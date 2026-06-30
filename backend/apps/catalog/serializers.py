from rest_framework import serializers

from apps.catalog.models import Category, Product, ProductImage


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = (
            "id",
            "name",
            "slug",
            "description",
            "active",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("id", "created_at", "updated_at")


class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = (
            "id",
            "image",
            "alt_text",
            "sort_order",
            "active",
            "created_at",
        )
        read_only_fields = ("id", "created_at")


class ProductSerializer(serializers.ModelSerializer):
    category_detail = CategorySerializer(source="category", read_only=True)
    images = ProductImageSerializer(many=True, read_only=True)
    low_stock = serializers.BooleanField(read_only=True)

    class Meta:
        model = Product
        fields = (
            "id",
            "name",
            "description",
            "price",
            "category",
            "category_detail",
            "material",
            "color",
            "style",
            "dimensions",
            "main_image",
            "stock",
            "minimum_stock",
            "low_stock",
            "active",
            "images",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("id", "low_stock", "created_at", "updated_at")
