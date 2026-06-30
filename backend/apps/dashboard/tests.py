from decimal import Decimal

import pytest
from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework.test import APIClient

from apps.catalog.models import Category, Product
from apps.orders.models import Order

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


def create_product(name, stock, minimum_stock=2):
    category = Category.objects.create(name=f"{name} category")
    return Product.objects.create(
        name=name,
        description="Furniture",
        price=Decimal("100.00"),
        category=category,
        stock=stock,
        minimum_stock=minimum_stock,
        active=True,
    )


def create_order(user, status, total, delivery_fee="80.00", distance_km="10.000"):
    return Order.objects.create(
        user=user,
        status=status,
        original_address="123 Main St",
        formatted_address="123 Main St, Tijuana",
        latitude=Decimal("32.51490000"),
        longitude=Decimal("-117.03820000"),
        distance_km=Decimal(distance_km),
        estimated_duration_minutes=Decimal("30.0"),
        delivery_fee=Decimal(delivery_fee),
        delivery_zone="standard",
        geocoding_provider="nominatim",
        distance_provider="openrouteservice",
        products_subtotal=Decimal(total) - Decimal(delivery_fee),
        total=Decimal(total),
    )


def test_dashboard_requires_employee_or_admin():
    customer = create_user("cliente_dashboard", User.Roles.CUSTOMER)

    anonymous_response = api_client().get(reverse("dashboard-metrics"))
    customer_response = api_client(customer).get(reverse("dashboard-metrics"))

    assert anonymous_response.status_code == 401
    assert customer_response.status_code == 403


def test_dashboard_metrics_for_employee():
    employee = create_user("empleado_dashboard")
    customer = create_user("cliente_dashboard_metrics", User.Roles.CUSTOMER)
    create_product("Low dashboard product", stock=1, minimum_stock=2)
    create_product("Healthy dashboard product", stock=8, minimum_stock=2)
    confirmed = create_order(
        customer,
        Order.Status.CONFIRMED,
        total="200.00",
        delivery_fee="50.00",
        distance_km="5.000",
    )
    create_order(
        customer,
        Order.Status.CANCELLED,
        total="300.00",
        delivery_fee="70.00",
        distance_km="15.000",
    )

    response = api_client(employee).get(reverse("dashboard-metrics"))

    assert response.status_code == 200
    assert response.data["total_orders"] == 2
    assert response.data["total_simulated_sales"] == "200.00"
    assert response.data["low_stock_count"] == 1
    assert response.data["average_delivery_fee"] == "60.00"
    assert response.data["average_delivery_distance"] == "10.000"
    assert response.data["recent_orders"][0]["id"] >= confirmed.id

    counts = {
        item["status"]: item["count"] for item in response.data["orders_by_status"]
    }
    assert counts[Order.Status.CONFIRMED] == 1
    assert counts[Order.Status.CANCELLED] == 1
    assert counts[Order.Status.PENDING] == 0


def test_dashboard_metrics_handles_empty_database():
    employee = create_user("empleado_empty_dashboard")

    response = api_client(employee).get(reverse("dashboard-metrics"))

    assert response.status_code == 200
    assert response.data["total_orders"] == 0
    assert response.data["total_simulated_sales"] == "0.00"
    assert response.data["orders_by_status"]
    assert response.data["low_stock_count"] == 0
    assert response.data["recent_orders"] == []
    assert response.data["average_delivery_fee"] == "0.00"
    assert response.data["average_delivery_distance"] == "0.000"
