from rest_framework import serializers

from apps.catalog.models import Product
from apps.catalog.serializers import CategorySerializer
from apps.inventory.models import InventoryMovement


class InventoryProductSerializer(serializers.ModelSerializer):
    category_detail = CategorySerializer(source="category", read_only=True)
    low_stock = serializers.BooleanField(read_only=True)

    class Meta:
        model = Product
        fields = (
            "id",
            "sku",
            "name",
            "category",
            "category_detail",
            "stock",
            "minimum_stock",
            "low_stock",
            "main_image",
            "active",
            "updated_at",
        )
        read_only_fields = fields


class StockUpdateSerializer(serializers.ModelSerializer):
    reason = serializers.CharField(
        max_length=255,
        required=False,
        allow_blank=True,
        write_only=True,
    )

    class Meta:
        model = Product
        fields = ("stock", "minimum_stock", "reason")
        extra_kwargs = {
            "stock": {"required": False},
            "minimum_stock": {"required": False},
        }

    def validate(self, attrs):
        if "stock" not in attrs and "minimum_stock" not in attrs:
            raise serializers.ValidationError("Provide stock, minimum_stock, or both.")
        return attrs

    def update(self, instance, validated_data):
        validated_data.pop("reason", None)
        return super().update(instance, validated_data)


class InventoryMovementSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source="product.name", read_only=True)
    product_sku = serializers.CharField(source="product.sku", read_only=True)
    created_by_username = serializers.CharField(
        source="created_by.username",
        read_only=True,
    )

    class Meta:
        model = InventoryMovement
        fields = (
            "id",
            "product",
            "product_sku",
            "product_name",
            "movement_type",
            "quantity_delta",
            "previous_stock",
            "new_stock",
            "reason",
            "order",
            "created_by",
            "created_by_username",
            "created_at",
        )
        read_only_fields = fields
