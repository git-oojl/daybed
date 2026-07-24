from decimal import Decimal

import pytest
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from django.test import override_settings
from django.urls import reverse
from rest_framework.test import APIClient

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


def test_get_bootstraps_public_store_settings_from_environment_fallbacks():
    with override_settings(
        STORE_LATITUDE=32.6000,
        STORE_LONGITUDE=-117.1000,
        DELIVERY_BASE_FEE=Decimal("90.00"),
        DELIVERY_PRICE_PER_KM=Decimal("9.50"),
    ):
        response = api_client().get(reverse("store-settings"))

    assert response.status_code == 200
    assert response.data["store_name"] == "Daybed"
    assert response.data["latitude"] == "32.60000000"
    assert response.data["longitude"] == "-117.10000000"
    assert response.data["delivery_base_fee"] == "90.00"
    assert response.data["delivery_price_per_km"] == "9.50"
    assert response.data["free_shipping_threshold"] is None
    assert StoreSettings.objects.count() == 1


def test_patch_requires_admin_user():
    customer = create_user("settings_customer")
    employee = create_user("settings_employee", User.Roles.EMPLOYEE)

    anonymous_response = api_client().patch(
        reverse("store-settings"),
        {"store_name": "No auth"},
        format="json",
    )
    customer_response = api_client(customer).patch(
        reverse("store-settings"),
        {"store_name": "Customer"},
        format="json",
    )
    employee_response = api_client(employee).patch(
        reverse("store-settings"),
        {"store_name": "Employee"},
        format="json",
    )

    assert anonymous_response.status_code == 401
    assert customer_response.status_code == 403
    assert employee_response.status_code == 403


def test_admin_patch_persists_settings_and_updated_by():
    admin = create_user("settings_admin", User.Roles.ADMIN)

    response = api_client(admin).patch(
        reverse("store-settings"),
        {
            "store_name": "Daybed Tijuana",
            "contact_phone": "+52 664 123 4567",
            "contact_email": "hola@daybed.mx",
            "street": "Av. Revolucion 1000",
            "neighborhood": "Centro",
            "city": "Tijuana",
            "state": "Baja California",
            "postal_code": "22000",
            "latitude": "32.51490000",
            "longitude": "-117.03820000",
            "delivery_base_fee": "120.00",
            "delivery_price_per_km": "12.50",
            "free_shipping_threshold": "5000.00",
            "show_cart_estimate": False,
        },
        format="json",
    )

    assert response.status_code == 200
    assert response.data["store_name"] == "Daybed Tijuana"
    assert response.data["free_shipping_threshold"] == "5000.00"
    assert response.data["show_cart_estimate"] is False
    assert response.data["updated_by"] == admin.id

    settings_object = StoreSettings.objects.get()
    assert settings_object.updated_by == admin
    assert settings_object.delivery_base_fee == Decimal("120.00")


@pytest.mark.parametrize(
    ("payload", "field"),
    [
        ({"latitude": "91.00000000"}, "latitude"),
        ({"longitude": "-181.00000000"}, "longitude"),
        ({"delivery_base_fee": "-0.01"}, "delivery_base_fee"),
        ({"delivery_price_per_km": "-0.01"}, "delivery_price_per_km"),
        ({"free_shipping_threshold": "-0.01"}, "free_shipping_threshold"),
        ({"contact_email": "not-an-email"}, "contact_email"),
    ],
)
def test_patch_validates_store_settings(payload, field):
    admin = create_user("settings_validator_admin", User.Roles.ADMIN)

    response = api_client(admin).patch(
        reverse("store-settings"),
        payload,
        format="json",
    )

    assert response.status_code == 400
    assert field in response.data


def test_model_rejects_more_than_one_active_settings_record():
    StoreSettings.get_active()

    duplicate = StoreSettings(**StoreSettings.bootstrap_defaults())

    with pytest.raises(ValidationError):
        duplicate.full_clean()

