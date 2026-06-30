from decimal import Decimal

from django.conf import settings
from django.core.exceptions import ValidationError
from django.db import models, transaction

from apps.catalog.models import Product


class Order(models.Model):
    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        CONFIRMED = "confirmed", "Confirmed"
        PREPARING = "preparing", "Preparing"
        SHIPPED = "shipped", "Shipped"
        DELIVERED = "delivered", "Delivered"
        CANCELLED = "cancelled", "Cancelled"

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name="orders",
    )
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING,
    )
    stock_decremented_at = models.DateTimeField(null=True, blank=True)

    original_address = models.CharField(max_length=500)
    formatted_address = models.CharField(max_length=500)
    latitude = models.DecimalField(max_digits=12, decimal_places=8)
    longitude = models.DecimalField(max_digits=12, decimal_places=8)
    distance_km = models.DecimalField(max_digits=10, decimal_places=3)
    estimated_duration_minutes = models.DecimalField(max_digits=10, decimal_places=1)
    delivery_fee = models.DecimalField(max_digits=10, decimal_places=2)
    delivery_zone = models.CharField(max_length=80, default="standard")
    geocoding_provider = models.CharField(max_length=80, blank=True)
    distance_provider = models.CharField(max_length=80, blank=True)

    products_subtotal = models.DecimalField(max_digits=10, decimal_places=2)
    total = models.DecimalField(max_digits=10, decimal_places=2)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ("-created_at", "-id")

    def __str__(self):
        return f"Order #{self.id} for {self.user}"

    @classmethod
    def allowed_status_transitions(cls):
        return {
            cls.Status.PENDING: {cls.Status.CONFIRMED, cls.Status.CANCELLED},
            cls.Status.CONFIRMED: {cls.Status.PREPARING, cls.Status.CANCELLED},
            cls.Status.PREPARING: {cls.Status.SHIPPED, cls.Status.CANCELLED},
            cls.Status.SHIPPED: {cls.Status.DELIVERED},
            cls.Status.DELIVERED: set(),
            cls.Status.CANCELLED: set(),
        }

    def can_transition_to(self, status):
        if status == self.status:
            return True
        return status in self.allowed_status_transitions()[self.status]

    def validate_status_transition(self, status):
        if not self.can_transition_to(status):
            raise ValidationError(
                f"Cannot transition order from '{self.status}' to '{status}'."
            )

    @transaction.atomic
    def confirm(self, actor=None):
        self.validate_status_transition(self.Status.CONFIRMED)
        if self.status == self.Status.CONFIRMED and self.stock_decremented_at:
            return
        if self.stock_decremented_at:
            self.status = self.Status.CONFIRMED
            self.save(update_fields=("status", "updated_at"))
            return

        items = list(self.items.select_related("product"))
        product_ids = [item.product_id for item in items]
        products = {
            product.id: product
            for product in Product.objects.select_for_update().filter(
                id__in=product_ids
            )
        }

        for item in items:
            product = products[item.product_id]
            if product.stock < item.quantity:
                raise ValidationError(
                    f"Insufficient stock for product '{product.name}'."
                )

        for item in items:
            product = products[item.product_id]
            previous_stock = product.stock
            product.stock -= item.quantity
            product.save(update_fields=("stock", "updated_at"))

            from apps.inventory.models import InventoryMovement
            from apps.inventory.services import record_inventory_movement

            record_inventory_movement(
                product=product,
                movement_type=InventoryMovement.Types.ORDER_CONFIRMED,
                previous_stock=previous_stock,
                new_stock=product.stock,
                reason=f"Order #{self.id} confirmed",
                order=self,
                created_by=actor,
            )

        from django.utils import timezone

        self.status = self.Status.CONFIRMED
        self.stock_decremented_at = timezone.now()
        self.save(update_fields=("status", "stock_decremented_at", "updated_at"))

    def transition_to(self, status, actor=None):
        if status == self.Status.CONFIRMED:
            self.confirm(actor=actor)
            return
        self.validate_status_transition(status)
        if status != self.status:
            self.status = status
            self.save(update_fields=("status", "updated_at"))


class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name="items")
    product = models.ForeignKey(
        Product,
        on_delete=models.PROTECT,
        related_name="order_items",
    )
    product_name = models.CharField(max_length=180)
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    quantity = models.PositiveIntegerField()
    line_total = models.DecimalField(max_digits=10, decimal_places=2)

    class Meta:
        ordering = ("id",)

    @classmethod
    def from_cart_item(cls, order, cart_item):
        unit_price = cart_item.product.price
        quantity = cart_item.quantity
        return cls(
            order=order,
            product=cart_item.product,
            product_name=cart_item.product.name,
            unit_price=unit_price,
            quantity=quantity,
            line_total=unit_price * Decimal(quantity),
        )

    def __str__(self):
        return f"{self.quantity} x {self.product_name}"
