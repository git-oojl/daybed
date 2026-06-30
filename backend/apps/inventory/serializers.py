from rest_framework import serializers

from apps.catalog.models import Product
from apps.catalog.serializers import CategorySerializer


class InventoryProductSerializer(serializers.ModelSerializer):
    category_detail = CategorySerializer(source="category", read_only=True)
    low_stock = serializers.BooleanField(read_only=True)

    class Meta:
        model = Product
        fields = (
            "id",
            "name",
            "category",
            "category_detail",
            "stock",
            "minimum_stock",
            "low_stock",
            "active",
            "updated_at",
        )
        read_only_fields = fields


class StockUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = ("stock", "minimum_stock")
        extra_kwargs = {
            "stock": {"required": False},
            "minimum_stock": {"required": False},
        }

    def validate(self, attrs):
        if not attrs:
            raise serializers.ValidationError("Provide stock, minimum_stock, or both.")
        return attrs
