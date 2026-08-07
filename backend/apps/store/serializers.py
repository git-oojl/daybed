from rest_framework import serializers

from apps.store.models import ContactRequest, StoreSettings


class StoreSettingsSerializer(serializers.ModelSerializer):
    updated_by = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = StoreSettings
        fields = (
            "store_name",
            "contact_phone",
            "contact_email",
            "business_hours",
            "support_instructions",
            "street",
            "neighborhood",
            "city",
            "state",
            "postal_code",
            "latitude",
            "longitude",
            "delivery_base_fee",
            "delivery_price_per_km",
            "maximum_delivery_radius_km",
            "free_shipping_threshold",
            "currency",
            "cancellation_window_hours",
            "default_low_stock_threshold",
            "default_preparation_days",
            "announcement_message",
            "instagram_url",
            "facebook_url",
            "storefront_available",
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
            "maximum_delivery_radius_km",
            "free_shipping_threshold",
            "cancellation_window_hours",
            "default_low_stock_threshold",
            "default_preparation_days",
        ):
            value = candidate.get(field)
            if value is not None and value < 0:
                raise serializers.ValidationError({field: "El valor no puede ser negativo."})

        currency = str(candidate.get("currency") or "MXN").upper()
        if currency != "MXN":
            raise serializers.ValidationError({"currency": "Daybed opera en pesos mexicanos (MXN)."})

        return attrs


class ContactRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactRequest
        fields = ("id", "name", "email", "subject", "message", "order_code", "created_at")
        read_only_fields = ("id", "created_at")

    def validate_order_code(self, value):
        normalized = str(value or "").strip().upper()
        if normalized and not normalized.startswith("DAY-"):
            raise serializers.ValidationError("Usa un código como DAY-00801.")
        return normalized
