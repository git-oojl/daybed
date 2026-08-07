from decimal import Decimal

import pytest
from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework.test import APIClient

from apps.cart.models import CartItem
from apps.catalog.models import Category, Product
from apps.store.models import StoreSettings

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
    assert api_client().get(reverse("cart-detail")).status_code == 401


@pytest.mark.parametrize("role", [User.Roles.CUSTOMER, User.Roles.EMPLOYEE, User.Roles.ADMIN])
def test_every_authenticated_daybed_role_has_a_personal_cart(role):
    user = create_user(f"cart_{role}", role)

    response = api_client(user).get(reverse("cart-detail"))

    assert response.status_code == 200
    assert response.data["items"] == []


def test_add_increment_update_remove_and_clear_preserve_product_stock():
    user = create_user("cart_lifecycle")
    product = create_product(price=Decimal("125.50"), stock=7)
    client = api_client(user)

    first = client.post(
        reverse("cart-item-list"),
        {"product_id": product.id, "quantity": 2},
        format="json",
    )
    second = client.post(
        reverse("cart-item-list"),
        {"product_id": product.id, "quantity": 1},
        format="json",
    )

    assert first.status_code == 201
    assert second.status_code == 200
    assert second.data["quantity"] == 3
    assert second.data["line_total"] == "376.50"
    assert CartItem.objects.count() == 1

    updated = client.patch(
        reverse("cart-item-detail", args=[second.data["id"]]),
        {"quantity": 4},
        format="json",
    )
    assert updated.status_code == 200
    assert updated.data["quantity"] == 4

    cart = client.get(reverse("cart-detail"))
    assert cart.data["subtotal"] == "502.00"

    removed = client.delete(reverse("cart-item-detail", args=[second.data["id"]]))
    assert removed.status_code == 204

    client.post(
        reverse("cart-item-list"),
        {"product_id": product.id, "quantity": 2},
        format="json",
    )
    cleared = client.delete(reverse("cart-detail"))
    assert cleared.status_code == 200
    assert cleared.data["items"] == []
    assert cleared.data["subtotal"] == "0.00"

    product.refresh_from_db()
    assert product.stock == 7


@pytest.mark.parametrize("quantity", [0, -1])
def test_quantity_must_be_positive(quantity):
    user = create_user(f"bad_quantity_{quantity}")
    product = create_product()

    response = api_client(user).post(
        reverse("cart-item-list"),
        {"product_id": product.id, "quantity": quantity},
        format="json",
    )

    assert response.status_code == 400


@pytest.mark.parametrize(
    ("active", "stock", "expected_text"),
    [
        (False, 5, "product_id"),
        (True, 0, "agotado"),
    ],
)
def test_unavailable_product_cannot_be_added(active, stock, expected_text):
    user = create_user(f"unavailable_{active}_{stock}")
    product = create_product(active=active, stock=stock)

    response = api_client(user).post(
        reverse("cart-item-list"),
        {"product_id": product.id, "quantity": 1},
        format="json",
    )

    assert response.status_code == 400
    assert expected_text.lower() in str(response.data).lower()
    assert CartItem.objects.count() == 0


def test_cart_rejects_quantity_above_authoritative_stock_on_add_and_update():
    user = create_user("cart_stock_limit")
    product = create_product(stock=2)
    client = api_client(user)

    too_many = client.post(
        reverse("cart-item-list"),
        {"product_id": product.id, "quantity": 3},
        format="json",
    )
    assert too_many.status_code == 400
    assert "2" in str(too_many.data)

    added = client.post(
        reverse("cart-item-list"),
        {"product_id": product.id, "quantity": 1},
        format="json",
    )
    updated = client.patch(
        reverse("cart-item-detail", args=[added.data["id"]]),
        {"quantity": 3},
        format="json",
    )
    assert updated.status_code == 400
    assert CartItem.objects.get(pk=added.data["id"]).quantity == 1


def test_paused_storefront_preserves_existing_cart_and_blocks_mutation():
    user = create_user("paused_storefront")
    product = create_product(stock=5)
    client = api_client(user)
    added = client.post(
        reverse("cart-item-list"),
        {"product_id": product.id, "quantity": 1},
        format="json",
    )
    settings = StoreSettings.get_active()
    settings.storefront_available = False
    settings.save(update_fields=("storefront_available", "updated_at"))

    blocked_add = client.post(
        reverse("cart-item-list"),
        {"product_id": product.id, "quantity": 1},
        format="json",
    )
    blocked_update = client.patch(
        reverse("cart-item-detail", args=[added.data["id"]]),
        {"quantity": 2},
        format="json",
    )
    readable = client.get(reverse("cart-detail"))

    assert blocked_add.status_code == 400
    assert blocked_update.status_code == 400
    assert "pausadas" in str(blocked_add.data).lower()
    assert readable.status_code == 200
    assert readable.data["items"][0]["quantity"] == 1


def test_user_cannot_access_another_users_cart_item():
    owner = create_user("cart_owner")
    other = create_user("cart_other")
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
