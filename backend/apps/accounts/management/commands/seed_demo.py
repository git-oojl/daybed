from decimal import Decimal
from pathlib import Path

from django.contrib.auth import get_user_model
from django.core.files import File
from django.core.files.storage import default_storage
from django.core.management.base import BaseCommand, CommandError
from django.db import transaction

from apps.cart.models import Cart, CartItem
from apps.catalog.models import Category, Product
from apps.inventory.models import InventoryMovement
from apps.inventory.services import record_inventory_movement
from apps.orders.models import Order, OrderItem

User = get_user_model()

DEMO_PASSWORD = "DemoPassword123!"
SEED_PRODUCT_IMAGE_DIR = (
    Path(__file__).resolve().parents[2] / "seed_assets" / "products"
)


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
        categories = self._seed_categories()
        products = self._seed_products(categories)
        self._seed_cart(users["customer"], products)
        self._seed_orders(users, products)
        self._seed_manual_inventory_movement(users["employee"], products)

        self.stdout.write(self.style.SUCCESS("Datos demo cargados correctamente."))
        self.stdout.write(f"Password demo para todos los usuarios: {DEMO_PASSWORD}")
        self.stdout.write(
            "Usuarios: cliente@example.com, empleado@example.com, admin@example.com"
        )

    def _reset_demo_data(self):
        demo_emails = [
            "cliente@example.com",
            "empleado@example.com",
            "admin@example.com",
        ]
        demo_category_slugs = [
            "sofas-cama",
            "mesas-centro",
            "sillas-acento",
            "almacenamiento",
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
                "image_asset": "LolitoDaybed.jpg",
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
                "image_asset": "RespiraDaybed.jpg",
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
                "image_asset": "SyltherineDaybed.jpg",
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
                "image_asset": "FondoDaybed.jpg",
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
                "image_asset": "LeviosaDaybed.jpg",
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
                "image_asset": "RespiraDaybed.jpg",
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
        ]

        self._validate_product_images(product_data)
        products = {}
        for item in product_data:
            image_asset = item["image_asset"]
            defaults = {
                key: value for key, value in item.items() if key != "image_asset"
            }
            product, _created = Product.objects.update_or_create(
                name=item["name"],
                defaults=defaults,
            )
            self._apply_product_image(product, image_asset)
            products[item["name"]] = product
        return products

    def _validate_product_images(self, product_data):
        missing_assets = sorted(
            {
                item["image_asset"]
                for item in product_data
                if not (SEED_PRODUCT_IMAGE_DIR / item["image_asset"]).is_file()
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

    def _seed_cart(self, customer, products):
        cart, _created = Cart.objects.get_or_create(user=customer)
        CartItem.objects.update_or_create(
            cart=cart,
            product=products["Daybed Roble Nórdico"],
            defaults={"quantity": 1},
        )
        CartItem.objects.update_or_create(
            cart=cart,
            product=products["Mesa Centro Fresno"],
            defaults={"quantity": 2},
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
            },
            {
                "key": "confirmed",
                "status": Order.Status.CONFIRMED,
                "items": [("Sofá Cama Lino Arena", 1)],
                "address": "Blvd. Agua Caliente 4500, Tijuana, B.C.",
                "distance_km": Decimal("12.500"),
                "duration": Decimal("30.0"),
                "delivery_fee": Decimal("180.00"),
            },
            {
                "key": "preparing",
                "status": Order.Status.PREPARING,
                "items": [("Daybed Roble Nórdico", 1), ("Mesa Centro Fresno", 1)],
                "address": "Calle Segunda 8100, Zona Río, Tijuana, B.C.",
                "distance_km": Decimal("6.200"),
                "duration": Decimal("18.0"),
                "delivery_fee": Decimal("129.60"),
            },
            {
                "key": "shipped",
                "status": Order.Status.SHIPPED,
                "items": [("Mesa Centro Fresno", 1)],
                "address": "Playas de Tijuana, Tijuana, B.C.",
                "distance_km": Decimal("18.300"),
                "duration": Decimal("42.0"),
                "delivery_fee": Decimal("226.40"),
            },
            {
                "key": "delivered",
                "status": Order.Status.DELIVERED,
                "items": [("Mesa Redonda Terra", 2)],
                "address": "Otay Universidad, Tijuana, B.C.",
                "distance_km": Decimal("10.100"),
                "duration": Decimal("25.0"),
                "delivery_fee": Decimal("160.80"),
            },
            {
                "key": "cancelled",
                "status": Order.Status.CANCELLED,
                "items": [("Silla Lectura Olivo", 1)],
                "address": "Col. Cacho, Tijuana, B.C.",
                "distance_km": Decimal("5.500"),
                "duration": Decimal("15.0"),
                "delivery_fee": Decimal("124.00"),
            },
        ]

        seeded_orders = {}
        for index, spec in enumerate(order_specs, start=1):
            seeded_orders[spec["key"]] = self._upsert_order(
                customer=users["customer"],
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
