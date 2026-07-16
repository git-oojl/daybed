from decimal import Decimal

from drf_spectacular.utils import extend_schema_field
from rest_framework import serializers

from apps.catalog.models import Category, Product, ProductImage

SPEC_VALUE_TYPES = (str, int, float, bool, type(None))
DIMENSION_FIELDS = (
    "width_cm",
    "height_cm",
    "depth_cm",
    "length_cm",
    "diameter_cm",
    "weight_kg",
)


def validate_simple_json_object(value, field_name):
    if not isinstance(value, dict):
        raise serializers.ValidationError(f"{field_name} debe ser un objeto JSON.")

    for key, item in value.items():
        if not isinstance(key, str) or not key:
            raise serializers.ValidationError(
                f"Las llaves de {field_name} deben ser texto no vacio."
            )
        if isinstance(item, list):
            if not all(isinstance(list_item, SPEC_VALUE_TYPES) for list_item in item):
                raise serializers.ValidationError(
                    f"Las listas de {field_name} solo pueden contener valores simples."
                )
        elif not isinstance(item, SPEC_VALUE_TYPES):
            raise serializers.ValidationError(
                f"{field_name} solo puede contener valores simples o listas simples."
            )

    return value


def validate_category_schema(value):
    if not isinstance(value, list):
        raise serializers.ValidationError("specification_schema debe ser una lista.")

    valid_types = {"text", "number", "boolean", "list"}
    seen_keys = set()
    for item in value:
        if not isinstance(item, dict):
            raise serializers.ValidationError(
                "Cada item de specification_schema debe ser un objeto."
            )
        key = item.get("key")
        label = item.get("label")
        field_type = item.get("type", "text")
        if not isinstance(key, str) or not key:
            raise serializers.ValidationError("Cada especificacion requiere key.")
        if key in seen_keys:
            raise serializers.ValidationError(f"Key duplicada en schema: {key}.")
        if label is not None and not isinstance(label, str):
            raise serializers.ValidationError("label debe ser texto.")
        if field_type not in valid_types:
            raise serializers.ValidationError(
                f"Tipo invalido para {key}: {field_type}."
            )
        if "filterable" in item and not isinstance(item["filterable"], bool):
            raise serializers.ValidationError("filterable debe ser booleano.")
        seen_keys.add(key)

    return value


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = (
            "id",
            "name",
            "slug",
            "description",
            "specification_schema",
            "active",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("id", "created_at", "updated_at")

    def validate_specification_schema(self, value):
        return validate_category_schema(value)


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
    structured_dimensions = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = (
            "id",
            "sku",
            "name",
            "description",
            "price",
            "category",
            "category_detail",
            "material",
            "color",
            "style",
            "width_cm",
            "height_cm",
            "depth_cm",
            "length_cm",
            "diameter_cm",
            "weight_kg",
            "structured_dimensions",
            "specifications",
            "main_image",
            "stock",
            "minimum_stock",
            "low_stock",
            "active",
            "images",
            "created_at",
            "updated_at",
        )
        read_only_fields = (
            "id",
            "low_stock",
            "structured_dimensions",
            "created_at",
            "updated_at",
        )

    def validate_price(self, value):
        if value < Decimal("0.00"):
            raise serializers.ValidationError("El precio no puede ser negativo.")
        return value

    def validate_specifications(self, value):
        return validate_simple_json_object(value, "specifications")

    def validate(self, attrs):
        for field in DIMENSION_FIELDS:
            value = attrs.get(field)
            if value is not None and value < Decimal("0.00"):
                raise serializers.ValidationError(
                    {field: "El valor no puede ser negativo."}
                )
        return attrs

    @extend_schema_field(serializers.DictField(allow_empty=True))
    def get_structured_dimensions(self, obj):
        return {
            key: str(value) if value is not None else None
            for key, value in obj.structured_dimensions.items()
        }
