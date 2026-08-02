from rest_framework import viewsets
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from apps.access_control.permissions import operational_permission
from apps.catalog.filters import (
    ProductFilter,
    SpecificationFilterMixin,
    StaffProductFilter,
)
from apps.catalog.models import Category, Product
from apps.catalog.serializers import CategorySerializer, ProductSerializer


class PublicCategoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Category.objects.filter(active=True)
    serializer_class = CategorySerializer
    permission_classes = (AllowAny,)
    lookup_field = "slug"
    search_fields = ("name", "description")
    ordering_fields = ("name",)


class PublicProductViewSet(SpecificationFilterMixin, viewsets.ReadOnlyModelViewSet):
    serializer_class = ProductSerializer
    permission_classes = (AllowAny,)
    filterset_class = ProductFilter
    search_fields = (
        "sku",
        "name",
        "description",
        "material",
        "color",
        "style",
    )
    ordering_fields = ("name", "price", "stock", "created_at")

    def get_queryset(self):
        return (
            Product.objects.filter(active=True, category__active=True)
            .select_related("category")
            .prefetch_related("images")
        )


class StaffCategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.order_by("name")
    serializer_class = CategorySerializer
    lookup_field = "slug"
    search_fields = ("name", "description")
    ordering_fields = ("name", "active", "created_at")

    def get_permissions(self):
        permission_by_action = {
            "list": "products.view",
            "retrieve": "products.view",
            "create": "products.create",
            "update": "products.update",
            "partial_update": "products.update",
            "destroy": "products.deactivate",
        }
        permission_code = permission_by_action.get(self.action, "products.view")
        return [operational_permission(permission_code)()]

    def destroy(self, request, *args, **kwargs):
        category = self.get_object()
        category.active = False
        category.save(update_fields=("active", "updated_at"))
        return Response(self.get_serializer(category).data)


class StaffProductViewSet(SpecificationFilterMixin, viewsets.ModelViewSet):
    queryset = (
        Product.objects.select_related("category")
        .prefetch_related("images")
        .order_by("name")
    )
    serializer_class = ProductSerializer
    filterset_class = StaffProductFilter
    search_fields = (
        "sku",
        "name",
        "description",
        "material",
        "color",
        "style",
    )
    ordering_fields = (
        "name",
        "price",
        "stock",
        "minimum_stock",
        "active",
        "created_at",
    )

    def get_permissions(self):
        permission_by_action = {
            "list": "products.view",
            "retrieve": "products.view",
            "create": "products.create",
            "update": "products.update",
            "partial_update": "products.update",
            "destroy": "products.deactivate",
        }
        permission_code = permission_by_action.get(self.action, "products.view")
        return [operational_permission(permission_code)()]

    def destroy(self, request, *args, **kwargs):
        product = self.get_object()
        product.active = False
        product.save(update_fields=("active", "updated_at"))
        return Response(self.get_serializer(product).data)