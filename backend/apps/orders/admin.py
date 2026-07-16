from django.contrib import admin

from apps.orders.models import Order, OrderItem


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ("line_total", "product_snapshot")


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    inlines = (OrderItemInline,)
    list_display = (
        "id",
        "user",
        "status",
        "products_subtotal",
        "delivery_fee",
        "total",
    )
    list_filter = ("status", "delivery_zone", "geocoding_provider", "distance_provider")
    search_fields = ("user__username", "user__email", "original_address")
    readonly_fields = ("stock_decremented_at",)


@admin.register(OrderItem)
class OrderItemAdmin(admin.ModelAdmin):
    list_display = (
        "order",
        "product_sku",
        "product_name",
        "quantity",
        "unit_price",
        "line_total",
    )
    search_fields = ("order__user__username", "product_sku", "product_name")
    readonly_fields = ("product_snapshot",)
