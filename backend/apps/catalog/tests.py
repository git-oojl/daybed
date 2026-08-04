from decimal import Decimal

import pytest
from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from django.urls import reverse
from rest_framework.test import APIClient

from apps.catalog.models import Category, Product

pytestmark = pytest.mark.django_db

User = get_user_model()


def api_client(user=None):
    client = APIClient()
    if user:
        client.force_authenticate(user=user)
    return client


def create_user(username, role):
    return User.objects.create_user(
        username=username,
        email=f"{username}@example.com",
        password="StrongPass123!",
        role=role,
    )


def create_category(name="Sofas", active=True):
    return Category.objects.create(name=name, description="Living room", active=active)


def create_product(name="Daybed Sofa", category=None, active=True, **overrides):
    defaults = {
        "description": "Comfortable furniture",
        "price": Decimal("1200.00"),
        "category": category or create_category(),
        "material": "wood",
        "color": "green",
        "style": "modern",
        "stock": 5,
        "minimum_stock": 2,
        "active": active,
    }
    defaults.update(overrides)
    return Product.objects.create(name=name, **defaults)


def test_public_product_list_only_returns_active_products_in_active_categories():
    active_category = create_category("Active category")
    inactive_category = create_category("Inactive category", active=False)
    visible = create_product("Visible sofa", category=active_category)
    create_product("Inactive product", category=active_category, active=False)
    create_product("Hidden category product", category=inactive_category)

    response = api_client().get(reverse("catalog-product-list"))

    assert response.status_code == 200
    product_ids = {item["id"] for item in response.data["results"]}
    assert product_ids == {visible.id}


def test_public_product_detail_hides_inactive_products():
    product = create_product(active=False)

    response = api_client().get(reverse("catalog-product-detail", args=[product.id]))

    assert response.status_code == 404


def test_public_products_support_search_and_filters():
    category = Category.objects.create(
        name="Chairs",
        description="Living room",
        active=True,
        specification_schema=[
            {
                "key": "shape",
                "label": "Shape",
                "type": "text",
                "filterable": True,
            },
            {
                "key": "assembly_required",
                "label": "Assembly required",
                "type": "boolean",
                "filterable": True,
            },
        ],
    )
    expected = create_product(
        "Oak chair",
        category=category,
        material="oak",
        color="blue",
        style="classic",
        price=Decimal("900.00"),
        stock=3,
        width_cm=Decimal("80.00"),
        specifications={"shape": "rectangular", "assembly_required": False},
    )
    create_product(
        "Pine table",
        material="pine",
        color="brown",
        style="rustic",
        price=Decimal("1500.00"),
        stock=0,
        width_cm=Decimal("120.00"),
        specifications={"shape": "round", "assembly_required": True},
    )

    response = api_client().get(
        reverse("catalog-product-list"),
        {
            "search": "chair",
            "category__slug": category.slug,
            "material": "oak",
            "color": "blue",
            "style": "classic",
            "min_price": "800.00",
            "max_price": "1000.00",
            "in_stock": "true",
            "min_width_cm": "70",
            "max_width_cm": "90",
            "spec.shape": "rectangular",
            "spec.assembly_required": "false",
        },
    )

    assert response.status_code == 200
    assert [item["id"] for item in response.data["results"]] == [expected.id]


def test_product_serializer_exposes_low_stock_flag():
    product = create_product(
        stock=2,
        minimum_stock=2,
        width_cm=Decimal("200.00"),
        height_cm=Decimal("80.00"),
        specifications={"assembly_required": False},
    )

    response = api_client().get(reverse("catalog-product-detail", args=[product.id]))

    assert response.status_code == 200
    assert response.data["sku"] == product.sku
    assert response.data["low_stock"] is True
    assert response.data["width_cm"] == "200.00"
    assert response.data["structured_dimensions"]["height_cm"] == "80.00"
    assert response.data["specifications"] == {"assembly_required": False}


def test_product_auto_generates_sku_when_missing():
    product = create_product()

    assert product.sku == f"DAY-{product.id:05d}"


def test_staff_product_management_accepts_structured_product_data():
    employee = create_user("empleado_structured_product", User.Roles.EMPLOYEE)
    category = create_category()

    response = api_client(employee).post(
        reverse("staff-product-list"),
        {
            "name": "Structured sofa",
            "description": "Created by staff",
            "price": "999.99",
            "category": category.id,
            "sku": "TEST-SOFA-001",
            "material": "linen",
            "color": "gray",
            "style": "minimal",
            "width_cm": "180.00",
            "height_cm": "75.00",
            "depth_cm": "80.00",
            "weight_kg": "35.50",
            "specifications": {
                "upholstery_material": "linen",
                "assembly_required": True,
            },
            "stock": 10,
            "minimum_stock": 3,
            "active": True,
        },
        format="json",
    )

    assert response.status_code == 201
    assert response.data["sku"] == "TEST-SOFA-001"
    assert response.data["depth_cm"] == "80.00"
    assert Product.objects.filter(sku="TEST-SOFA-001", active=True).exists()


def test_customer_cannot_use_staff_product_management():
    customer = create_user("cliente_catalog", User.Roles.CUSTOMER)

    response = api_client(customer).post(
        reverse("staff-product-list"),
        {
            "name": "Customer product",
            "description": "Not allowed",
            "price": "100.00",
            "category": create_category().id,
        },
        format="json",
    )

    assert response.status_code == 403


def test_employee_can_create_product():
    employee = create_user("empleado_catalog", User.Roles.EMPLOYEE)
    category = create_category()

    response = api_client(employee).post(
        reverse("staff-product-list"),
        {
            "name": "Staff sofa",
            "description": "Created by staff",
            "price": "999.99",
            "category": category.id,
            "material": "linen",
            "color": "gray",
            "style": "minimal",
            "stock": 10,
            "minimum_stock": 3,
            "active": True,
        },
        format="json",
    )

    assert response.status_code == 201
    assert Product.objects.filter(name="Staff sofa", active=True).exists()


def test_staff_product_management_accepts_uploaded_main_image(settings, tmp_path):
    settings.MEDIA_ROOT = tmp_path
    employee = create_user("empleado_product_image", User.Roles.EMPLOYEE)
    category = create_category()
    image = SimpleUploadedFile(
        "sofa.gif",
        b"GIF87a\x01\x00\x01\x00\x80\x01\x00\x00\x00\x00ccc,\x00\x00"
        b"\x00\x00\x01\x00\x01\x00\x00\x02\x02D\x01\x00;",
        content_type="image/gif",
    )

    response = api_client(employee).post(
        reverse("staff-product-list"),
        {
            "name": "Staff sofa with image",
            "description": "Created by staff",
            "price": "999.99",
            "category": category.id,
            "stock": 10,
            "minimum_stock": 3,
            "active": True,
            "image": image,
        },
        format="multipart",
    )

    assert response.status_code == 201
    assert response.data["main_image"]

    product = Product.objects.get(name="Staff sofa with image")
    assert product.main_image.name.startswith("products/sofa")


def test_staff_product_management_accepts_remote_image_url(
    monkeypatch,
    settings,
    tmp_path,
):
    settings.MEDIA_ROOT = tmp_path
    employee = create_user("empleado_remote_product_image", User.Roles.EMPLOYEE)
    category = create_category()
    image_bytes = (
        b"GIF87a\x01\x00\x01\x00\x80\x01\x00\x00\x00\x00ccc,\x00\x00"
        b"\x00\x00\x01\x00\x01\x00\x00\x02\x02D\x01\x00;"
    )

    class FakeStreamResponse:
        headers = {"content-type": "image/gif"}

        def __enter__(self):
            return self

        def __exit__(self, exc_type, exc, traceback):
            return False

        def raise_for_status(self):
            return None

        def iter_bytes(self):
            yield image_bytes

    def fake_stream(method, url, **kwargs):
        assert method == "GET"
        assert url == "https://example.test/remote-sofa.gif"
        assert kwargs["follow_redirects"] is True
        return FakeStreamResponse()

    monkeypatch.setattr("apps.catalog.serializers.httpx.stream", fake_stream)

    response = api_client(employee).post(
        reverse("staff-product-list"),
        {
            "name": "Staff sofa with remote image",
            "description": "Created by staff",
            "price": "999.99",
            "category": category.id,
            "stock": 10,
            "minimum_stock": 3,
            "active": True,
            "image_url": "https://example.test/remote-sofa.gif",
        },
        format="json",
    )

    assert response.status_code == 201
    assert response.data["main_image"]

    product = Product.objects.get(name="Staff sofa with remote image")
    assert product.main_image.name.startswith("products/remote-sofa")


def test_staff_product_management_rejects_oversized_remote_image(monkeypatch):
    employee = create_user("empleado_large_remote_product_image", User.Roles.EMPLOYEE)
    category = create_category()

    class FakeStreamResponse:
        headers = {"content-type": "image/gif"}

        def __enter__(self):
            return self

        def __exit__(self, exc_type, exc, traceback):
            return False

        def raise_for_status(self):
            return None

        def iter_bytes(self):
            yield b"x" * (5 * 1024 * 1024)
            yield b"x"

    def fake_stream(method, url, **kwargs):
        return FakeStreamResponse()

    monkeypatch.setattr("apps.catalog.serializers.httpx.stream", fake_stream)

    response = api_client(employee).post(
        reverse("staff-product-list"),
        {
            "name": "Staff sofa with oversized remote image",
            "description": "Created by staff",
            "price": "999.99",
            "category": category.id,
            "stock": 10,
            "minimum_stock": 3,
            "active": True,
            "image_url": "https://example.test/remote-sofa.gif",
        },
        format="json",
    )

    assert response.status_code == 400
    assert "5 MB" in str(response.data)
    assert not Product.objects.filter(
        name="Staff sofa with oversized remote image"
    ).exists()


def test_staff_product_management_rejects_negative_price():
    employee = create_user("empleado_negative_price", User.Roles.EMPLOYEE)
    category = create_category()

    response = api_client(employee).post(
        reverse("staff-product-list"),
        {
            "name": "Invalid price sofa",
            "description": "Invalid",
            "price": "-1.00",
            "category": category.id,
        },
        format="json",
    )

    assert response.status_code == 400
    assert "precio" in str(response.data).lower()


def test_staff_product_management_rejects_negative_dimensions():
    employee = create_user("empleado_negative_dimensions", User.Roles.EMPLOYEE)
    category = create_category()

    response = api_client(employee).post(
        reverse("staff-product-list"),
        {
            "name": "Invalid dimension sofa",
            "description": "Invalid",
            "price": "100.00",
            "category": category.id,
            "width_cm": "-1.00",
        },
        format="json",
    )

    assert response.status_code == 400
    assert "width_cm" in response.data


def test_category_schema_rejects_invalid_payload():
    employee = create_user("empleado_invalid_schema", User.Roles.EMPLOYEE)

    response = api_client(employee).post(
        reverse("staff-category-list"),
        {
            "name": "Invalid schema",
            "description": "Invalid",
            "specification_schema": [{"key": "shape", "type": "invalid"}],
            "active": True,
        },
        format="json",
    )

    assert response.status_code == 400
    assert "specification_schema" in response.data


def test_spec_filter_rejects_non_filterable_keys():
    category = Category.objects.create(
        name="Tables",
        active=True,
        specification_schema=[
            {"key": "shape", "label": "Shape", "type": "text", "filterable": True},
            {
                "key": "features",
                "label": "Features",
                "type": "list",
                "filterable": False,
            },
        ],
    )
    create_product(
        "Filter table",
        category=category,
        specifications={"shape": "round", "features": ["storage"]},
    )

    response = api_client().get(
        reverse("catalog-product-list"),
        {"category__slug": category.slug, "spec.features": "storage"},
    )

    assert response.status_code == 400
    assert "features" in str(response.data)


def test_spec_filter_requires_category_context():
    category = Category.objects.create(
        name="Beds",
        active=True,
        specification_schema=[
            {"key": "shape", "label": "Shape", "type": "text", "filterable": True},
        ],
    )
    create_product("Filter bed", category=category, specifications={"shape": "square"})

    response = api_client().get(
        reverse("catalog-product-list"),
        {"spec.shape": "square"},
    )

    assert response.status_code == 400
    assert "category" in str(response.data)


def test_spec_filter_rejects_invalid_boolean_values():
    category = Category.objects.create(
        name="Configurable sofas",
        active=True,
        specification_schema=[
            {
                "key": "assembly_required",
                "label": "Assembly required",
                "type": "boolean",
                "filterable": True,
            },
        ],
    )
    create_product(
        "Boolean sofa",
        category=category,
        specifications={"assembly_required": True},
    )

    response = api_client().get(
        reverse("catalog-product-list"),
        {
            "category__slug": category.slug,
            "spec.assembly_required": "maybe",
        },
    )

    assert response.status_code == 400
    assert "booleano" in str(response.data)


def test_staff_delete_deactivates_product_instead_of_hard_delete():
    employee = create_user("empleado_delete", User.Roles.EMPLOYEE)
    product = create_product()

    response = api_client(employee).delete(
        reverse("staff-product-detail", args=[product.id])
    )

    assert response.status_code == 200
    product.refresh_from_db()
    assert product.active is False
    assert Product.objects.filter(id=product.id).exists()
