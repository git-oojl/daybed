from decimal import Decimal

import pytest
from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework.test import APIClient

from apps.cart.models import CartItem
from apps.catalog.models import Category, Product

pytestmark = pytest.mark.django_db

User = get_user_model()


def api_client(user=None):
    client = APIClient()
    if user:
        client.force_authenticate(user=user)
    return client


def create_user(username, role=User.Roles.CUSTOMER):
    return User.objects.create_user(
        username=username,
        email=f"{username}@example.com",
        password="StrongPass123!",
        role=role,
    )


def create_product(name="Cart sofa", active=True, stock=8, price=Decimal("100.00")):
    category = Category.objects.create(name=f"{name} category", active=True)
    return Product.objects.create(
        name=name,
        description="Furniture",
        price=price,
        category=category,
        stock=stock,
        minimum_stock=2,
        active=active,
    )


def test_cart_requires_authentication():
    response = api_client().get(reverse("cart-detail"))

    assert response.status_code == 401


def test_cart_blocks_employee_role():
    employee = create_user("empleado_cart", User.Roles.EMPLOYEE)

    response = api_client(employee).get(reverse("cart-detail"))

    assert response.status_code == 403


def test_admin_can_use_cart_for_buyer_flow_preview():
    admin = create_user("admin_cart", User.Roles.ADMIN)

    response = api_client(admin).get(reverse("cart-detail"))

    assert response.status_code == 200
    assert response.data["items"] == []


def test_customer_can_add_item_and_view_subtotal_without_stock_decrement():
    customer = create_user("cliente_cart")
    product = create_product(price=Decimal("125.50"), stock=7)

    response = api_client(customer).post(
        reverse("cart-item-list"),
        {"product_id": product.id, "quantity": 2},
        format="json",
    )

    assert response.status_code == 201
    assert response.data["quantity"] == 2
    assert response.data["line_total"] == "251.00"

    product.refresh_from_db()
    assert product.stock == 7

    cart_response = api_client(customer).get(reverse("cart-detail"))
    assert cart_response.status_code == 200
    assert cart_response.data["subtotal"] == "251.00"
    assert len(cart_response.data["items"]) == 1


def test_adding_same_product_increments_existing_cart_item():
    customer = create_user("cliente_increment")
    product = create_product()
    client = api_client(customer)

    first_response = client.post(
        reverse("cart-item-list"),
        {"product_id": product.id, "quantity": 1},
        format="json",
    )
    second_response = client.post(
        reverse("cart-item-list"),
        {"product_id": product.id, "quantity": 3},
        format="json",
    )

    assert first_response.status_code == 201
    assert second_response.status_code == 200
    assert second_response.data["quantity"] == 4
    assert CartItem.objects.count() == 1


def test_quantity_must_be_positive_when_adding_or_updating():
    customer = create_user("cliente_quantity")
    product = create_product()
    client = api_client(customer)

    add_response = client.post(
        reverse("cart-item-list"),
        {"product_id": product.id, "quantity": 0},
        format="json",
    )

    assert add_response.status_code == 400

    valid_response = client.post(
        reverse("cart-item-list"),
        {"product_id": product.id, "quantity": 1},
        format="json",
    )
    item_id = valid_response.data["id"]

    update_response = client.patch(
        reverse("cart-item-detail", args=[item_id]),
        {"quantity": 0},
        format="json",
    )

    assert update_response.status_code == 400


def test_cannot_add_inactive_product_to_cart():
    customer = create_user("cliente_inactive")
    product = create_product(active=False)

    response = api_client(customer).post(
        reverse("cart-item-list"),
        {"product_id": product.id, "quantity": 1},
        format="json",
    )

    assert response.status_code == 400
    assert CartItem.objects.count() == 0


def test_customer_cannot_access_another_customers_cart_item():
    owner = create_user("cliente_owner")
    other = create_user("cliente_other")
    product = create_product()
    owner_response = api_client(owner).post(
        reverse("cart-item-list"),
        {"product_id": product.id, "quantity": 1},
        format="json",
    )

    response = api_client(other).get(
        reverse("cart-item-detail", args=[owner_response.data["id"]])
    )

    assert response.status_code == 404


def test_customer_can_update_remove_and_clear_cart_without_stock_decrement():
    customer = create_user("cliente_clear")
    product = create_product(stock=5)
    client = api_client(customer)
    add_response = client.post(
        reverse("cart-item-list"),
        {"product_id": product.id, "quantity": 1},
        format="json",
    )
    item_id = add_response.data["id"]

    update_response = client.patch(
        reverse("cart-item-detail", args=[item_id]),
        {"quantity": 4},
        format="json",
    )
    assert update_response.status_code == 200
    assert update_response.data["quantity"] == 4

    delete_response = client.delete(reverse("cart-item-detail", args=[item_id]))
    assert delete_response.status_code == 204

    client.post(
        reverse("cart-item-list"),
        {"product_id": product.id, "quantity": 2},
        format="json",
    )
    clear_response = client.delete(reverse("cart-detail"))
    assert clear_response.status_code == 200
    assert clear_response.data["items"] == []
    assert clear_response.data["subtotal"] == "0.00"

    product.refresh_from_db()
    assert product.stock == 5
