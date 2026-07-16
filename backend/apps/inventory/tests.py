from decimal import Decimal

import pytest
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from django.urls import reverse
from rest_framework.test import APIClient

from apps.catalog.models import Category, Product
from apps.inventory.models import InventoryMovement

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
    assert response.data["results"][0]["sku"] == product.sku
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

    movement = InventoryMovement.objects.get(product=product)
    assert movement.movement_type == InventoryMovement.Types.MANUAL_ADJUSTMENT
    assert movement.quantity_delta == 7
    assert movement.previous_stock == 1
    assert movement.new_stock == 8
    assert movement.reason == ""
    assert movement.created_by == employee


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


def test_stock_update_reason_alone_is_rejected():
    employee = create_user("empleado_reason_only")
    product = create_product("Reason only stock sofa", stock=1)

    response = api_client(employee).patch(
        reverse("inventory-stock-update", args=[product.id]),
        {"reason": "counted shelf"},
        format="json",
    )

    assert response.status_code == 400
    assert InventoryMovement.objects.count() == 0


def test_minimum_stock_update_does_not_create_stock_movement():
    employee = create_user("empleado_minimum_only")
    product = create_product("Minimum only sofa", stock=5, minimum_stock=2)

    response = api_client(employee).patch(
        reverse("inventory-stock-update", args=[product.id]),
        {"minimum_stock": 3},
        format="json",
    )

    assert response.status_code == 200
    assert response.data["minimum_stock"] == 3
    assert InventoryMovement.objects.count() == 0


def test_employee_can_list_inventory_movements():
    employee = create_user("empleado_movements")
    product = create_product("Movement list sofa", stock=1)
    InventoryMovement.objects.create(
        product=product,
        movement_type=InventoryMovement.Types.MANUAL_ADJUSTMENT,
        quantity_delta=4,
        previous_stock=1,
        new_stock=5,
        reason="cycle count",
        created_by=employee,
    )

    response = api_client(employee).get(reverse("inventory-movements"))

    assert response.status_code == 200
    assert response.data["results"][0]["product"] == product.id
    assert response.data["results"][0]["product_sku"] == product.sku
    assert response.data["results"][0]["product_name"] == product.name
    assert response.data["results"][0]["quantity_delta"] == 4
    assert response.data["results"][0]["reason"] == "cycle count"
    assert response.data["results"][0]["created_by"] == employee.id


def test_inventory_movement_rejects_invalid_stock_math():
    employee = create_user("empleado_bad_math")
    product = create_product("Bad math sofa", stock=5)

    movement = InventoryMovement(
        product=product,
        movement_type=InventoryMovement.Types.MANUAL_ADJUSTMENT,
        quantity_delta=3,
        previous_stock=5,
        new_stock=7,
        created_by=employee,
    )

    with pytest.raises(ValidationError):
        movement.save()


def test_inventory_movement_rejects_zero_delta():
    employee = create_user("empleado_zero_delta")
    product = create_product("Zero delta sofa", stock=5)

    movement = InventoryMovement(
        product=product,
        movement_type=InventoryMovement.Types.MANUAL_ADJUSTMENT,
        quantity_delta=0,
        previous_stock=5,
        new_stock=5,
        created_by=employee,
    )

    with pytest.raises(ValidationError):
        movement.save()


def test_inventory_movements_are_append_only():
    employee = create_user("empleado_append_only")
    product = create_product("Append only sofa", stock=5)
    movement = InventoryMovement.objects.create(
        product=product,
        movement_type=InventoryMovement.Types.MANUAL_ADJUSTMENT,
        quantity_delta=2,
        previous_stock=5,
        new_stock=7,
        created_by=employee,
    )

    movement.reason = "edited"

    with pytest.raises(ValidationError):
        movement.save()

    with pytest.raises(ValidationError):
        movement.delete()
