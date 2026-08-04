from decimal import Decimal
from pathlib import Path

from django.contrib.auth import get_user_model
from django.core.files import File
from django.core.files.storage import default_storage
from django.core.management.base import BaseCommand, CommandError
from django.db import transaction
from django.utils import timezone

from apps.cart.models import Cart, CartItem
from apps.catalog.models import Category, Product, ProductImage, ProductReview
from apps.inventory.models import InventoryMovement
from apps.inventory.services import record_inventory_movement
from apps.orders.models import Order, OrderItem
from apps.store.models import StoreSettings

User = get_user_model()

DEMO_PASSWORD = "DemoPassword123!"
SEED_PRODUCT_IMAGE_DIR = (
    Path(__file__).resolve().parents[2] / "seed_assets" / "products"
)

DEMO_REVIEW_POOL = [
    {
        "author": "Mariana Lopez",
        "rating": 5,
        "title": "Muy buena calidad",
        "body": "El mueble llego bien protegido y se ve igual que en el catalogo.",
        "date": "2026-07-18",
    },
    {
        "author": "Carlos Rivera",
        "rating": 4,
        "title": "Buena compra",
        "body": "La entrega fue clara y el producto funciona bien para un espacio pequeno.",
        "date": "2026-07-09",
    },
    {
        "author": "Ana Martinez",
        "rating": 5,
        "title": "Se siente firme",
        "body": "Los acabados se sienten cuidados y el color combina facil con la sala.",
        "date": "2026-06-30",
    },
    {
        "author": "Daniel Torres",
        "rating": 4,
        "title": "Practico para uso diario",
        "body": "Lo compre para visitas y ha sido comodo sin ocupar demasiado espacio.",
        "date": "2026-06-21",
    },
]


class Command(BaseCommand):
    help = "Carga datos demo repetibles para desarrollo local con SQLite."

    def add_arguments(self, parser):
        parser.add_argument(
            "--reset",
            action="store_true",
            help="Elimina los datos demo conocidos antes de volver a crearlos.",
        )

    @transaction.atomic
    def handle(self, *args, **options):
        if options["reset"]:
            self._reset_demo_data()

        users = self._seed_users()
        self._seed_store_settings(users["admin"])
        categories = self._seed_categories()
        products = self._seed_products(categories)
        self._seed_carts(users, products)
        self._seed_orders(users, products)
        self._seed_reviews(users, products)
        self._seed_manual_inventory_movement(users["employee"], products)

        self.stdout.write(self.style.SUCCESS("Datos demo cargados correctamente."))
        self.stdout.write(f"Password demo para todos los usuarios: {DEMO_PASSWORD}")
        self.stdout.write(
            "Usuarios: cliente@example.com, cliente.plus@example.com, "
            "empleado@example.com, admin@example.com"
        )

    def _reset_demo_data(self):
        demo_emails = [
            "cliente@example.com",
            "cliente.plus@example.com",
            "empleado@example.com",
            "admin@example.com",
        ]
        demo_category_slugs = [
            "sofas-cama",
            "mesas-centro",
            "sillas-acento",
            "almacenamiento",
            "recamaras",
            "comedores",
            "oficina",
            "exterior",
            "decoracion",
        ]

        InventoryMovement.objects.filter(
            product__category__slug__in=demo_category_slugs
        ).delete()
        Order.objects.filter(user__email__in=demo_emails).delete()
        Cart.objects.filter(user__email__in=demo_emails).delete()
        Product.objects.filter(category__slug__in=demo_category_slugs).delete()
        Category.objects.filter(slug__in=demo_category_slugs).delete()
        User.objects.filter(email__in=demo_emails).delete()

    def _seed_users(self):
        users = {
            "customer": self._upsert_user(
                username="cliente_demo",
                email="cliente@example.com",
                role=User.Roles.CUSTOMER,
                first_name="Cliente",
                last_name="Demo",
                phone="6645550101",
                state="Baja California",
                city="Tijuana",
            ),
            "customer_secondary": self._upsert_user(
                username="cliente_plus_demo",
                email="cliente.plus@example.com",
                role=User.Roles.CUSTOMER,
                first_name="Cliente",
                last_name="Plus",
                phone="6645550111",
                state="Baja California",
                city="Tijuana",
            ),
            "employee": self._upsert_user(
                username="empleado_demo",
                email="empleado@example.com",
                role=User.Roles.EMPLOYEE,
                first_name="Empleado",
                last_name="Operaciones",
                phone="6645550102",
                state="Baja California",
                city="Tijuana",
            ),
            "admin": self._upsert_user(
                username="admin_demo",
                email="admin@example.com",
                role=User.Roles.ADMIN,
                first_name="Admin",
                last_name="Daybed",
                phone="6645550103",
                state="Baja California",
                city="Tijuana",
                is_staff=True,
            ),
        }
        return users

    def _upsert_user(self, **data):
        email = data.pop("email")
        user, _created = User.objects.update_or_create(
            email=email,
            defaults={
                **data,
                "is_active": True,
            },
        )
        user.set_password(DEMO_PASSWORD)
        user.save(update_fields=("password", "is_active"))
        return user

    def _seed_store_settings(self, admin):
        settings_object = StoreSettings.get_active()
        settings_object.store_name = "Daybed Tijuana"
        settings_object.contact_phone = "+52 664 555 0100"
        settings_object.contact_email = "contacto@daybed.local"
        settings_object.street = "Av. Reforma 1200"
        settings_object.neighborhood = "Zona Centro"
        settings_object.city = "Tijuana"
        settings_object.state = "Baja California"
        settings_object.postal_code = "22000"
        settings_object.latitude = Decimal("32.51490000")
        settings_object.longitude = Decimal("-117.03820000")
        settings_object.delivery_base_fee = Decimal("80.00")
        settings_object.delivery_price_per_km = Decimal("8.00")
        settings_object.free_shipping_threshold = Decimal("15000.00")
        settings_object.show_cart_estimate = True
        settings_object.updated_by = admin
        settings_object.save()

    def _seed_categories(self):
        category_data = [
            {
                "name": "Sofás cama",
                "slug": "sofas-cama",
                "description": (
                    "Muebles convertibles para sala, visitas y descanso diario."
                ),
                "specification_schema": [
                    {
                        "key": "upholstery_material",
                        "label": "Material de tapizado",
                        "type": "text",
                        "filterable": True,
                    },
                    {
                        "key": "assembly_required",
                        "label": "Requiere armado",
                        "type": "boolean",
                        "filterable": True,
                    },
                    {
                        "key": "features",
                        "label": "Características",
                        "type": "list",
                        "filterable": False,
                    },
                ],
                "active": True,
            },
            {
                "name": "Mesas de centro",
                "slug": "mesas-centro",
                "description": "Mesas funcionales para sala y espacios de convivencia.",
                "specification_schema": [
                    {
                        "key": "shape",
                        "label": "Forma",
                        "type": "text",
                        "filterable": True,
                    },
                    {
                        "key": "finish",
                        "label": "Acabado",
                        "type": "text",
                        "filterable": True,
                    },
                    {
                        "key": "assembly_required",
                        "label": "Requiere armado",
                        "type": "boolean",
                        "filterable": True,
                    },
                ],
                "active": True,
            },
            {
                "name": "Sillas de acento",
                "slug": "sillas-acento",
                "description": "Sillas decorativas para lectura, recámara o sala.",
                "specification_schema": [
                    {
                        "key": "upholstery_material",
                        "label": "Material de tapizado",
                        "type": "text",
                        "filterable": True,
                    },
                    {
                        "key": "seat_height_cm",
                        "label": "Altura de asiento",
                        "type": "number",
                        "filterable": False,
                    },
                ],
                "active": True,
            },
            {
                "name": "Almacenamiento",
                "slug": "almacenamiento",
                "description": "Credenzas, bancos y piezas para organizar espacios.",
                "specification_schema": [
                    {
                        "key": "storage_included",
                        "label": "Incluye almacenamiento",
                        "type": "boolean",
                        "filterable": True,
                    },
                    {
                        "key": "weight_capacity_kg",
                        "label": "Capacidad de peso",
                        "type": "number",
                        "filterable": False,
                    },
                ],
                "active": True,
            },
            {
                "name": "Recámaras",
                "slug": "recamaras",
                "description": "Camas, burós y muebles principales para dormitorio.",
                "specification_schema": [
                    {
                        "key": "bed_size",
                        "label": "Tamaño de cama",
                        "type": "text",
                        "filterable": True,
                    },
                    {
                        "key": "storage_included",
                        "label": "Incluye almacenamiento",
                        "type": "boolean",
                        "filterable": True,
                    },
                    {
                        "key": "assembly_required",
                        "label": "Requiere armado",
                        "type": "boolean",
                        "filterable": True,
                    },
                ],
                "active": True,
            },
            {
                "name": "Comedores",
                "slug": "comedores",
                "description": "Mesas, sillas y conjuntos para comedor.",
                "specification_schema": [
                    {
                        "key": "seats",
                        "label": "Personas",
                        "type": "number",
                        "filterable": True,
                    },
                    {
                        "key": "shape",
                        "label": "Forma",
                        "type": "text",
                        "filterable": True,
                    },
                    {
                        "key": "finish",
                        "label": "Acabado",
                        "type": "text",
                        "filterable": True,
                    },
                ],
                "active": True,
            },
            {
                "name": "Oficina",
                "slug": "oficina",
                "description": "Escritorios, sillas y soluciones para home office.",
                "specification_schema": [
                    {
                        "key": "cable_management",
                        "label": "Gestión de cables",
                        "type": "boolean",
                        "filterable": True,
                    },
                    {
                        "key": "adjustable_height",
                        "label": "Altura ajustable",
                        "type": "boolean",
                        "filterable": True,
                    },
                ],
                "active": True,
            },
            {
                "name": "Exterior",
                "slug": "exterior",
                "description": "Muebles resistentes para terraza, patio o balcón.",
                "specification_schema": [
                    {
                        "key": "weather_resistant",
                        "label": "Resistente al clima",
                        "type": "boolean",
                        "filterable": True,
                    },
                    {
                        "key": "foldable",
                        "label": "Plegable",
                        "type": "boolean",
                        "filterable": True,
                    },
                ],
                "active": True,
            },
            {
                "name": "Decoración",
                "slug": "decoracion",
                "description": "Categoría inactiva para probar filtros internos.",
                "specification_schema": [],
                "active": False,
            },
        ]

        return {
            item["slug"]: Category.objects.update_or_create(
                slug=item["slug"],
                defaults=item,
            )[0]
            for item in category_data
        }

    def _seed_products(self, categories):
        product_data = [
            {
                "sku": "DAY-SOFA-ROB-001",
                "name": "Daybed Roble Nórdico",
                "description": (
                    "Sofá cama de roble con cojines claros y líneas limpias."
                ),
                "price": Decimal("12499.00"),
                "category": categories["sofas-cama"],
                "material": "Roble",
                "color": "Natural",
                "style": "Nórdico",
                "width_cm": Decimal("200.00"),
                "height_cm": Decimal("80.00"),
                "depth_cm": Decimal("90.00"),
                "length_cm": None,
                "diameter_cm": None,
                "weight_kg": Decimal("48.50"),
                "specifications": {
                    "upholstery_material": "algodón",
                    "assembly_required": False,
                    "features": ["convertible", "cojines incluidos"],
                    "room": "sala",
                    "pieces": 1,
                },
                "stock": 8,
                "minimum_stock": 2,
                "active": True,
                "image_asset": "daybed-roble-nordico.png",
                "gallery_assets": ["LolitoDaybed.jpg"],
            },
            {
                "sku": "DAY-SOFA-LIN-002",
                "name": "Sofá Cama Lino Arena",
                "description": (
                    "Daybed tapizado en lino con base baja para sala compacta."
                ),
                "price": Decimal("9799.00"),
                "category": categories["sofas-cama"],
                "material": "Lino",
                "color": "Arena",
                "style": "Contemporáneo",
                "width_cm": Decimal("190.00"),
                "height_cm": Decimal("78.00"),
                "depth_cm": Decimal("88.00"),
                "length_cm": None,
                "diameter_cm": None,
                "weight_kg": Decimal("42.00"),
                "specifications": {
                    "upholstery_material": "lino",
                    "assembly_required": True,
                    "orientation": "reversible",
                    "features": ["convertible", "base baja"],
                    "room": "sala",
                    "pieces": 1,
                },
                "stock": 1,
                "minimum_stock": 2,
                "active": True,
                "image_asset": "sofa-cama-lino-arena.png",
                "gallery_assets": ["RespiraDaybed.jpg"],
            },
            {
                "sku": "DAY-MESA-FRE-001",
                "name": "Mesa Centro Fresno",
                "description": "Mesa rectangular con repisa inferior y acabado mate.",
                "price": Decimal("3499.00"),
                "category": categories["mesas-centro"],
                "material": "Fresno",
                "color": "Miel",
                "style": "Moderno",
                "width_cm": Decimal("110.00"),
                "height_cm": Decimal("42.00"),
                "depth_cm": Decimal("60.00"),
                "length_cm": None,
                "diameter_cm": None,
                "weight_kg": Decimal("18.00"),
                "specifications": {
                    "shape": "rectangular",
                    "finish": "mate",
                    "assembly_required": True,
                    "room": "sala",
                    "pieces": 1,
                },
                "stock": 10,
                "minimum_stock": 3,
                "active": True,
                "image_asset": "mesa-centro-fresno.png",
                "gallery_assets": ["SyltherineDaybed.jpg"],
            },
            {
                "sku": "DAY-MESA-TER-002",
                "name": "Mesa Redonda Terra",
                "description": "Mesa auxiliar redonda con cubierta tipo piedra.",
                "price": Decimal("2899.00"),
                "category": categories["mesas-centro"],
                "material": "Madera y resina",
                "color": "Terracota",
                "style": "Orgánico",
                "width_cm": None,
                "height_cm": Decimal("45.00"),
                "depth_cm": None,
                "length_cm": None,
                "diameter_cm": Decimal("70.00"),
                "weight_kg": Decimal("14.00"),
                "specifications": {
                    "shape": "redonda",
                    "finish": "tipo piedra",
                    "assembly_required": False,
                    "room": "sala",
                    "pieces": 1,
                },
                "stock": 4,
                "minimum_stock": 2,
                "active": True,
                "image_asset": "mesa-redonda-terra.png",
                "gallery_assets": ["FondoDaybed.jpg"],
            },
            {
                "sku": "DAY-SILLA-OLI-001",
                "name": "Silla Lectura Olivo",
                "description": "Silla de acento con respaldo curvo y tela verde olivo.",
                "price": Decimal("4599.00"),
                "category": categories["sillas-acento"],
                "material": "Tela",
                "color": "Verde olivo",
                "style": "Mid-century",
                "width_cm": Decimal("78.00"),
                "height_cm": Decimal("86.00"),
                "depth_cm": Decimal("82.00"),
                "length_cm": None,
                "diameter_cm": None,
                "weight_kg": Decimal("16.50"),
                "specifications": {
                    "upholstery_material": "tela",
                    "seat_height_cm": 45,
                    "assembly_required": False,
                    "room": "recámara",
                    "pieces": 1,
                },
                "stock": 6,
                "minimum_stock": 2,
                "active": True,
                "image_asset": "silla-lectura-olivo.png",
                "gallery_assets": ["LeviosaDaybed.jpg"],
            },
            {
                "sku": "DAY-BANCO-NOG-001",
                "name": "Banco Baúl Nogal",
                "description": (
                    "Banco con almacenamiento interno para recámara o recibidor."
                ),
                "price": Decimal("5299.00"),
                "category": categories["almacenamiento"],
                "material": "Nogal",
                "color": "Nogal oscuro",
                "style": "Clásico",
                "width_cm": Decimal("120.00"),
                "height_cm": Decimal("48.00"),
                "depth_cm": Decimal("45.00"),
                "length_cm": None,
                "diameter_cm": None,
                "weight_kg": Decimal("24.00"),
                "specifications": {
                    "storage_included": True,
                    "weight_capacity_kg": 120,
                    "assembly_required": False,
                    "room": "recámara",
                    "pieces": 1,
                },
                "stock": 0,
                "minimum_stock": 2,
                "active": True,
                "image_asset": "banco-baul-nogal.png",
                "gallery_assets": ["RespiraDaybed.jpg"],
            },
            {
                "sku": "DAY-DECO-BRU-001",
                "name": "Florero Cerámica Bruma",
                "description": (
                    "Producto inactivo para validar que no aparece en catálogo público."
                ),
                "price": Decimal("799.00"),
                "category": categories["decoracion"],
                "material": "Cerámica",
                "color": "Blanco",
                "style": "Minimal",
                "width_cm": Decimal("18.00"),
                "height_cm": Decimal("32.00"),
                "depth_cm": Decimal("18.00"),
                "length_cm": None,
                "diameter_cm": None,
                "weight_kg": Decimal("2.50"),
                "specifications": {
                    "shape": "orgánica",
                    "finish": "cerámica mate",
                    "room": "sala",
                    "pieces": 1,
                },
                "stock": 12,
                "minimum_stock": 2,
                "active": False,
                "image_asset": "FondoDaybed.jpg",
            },
            {
                "sku": "DAY-SOFA-CHA-003",
                "name": "Chaise Modular Gris",
                "description": (
                    "Chaise modular con asiento profundo y tela gris texturizada."
                ),
                "price": Decimal("15999.00"),
                "category": categories["sofas-cama"],
                "material": "Tela",
                "color": "Gris",
                "style": "Modular",
                "width_cm": Decimal("230.00"),
                "height_cm": Decimal("82.00"),
                "depth_cm": Decimal("155.00"),
                "length_cm": None,
                "diameter_cm": None,
                "weight_kg": Decimal("62.00"),
                "specifications": {
                    "upholstery_material": "poliéster",
                    "assembly_required": True,
                    "orientation": "izquierda",
                    "features": ["modular", "fundas removibles"],
                    "room": "sala",
                    "pieces": 2,
                },
                "stock": 3,
                "minimum_stock": 1,
                "active": True,
                "image_asset": "LolitoDaybed.jpg",
                "gallery_assets": ["RespiraDaybed.jpg", "SyltherineDaybed.jpg"],
            },
            {
                "sku": "DAY-SOFA-CAP-004",
                "name": "Sofá Cama Capitoné Azul",
                "description": "Sofá cama con capitoné clásico y apertura sencilla.",
                "price": Decimal("11299.00"),
                "category": categories["sofas-cama"],
                "material": "Terciopelo",
                "color": "Azul petróleo",
                "style": "Clásico moderno",
                "width_cm": Decimal("205.00"),
                "height_cm": Decimal("84.00"),
                "depth_cm": Decimal("92.00"),
                "length_cm": None,
                "diameter_cm": None,
                "weight_kg": Decimal("52.00"),
                "specifications": {
                    "upholstery_material": "terciopelo",
                    "assembly_required": True,
                    "features": ["convertible", "capitoné"],
                    "room": "sala",
                    "pieces": 1,
                },
                "stock": 2,
                "minimum_stock": 2,
                "active": True,
                "image_asset": "RespiraDaybed.jpg",
                "gallery_assets": ["LolitoDaybed.jpg"],
            },
            {
                "sku": "DAY-MESA-NID-003",
                "name": "Set Mesas Nido Cerezo",
                "description": "Dos mesas nido con cubierta redonda y patas ligeras.",
                "price": Decimal("3799.00"),
                "category": categories["mesas-centro"],
                "material": "Cerezo",
                "color": "Cerezo",
                "style": "Escandinavo",
                "width_cm": None,
                "height_cm": Decimal("46.00"),
                "depth_cm": None,
                "length_cm": None,
                "diameter_cm": Decimal("62.00"),
                "weight_kg": Decimal("12.00"),
                "specifications": {
                    "shape": "redonda",
                    "finish": "satinado",
                    "assembly_required": True,
                    "room": "sala",
                    "pieces": 2,
                },
                "stock": 7,
                "minimum_stock": 2,
                "active": True,
                "image_asset": "SyltherineDaybed.jpg",
                "gallery_assets": ["FondoDaybed.jpg"],
            },
            {
                "sku": "DAY-MESA-ELE-004",
                "name": "Mesa Elevable Osaka",
                "description": (
                    "Mesa de centro con cubierta elevable y compartimento interno."
                ),
                "price": Decimal("6299.00"),
                "category": categories["mesas-centro"],
                "material": "MDF enchapado",
                "color": "Nogal claro",
                "style": "Japandi",
                "width_cm": Decimal("115.00"),
                "height_cm": Decimal("48.00"),
                "depth_cm": Decimal("65.00"),
                "length_cm": None,
                "diameter_cm": None,
                "weight_kg": Decimal("28.00"),
                "specifications": {
                    "shape": "rectangular",
                    "finish": "natural",
                    "assembly_required": True,
                    "storage_included": True,
                    "room": "sala",
                    "pieces": 1,
                },
                "stock": 0,
                "minimum_stock": 2,
                "active": True,
                "image_asset": "FondoDaybed.jpg",
                "gallery_assets": ["SyltherineDaybed.jpg"],
            },
            {
                "sku": "DAY-SILLA-BOU-002",
                "name": "Silla Bouclé Marfil",
                "description": "Silla curva tapizada en bouclé para lectura o tocador.",
                "price": Decimal("3899.00"),
                "category": categories["sillas-acento"],
                "material": "Bouclé",
                "color": "Marfil",
                "style": "Orgánico",
                "width_cm": Decimal("74.00"),
                "height_cm": Decimal("78.00"),
                "depth_cm": Decimal("76.00"),
                "length_cm": None,
                "diameter_cm": None,
                "weight_kg": Decimal("14.50"),
                "specifications": {
                    "upholstery_material": "bouclé",
                    "seat_height_cm": 43,
                    "assembly_required": False,
                    "room": "recámara",
                    "pieces": 1,
                },
                "stock": 9,
                "minimum_stock": 3,
                "active": True,
                "image_asset": "LeviosaDaybed.jpg",
                "gallery_assets": ["RespiraDaybed.jpg"],
            },
            {
                "sku": "DAY-SILLA-PIE-003",
                "name": "Sillón Piel Cognac",
                "description": (
                    "Sillón individual de piel sintética con brazos amplios."
                ),
                "price": Decimal("7399.00"),
                "category": categories["sillas-acento"],
                "material": "Piel sintética",
                "color": "Cognac",
                "style": "Industrial",
                "width_cm": Decimal("84.00"),
                "height_cm": Decimal("88.00"),
                "depth_cm": Decimal("86.00"),
                "length_cm": None,
                "diameter_cm": None,
                "weight_kg": Decimal("22.00"),
                "specifications": {
                    "upholstery_material": "piel sintética",
                    "seat_height_cm": 46,
                    "assembly_required": True,
                    "room": "sala",
                    "pieces": 1,
                },
                "stock": 2,
                "minimum_stock": 2,
                "active": True,
                "image_asset": "LeviosaDaybed.jpg",
                "gallery_assets": ["LolitoDaybed.jpg"],
            },
            {
                "sku": "DAY-ALM-CRE-002",
                "name": "Credenza Teca Puertas Correderas",
                "description": (
                    "Credenza baja con puertas de listones y entrepaños ajustables."
                ),
                "price": Decimal("8499.00"),
                "category": categories["almacenamiento"],
                "material": "Teca",
                "color": "Natural",
                "style": "Mid-century",
                "width_cm": Decimal("160.00"),
                "height_cm": Decimal("72.00"),
                "depth_cm": Decimal("42.00"),
                "length_cm": None,
                "diameter_cm": None,
                "weight_kg": Decimal("44.00"),
                "specifications": {
                    "storage_included": True,
                    "weight_capacity_kg": 80,
                    "assembly_required": True,
                    "room": "comedor",
                    "pieces": 1,
                },
                "stock": 5,
                "minimum_stock": 2,
                "active": True,
                "image_asset": "SyltherineDaybed.jpg",
                "gallery_assets": ["FondoDaybed.jpg"],
            },
            {
                "sku": "DAY-ALM-LIB-003",
                "name": "Librero Modular Blanco",
                "description": "Librero modular abierto para sala, estudio o recámara.",
                "price": Decimal("5999.00"),
                "category": categories["almacenamiento"],
                "material": "MDF",
                "color": "Blanco",
                "style": "Minimal",
                "width_cm": Decimal("120.00"),
                "height_cm": Decimal("180.00"),
                "depth_cm": Decimal("35.00"),
                "length_cm": None,
                "diameter_cm": None,
                "weight_kg": Decimal("38.00"),
                "specifications": {
                    "storage_included": True,
                    "weight_capacity_kg": 90,
                    "assembly_required": True,
                    "room": "oficina",
                    "pieces": 1,
                },
                "stock": 4,
                "minimum_stock": 2,
                "active": True,
                "image_asset": "FondoDaybed.jpg",
                "gallery_assets": ["SyltherineDaybed.jpg"],
            },
            {
                "sku": "DAY-REC-CAM-001",
                "name": "Cama Plataforma Encino Queen",
                "description": "Base de cama queen con cabecera baja y acabado encino.",
                "price": Decimal("10999.00"),
                "category": categories["recamaras"],
                "material": "Encino",
                "color": "Encino claro",
                "style": "Nórdico",
                "width_cm": Decimal("160.00"),
                "height_cm": Decimal("92.00"),
                "depth_cm": Decimal("210.00"),
                "length_cm": Decimal("210.00"),
                "diameter_cm": None,
                "weight_kg": Decimal("58.00"),
                "specifications": {
                    "bed_size": "queen",
                    "storage_included": False,
                    "assembly_required": True,
                    "room": "recámara",
                    "pieces": 1,
                },
                "stock": 3,
                "minimum_stock": 1,
                "active": True,
                "image_asset": "LolitoDaybed.jpg",
                "gallery_assets": ["RespiraDaybed.jpg"],
            },
            {
                "sku": "DAY-REC-CAB-002",
                "name": "Cabecera Tapizada Lino King",
                "description": (
                    "Cabecera king tapizada en lino con costuras verticales."
                ),
                "price": Decimal("6999.00"),
                "category": categories["recamaras"],
                "material": "Lino",
                "color": "Gris cálido",
                "style": "Contemporáneo",
                "width_cm": Decimal("200.00"),
                "height_cm": Decimal("125.00"),
                "depth_cm": Decimal("12.00"),
                "length_cm": None,
                "diameter_cm": None,
                "weight_kg": Decimal("26.00"),
                "specifications": {
                    "bed_size": "king",
                    "storage_included": False,
                    "assembly_required": True,
                    "room": "recámara",
                    "pieces": 1,
                },
                "stock": 6,
                "minimum_stock": 2,
                "active": True,
                "image_asset": "RespiraDaybed.jpg",
                "gallery_assets": ["LeviosaDaybed.jpg"],
            },
            {
                "sku": "DAY-REC-BUR-003",
                "name": "Buró Flotante Nogal",
                "description": "Buró compacto con cajón y repisa inferior.",
                "price": Decimal("2199.00"),
                "category": categories["recamaras"],
                "material": "Nogal",
                "color": "Nogal oscuro",
                "style": "Minimal",
                "width_cm": Decimal("48.00"),
                "height_cm": Decimal("42.00"),
                "depth_cm": Decimal("36.00"),
                "length_cm": None,
                "diameter_cm": None,
                "weight_kg": Decimal("9.50"),
                "specifications": {
                    "storage_included": True,
                    "assembly_required": True,
                    "room": "recámara",
                    "pieces": 1,
                },
                "stock": 12,
                "minimum_stock": 4,
                "active": True,
                "image_asset": "SyltherineDaybed.jpg",
                "gallery_assets": ["FondoDaybed.jpg"],
            },
            {
                "sku": "DAY-COM-MES-001",
                "name": "Mesa Comedor Nogal Seis",
                "description": "Mesa rectangular de comedor para seis personas.",
                "price": Decimal("13999.00"),
                "category": categories["comedores"],
                "material": "Nogal",
                "color": "Nogal",
                "style": "Contemporáneo",
                "width_cm": Decimal("180.00"),
                "height_cm": Decimal("76.00"),
                "depth_cm": Decimal("90.00"),
                "length_cm": Decimal("180.00"),
                "diameter_cm": None,
                "weight_kg": Decimal("54.00"),
                "specifications": {
                    "seats": 6,
                    "shape": "rectangular",
                    "finish": "satinado",
                    "assembly_required": True,
                    "room": "comedor",
                    "pieces": 1,
                },
                "stock": 2,
                "minimum_stock": 1,
                "active": True,
                "image_asset": "FondoDaybed.jpg",
                "gallery_assets": ["SyltherineDaybed.jpg"],
            },
            {
                "sku": "DAY-COM-SIL-002",
                "name": "Set Sillas Comedor Avellana",
                "description": (
                    "Set de cuatro sillas con asiento tejido y estructura sólida."
                ),
                "price": Decimal("8999.00"),
                "category": categories["comedores"],
                "material": "Madera y ratán",
                "color": "Avellana",
                "style": "Natural",
                "width_cm": Decimal("50.00"),
                "height_cm": Decimal("84.00"),
                "depth_cm": Decimal("54.00"),
                "length_cm": None,
                "diameter_cm": None,
                "weight_kg": Decimal("24.00"),
                "specifications": {
                    "seats": 4,
                    "shape": "silla",
                    "finish": "natural",
                    "assembly_required": False,
                    "room": "comedor",
                    "pieces": 4,
                },
                "stock": 6,
                "minimum_stock": 2,
                "active": True,
                "image_asset": "LeviosaDaybed.jpg",
                "gallery_assets": ["FondoDaybed.jpg"],
            },
            {
                "sku": "DAY-COM-BAN-003",
                "name": "Banco Comedor Roble",
                "description": "Banco largo para mesa de comedor o recibidor.",
                "price": Decimal("4999.00"),
                "category": categories["comedores"],
                "material": "Roble",
                "color": "Natural",
                "style": "Rústico moderno",
                "width_cm": Decimal("150.00"),
                "height_cm": Decimal("46.00"),
                "depth_cm": Decimal("38.00"),
                "length_cm": Decimal("150.00"),
                "diameter_cm": None,
                "weight_kg": Decimal("20.00"),
                "specifications": {
                    "seats": 3,
                    "shape": "banco",
                    "finish": "mate",
                    "assembly_required": True,
                    "room": "comedor",
                    "pieces": 1,
                },
                "stock": 1,
                "minimum_stock": 2,
                "active": True,
                "image_asset": "RespiraDaybed.jpg",
                "gallery_assets": ["SyltherineDaybed.jpg"],
            },
            {
                "sku": "DAY-OFI-ESC-001",
                "name": "Escritorio Compacto Fresno",
                "description": "Escritorio compacto con cajón lateral y pasacables.",
                "price": Decimal("6499.00"),
                "category": categories["oficina"],
                "material": "Fresno",
                "color": "Miel",
                "style": "Moderno",
                "width_cm": Decimal("120.00"),
                "height_cm": Decimal("75.00"),
                "depth_cm": Decimal("60.00"),
                "length_cm": Decimal("120.00"),
                "diameter_cm": None,
                "weight_kg": Decimal("31.00"),
                "specifications": {
                    "cable_management": True,
                    "adjustable_height": False,
                    "storage_included": True,
                    "room": "oficina",
                    "pieces": 1,
                },
                "stock": 8,
                "minimum_stock": 2,
                "active": True,
                "image_asset": "SyltherineDaybed.jpg",
                "gallery_assets": ["FondoDaybed.jpg"],
            },
            {
                "sku": "DAY-OFI-SIL-002",
                "name": "Silla Oficina Malla Negra",
                "description": (
                    "Silla ergonómica con respaldo de malla y soporte lumbar."
                ),
                "price": Decimal("5799.00"),
                "category": categories["oficina"],
                "material": "Malla",
                "color": "Negro",
                "style": "Ergonómico",
                "width_cm": Decimal("66.00"),
                "height_cm": Decimal("112.00"),
                "depth_cm": Decimal("66.00"),
                "length_cm": None,
                "diameter_cm": None,
                "weight_kg": Decimal("17.00"),
                "specifications": {
                    "adjustable_height": True,
                    "cable_management": False,
                    "lumbar_support": True,
                    "room": "oficina",
                    "pieces": 1,
                },
                "stock": 11,
                "minimum_stock": 3,
                "active": True,
                "image_asset": "LeviosaDaybed.jpg",
                "gallery_assets": ["RespiraDaybed.jpg"],
            },
            {
                "sku": "DAY-OFI-REP-003",
                "name": "Repisa Escalera Home Office",
                "description": (
                    "Repisa tipo escalera para libros, plantas y accesorios."
                ),
                "price": Decimal("3299.00"),
                "category": categories["oficina"],
                "material": "Metal y madera",
                "color": "Negro y natural",
                "style": "Industrial",
                "width_cm": Decimal("80.00"),
                "height_cm": Decimal("170.00"),
                "depth_cm": Decimal("42.00"),
                "length_cm": None,
                "diameter_cm": None,
                "weight_kg": Decimal("19.00"),
                "specifications": {
                    "storage_included": True,
                    "assembly_required": True,
                    "room": "oficina",
                    "pieces": 1,
                },
                "stock": 3,
                "minimum_stock": 2,
                "active": True,
                "image_asset": "FondoDaybed.jpg",
                "gallery_assets": ["SyltherineDaybed.jpg"],
            },
            {
                "sku": "DAY-EXT-SAL-001",
                "name": "Set Terraza Acapulco",
                "description": "Set de dos sillas y mesa ligera para terraza.",
                "price": Decimal("7899.00"),
                "category": categories["exterior"],
                "material": "Acero y cordón PVC",
                "color": "Terracota",
                "style": "Retro",
                "width_cm": Decimal("72.00"),
                "height_cm": Decimal("86.00"),
                "depth_cm": Decimal("76.00"),
                "length_cm": None,
                "diameter_cm": Decimal("55.00"),
                "weight_kg": Decimal("26.00"),
                "specifications": {
                    "weather_resistant": True,
                    "foldable": False,
                    "seats": 2,
                    "room": "terraza",
                    "pieces": 3,
                },
                "stock": 5,
                "minimum_stock": 2,
                "active": True,
                "image_asset": "FondoDaybed.jpg",
                "gallery_assets": ["LeviosaDaybed.jpg"],
            },
            {
                "sku": "DAY-EXT-BAN-002",
                "name": "Banco Exterior Teca",
                "description": (
                    "Banco de teca para patio con acabado resistente a intemperie."
                ),
                "price": Decimal("6699.00"),
                "category": categories["exterior"],
                "material": "Teca",
                "color": "Natural",
                "style": "Tropical",
                "width_cm": Decimal("135.00"),
                "height_cm": Decimal("82.00"),
                "depth_cm": Decimal("58.00"),
                "length_cm": Decimal("135.00"),
                "diameter_cm": None,
                "weight_kg": Decimal("29.00"),
                "specifications": {
                    "weather_resistant": True,
                    "foldable": False,
                    "seats": 2,
                    "room": "exterior",
                    "pieces": 1,
                },
                "stock": 0,
                "minimum_stock": 1,
                "active": True,
                "image_asset": "SyltherineDaybed.jpg",
                "gallery_assets": ["FondoDaybed.jpg"],
            },
            {
                "sku": "DAY-EXT-MES-003",
                "name": "Mesa Plegable Balcón",
                "description": (
                    "Mesa plegable para balcón pequeño con cubierta redonda."
                ),
                "price": Decimal("1899.00"),
                "category": categories["exterior"],
                "material": "Metal",
                "color": "Verde salvia",
                "style": "Práctico",
                "width_cm": None,
                "height_cm": Decimal("72.00"),
                "depth_cm": None,
                "length_cm": None,
                "diameter_cm": Decimal("60.00"),
                "weight_kg": Decimal("8.00"),
                "specifications": {
                    "weather_resistant": True,
                    "foldable": True,
                    "room": "balcón",
                    "pieces": 1,
                },
                "stock": 13,
                "minimum_stock": 4,
                "active": True,
                "image_asset": "FondoDaybed.jpg",
                "gallery_assets": ["LeviosaDaybed.jpg"],
            },
        ]

        self._validate_product_images(product_data)
        products = {}
        for item in product_data:
            image_asset = item["image_asset"]
            gallery_assets = item.get("gallery_assets", [])
            defaults = {
                key: value
                for key, value in item.items()
                if key not in {"image_asset", "gallery_assets"}
            }
            product, _created = Product.objects.update_or_create(
                name=item["name"],
                defaults=defaults,
            )
            self._apply_product_image(product, image_asset)
            self._apply_product_gallery(product, gallery_assets)
            products[item["name"]] = product
        return products

    def _validate_product_images(self, product_data):
        missing_assets = sorted(
            {
                image_asset
                for item in product_data
                for image_asset in [
                    item["image_asset"],
                    *item.get("gallery_assets", []),
                ]
                if not (SEED_PRODUCT_IMAGE_DIR / image_asset).is_file()
            }
        )
        if missing_assets:
            missing_list = ", ".join(missing_assets)
            raise CommandError(f"Faltan imagenes demo de productos: {missing_list}")

    def _apply_product_image(self, product, image_asset):
        image_path = SEED_PRODUCT_IMAGE_DIR / image_asset
        target_filename = f"{product.sku.lower()}{image_path.suffix.lower()}"
        target_field_name = f"demo/{target_filename}"
        target_storage_name = f"products/{target_field_name}"

        if product.main_image.name == target_storage_name and default_storage.exists(
            target_storage_name
        ):
            return

        old_image_name = product.main_image.name
        if (
            old_image_name
            and old_image_name != target_storage_name
            and old_image_name.startswith("products/demo/")
            and default_storage.exists(old_image_name)
        ):
            default_storage.delete(old_image_name)

        with image_path.open("rb") as image_file:
            product.main_image.save(target_field_name, File(image_file), save=False)
        product.save(update_fields=("main_image", "updated_at"))

    def _apply_product_gallery(self, product, gallery_assets):
        ProductImage.objects.filter(
            product=product,
            image__startswith="products/gallery/demo/",
        ).delete()

        for sort_order, image_asset in enumerate(gallery_assets, start=1):
            image_path = SEED_PRODUCT_IMAGE_DIR / image_asset
            target_filename = (
                f"{product.sku.lower()}-gallery-{sort_order}{image_path.suffix.lower()}"
            )
            target_field_name = f"demo/{target_filename}"
            target_storage_name = f"products/gallery/{target_field_name}"

            if default_storage.exists(target_storage_name):
                default_storage.delete(target_storage_name)

            gallery_image = ProductImage(
                product=product,
                alt_text=f"{product.name} vista {sort_order}",
                sort_order=sort_order,
                active=True,
            )
            with image_path.open("rb") as image_file:
                gallery_image.image.save(
                    target_field_name,
                    File(image_file),
                    save=False,
                )
            gallery_image.save()

    def _seed_reviews(self, users, products):
        reviewers = (users["customer"], users["customer_secondary"])
        for product_index, product in enumerate(products.values()):
            for reviewer_index, reviewer in enumerate(reviewers):
                review_data = DEMO_REVIEW_POOL[
                    (product_index + reviewer_index) % len(DEMO_REVIEW_POOL)
                ]
                ProductReview.objects.update_or_create(
                    product=product,
                    user=reviewer,
                    defaults={
                        "rating": review_data["rating"],
                        "title": review_data["title"],
                        "body": review_data["body"],
                        "verified_purchase": OrderItem.objects.filter(
                            order__user=reviewer,
                            order__status=Order.Status.DELIVERED,
                            product=product,
                        ).exists(),
                        "active": True,
                    },
                )

    def _seed_carts(self, users, products):
        cart_specs = {
            "customer": [
                ("Daybed Roble Nórdico", 1),
                ("Mesa Centro Fresno", 2),
                ("Silla Bouclé Marfil", 1),
            ],
            "customer_secondary": [
                ("Buró Flotante Nogal", 2),
                ("Mesa Plegable Balcón", 1),
            ],
        }
        for user_key, items in cart_specs.items():
            cart, _created = Cart.objects.get_or_create(user=users[user_key])
            cart.items.all().delete()
            for product_name, quantity in items:
                CartItem.objects.create(
                    cart=cart,
                    product=products[product_name],
                    quantity=quantity,
                )

    def _seed_orders(self, users, products):
        order_specs = [
            {
                "key": "pending",
                "status": Order.Status.PENDING,
                "items": [("Silla Lectura Olivo", 1), ("Mesa Redonda Terra", 1)],
                "address": "Av. Reforma 123, Zona Centro, Tijuana, B.C.",
                "distance_km": Decimal("8.400"),
                "duration": Decimal("22.0"),
                "delivery_fee": Decimal("147.20"),
                "payment_method": Order.PaymentMethod.TRANSFER,
            },
            {
                "key": "confirmed",
                "status": Order.Status.CONFIRMED,
                "items": [("Sofá Cama Lino Arena", 1)],
                "address": "Blvd. Agua Caliente 4500, Tijuana, B.C.",
                "distance_km": Decimal("12.500"),
                "duration": Decimal("30.0"),
                "delivery_fee": Decimal("180.00"),
                "payment_method": Order.PaymentMethod.CARD,
            },
            {
                "key": "preparing",
                "status": Order.Status.PREPARING,
                "items": [("Daybed Roble Nórdico", 1), ("Mesa Centro Fresno", 1)],
                "address": "Calle Segunda 8100, Zona Río, Tijuana, B.C.",
                "distance_km": Decimal("6.200"),
                "duration": Decimal("18.0"),
                "delivery_fee": Decimal("129.60"),
                "payment_method": Order.PaymentMethod.CASH,
            },
            {
                "key": "shipped",
                "status": Order.Status.SHIPPED,
                "items": [("Mesa Centro Fresno", 1)],
                "address": "Playas de Tijuana, Tijuana, B.C.",
                "distance_km": Decimal("18.300"),
                "duration": Decimal("42.0"),
                "delivery_fee": Decimal("226.40"),
                "payment_method": Order.PaymentMethod.CARD,
            },
            {
                "key": "delivered",
                "status": Order.Status.DELIVERED,
                "items": [("Mesa Redonda Terra", 2)],
                "address": "Otay Universidad, Tijuana, B.C.",
                "distance_km": Decimal("10.100"),
                "duration": Decimal("25.0"),
                "delivery_fee": Decimal("160.80"),
                "payment_method": Order.PaymentMethod.CARD,
            },
            {
                "key": "cancelled",
                "status": Order.Status.CANCELLED,
                "items": [("Silla Lectura Olivo", 1)],
                "address": "Col. Cacho, Tijuana, B.C.",
                "distance_km": Decimal("5.500"),
                "duration": Decimal("15.0"),
                "delivery_fee": Decimal("124.00"),
                "payment_method": Order.PaymentMethod.CASH,
            },
            {
                "key": "secondary_pending_cash",
                "customer_key": "customer_secondary",
                "status": Order.Status.PENDING,
                "items": [("Buró Flotante Nogal", 2), ("Mesa Plegable Balcón", 1)],
                "address": "Rampa Buenavista 220, Tijuana, B.C.",
                "distance_km": Decimal("9.700"),
                "duration": Decimal("26.0"),
                "delivery_fee": Decimal("157.60"),
                "payment_method": Order.PaymentMethod.CASH,
            },
            {
                "key": "secondary_confirmed_transfer",
                "customer_key": "customer_secondary",
                "status": Order.Status.CONFIRMED,
                "items": [("Credenza Teca Puertas Correderas", 1)],
                "address": "Lomas de Agua Caliente 410, Tijuana, B.C.",
                "distance_km": Decimal("11.800"),
                "duration": Decimal("29.0"),
                "delivery_fee": Decimal("174.40"),
                "payment_method": Order.PaymentMethod.TRANSFER,
                "payment_status": Order.PaymentStatus.AUTHORIZED,
            },
            {
                "key": "secondary_preparing_large",
                "customer_key": "customer_secondary",
                "status": Order.Status.PREPARING,
                "items": [
                    ("Cama Plataforma Encino Queen", 1),
                    ("Cabecera Tapizada Lino King", 1),
                    ("Buró Flotante Nogal", 2),
                ],
                "address": "Privada San Antonio 88, Tijuana, B.C.",
                "distance_km": Decimal("14.600"),
                "duration": Decimal("34.0"),
                "delivery_fee": Decimal("0.00"),
                "payment_method": Order.PaymentMethod.CARD,
            },
            {
                "key": "secondary_shipped_office",
                "customer_key": "customer_secondary",
                "status": Order.Status.SHIPPED,
                "items": [
                    ("Escritorio Compacto Fresno", 1),
                    ("Silla Oficina Malla Negra", 1),
                ],
                "address": "Parque Industrial Pacífico 550, Tijuana, B.C.",
                "distance_km": Decimal("21.200"),
                "duration": Decimal("48.0"),
                "delivery_fee": Decimal("249.60"),
                "payment_method": Order.PaymentMethod.CARD,
            },
            {
                "key": "secondary_delivered_exterior",
                "customer_key": "customer_secondary",
                "status": Order.Status.DELIVERED,
                "items": [("Set Terraza Acapulco", 1), ("Mesa Plegable Balcón", 1)],
                "address": "Real del Mar, Tijuana, B.C.",
                "distance_km": Decimal("29.400"),
                "duration": Decimal("58.0"),
                "delivery_fee": Decimal("315.20"),
                "payment_method": Order.PaymentMethod.CASH,
                "payment_status": Order.PaymentStatus.AUTHORIZED,
            },
            {
                "key": "secondary_cancelled_failed_card",
                "customer_key": "customer_secondary",
                "status": Order.Status.CANCELLED,
                "items": [("Sofá Cama Capitoné Azul", 1)],
                "address": "Col. Libertad 1450, Tijuana, B.C.",
                "distance_km": Decimal("7.100"),
                "duration": Decimal("21.0"),
                "delivery_fee": Decimal("136.80"),
                "payment_method": Order.PaymentMethod.CARD,
                "payment_status": Order.PaymentStatus.FAILED,
            },
        ]

        seeded_orders = {}
        for index, spec in enumerate(order_specs, start=1):
            seeded_orders[spec["key"]] = self._upsert_order(
                customer=users[spec.get("customer_key", "customer")],
                employee=users["employee"],
                products=products,
                spec=spec,
                latitude=Decimal("32.51490000") + Decimal(index) / Decimal("1000"),
                longitude=Decimal("-117.03820000") - Decimal(index) / Decimal("1000"),
            )

        return seeded_orders

    def _upsert_order(self, *, customer, employee, products, spec, latitude, longitude):
        order = (
            Order.objects.filter(
                user=customer,
                original_address=spec["address"],
            )
            .prefetch_related("items")
            .first()
        )
        if order is None:
            order = Order(user=customer, original_address=spec["address"])
        else:
            order.items.all().delete()
            InventoryMovement.objects.filter(order=order).delete()

        products_subtotal = Decimal("0.00")
        for product_name, quantity in spec["items"]:
            product = products[product_name]
            products_subtotal += product.price * Decimal(quantity)

        order.status = Order.Status.PENDING
        order.stock_decremented_at = None
        order.formatted_address = f"{spec['address']}, México"
        order.latitude = latitude
        order.longitude = longitude
        order.distance_km = spec["distance_km"]
        order.estimated_duration_minutes = spec["duration"]
        order.delivery_fee = spec["delivery_fee"]
        order.delivery_zone = "standard"
        order.geocoding_provider = "nominatim"
        order.distance_provider = "openrouteservice"
        order.products_subtotal = products_subtotal
        order.total = products_subtotal + spec["delivery_fee"]
        for field, value in self._payment_fields_for_spec(spec).items():
            setattr(order, field, value)
        order.save()

        for product_name, quantity in spec["items"]:
            product = products[product_name]
            OrderItem.objects.create(
                order=order,
                product=product,
                product_sku=product.sku or "",
                product_name=product.name,
                unit_price=product.price,
                quantity=quantity,
                line_total=product.price * Decimal(quantity),
                product_snapshot=OrderItem.snapshot_from_product(product),
            )

        if spec["status"] == Order.Status.CONFIRMED:
            order.confirm(actor=employee)
        elif spec["status"] in {
            Order.Status.PREPARING,
            Order.Status.SHIPPED,
            Order.Status.DELIVERED,
        }:
            order.confirm(actor=employee)
            for status in self._statuses_after_confirm(spec["status"]):
                order.transition_to(status, actor=employee)
        elif spec["status"] == Order.Status.CANCELLED:
            order.transition_to(Order.Status.CANCELLED, actor=employee)

        order.refresh_from_db()
        return order

    def _payment_fields_for_spec(self, spec):
        method = spec.get("payment_method", Order.PaymentMethod.CASH)
        payment_status = spec.get("payment_status")
        reference = f"SIM-DEMO-{spec['key'].upper()}"

        if method == Order.PaymentMethod.CARD:
            last4_by_key = {
                "confirmed": "4242",
                "shipped": "1881",
                "delivered": "5555",
                "secondary_preparing_large": "4242",
                "secondary_shipped_office": "1881",
                "secondary_cancelled_failed_card": "0000",
            }
            last4 = last4_by_key.get(spec["key"], "4242")
            status = payment_status or Order.PaymentStatus.AUTHORIZED
            return {
                "payment_method": Order.PaymentMethod.CARD,
                "payment_status": status,
                "payment_reference": reference,
                "payment_processed_at": timezone.now(),
                "payment_snapshot": {
                    "provider": "simulated",
                    "brand": "Visa",
                    "last4": last4,
                    "masked": f"**** **** **** {last4}",
                    "message": (
                        "Pago simulado rechazado."
                        if status == Order.PaymentStatus.FAILED
                        else "Pago simulado autorizado."
                    ),
                },
            }

        if method == Order.PaymentMethod.TRANSFER:
            status = payment_status or Order.PaymentStatus.AWAITING_TRANSFER
            return {
                "payment_method": Order.PaymentMethod.TRANSFER,
                "payment_status": status,
                "payment_reference": reference,
                "payment_processed_at": timezone.now(),
                "payment_snapshot": {
                    "provider": "simulated",
                    "message": (
                        "Transferencia simulada recibida."
                        if status == Order.PaymentStatus.AUTHORIZED
                        else "Transferencia simulada pendiente de confirmación."
                    ),
                },
            }

        status = payment_status or Order.PaymentStatus.PAY_ON_DELIVERY
        return {
            "payment_method": Order.PaymentMethod.CASH,
            "payment_status": status,
            "payment_reference": reference,
            "payment_processed_at": timezone.now(),
            "payment_snapshot": {
                "provider": "simulated",
                "message": (
                    "Pago en efectivo simulado recibido."
                    if status == Order.PaymentStatus.AUTHORIZED
                    else "Pago en efectivo registrado para cobro contra entrega."
                ),
            },
        }

    def _statuses_after_confirm(self, target_status):
        statuses = []
        if target_status in {
            Order.Status.PREPARING,
            Order.Status.SHIPPED,
            Order.Status.DELIVERED,
        }:
            statuses.append(Order.Status.PREPARING)
        if target_status in {Order.Status.SHIPPED, Order.Status.DELIVERED}:
            statuses.append(Order.Status.SHIPPED)
        if target_status == Order.Status.DELIVERED:
            statuses.append(Order.Status.DELIVERED)
        return statuses

    def _seed_manual_inventory_movement(self, employee, products):
        product = products["Mesa Centro Fresno"]
        InventoryMovement.objects.filter(
            product=product,
            movement_type=InventoryMovement.Types.MANUAL_ADJUSTMENT,
            reason="Conteo físico demo",
        ).delete()

        previous_stock = product.stock
        new_stock = previous_stock + 3
        product.stock = new_stock
        product.save(update_fields=("stock", "updated_at"))
        record_inventory_movement(
            product=product,
            movement_type=InventoryMovement.Types.MANUAL_ADJUSTMENT,
            previous_stock=previous_stock,
            new_stock=new_stock,
            reason="Conteo físico demo",
            created_by=employee,
        )
