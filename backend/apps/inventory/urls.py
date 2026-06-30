from django.urls import path

from apps.inventory.views import (
    InventoryProductListView,
    LowStockProductListView,
    StockUpdateView,
)

urlpatterns = [
    path("products/", InventoryProductListView.as_view(), name="inventory-products"),
    path("low-stock/", LowStockProductListView.as_view(), name="inventory-low-stock"),
    path(
        "products/<int:pk>/stock/",
        StockUpdateView.as_view(),
        name="inventory-stock-update",
    ),
]
