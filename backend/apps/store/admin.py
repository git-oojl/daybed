from django.contrib import admin

from apps.store.models import StoreSettings


@admin.register(StoreSettings)
class StoreSettingsAdmin(admin.ModelAdmin):
    list_display = (
        "store_name",
        "city",
        "state",
        "delivery_base_fee",
        "delivery_price_per_km",
        "free_shipping_threshold",
        "show_cart_estimate",
        "updated_at",
    )
    readonly_fields = ("updated_at",)

