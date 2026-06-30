from rest_framework import viewsets
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from apps.accounts.permissions import IsEmployeeOrAdmin
from apps.catalog.models import Category, Product
from apps.catalog.serializers import CategorySerializer, ProductSerializer


class PublicCategoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Category.objects.filter(active=True)
    serializer_class = CategorySerializer
    permission_classes = (AllowAny,)
    lookup_field = "slug"
    search_fields = ("name", "description")
    ordering_fields = ("name",)


class PublicProductViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = ProductSerializer
    permission_classes = (AllowAny,)
    filterset_fields = (
        "category",
        "category__slug",
        "material",
        "color",
        "style",
    )
    search_fields = (
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
    permission_classes = (IsEmployeeOrAdmin,)
    lookup_field = "slug"
    search_fields = ("name", "description")
    ordering_fields = ("name", "active", "created_at")


class StaffProductViewSet(viewsets.ModelViewSet):
    queryset = (
        Product.objects.select_related("category")
        .prefetch_related("images")
        .order_by("name")
    )
    serializer_class = ProductSerializer
    permission_classes = (IsEmployeeOrAdmin,)
    filterset_fields = (
        "active",
        "category",
        "category__slug",
        "material",
        "color",
        "style",
    )
    search_fields = (
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

    def destroy(self, request, *args, **kwargs):
        product = self.get_object()
        product.active = False
        product.save(update_fields=("active", "updated_at"))
        return Response(self.get_serializer(product).data)
