from decimal import Decimal
from pathlib import PurePosixPath
from urllib.parse import urlparse

import httpx
from django.core.files.base import ContentFile
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
MAX_REMOTE_IMAGE_BYTES = 5 * 1024 * 1024
ALLOWED_REMOTE_IMAGE_TYPES = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "image/gif": ".gif",
}


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


def image_filename_from_url(url, content_type):
    parsed = urlparse(url)
    candidate = PurePosixPath(parsed.path).name or "product-image"
    stem = PurePosixPath(candidate).stem or "product-image"
    suffix = PurePosixPath(candidate).suffix.lower()
    expected_suffix = ALLOWED_REMOTE_IMAGE_TYPES.get(content_type, ".jpg")
    if suffix not in {".jpg", ".jpeg", ".png", ".webp", ".gif"}:
        suffix = expected_suffix
    return f"{stem[:80]}{suffix}"


def download_remote_image(url):
    try:
        response = httpx.get(url, follow_redirects=True, timeout=10)
        response.raise_for_status()
    except httpx.HTTPError as exc:
        raise serializers.ValidationError(
            "No se pudo descargar la imagen desde la URL proporcionada."
        ) from exc

    content_type = response.headers.get("content-type", "").split(";", 1)[0].lower()
    if content_type not in ALLOWED_REMOTE_IMAGE_TYPES:
        raise serializers.ValidationError(
            "La URL debe apuntar a una imagen JPG, PNG, WEBP o GIF."
        )

    content = response.content
    if not content:
        raise serializers.ValidationError("La imagen descargada esta vacia.")
    if len(content) > MAX_REMOTE_IMAGE_BYTES:
        raise serializers.ValidationError("La imagen no debe superar 5 MB.")

    return ContentFile(content, name=image_filename_from_url(url, content_type))


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
    image = serializers.ImageField(write_only=True, required=False)
    image_url = serializers.URLField(
        write_only=True,
        required=False,
        allow_blank=True,
    )

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
            "image",
            "image_url",
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
        image = attrs.pop("image", None)
        image_url = attrs.pop("image_url", "")
        if image and not attrs.get("main_image"):
            attrs["main_image"] = image
        if image_url and not attrs.get("main_image"):
            attrs["main_image"] = download_remote_image(image_url)

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
