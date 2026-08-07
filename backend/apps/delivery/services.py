from dataclasses import dataclass, field
from decimal import ROUND_HALF_UP, Decimal
from math import asin, cos, radians, sin, sqrt
import re
import unicodedata

import httpx
from django.conf import settings

from apps.store.models import StoreSettings


class DeliveryServiceError(Exception):
    status_code = 502
    code = "delivery_service_unavailable"
    feature = "delivery"
    user_message = "No pudimos verificar la entrega en este momento. Conserva tus datos y vuelve a intentarlo."

    def __str__(self):
        return self.user_message


class DeliveryAddressNotFound(DeliveryServiceError):
    status_code = 404
    code = "address_not_found"
    user_message = "No encontramos una coincidencia clara. Revisa calle, municipio, entidad y código postal."


class GeocodingServiceUnavailable(DeliveryServiceError):
    status_code = 503
    code = "geocoding_service_unavailable"
    user_message = "El buscador de direcciones no está disponible por el momento. Tu carrito y sesión siguen intactos."


class DeliveryConfigurationError(DeliveryServiceError):
    status_code = 503
    code = "routing_service_unavailable"
    user_message = "No pudimos calcular el costo de entrega. Puedes corregir la dirección o intentarlo más tarde."


@dataclass(frozen=True)
class GeocodeCandidate:
    formatted_address: str
    latitude: Decimal
    longitude: Decimal
    address: dict = field(default_factory=dict)


@dataclass(frozen=True)
class GeocodeResult:
    original_address: str
    formatted_address: str
    latitude: Decimal
    longitude: Decimal
    provider: str = "nominatim"
    candidates: tuple[GeocodeCandidate, ...] = ()


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
    distance_provider: str = "straight_line_estimate"
    routing_available: bool = True
    routing_warning: str = ""


def _decimal(value):
    return Decimal(str(value))


def _money(value):
    return value.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)


def _distance(value):
    return value.quantize(Decimal("0.001"), rounding=ROUND_HALF_UP)


def _duration(value):
    return value.quantize(Decimal("0.1"), rounding=ROUND_HALF_UP)


def normalize_address_text(address):
    value = unicodedata.normalize("NFKC", str(address or ""))
    value = re.sub(r"\s+", " ", value)
    value = re.sub(r"\s*,\s*", ", ", value)
    return value.strip(" ,")


def strip_address_accents(address):
    return "".join(
        character
        for character in unicodedata.normalize("NFKD", address)
        if not unicodedata.combining(character)
    )


def build_structured_address(*, street="", neighborhood="", city="", state="", postal_code=""):
    parts = [street, neighborhood, city, state, postal_code, "México"]
    return normalize_address_text(", ".join(part for part in parts if str(part).strip()))


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
    normalized_address = normalize_address_text(address)
    data = _search_geocoding_provider(normalized_address)
    if not data:
        accent_insensitive = strip_address_accents(normalized_address)
        if accent_insensitive != normalized_address:
            data = _search_geocoding_provider(accent_insensitive)
    if not data:
        raise DeliveryAddressNotFound()

    candidates = tuple(
        GeocodeCandidate(
            formatted_address=result.get("display_name", normalized_address),
            latitude=_decimal(result["lat"]),
            longitude=_decimal(result["lon"]),
            address=result.get("address") or {},
        )
        for result in data
        if result.get("lat") is not None and result.get("lon") is not None
    )
    if not candidates:
        raise DeliveryAddressNotFound()

    selected = candidates[0]
    return GeocodeResult(
        original_address=normalized_address,
        formatted_address=selected.formatted_address,
        latitude=selected.latitude,
        longitude=selected.longitude,
        candidates=candidates,
    )


def _search_geocoding_provider(query):
    try:
        response = httpx.get(
            f"{settings.NOMINATIM_BASE_URL}/search",
            params={
                "q": query,
                "format": "jsonv2",
                "limit": 5,
                "addressdetails": 1,
                "countrycodes": "mx",
                "accept-language": "es-MX,es",
            },
            headers={"User-Agent": settings.NOMINATIM_USER_AGENT},
            timeout=10,
        )
        response.raise_for_status()
        return response.json()
    except (httpx.HTTPError, ValueError) as exc:
        raise GeocodingServiceUnavailable() from exc


def estimate_delivery(latitude, longitude, order_subtotal=None, store_settings=None):
    store_settings = store_settings or StoreSettings.get_active()
    origin_latitude = _decimal(store_settings.latitude)
    origin_longitude = _decimal(store_settings.longitude)
    destination_latitude = _decimal(latitude)
    destination_longitude = _decimal(longitude)
    distance_km = _fallback_distance_km(
        origin_latitude,
        origin_longitude,
        destination_latitude,
        destination_longitude,
    )
    duration_minutes = _duration(distance_km / Decimal("35.0") * Decimal("60.0"))

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
        free_shipping_applied=free_shipping_applies(order_subtotal, store_settings),
        free_shipping_threshold=store_settings.free_shipping_threshold,
        distance_provider="straight_line_estimate",
    )


def _fallback_estimate(origin_latitude, origin_longitude, destination_latitude, destination_longitude, order_subtotal, store_settings, warning):
    distance_km = _fallback_distance_km(
        origin_latitude,
        origin_longitude,
        destination_latitude,
        destination_longitude,
    )
    duration_minutes = _duration(distance_km / Decimal("35.0") * Decimal("60.0"))
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
        free_shipping_applied=free_shipping_applies(order_subtotal, store_settings),
        free_shipping_threshold=store_settings.free_shipping_threshold,
        distance_provider="approximate_fallback",
        routing_available=False,
        routing_warning=warning,
    )


def _openrouteservice_summary(payload):
    routes = payload.get("routes")
    if routes:
        return routes[0]["summary"]
    features = payload.get("features")
    if features:
        return features[0]["properties"]["summary"]
    raise KeyError("summary")


def _fallback_distance_km(origin_latitude, origin_longitude, destination_latitude, destination_longitude):
    earth_radius_km = 6371.0
    lat1 = radians(float(origin_latitude))
    lon1 = radians(float(origin_longitude))
    lat2 = radians(float(destination_latitude))
    lon2 = radians(float(destination_longitude))
    delta_lat = lat2 - lat1
    delta_lon = lon2 - lon1
    haversine = (
        sin(delta_lat / 2) ** 2
        + cos(lat1) * cos(lat2) * sin(delta_lon / 2) ** 2
    )
    straight_line_km = Decimal(str(2 * earth_radius_km * asin(sqrt(haversine))))
    return _distance(straight_line_km * Decimal("1.25"))
