from dataclasses import dataclass
from decimal import ROUND_HALF_UP, Decimal

import httpx
from django.conf import settings

from apps.store.models import StoreSettings


class DeliveryServiceError(Exception):
    status_code = 502


class DeliveryAddressNotFound(DeliveryServiceError):
    status_code = 404


class DeliveryConfigurationError(DeliveryServiceError):
    status_code = 503


@dataclass(frozen=True)
class GeocodeResult:
    original_address: str
    formatted_address: str
    latitude: Decimal
    longitude: Decimal
    provider: str = "nominatim"


@dataclass(frozen=True)
class DeliveryEstimate:
    origin_latitude: Decimal
    origin_longitude: Decimal
    destination_latitude: Decimal
    destination_longitude: Decimal
    distance_km: Decimal
    estimated_duration_minutes: Decimal
    delivery_fee: Decimal
    free_shipping_applied: bool
    free_shipping_threshold: Decimal | None
    distance_provider: str = "openrouteservice"


def _decimal(value):
    return Decimal(str(value))


def _money(value):
    return value.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)


def _distance(value):
    return value.quantize(Decimal("0.001"), rounding=ROUND_HALF_UP)


def _duration(value):
    return value.quantize(Decimal("0.1"), rounding=ROUND_HALF_UP)


def free_shipping_applies(order_subtotal, store_settings=None):
    if order_subtotal is None:
        return False

    store_settings = store_settings or StoreSettings.get_active()
    threshold = store_settings.free_shipping_threshold
    if threshold is None:
        return False

    return _decimal(order_subtotal) >= threshold


def calculate_delivery_fee(distance_km, order_subtotal=None, store_settings=None):
    store_settings = store_settings or StoreSettings.get_active()
    if free_shipping_applies(order_subtotal, store_settings):
        return _money(Decimal("0.00"))

    return _money(
        store_settings.delivery_base_fee
        + _decimal(distance_km) * store_settings.delivery_price_per_km
    )


def geocode_address(address):
    try:
        response = httpx.get(
            f"{settings.NOMINATIM_BASE_URL}/search",
            params={
                "q": address,
                "format": "jsonv2",
                "limit": 1,
                "addressdetails": 1,
            },
            headers={"User-Agent": settings.NOMINATIM_USER_AGENT},
            timeout=10,
        )
        response.raise_for_status()
    except httpx.HTTPError as exc:
        raise DeliveryServiceError("Geocoding provider failed.") from exc

    data = response.json()
    if not data:
        raise DeliveryAddressNotFound("Address could not be geocoded.")

    result = data[0]
    return GeocodeResult(
        original_address=address,
        formatted_address=result.get("display_name", address),
        latitude=_decimal(result["lat"]),
        longitude=_decimal(result["lon"]),
    )


def estimate_delivery(latitude, longitude, order_subtotal=None):
    if not settings.OPENROUTESERVICE_API_KEY:
        raise DeliveryConfigurationError("OpenRouteService API key is not configured.")

    store_settings = StoreSettings.get_active()
    origin_latitude = _decimal(store_settings.latitude)
    origin_longitude = _decimal(store_settings.longitude)
    destination_latitude = _decimal(latitude)
    destination_longitude = _decimal(longitude)

    try:
        response = httpx.post(
            f"{settings.OPENROUTESERVICE_BASE_URL}/v2/directions/driving-car",
            json={
                "coordinates": [
                    [float(origin_longitude), float(origin_latitude)],
                    [float(destination_longitude), float(destination_latitude)],
                ]
            },
            headers={
                "Authorization": settings.OPENROUTESERVICE_API_KEY,
                "Content-Type": "application/json",
            },
            timeout=10,
        )
        response.raise_for_status()
    except httpx.HTTPError as exc:
        raise DeliveryServiceError("Distance provider failed.") from exc

    try:
        summary = response.json()["features"][0]["properties"]["summary"]
        distance_km = _distance(_decimal(summary["distance"]) / Decimal("1000"))
        duration_minutes = _duration(_decimal(summary["duration"]) / Decimal("60"))
    except (KeyError, IndexError, TypeError) as exc:
        raise DeliveryServiceError(
            "Distance provider returned an invalid response."
        ) from exc

    delivery_fee = calculate_delivery_fee(
        distance_km,
        order_subtotal=order_subtotal,
        store_settings=store_settings,
    )

    return DeliveryEstimate(
        origin_latitude=origin_latitude,
        origin_longitude=origin_longitude,
        destination_latitude=destination_latitude,
        destination_longitude=destination_longitude,
        distance_km=distance_km,
        estimated_duration_minutes=duration_minutes,
        delivery_fee=delivery_fee,
        free_shipping_applied=free_shipping_applies(
            order_subtotal,
            store_settings=store_settings,
        ),
        free_shipping_threshold=store_settings.free_shipping_threshold,
    )
