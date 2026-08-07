from rest_framework import serializers

from apps.delivery.services import build_structured_address


class GeocodeRequestSerializer(serializers.Serializer):
    address = serializers.CharField(max_length=500, required=False, allow_blank=True, trim_whitespace=True)
    street = serializers.CharField(max_length=180, required=False, allow_blank=True)
    neighborhood = serializers.CharField(max_length=120, required=False, allow_blank=True)
    city = serializers.CharField(max_length=120, required=False, allow_blank=True)
    state = serializers.CharField(max_length=120, required=False, allow_blank=True)
    postal_code = serializers.CharField(max_length=10, required=False, allow_blank=True)

    def validate(self, attrs):
        address = attrs.get("address") or build_structured_address(
            street=attrs.get("street", ""),
            neighborhood=attrs.get("neighborhood", ""),
            city=attrs.get("city", ""),
            state=attrs.get("state", ""),
            postal_code=attrs.get("postal_code", ""),
        )
        if not address:
            raise serializers.ValidationError({"address": "Completa los datos principales de la dirección."})
        attrs["address"] = address
        return attrs


class GeocodeCandidateSerializer(serializers.Serializer):
    formatted_address = serializers.CharField()
    latitude = serializers.DecimalField(max_digits=12, decimal_places=8)
    longitude = serializers.DecimalField(max_digits=12, decimal_places=8)
    address = serializers.DictField(required=False)


class GeocodeResponseSerializer(serializers.Serializer):
    original_address = serializers.CharField()
    formatted_address = serializers.CharField()
    latitude = serializers.DecimalField(max_digits=12, decimal_places=8)
    longitude = serializers.DecimalField(max_digits=12, decimal_places=8)
    provider = serializers.CharField()
    candidates = GeocodeCandidateSerializer(many=True, required=False)


class DeliveryEstimateRequestSerializer(serializers.Serializer):
    address = serializers.CharField(max_length=500, required=False, allow_blank=False, trim_whitespace=True)
    latitude = serializers.DecimalField(max_digits=12, decimal_places=8, required=False)
    longitude = serializers.DecimalField(max_digits=12, decimal_places=8, required=False)
    order_subtotal = serializers.DecimalField(max_digits=10, decimal_places=2, min_value=0, required=False)

    def validate(self, attrs):
        has_address = bool(attrs.get("address"))
        has_coordinates = "latitude" in attrs and "longitude" in attrs
        if not has_address and not has_coordinates:
            raise serializers.ValidationError("Proporciona una dirección o coordenadas válidas.")
        return attrs


class DeliveryEstimateResponseSerializer(serializers.Serializer):
    origin_latitude = serializers.DecimalField(max_digits=12, decimal_places=8)
    origin_longitude = serializers.DecimalField(max_digits=12, decimal_places=8)
    destination_latitude = serializers.DecimalField(max_digits=12, decimal_places=8)
    destination_longitude = serializers.DecimalField(max_digits=12, decimal_places=8)
    distance_km = serializers.DecimalField(max_digits=10, decimal_places=3)
    estimated_duration_minutes = serializers.DecimalField(max_digits=10, decimal_places=1)
    delivery_fee = serializers.DecimalField(max_digits=10, decimal_places=2)
    free_shipping_applied = serializers.BooleanField()
    free_shipping_threshold = serializers.DecimalField(max_digits=10, decimal_places=2, allow_null=True)
    delivery_zone = serializers.CharField()
    geocoding_provider = serializers.CharField(required=False)
    distance_provider = serializers.CharField()
    routing_available = serializers.BooleanField()
    routing_warning = serializers.CharField(required=False, allow_blank=True)
