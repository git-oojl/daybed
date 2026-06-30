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


def create_user(username, role=User.Roles.EMPLOYEE):
    return User.objects.create_user(
        username=username,
        email=f"{username}@example.com",
        password="StrongPass123!",
        role=role,
    )


def create_product(name, stock, minimum_stock=2, active=True):
    category = Category.objects.create(name=f"{name} category")
    return Product.objects.create(
        name=name,
        description="Furniture",
        price=Decimal("100.00"),
        category=category,
        stock=stock,
        minimum_stock=minimum_stock,
        active=active,
    )


def test_inventory_requires_employee_or_admin():
    customer = create_user("cliente_inventory", User.Roles.CUSTOMER)

    anonymous_response = api_client().get(reverse("inventory-products"))
    customer_response = api_client(customer).get(reverse("inventory-products"))

    assert anonymous_response.status_code == 401
    assert customer_response.status_code == 403


def test_employee_can_list_inventory_products():
    employee = create_user("empleado_inventory")
    product = create_product("Inventory sofa", stock=7, minimum_stock=2)

    response = api_client(employee).get(reverse("inventory-products"))

    assert response.status_code == 200
    assert response.data["results"][0]["id"] == product.id
    assert response.data["results"][0]["stock"] == 7
    assert response.data["results"][0]["low_stock"] is False


def test_low_stock_endpoint_returns_only_active_low_stock_products():
    employee = create_user("empleado_low_stock")
    low = create_product("Low stock sofa", stock=2, minimum_stock=2)
    create_product("Healthy sofa", stock=5, minimum_stock=2)
    create_product("Inactive low sofa", stock=0, minimum_stock=2, active=False)

    response = api_client(employee).get(reverse("inventory-low-stock"))

    assert response.status_code == 200
    assert [item["id"] for item in response.data["results"]] == [low.id]


def test_employee_can_update_stock_and_minimum_stock():
    employee = create_user("empleado_stock_update")
    product = create_product("Stock update sofa", stock=1, minimum_stock=2)

    response = api_client(employee).patch(
        reverse("inventory-stock-update", args=[product.id]),
        {"stock": 8, "minimum_stock": 3},
        format="json",
    )

    assert response.status_code == 200
    assert response.data["stock"] == 8
    assert response.data["minimum_stock"] == 3
    assert response.data["low_stock"] is False

    product.refresh_from_db()
    assert product.stock == 8
    assert product.minimum_stock == 3


def test_stock_update_rejects_empty_payload():
    employee = create_user("empleado_empty_stock")
    product = create_product("Empty stock payload sofa", stock=1)

    response = api_client(employee).patch(
        reverse("inventory-stock-update", args=[product.id]),
        {},
        format="json",
    )

    assert response.status_code == 400
    assert "Provide stock" in str(response.data)
