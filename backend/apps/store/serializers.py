from rest_framework import serializers

from apps.store.models import StoreSettings


class StoreSettingsSerializer(serializers.ModelSerializer):
    updated_by = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = StoreSettings
        fields = (
            "store_name",
            "contact_phone",
            "contact_email",
            "street",
            "neighborhood",
            "city",
            "state",
            "postal_code",
            "latitude",
            "longitude",
            "delivery_base_fee",
            "delivery_price_per_km",
            "free_shipping_threshold",
            "show_cart_estimate",
            "updated_at",
            "updated_by",
        )
        read_only_fields = ("updated_at", "updated_by")

    def validate(self, attrs):
        candidate = {}
        if self.instance:
            for field in self.Meta.fields:
                if field not in self.Meta.read_only_fields:
                    candidate[field] = getattr(self.instance, field)
        candidate.update(attrs)

        latitude = candidate.get("latitude")
        if latitude is not None and not (-90 <= latitude <= 90):
            raise serializers.ValidationError(
                {"latitude": "Latitude must be between -90 and 90."}
            )

        longitude = candidate.get("longitude")
        if longitude is not None and not (-180 <= longitude <= 180):
            raise serializers.ValidationError(
                {"longitude": "Longitude must be between -180 and 180."}
            )

        for field in (
            "delivery_base_fee",
            "delivery_price_per_km",
            "free_shipping_threshold",
        ):
            value = candidate.get(field)
            if value is not None and value < 0:
                raise serializers.ValidationError({field: "Value cannot be negative."})

        return attrs
