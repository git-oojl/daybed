from decimal import Decimal

import pytest
from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework.test import APIClient

from apps.access_control.services import (
    EMPLOYEE_GROUP_NAME,
    PERMISSION_BY_CODE,
    get_effective_permission_codes,
    set_employee_permission_codes,
)
from apps.cart.models import Cart, CartItem
from apps.catalog.models import Category, Product
from apps.inventory.models import InventoryMovement
from apps.orders.models import Order

pytestmark = pytest.mark.django_db

User = get_user_model()


def api_client(user=None):
    client = APIClient()
    if user:
        client.force_authenticate(user=user)
    return client


def create_user(username, role=User.Roles.EMPLOYEE, **overrides):
    return User.objects.create_user(
        username=username,
        email=f"{username}@example.com",
        password="StrongPass123!",
        role=role,
        **overrides,
    )


def create_category(name="RBAC category"):
    return Category.objects.create(name=name, active=True)


def create_product(name="RBAC product", **overrides):
    defaults = {
        "description": "RBAC product",
        "price": Decimal("100.00"),
        "category": create_category(f"{name} category"),
        "material": "wood",
        "color": "green",
        "style": "modern",
        "stock": 5,
        "minimum_stock": 2,
        "active": True,
    }
    defaults.update(overrides)
    return Product.objects.create(name=name, **defaults)


def create_order(customer=None, suffix=""):
    customer = customer or create_user("rbac_customer", User.Roles.CUSTOMER)
    product_name = f"RBAC order product {suffix or customer.username}"
    product = create_product(product_name, stock=10)
    cart, _created = Cart.objects.get_or_create(user=customer)
    CartItem.objects.create(cart=cart, product=product, quantity=1)
    order = Order.objects.create(
        user=customer,
        original_address="123 Main St",
        formatted_address="123 Main St",
        latitude=Decimal("32.50000000"),
        longitude=Decimal("-117.00000000"),
        distance_km=Decimal("1.000"),
        estimated_duration_minutes=Decimal("5.0"),
        delivery_fee=Decimal("80.00"),
        delivery_zone="standard",
        products_subtotal=Decimal("100.00"),
        total=Decimal("180.00"),
    )
    return order


def allow_only(*permission_codes):
    set_employee_permission_codes(permission_codes)


def assert_forbidden_without_permission(method, url, permission_code, data=None):
    employee = create_user(f"employee_no_{permission_code.replace('.', '_')}")
    allow_only()

    response = getattr(api_client(employee), method)(url, data=data, format="json")

    assert response.status_code == 403


def test_employee_group_membership_syncs_when_role_changes():
    user = create_user("rbac_sync_customer", User.Roles.CUSTOMER)

    assert not user.groups.filter(name=EMPLOYEE_GROUP_NAME).exists()

    user.role = User.Roles.EMPLOYEE
    user.save(update_fields=("role",))
    assert user.groups.filter(name=EMPLOYEE_GROUP_NAME).exists()

    user.role = User.Roles.ADMIN
    user.save(update_fields=("role",))
    assert not user.groups.filter(name=EMPLOYEE_GROUP_NAME).exists()


def test_accounts_me_includes_effective_permissions_without_jwt_claims():
    employee = create_user("rbac_me_employee")
    allow_only("products.view")

    first_response = api_client(employee).get(reverse("current-user"))
    allow_only("orders.view")
    second_response = api_client(employee).get(reverse("current-user"))

    assert first_response.status_code == 200
    assert first_response.data["effective_permission_codes"] == ["products.view"]
    assert second_response.status_code == 200
    assert second_response.data["effective_permission_codes"] == ["orders.view"]


def test_access_roles_returns_real_counts_and_permission_catalog():
    admin = create_user("rbac_roles_admin", User.Roles.ADMIN)
    create_user("rbac_roles_employee", User.Roles.EMPLOYEE)
    create_user("rbac_roles_customer", User.Roles.CUSTOMER)

    response = api_client(admin).get(reverse("access-roles"))

    assert response.status_code == 200
    assert {item["code"] for item in response.data["permission_catalog"]} == set(
        PERMISSION_BY_CODE
    )
    role_payload = {role["id"]: role for role in response.data["roles"]}
    assert role_payload[User.Roles.ADMIN]["user_count"] == 1
    assert role_payload[User.Roles.EMPLOYEE]["user_count"] == 1
    assert role_payload[User.Roles.CUSTOMER]["user_count"] == 1
    assert role_payload[User.Roles.ADMIN]["editable"] is False
    assert role_payload[User.Roles.EMPLOYEE]["editable"] is True
    assert "editor" not in role_payload
    assert "invitado" not in role_payload


def test_only_admin_can_manage_employee_permission_bundle():
    employee = create_user("rbac_roles_employee_only", User.Roles.EMPLOYEE)

    get_response = api_client(employee).get(reverse("access-roles"))
    patch_response = api_client(employee).patch(
        reverse("access-employee-role"),
        {"permission_codes": ["products.view"]},
        format="json",
    )

    assert get_response.status_code == 403
    assert patch_response.status_code == 403


def test_employee_permission_patch_accepts_only_approved_codes():
    admin = create_user("rbac_roles_patch_admin", User.Roles.ADMIN)

    unknown_response = api_client(admin).patch(
        reverse("access-employee-role"),
        {"permission_codes": ["products.view", "users.manage"]},
        format="json",
    )
    valid_response = api_client(admin).patch(
        reverse("access-employee-role"),
        {"permission_codes": ["products.view", "orders.view"]},
        format="json",
    )

    assert unknown_response.status_code == 400
    assert "users.manage" in str(unknown_response.data)
    assert valid_response.status_code == 200
    assert set(
        get_effective_permission_codes(create_user("rbac_roles_effective_employee"))
    ) == {"orders.view", "products.view"}


def test_dashboard_view_permission_allows_and_blocks_direct_api_calls():
    employee = create_user("rbac_dashboard_employee")
    allow_only("dashboard.view")

    allowed = api_client(employee).get(reverse("dashboard-metrics"))
    assert_forbidden_without_permission(
        "get",
        reverse("dashboard-metrics"),
        "dashboard.view",
    )

    assert allowed.status_code == 200


def test_products_view_permission_allows_and_blocks_direct_api_calls():
    create_product()
    employee = create_user("rbac_products_view_employee")
    allow_only("products.view")

    allowed = api_client(employee).get(reverse("staff-product-list"))
    assert_forbidden_without_permission(
        "get",
        reverse("staff-product-list"),
        "products.view",
    )

    assert allowed.status_code == 200


def test_products_create_permission_allows_and_blocks_direct_api_calls():
    category = create_category("RBAC create category")
    payload = {
        "name": "RBAC created product",
        "description": "Created by permission",
        "price": "123.00",
        "category": category.id,
        "stock": 4,
        "minimum_stock": 1,
        "active": True,
    }
    employee = create_user("rbac_products_create_employee")
    allow_only("products.create")

    allowed = api_client(employee).post(
        reverse("staff-product-list"),
        payload,
        format="json",
    )
    assert_forbidden_without_permission(
        "post",
        reverse("staff-product-list"),
        "products.create",
        data=payload,
    )

    assert allowed.status_code == 201


def test_products_update_permission_allows_and_blocks_direct_api_calls():
    product = create_product()
    employee = create_user("rbac_products_update_employee")
    allow_only("products.update")

    allowed = api_client(employee).patch(
        reverse("staff-product-detail", args=[product.id]),
        {"name": "RBAC updated product"},
        format="json",
    )
    assert_forbidden_without_permission(
        "patch",
        reverse("staff-product-detail", args=[product.id]),
        "products.update",
        data={"name": "Blocked update"},
    )

    assert allowed.status_code == 200


def test_products_deactivate_permission_allows_and_blocks_direct_api_calls():
    product = create_product("RBAC deactivate product")
    blocked_product = create_product("RBAC blocked deactivate product")
    employee = create_user("rbac_products_deactivate_employee")
    allow_only("products.deactivate")

    allowed = api_client(employee).delete(
        reverse("staff-product-detail", args=[product.id])
    )
    assert_forbidden_without_permission(
        "delete",
        reverse("staff-product-detail", args=[blocked_product.id]),
        "products.deactivate",
    )

    assert allowed.status_code == 200
    product.refresh_from_db()
    assert product.active is False


def test_inventory_view_permission_allows_and_blocks_direct_api_calls():
    create_product()
    employee = create_user("rbac_inventory_view_employee")
    allow_only("inventory.view")

    allowed = api_client(employee).get(reverse("inventory-products"))
    assert_forbidden_without_permission(
        "get",
        reverse("inventory-products"),
        "inventory.view",
    )

    assert allowed.status_code == 200


def test_inventory_adjust_permission_allows_and_blocks_direct_api_calls():
    product = create_product("RBAC inventory product")
    employee = create_user("rbac_inventory_adjust_employee")
    allow_only("inventory.adjust")

    allowed = api_client(employee).patch(
        reverse("inventory-stock-update", args=[product.id]),
        {"stock": 8, "reason": "RBAC adjustment"},
        format="json",
    )
    assert_forbidden_without_permission(
        "patch",
        reverse("inventory-stock-update", args=[product.id]),
        "inventory.adjust",
        data={"stock": 9},
    )

    assert allowed.status_code == 200
    product.refresh_from_db()
    assert product.stock == 8


def test_inventory_movements_view_permission_allows_and_blocks_direct_api_calls():
    product = create_product("RBAC movement product")
    InventoryMovement.objects.create(
        product=product,
        movement_type=InventoryMovement.Types.MANUAL_ADJUSTMENT,
        quantity_delta=1,
        previous_stock=1,
        new_stock=2,
        reason="RBAC movement",
    )
    employee = create_user("rbac_inventory_movements_employee")
    allow_only("inventory.movements.view")

    allowed = api_client(employee).get(reverse("inventory-movements"))
    assert_forbidden_without_permission(
        "get",
        reverse("inventory-movements"),
        "inventory.movements.view",
    )

    assert allowed.status_code == 200


def test_orders_view_permission_allows_and_blocks_direct_api_calls():
    create_order()
    employee = create_user("rbac_orders_view_employee")
    allow_only("orders.view")

    allowed = api_client(employee).get(reverse("staff-order-list"))
    assert_forbidden_without_permission(
        "get",
        reverse("staff-order-list"),
        "orders.view",
    )

    assert allowed.status_code == 200


def test_orders_status_update_permission_allows_and_blocks_direct_api_calls():
    order = create_order()
    blocked_order = create_order(
        create_user("rbac_blocked_order_customer", User.Roles.CUSTOMER)
    )
    employee = create_user("rbac_orders_update_employee")
    allow_only("orders.status.update")

    allowed = api_client(employee).patch(
        reverse("staff-order-detail", args=[order.id]),
        {"status": Order.Status.CANCELLED},
        format="json",
    )
    assert_forbidden_without_permission(
        "patch",
        reverse("staff-order-detail", args=[blocked_order.id]),
        "orders.status.update",
        data={"status": Order.Status.CANCELLED},
    )

    assert allowed.status_code == 200
    assert allowed.data["status"] == Order.Status.CANCELLED


def test_administrator_bypasses_operational_permission_bundle():
    admin = create_user("rbac_bypass_admin", User.Roles.ADMIN)
    allow_only()

    response = api_client(admin).get(reverse("dashboard-metrics"))

    assert response.status_code == 200
    assert set(get_effective_permission_codes(admin)) == set(PERMISSION_BY_CODE)


def test_anonymous_access_is_not_an_assignable_role_and_public_endpoints_stay_public():
    product = create_product()

    public_catalog = api_client().get(reverse("catalog-product-list"))
    public_detail = api_client().get(
        reverse("catalog-product-detail", args=[product.id])
    )
    protected_internal = api_client().get(reverse("staff-product-list"))

    assert public_catalog.status_code == 200
    assert public_detail.status_code == 200
    assert protected_internal.status_code == 401
    assert not User.objects.filter(role="invitado").exists()
