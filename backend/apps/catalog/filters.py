from decimal import Decimal, InvalidOperation

import django_filters
from rest_framework.exceptions import ValidationError
from django.db.models import Avg

from apps.catalog.models import Category, Product


class ProductFilter(django_filters.FilterSet):
    ids = django_filters.CharFilter(method="filter_ids")
    category__slug = django_filters.CharFilter(
        field_name="category__slug",
        lookup_expr="exact",
    )
    min_price = django_filters.NumberFilter(field_name="price", lookup_expr="gte")
    max_price = django_filters.NumberFilter(field_name="price", lookup_expr="lte")
    in_stock = django_filters.BooleanFilter(method="filter_in_stock")
    min_rating = django_filters.NumberFilter(method="filter_min_rating")
    min_width_cm = django_filters.NumberFilter(field_name="width_cm", lookup_expr="gte")
    max_width_cm = django_filters.NumberFilter(field_name="width_cm", lookup_expr="lte")
    min_height_cm = django_filters.NumberFilter(
        field_name="height_cm",
        lookup_expr="gte",
    )
    max_height_cm = django_filters.NumberFilter(
        field_name="height_cm",
        lookup_expr="lte",
    )
    min_depth_cm = django_filters.NumberFilter(field_name="depth_cm", lookup_expr="gte")
    max_depth_cm = django_filters.NumberFilter(field_name="depth_cm", lookup_expr="lte")
    min_weight_kg = django_filters.NumberFilter(
        field_name="weight_kg",
        lookup_expr="gte",
    )
    max_weight_kg = django_filters.NumberFilter(
        field_name="weight_kg",
        lookup_expr="lte",
    )

    class Meta:
        model = Product
        fields = (
            "ids",
            "category",
            "category__slug",
            "material",
            "color",
            "style",
            "room",
            "furniture_type",
            "has_storage",
            "is_sofa_bed",
            "featured",
        )

    def filter_in_stock(self, queryset, name, value):
        if value:
            return queryset.filter(stock__gt=0)
        return queryset.filter(stock=0)

    def filter_ids(self, queryset, name, value):
        values = [
            int(item)
            for item in str(value or "").split(",")
            if str(item).strip().isdigit()
        ]
        if not values:
            return queryset.none()
        return queryset.filter(id__in=values)

    def filter_min_rating(self, queryset, name, value):
        if value is None:
            return queryset
        return queryset.annotate(public_rating=Avg("reviews__rating")).filter(
            public_rating__gte=value,
            reviews__active=True,
        ).distinct()


class StaffProductFilter(ProductFilter):
    class Meta(ProductFilter.Meta):
        fields = ProductFilter.Meta.fields + ("active",)


class SpecificationFilterMixin:
    spec_filter_prefix = "spec."

    def filter_queryset(self, queryset):
        queryset = super().filter_queryset(queryset)
        spec_filters = {
            key.removeprefix(self.spec_filter_prefix): value
            for key, value in self.request.query_params.items()
            if key.startswith(self.spec_filter_prefix)
        }
        if not spec_filters:
            return queryset

        allowed_types = self.get_allowed_spec_filter_types()
        invalid_keys = sorted(set(spec_filters) - set(allowed_types))
        if invalid_keys:
            raise ValidationError(
                {
                    "specifications": (
                        "Filtros de especificacion no permitidos: "
                        + ", ".join(invalid_keys)
                    )
                }
            )

        for key, raw_value in spec_filters.items():
            queryset = queryset.filter(
                **{
                    f"specifications__{key}": parse_spec_filter_value(
                        raw_value,
                        allowed_types[key],
                    )
                }
            )
        return queryset

    def get_allowed_spec_filter_types(self):
        category_slugs = self.request.query_params.getlist("category__slug")
        category_ids = self.request.query_params.getlist("category")
        if not category_slugs and not category_ids:
            raise ValidationError(
                {
                    "specifications": (
                        "Los filtros spec.* requieren category o category__slug."
                    )
                }
            )

        categories = Category.objects.all()
        if category_slugs:
            categories = categories.filter(slug__in=category_slugs)
        if category_ids:
            categories = categories.filter(id__in=category_ids)

        allowed_types = {}
        scalar_types = {"text", "number", "boolean"}
        for schema in categories.values_list("specification_schema", flat=True):
            if not isinstance(schema, list):
                continue
            for item in schema:
                if not isinstance(item, dict) or item.get("filterable") is not True:
                    continue
                key = item.get("key")
                field_type = item.get("type", "text")
                if key and field_type in scalar_types:
                    allowed_types[key] = field_type
        return allowed_types


def parse_spec_filter_value(value, field_type):
    normalized = value.strip()
    if field_type == "text":
        return value

    if field_type == "boolean":
        lowered = normalized.lower()
        if lowered == "true":
            return True
        if lowered == "false":
            return False
        raise ValidationError({"specifications": f"Valor booleano invalido: {value}."})

    try:
        decimal_value = Decimal(normalized)
    except InvalidOperation:
        raise ValidationError(
            {"specifications": f"Valor numerico invalido: {value}."}
        ) from None

    if decimal_value == decimal_value.to_integral_value():
        return int(decimal_value)
    return float(decimal_value)
