from django.conf import settings
from django.core.exceptions import ValidationError
from django.db import models

from apps.catalog.models import Product


class InventoryMovement(models.Model):
    class Types(models.TextChoices):
        MANUAL_ADJUSTMENT = "manual_adjustment", "Manual adjustment"
        ORDER_CONFIRMED = "order_confirmed", "Order confirmed"
        ORDER_RESERVED = "order_reserved", "Order reserved"
        ORDER_CANCELLED = "order_cancelled", "Order cancelled"

    product = models.ForeignKey(
        Product,
        on_delete=models.PROTECT,
        related_name="inventory_movements",
    )
    movement_type = models.CharField(max_length=40, choices=Types.choices)
    quantity_delta = models.IntegerField()
    previous_stock = models.PositiveIntegerField()
    new_stock = models.PositiveIntegerField()
    reason = models.CharField(max_length=255, blank=True)
    order = models.ForeignKey(
        "orders.Order",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="inventory_movements",
    )
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="inventory_movements",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ("-created_at", "-id")
        constraints = [
            models.CheckConstraint(
                condition=~models.Q(quantity_delta=0),
                name="inventory_movement_quantity_delta_not_zero",
            ),
            models.CheckConstraint(
                condition=models.Q(
                    new_stock=models.F("previous_stock") + models.F("quantity_delta")
                ),
                name="inventory_movement_stock_math_matches_delta",
            ),
        ]

    def __str__(self):
        return f"{self.product} {self.quantity_delta:+d}"

    def clean(self):
        super().clean()
        if self.pk and InventoryMovement.objects.filter(pk=self.pk).exists():
            raise ValidationError("Inventory movements are append-only.")
        if self.quantity_delta == 0:
            raise ValidationError("Inventory movement quantity delta cannot be zero.")
        if self.new_stock != self.previous_stock + self.quantity_delta:
            raise ValidationError(
                "Inventory movement stock values must match the quantity delta."
            )

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)

    def delete(self, *args, **kwargs):
        raise ValidationError("Inventory movements are append-only.")
