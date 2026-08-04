from decimal import Decimal

import pytest
from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework.test import APIClient

from apps.cart.models import Cart, CartItem
from apps.catalog.models import Category, Product
from apps.inventory.models import InventoryMovement
from apps.orders.models import Order
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


def add_cart_item(user, product, quantity=2):
    cart, _created = Cart.objects.get_or_create(user=user)
    return CartItem.objects.create(cart=cart, product=product, quantity=quantity)


def create_store_settings(**overrides):
    defaults = StoreSettings.bootstrap_defaults()
    defaults.update(overrides)
    return StoreSettings.objects.create(**defaults)


def delivery_payload(**overrides):
    payload = {
        "original_address": "123 Main St",
        "formatted_address": "123 Main St, Tijuana",
        "latitude": "32.51490000",
        "longitude": "-117.03820000",
        "distance_km": "12.500",
        "estimated_duration_minutes": "30.0",
        "delivery_fee": "180.00",
        "delivery_zone": "standard",
        "geocoding_provider": "nominatim",
        "distance_provider": "openrouteservice",
    }
    payload.update(overrides)
    return payload


def checkout(user, payload=None):
    return api_client(user).post(
        reverse("checkout"),
        payload or delivery_payload(),
        format="json",
    )


def test_checkout_requires_authenticated_customer():
    response = api_client().post(reverse("checkout"), delivery_payload(), format="json")

    assert response.status_code == 401


def test_checkout_allows_admin_buyer_flow_preview():
    admin = create_user("admin_checkout", User.Roles.ADMIN)

    response = checkout(admin)

    assert response.status_code == 400
    assert "Cart is empty" in str(response.data)


def test_checkout_blocks_employee_role():
    employee = create_user("empleado_checkout", User.Roles.EMPLOYEE)

    response = checkout(employee)

    assert response.status_code == 403


def test_checkout_requires_non_empty_cart():
    customer = create_user("cliente_empty")

    response = checkout(customer)

    assert response.status_code == 400
    assert "Cart is empty" in str(response.data)


def test_checkout_creates_pending_order_and_clears_cart_without_stock_decrement():
    customer = create_user("cliente_checkout")
    product = create_product(stock=9, price=Decimal("150.00"))
    add_cart_item(customer, product, quantity=2)

    response = checkout(customer)

    assert response.status_code == 201
    assert response.data["status"] == Order.Status.PENDING
    assert response.data["payment_method"] == Order.PaymentMethod.CASH
    assert response.data["payment_status"] == Order.PaymentStatus.PAY_ON_DELIVERY
    assert response.data["payment_reference"].startswith("SIM-CASH-")
    assert response.data["payment_processed_at"]
    assert response.data["payment_snapshot"]["provider"] == "simulated"
    assert response.data["products_subtotal"] == "300.00"
    assert response.data["delivery_fee"] == "180.00"
    assert response.data["total"] == "480.00"
    assert response.data["original_address"] == "123 Main St"
    assert response.data["formatted_address"] == "123 Main St, Tijuana"
    assert response.data["distance_km"] == "12.500"
    assert response.data["estimated_duration_minutes"] == "30.0"
    assert len(response.data["items"]) == 1
    assert response.data["items"][0]["product_sku"] == product.sku
    assert response.data["items"][0]["product_name"] == product.name
    assert response.data["items"][0]["unit_price"] == "150.00"
    assert response.data["items"][0]["quantity"] == 2
    assert response.data["items"][0]["line_total"] == "300.00"
    assert response.data["items"][0]["product_snapshot"]["sku"] == product.sku
    assert (
        response.data["items"][0]["product_snapshot"]["structured_dimensions"][
            "width_cm"
        ]
        == "200.00"
    )
    assert response.data["items"][0]["product_snapshot"]["specifications"] == {
        "assembly_required": False
    }

    product.refresh_from_db()
    assert product.stock == 9
    assert CartItem.objects.filter(cart__user=customer).count() == 0


def test_checkout_records_simulated_card_payment_without_sensitive_fields():
    customer = create_user("cliente_card_checkout")
    product = create_product(stock=9, price=Decimal("150.00"))
    add_cart_item(customer, product, quantity=1)

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
    assert response.data["payment_method"] == Order.PaymentMethod.CARD
    assert response.data["payment_status"] == Order.PaymentStatus.AUTHORIZED
    assert response.data["payment_reference"].startswith("SIM-CARD-")
    assert response.data["payment_processed_at"]
    assert response.data["payment_snapshot"]["brand"] == "Visa"
    assert response.data["payment_snapshot"]["last4"] == "4242"
    assert "4242424242424242" not in str(response.data["payment_snapshot"])
    assert "123" not in str(response.data["payment_snapshot"])


def test_checkout_records_simulated_transfer_payment():
    customer = create_user("cliente_transfer_checkout")
    product = create_product(stock=9, price=Decimal("150.00"))
    add_cart_item(customer, product, quantity=1)

    response = checkout(
        customer,
        delivery_payload(payment_method=Order.PaymentMethod.TRANSFER),
    )

    assert response.status_code == 201
    assert response.data["payment_method"] == Order.PaymentMethod.TRANSFER
    assert response.data["payment_status"] == Order.PaymentStatus.AWAITING_TRANSFER
    assert response.data["payment_reference"].startswith("SIM-TRANSFER-")
    assert "pendiente" in response.data["payment_snapshot"]["message"].lower()


def test_checkout_rejects_declined_simulated_card_without_clearing_cart():
    customer = create_user("cliente_declined_card")
    product = create_product(stock=9, price=Decimal("150.00"))
    add_cart_item(customer, product, quantity=1)

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
    assert "payment" in response.data
    assert Order.objects.filter(user=customer).count() == 0
    assert CartItem.objects.filter(cart__user=customer).count() == 1


def test_checkout_rejects_invalid_delivery_numbers():
    customer = create_user("cliente_bad_delivery_numbers")
    product = create_product()
    add_cart_item(customer, product, quantity=1)

    response = checkout(customer, delivery_payload(delivery_fee="-1.00"))

    assert response.status_code == 400
    assert "delivery_fee" in response.data


def test_checkout_recomputes_delivery_fee_instead_of_trusting_client_payload():
    customer = create_user("cliente_checkout_recomputed")
    product = create_product(stock=9, price=Decimal("100.00"))
    add_cart_item(customer, product, quantity=1)
    create_store_settings(
        delivery_base_fee="50.00",
        delivery_price_per_km="5.00",
    )

    response = checkout(customer, delivery_payload(delivery_fee="999.00"))

    assert response.status_code == 201
    assert response.data["products_subtotal"] == "100.00"
    assert response.data["distance_km"] == "12.500"
    assert response.data["delivery_fee"] == "112.50"
    assert response.data["total"] == "212.50"


def test_checkout_applies_free_shipping_threshold_from_store_settings():
    customer = create_user("cliente_checkout_free_shipping")
    product = create_product(stock=9, price=Decimal("250.00"))
    add_cart_item(customer, product, quantity=2)
    create_store_settings(
        delivery_base_fee="50.00",
        delivery_price_per_km="5.00",
        free_shipping_threshold="500.00",
    )

    response = checkout(customer, delivery_payload())

    assert response.status_code == 201
    assert response.data["products_subtotal"] == "500.00"
    assert response.data["delivery_fee"] == "0.00"
    assert response.data["total"] == "500.00"


def test_checkout_rejects_inactive_cart_products():
    customer = create_user("cliente_inactive_checkout")
    product = create_product()
    add_cart_item(customer, product, quantity=1)
    product.active = False
    product.save(update_fields=("active", "updated_at"))

    response = checkout(customer)

    assert response.status_code == 400
    assert "inactive products" in str(response.data)


def test_customer_can_only_see_own_orders():
    owner = create_user("cliente_owner_order")
    other = create_user("cliente_other_order")
    product = create_product()
    add_cart_item(owner, product)
    order_id = checkout(owner).data["id"]

    other_list = api_client(other).get(reverse("customer-order-list"))
    other_detail = api_client(other).get(
        reverse("customer-order-detail", args=[order_id])
    )

    assert other_list.status_code == 200
    assert other_list.data["results"] == []
    assert other_detail.status_code == 404


def test_staff_can_list_and_advance_order_status():
    customer = create_user("cliente_staff_update")
    employee = create_user("empleado_orders", User.Roles.EMPLOYEE)
    product = create_product(stock=5)
    add_cart_item(customer, product, quantity=1)
    order_id = checkout(customer).data["id"]

    list_response = api_client(employee).get(reverse("staff-order-list"))
    update_response = api_client(employee).patch(
        reverse("staff-order-detail", args=[order_id]),
        {"status": Order.Status.CONFIRMED},
        format="json",
    )

    assert list_response.status_code == 200
    assert list_response.data["results"][0]["id"] == order_id
    assert list_response.data["results"][0]["user_id"] == customer.id
    assert list_response.data["results"][0]["customer_email"] == customer.email
    assert list_response.data["results"][0]["customer_phone"] == customer.phone
    assert update_response.status_code == 200
    assert update_response.data["status"] == Order.Status.CONFIRMED

    product.refresh_from_db()
    assert product.stock == 4


def test_staff_can_mark_simulated_transfer_payment_received():
    customer = create_user("cliente_transfer_received")
    employee = create_user("empleado_transfer_received", User.Roles.EMPLOYEE)
    product = create_product(stock=5)
    add_cart_item(customer, product, quantity=1)
    order_id = checkout(
        customer,
        delivery_payload(payment_method=Order.PaymentMethod.TRANSFER),
    ).data["id"]

    response = api_client(employee).patch(
        reverse("staff-order-detail", args=[order_id]),
        {"payment_status": Order.PaymentStatus.AUTHORIZED},
        format="json",
    )

    assert response.status_code == 200
    assert response.data["payment_method"] == Order.PaymentMethod.TRANSFER
    assert response.data["payment_status"] == Order.PaymentStatus.AUTHORIZED
    assert response.data["payment_snapshot"]["message"] == "Pago simulado recibido."


def test_staff_can_mark_simulated_cash_payment_received():
    customer = create_user("cliente_cash_received")
    employee = create_user("empleado_cash_received", User.Roles.EMPLOYEE)
    product = create_product(stock=5)
    add_cart_item(customer, product, quantity=1)
    order_id = checkout(customer).data["id"]

    response = api_client(employee).patch(
        reverse("staff-order-detail", args=[order_id]),
        {"payment_status": Order.PaymentStatus.AUTHORIZED},
        format="json",
    )

    assert response.status_code == 200
    assert response.data["payment_method"] == Order.PaymentMethod.CASH
    assert response.data["payment_status"] == Order.PaymentStatus.AUTHORIZED
    assert response.data["payment_snapshot"]["message"] == "Pago simulado recibido."


def test_stock_decreases_only_when_order_is_confirmed_and_not_twice():
    customer = create_user("cliente_confirm")
    employee = create_user("empleado_confirm", User.Roles.EMPLOYEE)
    product = create_product(stock=5)
    add_cart_item(customer, product, quantity=2)
    order_id = checkout(customer).data["id"]

    product.refresh_from_db()
    assert product.stock == 5

    first_confirm = api_client(employee).patch(
        reverse("staff-order-detail", args=[order_id]),
        {"status": Order.Status.CONFIRMED},
        format="json",
    )
    second_confirm = api_client(employee).patch(
        reverse("staff-order-detail", args=[order_id]),
        {"status": Order.Status.CONFIRMED},
        format="json",
    )

    assert first_confirm.status_code == 200
    assert second_confirm.status_code == 200

    product.refresh_from_db()
    assert product.stock == 3

    order = Order.objects.get(id=order_id)
    assert order.status == Order.Status.CONFIRMED
    assert order.stock_decremented_at is not None

    movement = InventoryMovement.objects.get(order=order, product=product)
    assert movement.movement_type == InventoryMovement.Types.ORDER_CONFIRMED
    assert movement.quantity_delta == -2
    assert movement.previous_stock == 5
    assert movement.new_stock == 3
    assert movement.created_by == employee


def test_confirm_validates_stock_before_decrementing():
    customer = create_user("cliente_low_stock")
    employee = create_user("empleado_low_stock", User.Roles.EMPLOYEE)
    product = create_product(stock=1)
    add_cart_item(customer, product, quantity=2)
    order_id = checkout(customer).data["id"]

    response = api_client(employee).patch(
        reverse("staff-order-detail", args=[order_id]),
        {"status": Order.Status.CONFIRMED},
        format="json",
    )

    assert response.status_code == 400
    assert "Insufficient stock" in str(response.data)

    product.refresh_from_db()
    assert product.stock == 1

    order = Order.objects.get(id=order_id)
    assert order.status == Order.Status.PENDING
    assert order.stock_decremented_at is None


def test_customer_cannot_use_staff_order_endpoint():
    customer = create_user("cliente_staff_forbidden")

    response = api_client(customer).get(reverse("staff-order-list"))

    assert response.status_code == 403


def test_staff_cannot_skip_required_status_steps():
    customer = create_user("cliente_skip_status")
    employee = create_user("empleado_skip_status", User.Roles.EMPLOYEE)
    product = create_product(stock=5)
    add_cart_item(customer, product, quantity=1)
    order_id = checkout(customer).data["id"]

    response = api_client(employee).patch(
        reverse("staff-order-detail", args=[order_id]),
        {"status": Order.Status.SHIPPED},
        format="json",
    )

    assert response.status_code == 400
    assert "Cannot transition" in str(response.data)

    product.refresh_from_db()
    assert product.stock == 5

    order = Order.objects.get(id=order_id)
    assert order.status == Order.Status.PENDING


def test_terminal_statuses_cannot_transition_again():
    customer = create_user("cliente_terminal_status")
    employee = create_user("empleado_terminal_status", User.Roles.EMPLOYEE)
    product = create_product(stock=5)
    add_cart_item(customer, product, quantity=1)
    order_id = checkout(customer).data["id"]
    client = api_client(employee)

    cancel_response = client.patch(
        reverse("staff-order-detail", args=[order_id]),
        {"status": Order.Status.CANCELLED},
        format="json",
    )
    reopen_response = client.patch(
        reverse("staff-order-detail", args=[order_id]),
        {"status": Order.Status.CONFIRMED},
        format="json",
    )

    assert cancel_response.status_code == 200
    assert reopen_response.status_code == 400
    assert "Cannot transition" in str(reopen_response.data)

    product.refresh_from_db()
    assert product.stock == 5


def test_full_valid_status_workflow_reaches_delivered():
    customer = create_user("cliente_full_status")
    employee = create_user("empleado_full_status", User.Roles.EMPLOYEE)
    product = create_product(stock=5)
    add_cart_item(customer, product, quantity=1)
    order_id = checkout(customer).data["id"]
    client = api_client(employee)

    for status in (
        Order.Status.CONFIRMED,
        Order.Status.PREPARING,
        Order.Status.SHIPPED,
        Order.Status.DELIVERED,
    ):
        response = client.patch(
            reverse("staff-order-detail", args=[order_id]),
            {"status": status},
            format="json",
        )
        assert response.status_code == 200
        assert response.data["status"] == status

    product.refresh_from_db()
    assert product.stock == 4
