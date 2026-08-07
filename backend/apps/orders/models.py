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

    class PaymentMethod(models.TextChoices):
        CARD = "card", "Tarjeta"
        TRANSFER = "transfer", "Transferencia"
        CASH = "cash", "Efectivo contra entrega"

    class PaymentStatus(models.TextChoices):
        AUTHORIZED = "authorized", "Autorizado"
        AWAITING_TRANSFER = "awaiting_transfer", "Pendiente de transferencia"
        PAY_ON_DELIVERY = "pay_on_delivery", "Pago contra entrega"
        FAILED = "failed", "Fallido"

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
    stock_released_at = models.DateTimeField(null=True, blank=True)

    original_address = models.CharField(max_length=500)
    formatted_address = models.CharField(max_length=500)
    latitude = models.DecimalField(
        max_digits=12,
        decimal_places=8,
        null=True,
        blank=True,
    )
    longitude = models.DecimalField(
        max_digits=12,
        decimal_places=8,
        null=True,
        blank=True,
    )
    distance_km = models.DecimalField(
        max_digits=10,
        decimal_places=3,
        null=True,
        blank=True,
    )
    estimated_duration_minutes = models.DecimalField(
        max_digits=10,
        decimal_places=1,
        null=True,
        blank=True,
    )
    delivery_fee = models.DecimalField(max_digits=10, decimal_places=2)
    delivery_zone = models.CharField(max_length=80, default="standard")
    geocoding_provider = models.CharField(max_length=80, blank=True)
    distance_provider = models.CharField(max_length=80, blank=True)

    products_subtotal = models.DecimalField(max_digits=10, decimal_places=2)
    discount_total = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal("0.00"))
    total = models.DecimalField(max_digits=10, decimal_places=2)
    delivery_notes = models.TextField(blank=True)
    internal_notes = models.TextField(blank=True)

    payment_method = models.CharField(
        max_length=20,
        choices=PaymentMethod.choices,
        default=PaymentMethod.CASH,
    )
    payment_status = models.CharField(
        max_length=30,
        choices=PaymentStatus.choices,
        default=PaymentStatus.PAY_ON_DELIVERY,
    )
    payment_reference = models.CharField(max_length=40, blank=True)
    payment_processed_at = models.DateTimeField(null=True, blank=True)
    payment_snapshot = models.JSONField(default=dict, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ("-created_at", "-id")

    @property
    def order_code(self):
        return f"DAY-{self.id:05d}" if self.id else "DAY-PENDIENTE"

    def __str__(self):
        return f"{self.order_code} for {self.user}"

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
            return False
        return status in self.allowed_status_transitions().get(self.status, set())

    def available_status_transitions(self):
        return sorted(self.allowed_status_transitions().get(self.status, set()))

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

    @transaction.atomic
    def release_reserved_stock(self, actor=None):
        if not self.stock_decremented_at or self.stock_released_at:
            return

        from django.utils import timezone
        from apps.inventory.models import InventoryMovement
        from apps.inventory.services import record_inventory_movement

        items = list(self.items.select_related("product"))
        products = {
            product.id: product
            for product in Product.objects.select_for_update().filter(
                id__in=[item.product_id for item in items]
            )
        }
        for item in items:
            product = products[item.product_id]
            previous_stock = product.stock
            product.stock += item.quantity
            product.save(update_fields=("stock", "updated_at"))
            record_inventory_movement(
                product=product,
                movement_type=InventoryMovement.Types.ORDER_CANCELLED,
                previous_stock=previous_stock,
                new_stock=product.stock,
                reason=f"{self.order_code} cancelled; reserved stock released",
                order=self,
                created_by=actor,
            )
        self.stock_released_at = timezone.now()
        self.save(update_fields=("stock_released_at", "updated_at"))

    @transaction.atomic
    def transition_to(self, status, actor=None, note=""):
        previous_status = self.status
        self.validate_status_transition(status)
        if status == self.Status.CONFIRMED:
            self.confirm(actor=actor)
        else:
            if status == self.Status.CANCELLED:
                self.release_reserved_stock(actor=actor)
            self.status = status
            self.save(update_fields=("status", "updated_at"))

        OrderStatusEvent.objects.create(
            order=self,
            from_status=previous_status,
            to_status=status,
            note=note,
            actor=actor,
        )


class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name="items")
    product = models.ForeignKey(
        Product,
        on_delete=models.PROTECT,
        related_name="order_items",
    )
    product_sku = models.CharField(max_length=64, blank=True)
    product_name = models.CharField(max_length=180)
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    quantity = models.PositiveIntegerField()
    line_total = models.DecimalField(max_digits=10, decimal_places=2)
    product_snapshot = models.JSONField(default=dict, blank=True)

    class Meta:
        ordering = ("id",)

    @classmethod
    def from_cart_item(cls, order, cart_item):
        unit_price = cart_item.product.price
        quantity = cart_item.quantity
        return cls(
            order=order,
            product=cart_item.product,
            product_sku=cart_item.product.sku or "",
            product_name=cart_item.product.name,
            unit_price=unit_price,
            quantity=quantity,
            line_total=unit_price * Decimal(quantity),
            product_snapshot=cls.snapshot_from_product(cart_item.product),
        )

    @staticmethod
    def snapshot_from_product(product):
        return {
            "sku": product.sku,
            "name": product.name,
            "main_image": product.main_image.url if product.main_image else "",
            "material": product.material,
            "color": product.color,
            "style": product.style,
            "structured_dimensions": {
                key: str(value) if value is not None else None
                for key, value in product.structured_dimensions.items()
            },
            "specifications": product.specifications,
        }

    def __str__(self):
        return f"{self.quantity} x {self.product_name}"


class OrderStatusEvent(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name="status_history")
    from_status = models.CharField(max_length=20, blank=True)
    to_status = models.CharField(max_length=20, choices=Order.Status.choices)
    note = models.CharField(max_length=300, blank=True)
    actor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="order_status_events",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ("created_at", "id")

    def __str__(self):
        return f"{self.order.order_code}: {self.from_status or 'created'} → {self.to_status}"
