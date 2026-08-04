import re
import uuid
from decimal import Decimal

from django.core.exceptions import ValidationError as DjangoValidationError
from django.db import transaction
from django.utils import timezone
from rest_framework import serializers

from apps.cart.models import Cart
from apps.delivery.services import calculate_delivery_fee
from apps.orders.models import Order, OrderItem


class OrderItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItem
        fields = (
            "id",
            "product",
            "product_sku",
            "product_name",
            "unit_price",
            "quantity",
            "line_total",
            "product_snapshot",
        )
        read_only_fields = fields


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    user_id = serializers.IntegerField(source="user.id", read_only=True)
    customer_name = serializers.SerializerMethodField()
    customer_email = serializers.EmailField(source="user.email", read_only=True)
    customer_phone = serializers.CharField(source="user.phone", read_only=True)

    class Meta:
        model = Order
        fields = (
            "id",
            "user_id",
            "customer_name",
            "customer_email",
            "customer_phone",
            "status",
            "items",
            "original_address",
            "formatted_address",
            "latitude",
            "longitude",
            "distance_km",
            "estimated_duration_minutes",
            "delivery_fee",
            "delivery_zone",
            "geocoding_provider",
            "distance_provider",
            "products_subtotal",
            "total",
            "payment_method",
            "payment_status",
            "payment_reference",
            "payment_processed_at",
            "payment_snapshot",
            "stock_decremented_at",
            "created_at",
            "updated_at",
        )
        read_only_fields = fields

    def get_customer_name(self, obj):
        full_name = f"{obj.user.first_name} {obj.user.last_name}".strip()
        return full_name or obj.user.username or obj.user.email


class CheckoutSerializer(serializers.Serializer):
    original_address = serializers.CharField(max_length=500)
    formatted_address = serializers.CharField(max_length=500)
    latitude = serializers.DecimalField(
        max_digits=12,
        decimal_places=8,
        min_value=Decimal("-90.00000000"),
        max_value=Decimal("90.00000000"),
    )
    longitude = serializers.DecimalField(
        max_digits=12,
        decimal_places=8,
        min_value=Decimal("-180.00000000"),
        max_value=Decimal("180.00000000"),
    )
    distance_km = serializers.DecimalField(
        max_digits=10,
        decimal_places=3,
        min_value=Decimal("0.000"),
    )
    estimated_duration_minutes = serializers.DecimalField(
        max_digits=10,
        decimal_places=1,
        min_value=Decimal("0.0"),
    )
    delivery_fee = serializers.DecimalField(
        max_digits=10,
        decimal_places=2,
        min_value=Decimal("0.00"),
        required=False,
    )
    delivery_zone = serializers.CharField(max_length=80, default="standard")
    geocoding_provider = serializers.CharField(
        max_length=80,
        required=False,
        allow_blank=True,
    )
    distance_provider = serializers.CharField(
        max_length=80,
        required=False,
        allow_blank=True,
    )
    payment_method = serializers.ChoiceField(
        choices=Order.PaymentMethod.choices,
        default=Order.PaymentMethod.CASH,
        required=False,
    )
    card_number = serializers.CharField(
        max_length=32,
        required=False,
        allow_blank=True,
        write_only=True,
    )
    card_expiry = serializers.CharField(
        max_length=7,
        required=False,
        allow_blank=True,
        write_only=True,
    )
    card_cvv = serializers.CharField(
        max_length=4,
        required=False,
        allow_blank=True,
        write_only=True,
    )

    def validate(self, attrs):
        user = self.context["request"].user
        cart = Cart.objects.filter(user=user).first()
        if not cart:
            raise serializers.ValidationError("Cart is empty.")

        items = list(cart.items.select_related("product", "product__category"))
        if not items:
            raise serializers.ValidationError("Cart is empty.")

        inactive_items = [
            item.product.name
            for item in items
            if not item.product.active or not item.product.category.active
        ]
        if inactive_items:
            raise serializers.ValidationError(
                {
                    "cart": (
                        "Cart contains inactive products: "
                        + ", ".join(sorted(inactive_items))
                    )
                }
            )
        attrs["cart"] = cart
        attrs["cart_items"] = items
        attrs["payment_fields"] = self._build_payment_fields(attrs)
        return attrs

    def _build_payment_fields(self, attrs):
        method = attrs.get("payment_method") or Order.PaymentMethod.CASH
        reference = self._build_payment_reference(method)
        processed_at = timezone.now()

        if method == Order.PaymentMethod.CARD:
            last4, brand = self._validate_simulated_card(attrs)
            return {
                "payment_method": method,
                "payment_status": Order.PaymentStatus.AUTHORIZED,
                "payment_reference": reference,
                "payment_processed_at": processed_at,
                "payment_snapshot": {
                    "provider": "simulated",
                    "brand": brand,
                    "last4": last4,
                    "masked": f"**** **** **** {last4}",
                    "message": "Pago simulado autorizado.",
                },
            }

        if method == Order.PaymentMethod.TRANSFER:
            return {
                "payment_method": method,
                "payment_status": Order.PaymentStatus.AWAITING_TRANSFER,
                "payment_reference": reference,
                "payment_processed_at": processed_at,
                "payment_snapshot": {
                    "provider": "simulated",
                    "message": "Transferencia simulada pendiente de confirmación.",
                },
            }

        return {
            "payment_method": Order.PaymentMethod.CASH,
            "payment_status": Order.PaymentStatus.PAY_ON_DELIVERY,
            "payment_reference": reference,
            "payment_processed_at": processed_at,
            "payment_snapshot": {
                "provider": "simulated",
                "message": "Pago en efectivo registrado para cobro contra entrega.",
            },
        }

    def _validate_simulated_card(self, attrs):
        card_digits = re.sub(r"\D", "", attrs.get("card_number") or "")
        expiry = (attrs.get("card_expiry") or "").strip()
        cvv = (attrs.get("card_cvv") or "").strip()

        if not 13 <= len(card_digits) <= 19:
            raise serializers.ValidationError(
                {
                    "card_number": (
                        "Ingresa un número de tarjeta válido para la simulación."
                    )
                }
            )

        if card_digits[-4:] == "0000":
            raise serializers.ValidationError(
                {"payment": "La tarjeta simulada fue rechazada."}
            )

        match = re.fullmatch(r"(0[1-9]|1[0-2])\s*/\s*(\d{2}|\d{4})", expiry)
        if not match:
            raise serializers.ValidationError(
                {"card_expiry": "Usa el formato MM/AA o MM/AAAA."}
            )

        month = int(match.group(1))
        year = int(match.group(2))
        if year < 100:
            year += 2000
        now = timezone.now()
        if (year, month) < (now.year, now.month):
            raise serializers.ValidationError(
                {"card_expiry": "La tarjeta simulada está vencida."}
            )

        if not re.fullmatch(r"\d{3,4}", cvv):
            raise serializers.ValidationError(
                {"card_cvv": "Ingresa un CVV de 3 o 4 dígitos."}
            )

        return card_digits[-4:], self._card_brand(card_digits)

    @staticmethod
    def _card_brand(card_digits):
        if card_digits.startswith("4"):
            return "Visa"
        if card_digits[:2] in {"34", "37"}:
            return "American Express"
        if card_digits.startswith(("2", "5")):
            return "Mastercard"
        return "Tarjeta demo"

    @staticmethod
    def _build_payment_reference(method):
        method_value = getattr(method, "value", method)
        return f"SIM-{method_value.upper()}-{uuid.uuid4().hex[:10].upper()}"

    @transaction.atomic
    def create(self, validated_data):
        cart = validated_data.pop("cart")
        items = validated_data.pop("cart_items")
        payment_fields = validated_data.pop("payment_fields")
        validated_data.pop("payment_method", None)
        validated_data.pop("card_number", None)
        validated_data.pop("card_expiry", None)
        validated_data.pop("card_cvv", None)
        products_subtotal = sum(
            (item.line_total for item in items),
            Decimal("0.00"),
        )
        validated_data["delivery_fee"] = calculate_delivery_fee(
            validated_data["distance_km"],
            order_subtotal=products_subtotal,
        )
        total = products_subtotal + validated_data["delivery_fee"]

        order = Order.objects.create(
            user=self.context["request"].user,
            products_subtotal=products_subtotal,
            total=total,
            **payment_fields,
            **validated_data,
        )
        OrderItem.objects.bulk_create(
            [OrderItem.from_cart_item(order, item) for item in items]
        )
        cart.items.all().delete()
        return order


class OrderStatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = Order
        fields = ("status", "payment_status")

    def validate(self, attrs):
        if "payment_status" in attrs:
            self._validate_payment_status(attrs["payment_status"])
        return attrs

    def _validate_payment_status(self, payment_status):
        if payment_status == self.instance.payment_status:
            return

        payable_statuses = {
            Order.PaymentStatus.AWAITING_TRANSFER,
            Order.PaymentStatus.PAY_ON_DELIVERY,
        }
        allowed_targets = {
            Order.PaymentStatus.AUTHORIZED,
            Order.PaymentStatus.FAILED,
        }
        if (
            self.instance.payment_status not in payable_statuses
            or payment_status not in allowed_targets
        ):
            raise serializers.ValidationError(
                {"payment_status": "No se permite esa transición de pago."}
            )

    def update(self, instance, validated_data):
        request = self.context.get("request")
        actor = request.user if request and request.user.is_authenticated else None

        if "status" in validated_data:
            status = validated_data["status"]
            try:
                instance.transition_to(status, actor=actor)
            except DjangoValidationError as exc:
                raise serializers.ValidationError({"status": exc.messages}) from exc

        if "payment_status" in validated_data:
            instance.payment_status = validated_data["payment_status"]
            if instance.payment_status == Order.PaymentStatus.AUTHORIZED:
                instance.payment_snapshot = {
                    **(instance.payment_snapshot or {}),
                    "message": "Pago simulado recibido.",
                }
            elif instance.payment_status == Order.PaymentStatus.FAILED:
                instance.payment_snapshot = {
                    **(instance.payment_snapshot or {}),
                    "message": "Pago simulado marcado como fallido.",
                }
            instance.save(
                update_fields=("payment_status", "payment_snapshot", "updated_at")
            )
        return instance
