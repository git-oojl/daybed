from decimal import Decimal

import pytest
from django.contrib.auth import get_user_model
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
        "dimensions": "200 x 90 x 80 cm",
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
    category = create_category("Chairs")
    expected = create_product(
        "Oak chair",
        category=category,
        material="oak",
        color="blue",
        style="classic",
    )
    create_product("Pine table", material="pine", color="brown", style="rustic")

    response = api_client().get(
        reverse("catalog-product-list"),
        {
            "search": "chair",
            "category__slug": category.slug,
            "material": "oak",
            "color": "blue",
            "style": "classic",
        },
    )

    assert response.status_code == 200
    assert [item["id"] for item in response.data["results"]] == [expected.id]


def test_product_serializer_exposes_low_stock_flag():
    product = create_product(stock=2, minimum_stock=2)

    response = api_client().get(reverse("catalog-product-detail", args=[product.id]))

    assert response.status_code == 200
    assert response.data["low_stock"] is True


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
            "dimensions": "180 x 80 x 75 cm",
            "stock": 10,
            "minimum_stock": 3,
            "active": True,
        },
        format="json",
    )

    assert response.status_code == 201
    assert Product.objects.filter(name="Staff sofa", active=True).exists()


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
