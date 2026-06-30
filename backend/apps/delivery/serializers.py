from rest_framework import serializers


class GeocodeRequestSerializer(serializers.Serializer):
    address = serializers.CharField(max_length=500, trim_whitespace=True)


class GeocodeResponseSerializer(serializers.Serializer):
    original_address = serializers.CharField()
    formatted_address = serializers.CharField()
    latitude = serializers.DecimalField(max_digits=12, decimal_places=8)
    longitude = serializers.DecimalField(max_digits=12, decimal_places=8)
    provider = serializers.CharField()


class DeliveryEstimateRequestSerializer(serializers.Serializer):
    address = serializers.CharField(
        max_length=500,
        required=False,
        allow_blank=False,
        trim_whitespace=True,
    )
    latitude = serializers.DecimalField(
        max_digits=12,
        decimal_places=8,
        required=False,
    )
    longitude = serializers.DecimalField(
        max_digits=12,
        decimal_places=8,
        required=False,
    )

    def validate(self, attrs):
        has_address = bool(attrs.get("address"))
        has_coordinates = "latitude" in attrs and "longitude" in attrs
        if not has_address and not has_coordinates:
            raise serializers.ValidationError(
                "Provide either address or latitude and longitude."
            )
        return attrs


class DeliveryEstimateResponseSerializer(serializers.Serializer):
    origin_latitude = serializers.DecimalField(max_digits=12, decimal_places=8)
    origin_longitude = serializers.DecimalField(max_digits=12, decimal_places=8)
    destination_latitude = serializers.DecimalField(max_digits=12, decimal_places=8)
    destination_longitude = serializers.DecimalField(max_digits=12, decimal_places=8)
    distance_km = serializers.DecimalField(max_digits=10, decimal_places=3)
    estimated_duration_minutes = serializers.DecimalField(
        max_digits=10, decimal_places=1
    )
    delivery_fee = serializers.DecimalField(max_digits=10, decimal_places=2)
    delivery_zone = serializers.CharField()
    geocoding_provider = serializers.CharField(required=False)
    distance_provider = serializers.CharField()
