from django.db.models import F
from rest_framework import generics

from apps.accounts.permissions import IsEmployeeOrAdmin
from apps.catalog.models import Product
from apps.inventory.serializers import (
    InventoryProductSerializer,
    StockUpdateSerializer,
)


class InventoryProductListView(generics.ListAPIView):
    serializer_class = InventoryProductSerializer
    permission_classes = (IsEmployeeOrAdmin,)
    filterset_fields = ("active", "category", "category__slug")
    search_fields = ("name", "description", "material", "color", "style")
    ordering_fields = ("name", "stock", "minimum_stock", "updated_at")

    def get_queryset(self):
        return Product.objects.select_related("category").order_by("name")


class LowStockProductListView(InventoryProductListView):
    def get_queryset(self):
        return super().get_queryset().filter(active=True, stock__lte=F("minimum_stock"))


class StockUpdateView(generics.UpdateAPIView):
    queryset = Product.objects.select_related("category").order_by("id")
    permission_classes = (IsEmployeeOrAdmin,)
    serializer_class = StockUpdateSerializer
    http_method_names = ["patch", "put", "head", "options"]

    def get_serializer_class(self):
        if self.request.method in {"PATCH", "PUT"}:
            return StockUpdateSerializer
        return InventoryProductSerializer

    def update(self, request, *args, **kwargs):
        response = super().update(request, *args, **kwargs)
        product = self.get_object()
        response.data = InventoryProductSerializer(product).data
        return response
