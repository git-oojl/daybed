from django.db.models import F
from rest_framework import generics

from apps.accounts.permissions import IsEmployeeOrAdmin
from apps.catalog.models import Product
from apps.inventory.models import InventoryMovement
from apps.inventory.serializers import (
    InventoryMovementSerializer,
    InventoryProductSerializer,
    StockUpdateSerializer,
)
from apps.inventory.services import record_inventory_movement


class InventoryProductListView(generics.ListAPIView):
    serializer_class = InventoryProductSerializer
    permission_classes = (IsEmployeeOrAdmin,)
    filterset_fields = ("active", "category", "category__slug")
    search_fields = ("sku", "name", "description", "material", "color", "style")
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
        product = self.get_object()
        previous_stock = product.stock
        reason = request.data.get("reason", "")
        response = super().update(request, *args, **kwargs)
        product = self.get_object()
        record_inventory_movement(
            product=product,
            movement_type=InventoryMovement.Types.MANUAL_ADJUSTMENT,
            previous_stock=previous_stock,
            new_stock=product.stock,
            reason=reason,
            created_by=request.user,
        )
        response.data = InventoryProductSerializer(product).data
        return response


class InventoryMovementListView(generics.ListAPIView):
    serializer_class = InventoryMovementSerializer
    permission_classes = (IsEmployeeOrAdmin,)
    filterset_fields = ("product", "movement_type", "order", "created_by")
    search_fields = ("product__name", "reason", "created_by__username")
    ordering_fields = ("created_at", "quantity_delta")

    def get_queryset(self):
        return InventoryMovement.objects.select_related(
            "product",
            "order",
            "created_by",
        ).order_by("-created_at", "-id")
