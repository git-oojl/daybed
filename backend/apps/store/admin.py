from django.contrib import admin

from apps.store.models import ContactRequest, StoreSettings


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



@admin.register(ContactRequest)
class ContactRequestAdmin(admin.ModelAdmin):
    list_display = ("subject", "name", "email", "order_code", "status", "created_at")
    list_filter = ("status", "created_at")
    search_fields = ("name", "email", "subject", "order_code", "message")
    readonly_fields = ("created_at", "updated_at")
