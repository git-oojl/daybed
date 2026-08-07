from decimal import Decimal
from types import SimpleNamespace

import pytest
from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import serializers as drf_serializers
from rest_framework.test import APIClient

from apps.cart.models import Cart, CartItem
from apps.catalog.models import Category, Product
from apps.delivery.services import DeliveryEstimate, calculate_delivery_fee
from apps.inventory.models import InventoryMovement
from apps.orders.models import Order, OrderStatusEvent
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
        first_name=username.split("_")[0].title(),
        phone="6645550101",
    )


def create_product(name="Order sofa", stock=10, price=Decimal("100.00")):
    category = Category.objects.create(name=f"{name} category", active=True)
    return Product.objects.create(
        name=name,
        description="Furniture",
        price=price,
        category=category,
        material="wood",
        color="green",
        style="modern",
        width_cm=Decimal("200.00"),
        height_cm=Decimal("80.00"),
        depth_cm=Decimal("90.00"),
        specifications={"assembly_required": False},
        stock=stock,
        minimum_stock=2,
        active=True,
    )


def add_cart_item(user, product, quantity=1):
    cart, _created = Cart.objects.get_or_create(user=user)
    return CartItem.objects.create(cart=cart, product=product, quantity=quantity)


def delivery_payload(**overrides):
    payload = {
        "original_address": "Av. Revolución 1200, Zona Centro",
        "formatted_address": "Av. Revolución 1200, Zona Centro, Tijuana, Baja California, 22000, México",
        "latitude": "32.51490000",
        "longitude": "-117.03820000",
        "distance_km": "12.500",
        "estimated_duration_minutes": "30.0",
        "delivery_fee": "180.00",
        "delivery_zone": "standard",
        "geocoding_provider": "nominatim",
        "distance_provider": "openrouteservice",
        "delivery_notes": "Tocar el timbre de recepción.",
    }
    payload.update(overrides)
    return payload


def checkout(user, payload=None):
    return api_client(user).post(
        reverse("checkout"),
        payload or delivery_payload(),
        format="json",
    )


@pytest.fixture(autouse=True)
def reliable_route_estimate(monkeypatch):
    def estimate(latitude, longitude, order_subtotal=None):
        settings = StoreSettings.get_active()
        distance = Decimal("12.500")
        return DeliveryEstimate(
            origin_latitude=settings.latitude,
            origin_longitude=settings.longitude,
            destination_latitude=Decimal(str(latitude)),
            destination_longitude=Decimal(str(longitude)),
            distance_km=distance,
            estimated_duration_minutes=Decimal("30.0"),
            delivery_fee=calculate_delivery_fee(distance, order_subtotal, settings),
            free_shipping_applied=(
                settings.free_shipping_threshold is not None
                and Decimal(str(order_subtotal or 0)) >= settings.free_shipping_threshold
            ),
            free_shipping_threshold=settings.free_shipping_threshold,
            distance_provider="openrouteservice",
            routing_available=True,
        )

    monkeypatch.setattr("apps.orders.serializers.estimate_delivery", estimate)


def test_checkout_requires_authentication():
    assert checkout(None).status_code == 401


@pytest.mark.parametrize("role", [User.Roles.CUSTOMER, User.Roles.EMPLOYEE, User.Roles.ADMIN])
def test_every_authenticated_role_can_use_personal_checkout(role):
    user = create_user(f"checkout_{role}", role)

    response = checkout(user)

    assert response.status_code == 400
    assert "vacío" in str(response.data).lower()


def test_checkout_creates_distinct_order_reserves_stock_and_clears_cart():
    customer = create_user("cliente_checkout")
    product = create_product(stock=9, price=Decimal("150.00"))
    add_cart_item(customer, product, quantity=2)

    response = checkout(customer)

    assert response.status_code == 201
    assert response.data["order_code"].startswith("DAY-")
    assert response.data["status"] == Order.Status.PENDING
    assert response.data["payment_status"] == Order.PaymentStatus.PAY_ON_DELIVERY
    assert response.data["payment_reference"].startswith("DAY-CASH-")
    assert "payment_snapshot" not in response.data
    assert response.data["payment_summary"]["message"] == "Pago en efectivo registrado para cobro contra entrega."
    assert response.data["products_subtotal"] == "300.00"
    assert response.data["delivery_fee"] == "180.00"
    assert response.data["total"] == "480.00"
    assert response.data["delivery_notes"] == "Tocar el timbre de recepción."
    assert len(response.data["items"]) == 1
    assert response.data["items"][0]["product_sku"] == product.sku
    assert response.data["items"][0]["quantity"] == 2
    assert response.data["items"][0]["line_total"] == "300.00"
    assert response.data["items"][0]["product_snapshot"]["structured_dimensions"]["width_cm"] == "200.00"

    product.refresh_from_db()
    order = Order.objects.get(pk=response.data["id"])
    assert product.stock == 7
    assert order.stock_decremented_at is not None
    assert CartItem.objects.filter(cart__user=customer).count() == 0
    assert OrderStatusEvent.objects.filter(order=order, to_status=Order.Status.PENDING).exists()
    movement = InventoryMovement.objects.get(order=order, product=product)
    assert movement.movement_type == InventoryMovement.Types.ORDER_RESERVED
    assert movement.quantity_delta == -2


def test_card_checkout_does_not_store_sensitive_fields():
    customer = create_user("cliente_card")
    product = create_product(stock=4)
    add_cart_item(customer, product)

    response = checkout(
        customer,
        delivery_payload(
            payment_method=Order.PaymentMethod.CARD,
            card_number="4242 4242 4242 4242",
            card_expiry="12/30",
            card_cvv="123",
        ),
    )

    assert response.status_code == 201
    assert response.data["payment_status"] == Order.PaymentStatus.AUTHORIZED
    assert response.data["payment_reference"].startswith("DAY-CARD-")
    assert "payment_snapshot" not in response.data
    assert response.data["payment_summary"]["brand"] == "Visa"
    assert response.data["payment_summary"]["last4"] == "4242"
    serialized = str(response.data)
    assert "4242424242424242" not in serialized
    assert "card_cvv" not in serialized


def test_declined_card_preserves_cart_and_stock():
    customer = create_user("cliente_declined")
    product = create_product(stock=4)
    add_cart_item(customer, product)

    response = checkout(
        customer,
        delivery_payload(
            payment_method=Order.PaymentMethod.CARD,
            card_number="4000 0000 0000 0000",
            card_expiry="12/30",
            card_cvv="123",
        ),
    )

    assert response.status_code == 400
    assert Order.objects.filter(user=customer).count() == 0
    assert CartItem.objects.filter(cart__user=customer).count() == 1
    product.refresh_from_db()
    assert product.stock == 4


def test_free_shipping_threshold_is_server_authoritative():
    settings = StoreSettings.get_active()
    settings.delivery_base_fee = Decimal("50.00")
    settings.delivery_price_per_km = Decimal("5.00")
    settings.free_shipping_threshold = Decimal("500.00")
    settings.save()
    customer = create_user("cliente_free_shipping")
    product = create_product(stock=5, price=Decimal("250.00"))
    add_cart_item(customer, product, quantity=2)

    response = checkout(customer, delivery_payload(delivery_fee="999.00"))

    assert response.status_code == 201
    assert response.data["products_subtotal"] == "500.00"
    assert response.data["delivery_fee"] == "0.00"
    assert response.data["total"] == "500.00"


def test_checkout_revalidates_sold_out_stock_and_preserves_cart():
    customer = create_user("cliente_stale_stock")
    product = create_product(stock=2)
    add_cart_item(customer, product, quantity=2)
    product.stock = 1
    product.save(update_fields=("stock", "updated_at"))

    response = checkout(customer)

    assert response.status_code == 400
    assert "disponibilidad" in str(response.data).lower()
    assert Order.objects.filter(user=customer).count() == 0
    assert CartItem.objects.filter(cart__user=customer).count() == 1
    product.refresh_from_db()
    assert product.stock == 1


def test_routing_failure_is_focused_and_does_not_destroy_cart_or_session(monkeypatch):
    customer = create_user("cliente_route_failure")
    product = create_product(stock=3)
    add_cart_item(customer, product)

    def unavailable(*args, **kwargs):
        settings = StoreSettings.get_active()
        return DeliveryEstimate(
            origin_latitude=settings.latitude,
            origin_longitude=settings.longitude,
            destination_latitude=Decimal("32.51490000"),
            destination_longitude=Decimal("-117.03820000"),
            distance_km=Decimal("12.500"),
            estimated_duration_minutes=Decimal("30.0"),
            delivery_fee=Decimal("180.00"),
            free_shipping_applied=False,
            free_shipping_threshold=settings.free_shipping_threshold,
            distance_provider="approximate_fallback",
            routing_available=False,
            routing_warning="Servicio no disponible.",
        )

    monkeypatch.setattr("apps.orders.serializers.estimate_delivery", unavailable)
    response = checkout(customer)

    assert response.status_code == 503
    assert response.data["code"] == "routing_service_unavailable"
    assert response.data["feature"] == "delivery"
    assert Order.objects.filter(user=customer).count() == 0
    assert CartItem.objects.filter(cart__user=customer).count() == 1
    assert api_client(customer).get(reverse("cart-detail")).status_code == 200


def test_paused_storefront_prevents_submission_without_destroying_cart():
    customer = create_user("cliente_store_paused")
    product = create_product(stock=3)
    add_cart_item(customer, product)
    settings = StoreSettings.get_active()
    settings.storefront_available = False
    settings.save(update_fields=("storefront_available", "updated_at"))

    response = checkout(customer)

    assert response.status_code == 400
    assert "pausadas" in str(response.data).lower()
    assert CartItem.objects.filter(cart__user=customer).count() == 1


def test_two_orders_for_same_customer_are_distinct_and_open_by_code():
    customer = create_user("cliente_two_orders")
    product = create_product(stock=8)
    add_cart_item(customer, product, quantity=1)
    first = checkout(customer).data
    add_cart_item(customer, product, quantity=2)
    second = checkout(customer).data

    first_detail = api_client(customer).get(
        reverse("customer-order-detail", args=[first["order_code"]])
    )
    second_detail = api_client(customer).get(
        reverse("customer-order-detail", args=[second["order_code"]])
    )

    assert first["id"] != second["id"]
    assert first["order_code"] != second["order_code"]
    assert first_detail.status_code == 200
    assert second_detail.status_code == 200
    assert first_detail.data["items"][0]["quantity"] == 1
    assert second_detail.data["items"][0]["quantity"] == 2
    assert first_detail.data["total"] != second_detail.data["total"]



def test_customer_order_payload_hides_internal_operations_metadata():
    customer = create_user("cliente_safe_order")
    employee = create_user("empleado_safe_order", User.Roles.EMPLOYEE)
    product = create_product(stock=5)
    add_cart_item(customer, product)
    created = checkout(customer).data

    api_client(employee).patch(
        reverse("staff-order-detail", args=[created["id"]]),
        {"internal_notes": "Validar acceso del edificio.", "status": Order.Status.CONFIRMED, "status_note": "Nota interna de operación."},
        format="json",
    )
    customer_detail = api_client(customer).get(
        reverse("customer-order-detail", args=[created["order_code"]])
    )
    staff_detail = api_client(employee).get(
        reverse("staff-order-detail", args=[created["order_code"]])
    )

    assert customer_detail.status_code == 200
    for key in (
        "payment_snapshot",
        "internal_notes",
        "geocoding_provider",
        "distance_provider",
        "stock_decremented_at",
        "stock_released_at",
        "available_status_transitions",
    ):
        assert key not in customer_detail.data
    assert all("note" not in event and "actor_name" not in event for event in customer_detail.data["status_history"])
    assert staff_detail.data["internal_notes"] == "Validar acceso del edificio."
    assert "payment_snapshot" in staff_detail.data
    assert "available_status_transitions" in staff_detail.data


def test_checkout_rejects_cart_changed_after_validation_without_reserving_stock():
    from apps.orders.serializers import CheckoutSerializer

    customer = create_user("cliente_cart_race")
    product = create_product(stock=8, price=Decimal("250.00"))
    item = add_cart_item(customer, product, quantity=1)
    serializer = CheckoutSerializer(
        data=delivery_payload(),
        context={"request": SimpleNamespace(user=customer)},
    )
    assert serializer.is_valid(), serializer.errors

    item.quantity = 2
    item.save(update_fields=("quantity", "updated_at"))

    with pytest.raises(drf_serializers.ValidationError) as exc_info:
        serializer.save()

    assert "carrito cambió" in str(exc_info.value).lower()
    assert not Order.objects.filter(user=customer).exists()
    product.refresh_from_db()
    assert product.stock == 8
    assert CartItem.objects.get(pk=item.pk).quantity == 2

def test_customer_can_only_see_own_order_by_id_or_code():
    owner = create_user("cliente_owner")
    other = create_user("cliente_other")
    product = create_product()
    add_cart_item(owner, product)
    order = checkout(owner).data

    assert api_client(other).get(reverse("customer-order-list")).data["results"] == []
    assert api_client(other).get(
        reverse("customer-order-detail", args=[order["id"]])
    ).status_code == 404
    assert api_client(other).get(
        reverse("customer-order-detail", args=[order["order_code"]])
    ).status_code == 404


def test_multiple_products_are_preserved_in_one_order():
    customer = create_user("cliente_multi_item")
    sofa = create_product("Sofa multi", stock=4, price=Decimal("200.00"))
    table = create_product("Table multi", stock=5, price=Decimal("75.00"))
    add_cart_item(customer, sofa, quantity=2)
    add_cart_item(customer, table, quantity=1)

    response = checkout(customer)

    assert response.status_code == 201
    assert len(response.data["items"]) == 2
    assert {item["product_name"] for item in response.data["items"]} == {sofa.name, table.name}
    assert response.data["products_subtotal"] == "475.00"


def test_employee_opens_exact_order_and_valid_transition_updates_same_record():
    customer = create_user("cliente_staff_order")
    employee = create_user("empleado_orders", User.Roles.EMPLOYEE)
    product = create_product(stock=5)
    add_cart_item(customer, product)
    order = checkout(customer).data

    detail = api_client(employee).get(
        reverse("staff-order-detail", args=[order["order_code"]])
    )
    update = api_client(employee).patch(
        reverse("staff-order-detail", args=[order["order_code"]]),
        {"status": Order.Status.CONFIRMED, "status_note": "Pago y existencia revisados."},
        format="json",
    )
    refreshed_list = api_client(employee).get(reverse("staff-order-list"))

    assert detail.status_code == 200
    assert detail.data["order_code"] == order["order_code"]
    assert update.status_code == 200
    assert update.data["status"] == Order.Status.CONFIRMED
    assert update.data["available_status_transitions"] == [Order.Status.CANCELLED, Order.Status.PREPARING]
    listed = next(item for item in refreshed_list.data["results"] if item["id"] == order["id"])
    assert listed["status"] == Order.Status.CONFIRMED
    assert any(event["note"] == "Pago y existencia revisados." for event in update.data["status_history"])

    product.refresh_from_db()
    assert product.stock == 4  # reserved once at checkout, not again on confirmation


@pytest.mark.parametrize("target", [Order.Status.SHIPPED, Order.Status.DELIVERED, Order.Status.PENDING])
def test_invalid_or_repeated_transitions_are_rejected(target):
    customer = create_user(f"cliente_invalid_{target}")
    employee = create_user(f"empleado_invalid_{target}", User.Roles.EMPLOYEE)
    product = create_product(stock=5)
    add_cart_item(customer, product)
    order = checkout(customer).data

    response = api_client(employee).patch(
        reverse("staff-order-detail", args=[order["id"]]),
        {"status": target},
        format="json",
    )

    assert response.status_code == 400
    assert "transición" in str(response.data).lower() or "estado" in str(response.data).lower()
    assert Order.objects.get(pk=order["id"]).status == Order.Status.PENDING


def test_cancelled_order_releases_reserved_stock_and_cannot_be_reactivated():
    customer = create_user("cliente_cancelled")
    employee = create_user("empleado_cancelled", User.Roles.EMPLOYEE)
    product = create_product(stock=5)
    add_cart_item(customer, product, quantity=2)
    order = checkout(customer).data
    product.refresh_from_db()
    assert product.stock == 3

    cancelled = api_client(employee).patch(
        reverse("staff-order-detail", args=[order["id"]]),
        {"status": Order.Status.CANCELLED, "status_note": "Cancelación solicitada."},
        format="json",
    )
    reopened = api_client(employee).patch(
        reverse("staff-order-detail", args=[order["id"]]),
        {"status": Order.Status.CONFIRMED},
        format="json",
    )

    assert cancelled.status_code == 200
    assert cancelled.data["available_status_transitions"] == []
    assert reopened.status_code == 400
    product.refresh_from_db()
    assert product.stock == 5
    assert InventoryMovement.objects.filter(
        order_id=order["id"],
        movement_type=InventoryMovement.Types.ORDER_CANCELLED,
    ).exists()


def test_full_valid_status_workflow_reaches_terminal_delivered():
    customer = create_user("cliente_delivered")
    employee = create_user("empleado_delivered", User.Roles.EMPLOYEE)
    product = create_product(stock=5)
    add_cart_item(customer, product)
    order = checkout(customer).data
    client = api_client(employee)

    for status in (
        Order.Status.CONFIRMED,
        Order.Status.PREPARING,
        Order.Status.SHIPPED,
        Order.Status.DELIVERED,
    ):
        response = client.patch(
            reverse("staff-order-detail", args=[order["id"]]),
            {"status": status},
            format="json",
        )
        assert response.status_code == 200
        assert response.data["status"] == status

    repeated = client.patch(
        reverse("staff-order-detail", args=[order["id"]]),
        {"status": Order.Status.PREPARING},
        format="json",
    )
    customer_detail = api_client(customer).get(
        reverse("customer-order-detail", args=[order["order_code"]])
    )

    assert repeated.status_code == 400
    assert customer_detail.data["status"] == Order.Status.DELIVERED
    assert "available_status_transitions" not in customer_detail.data
    assert all(set(event) <= {"id", "from_status", "to_status", "created_at"} for event in customer_detail.data["status_history"])


def test_payment_state_can_advance_once_for_transfer_or_cash():
    employee = create_user("empleado_payment", User.Roles.EMPLOYEE)
    for suffix, method in (("transfer", Order.PaymentMethod.TRANSFER), ("cash", Order.PaymentMethod.CASH)):
        customer = create_user(f"cliente_payment_{suffix}")
        product = create_product(f"Payment product {suffix}", stock=3)
        add_cart_item(customer, product)
        order = checkout(customer, delivery_payload(payment_method=method)).data

        received = api_client(employee).patch(
            reverse("staff-order-detail", args=[order["id"]]),
            {"payment_status": Order.PaymentStatus.AUTHORIZED},
            format="json",
        )
        repeated = api_client(employee).patch(
            reverse("staff-order-detail", args=[order["id"]]),
            {"payment_status": Order.PaymentStatus.AUTHORIZED},
            format="json",
        )

        assert received.status_code == 200
        assert received.data["payment_snapshot"]["message"] == "Pago recibido."
        assert repeated.status_code == 400
