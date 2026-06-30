from django.contrib import admin

from apps.inventory.models import InventoryMovement


@admin.register(InventoryMovement)
class InventoryMovementAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "product",
        "movement_type",
        "quantity_delta",
        "previous_stock",
        "new_stock",
        "created_by",
        "created_at",
    )
    list_filter = ("movement_type", "created_at")
    search_fields = ("product__name", "reason", "created_by__username")
    readonly_fields = (
        "product",
        "movement_type",
        "quantity_delta",
        "previous_stock",
        "new_stock",
        "reason",
        "order",
        "created_by",
        "created_at",
    )

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False if obj else super().has_change_permission(request, obj=obj)

    def has_delete_permission(self, request, obj=None):
        return False
