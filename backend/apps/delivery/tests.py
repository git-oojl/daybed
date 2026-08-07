from decimal import Decimal

import httpx
import pytest
from django.contrib.auth import get_user_model
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


def create_customer(username="cliente_delivery"):
    return User.objects.create_user(
        username=username,
        email=f"{username}@example.com",
        password="StrongPass123!",
        role=User.Roles.CUSTOMER,
    )


def response(status_code, payload, method="GET", url="https://provider.test"):
    return httpx.Response(
        status_code,
        json=payload,
        request=httpx.Request(method, url),
    )


def create_store_settings(**overrides):
    defaults = StoreSettings.bootstrap_defaults()
    defaults.update(overrides)
    return StoreSettings.objects.create(**defaults)


def test_delivery_endpoints_require_authentication():
    geocode_response = api_client().post(
        reverse("delivery-geocode"),
        {"address": "123 Main St"},
        format="json",
    )
    estimate_response = api_client().post(
        reverse("delivery-estimate"),
        {"latitude": "32.50000000", "longitude": "-117.00000000"},
        format="json",
    )

    assert geocode_response.status_code == 401
    assert estimate_response.status_code == 401


def test_delivery_endpoints_allow_employee_buyer_flow(monkeypatch):
    employee = User.objects.create_user(
        username="empleado_delivery",
        email="empleado_delivery@example.com",
        password="StrongPass123!",
        role=User.Roles.EMPLOYEE,
    )

    def fake_get(url, params, headers, timeout):
        return response(200, [{"display_name": "Av. Reforma, Tijuana", "lat": "32.51490000", "lon": "-117.03820000", "address": {}}])

    monkeypatch.setattr("apps.delivery.services.httpx.get", fake_get)
    with override_settings(OPENROUTESERVICE_API_KEY=""):
        geocode_response = api_client(employee).post(
            reverse("delivery-geocode"),
            {"address": "Av. Reforma, Tijuana"},
            format="json",
        )
        estimate_response = api_client(employee).post(
            reverse("delivery-estimate"),
            {"latitude": "32.50000000", "longitude": "-117.00000000"},
            format="json",
        )

    assert geocode_response.status_code == 200
    assert estimate_response.status_code == 200
    assert estimate_response.data["routing_available"] is False

def test_successful_geocode_mocks_nominatim(monkeypatch):
    customer = create_customer()
    calls = {}

    def fake_get(url, params, headers, timeout):
        calls["url"] = url
        calls["params"] = params
        calls["headers"] = headers
        calls["timeout"] = timeout
        return response(
            200,
            [
                {
                    "display_name": "123 Main St, Tijuana",
                    "lat": "32.51490000",
                    "lon": "-117.03820000",
                }
            ],
        )

    monkeypatch.setattr("apps.delivery.services.httpx.get", fake_get)

    api_response = api_client(customer).post(
        reverse("delivery-geocode"),
        {"address": "123 Main St"},
        format="json",
    )

    assert api_response.status_code == 200
    assert api_response.data["original_address"] == "123 Main St"
    assert api_response.data["formatted_address"] == "123 Main St, Tijuana"
    assert api_response.data["latitude"] == "32.51490000"
    assert api_response.data["longitude"] == "-117.03820000"
    assert api_response.data["provider"] == "nominatim"
    assert len(api_response.data["candidates"]) == 1
    assert calls["params"]["q"] == "123 Main St"
    assert calls["headers"]["User-Agent"]


def test_geocode_retries_without_accents_when_first_search_has_no_matches(monkeypatch):
    customer = create_customer("cliente_accent_retry")
    queries = []

    def fake_get(url, params, headers, timeout):
        queries.append(params["q"])
        if "Niños Héroes" in params["q"]:
            return response(200, [])
        return response(
            200,
            [{
                "display_name": "Avenida Ninos Heroes, Guadalajara, Jalisco, México",
                "lat": "20.66710000",
                "lon": "-103.35580000",
                "address": {"postcode": "44100"},
            }],
        )

    monkeypatch.setattr("apps.delivery.services.httpx.get", fake_get)
    api_response = api_client(customer).post(
        reverse("delivery-geocode"),
        {"address": "Avenida Niños Héroes, Guadalajara, Jalisco, 44100"},
        format="json",
    )

    assert api_response.status_code == 200
    assert len(queries) == 2
    assert queries[0] != queries[1]
    assert "Ninos Heroes" in queries[1]


def test_failed_geocode_returns_not_found(monkeypatch):
    customer = create_customer()

    def fake_get(url, params, headers, timeout):
        return response(200, [])

    monkeypatch.setattr("apps.delivery.services.httpx.get", fake_get)

    api_response = api_client(customer).post(
        reverse("delivery-geocode"),
        {"address": "Unknown address"},
        format="json",
    )

    assert api_response.status_code == 404
    assert api_response.data["code"] == "address_not_found"
    assert "coincidencia" in api_response.data["user_message"].lower()


@override_settings(
    OPENROUTESERVICE_API_KEY="test-key",
    STORE_LATITUDE=32.5000,
    STORE_LONGITUDE=-117.0000,
)
def test_successful_estimate_mocks_openrouteservice(monkeypatch):
    customer = create_customer()
    calls = {}

    def fake_post(url, json, headers, timeout):
        calls["url"] = url
        calls["json"] = json
        calls["headers"] = headers
        calls["timeout"] = timeout
        return response(
            200,
            {
                "routes": [
                    {
                        "summary": {
                            "distance": 12500,
                            "duration": 1800,
                        }
                    }
                ]
            },
            method="POST",
        )

    monkeypatch.setattr("apps.delivery.services.httpx.post", fake_post)

    api_response = api_client(customer).post(
        reverse("delivery-estimate"),
        {"latitude": "32.60000000", "longitude": "-117.10000000"},
        format="json",
    )

    assert api_response.status_code == 200
    assert api_response.data["origin_latitude"] == "32.50000000"
    assert api_response.data["origin_longitude"] == "-117.00000000"
    assert api_response.data["destination_latitude"] == "32.60000000"
    assert api_response.data["destination_longitude"] == "-117.10000000"
    assert api_response.data["distance_km"] == "12.500"
    assert api_response.data["estimated_duration_minutes"] == "30.0"
    assert api_response.data["delivery_fee"] == "180.00"
    assert api_response.data["delivery_zone"] == "standard"
    assert api_response.data["distance_provider"] == "openrouteservice"
    assert calls["headers"]["Authorization"] == "test-key"
    assert calls["json"]["coordinates"] == [[-117.0, 32.5], [-117.1, 32.6]]


@override_settings(OPENROUTESERVICE_API_KEY="test-key")
def test_distance_provider_failure_returns_local_fallback(monkeypatch):
    customer = create_customer()

    def fake_post(url, json, headers, timeout):
        return response(503, {"error": "unavailable"}, method="POST")

    monkeypatch.setattr("apps.delivery.services.httpx.post", fake_post)

    api_response = api_client(customer).post(
        reverse("delivery-estimate"),
        {"latitude": "32.60000000", "longitude": "-117.10000000"},
        format="json",
    )

    assert api_response.status_code == 200
    assert api_response.data["distance_provider"] == "approximate_fallback"
    assert api_response.data["routing_available"] is False
    assert "estimación" in api_response.data["routing_warning"].lower()


def test_estimate_uses_fallback_distance_without_provider_key(monkeypatch):
    customer = create_customer()

    def fail_post(*args, **kwargs):
        raise AssertionError("external provider should not be called")

    monkeypatch.setattr("apps.delivery.services.httpx.post", fail_post)

    with override_settings(OPENROUTESERVICE_API_KEY=""):
        api_response = api_client(customer).post(
            reverse("delivery-estimate"),
            {"latitude": "32.60000000", "longitude": "-117.10000000"},
            format="json",
        )

    assert api_response.status_code == 200
    assert api_response.data["distance_provider"] == "approximate_fallback"
    assert Decimal(api_response.data["distance_km"]) > Decimal("0.000")
    assert api_response.data["routing_available"] is False
    assert "ruta" in api_response.data["routing_warning"].lower()
    assert "openroute" not in api_response.data["routing_warning"].lower()


@override_settings(OPENROUTESERVICE_API_KEY="test-key")
def test_estimate_can_geocode_address_before_distance(monkeypatch):
    customer = create_customer()

    def fake_get(url, params, headers, timeout):
        return response(
            200,
            [
                {
                    "display_name": "Mapped address",
                    "lat": "32.70000000",
                    "lon": "-117.20000000",
                }
            ],
        )

    def fake_post(url, json, headers, timeout):
        return response(
            200,
            {
                "features": [
                    {
                        "properties": {
                            "summary": {
                                "distance": 1000,
                                "duration": 120,
                            }
                        }
                    }
                ]
            },
            method="POST",
        )

    monkeypatch.setattr("apps.delivery.services.httpx.get", fake_get)
    monkeypatch.setattr("apps.delivery.services.httpx.post", fake_post)

    api_response = api_client(customer).post(
        reverse("delivery-estimate"),
        {"address": "Mapped address"},
        format="json",
    )

    assert api_response.status_code == 200
    assert api_response.data["destination_latitude"] == "32.70000000"
    assert api_response.data["destination_longitude"] == "-117.20000000"
    assert api_response.data["geocoding_provider"] == "nominatim"
    assert api_response.data["delivery_fee"] == "88.00"


@override_settings(OPENROUTESERVICE_API_KEY="test-key")
def test_estimate_uses_persisted_store_origin_and_delivery_prices(monkeypatch):
    customer = create_customer()
    create_store_settings(
        latitude="32.40000000",
        longitude="-117.30000000",
        delivery_base_fee="100.00",
        delivery_price_per_km="10.00",
    )

    def fake_post(url, json, headers, timeout):
        return response(
            200,
            {
                "features": [
                    {
                        "properties": {
                            "summary": {
                                "distance": 5000,
                                "duration": 600,
                            }
                        }
                    }
                ]
            },
            method="POST",
        )

    monkeypatch.setattr("apps.delivery.services.httpx.post", fake_post)

    api_response = api_client(customer).post(
        reverse("delivery-estimate"),
        {"latitude": "32.60000000", "longitude": "-117.10000000"},
        format="json",
    )

    assert api_response.status_code == 200
    assert api_response.data["origin_latitude"] == "32.40000000"
    assert api_response.data["origin_longitude"] == "-117.30000000"
    assert api_response.data["delivery_fee"] == "150.00"


@override_settings(OPENROUTESERVICE_API_KEY="test-key")
def test_estimate_applies_free_shipping_threshold_from_same_rule(monkeypatch):
    customer = create_customer()
    create_store_settings(
        delivery_base_fee="100.00",
        delivery_price_per_km="10.00",
        free_shipping_threshold="500.00",
    )

    def fake_post(url, json, headers, timeout):
        return response(
            200,
            {
                "features": [
                    {
                        "properties": {
                            "summary": {
                                "distance": 5000,
                                "duration": 600,
                            }
                        }
                    }
                ]
            },
            method="POST",
        )

    monkeypatch.setattr("apps.delivery.services.httpx.post", fake_post)

    api_response = api_client(customer).post(
        reverse("delivery-estimate"),
        {
            "latitude": "32.60000000",
            "longitude": "-117.10000000",
            "order_subtotal": "500.00",
        },
        format="json",
    )

    assert api_response.status_code == 200
    assert api_response.data["delivery_fee"] == "0.00"
    assert api_response.data["free_shipping_applied"] is True
    assert api_response.data["free_shipping_threshold"] == "500.00"
