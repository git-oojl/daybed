import re
import uuid
from datetime import timedelta
from decimal import Decimal

from django.core.exceptions import ValidationError as DjangoValidationError
from django.db import transaction
from django.utils import timezone
from rest_framework import serializers

from apps.cart.models import Cart
from apps.delivery.services import (
    build_structured_address,
    calculate_delivery_fee,
    estimate_delivery,
)
from apps.inventory.models import InventoryMovement
from apps.inventory.services import record_inventory_movement
from apps.catalog.models import Product
from apps.orders.models import Order, OrderItem, OrderStatusEvent
from apps.store.models import StoreSettings


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


class CustomerOrderStatusEventSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderStatusEvent
        fields = ("id", "from_status", "to_status", "created_at")
        read_only_fields = fields


class OrderStatusEventSerializer(serializers.ModelSerializer):
    actor_name = serializers.SerializerMethodField()

    class Meta:
        model = OrderStatusEvent
        fields = ("id", "from_status", "to_status", "note", "actor_name", "created_at")
        read_only_fields = fields

    def get_actor_name(self, obj):
        if not obj.actor:
            return "Daybed"
        return obj.actor.get_full_name().strip() or obj.actor.email


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    user_id = serializers.IntegerField(source="user.id", read_only=True)
    customer_name = serializers.SerializerMethodField()
    customer_email = serializers.EmailField(source="user.email", read_only=True)
    customer_phone = serializers.CharField(source="user.phone", read_only=True)
    order_code = serializers.CharField(read_only=True)
    status_history = CustomerOrderStatusEventSerializer(many=True, read_only=True)
    cancellation_deadline = serializers.SerializerMethodField()
    customer_cancellation_available = serializers.SerializerMethodField()
    preparation_estimate_days = serializers.SerializerMethodField()
    payment_summary = serializers.SerializerMethodField()

    class Meta:
        model = Order
        fields = (
            "id",
            "order_code",
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
            "products_subtotal",
            "total",
            "payment_method",
            "payment_status",
            "payment_reference",
            "payment_processed_at",
            "payment_summary",
            "discount_total",
            "delivery_notes",
            "status_history",
            "cancellation_deadline",
            "customer_cancellation_available",
            "preparation_estimate_days",
            "created_at",
            "updated_at",
        )
        read_only_fields = fields

    def _store_settings(self):
        if not hasattr(self, "_cached_store_settings"):
            self._cached_store_settings = StoreSettings.get_active()
        return self._cached_store_settings

    def get_cancellation_deadline(self, obj):
        hours = self._store_settings().cancellation_window_hours
        if not hours:
            return None
        return obj.created_at + timedelta(hours=hours)

    def get_customer_cancellation_available(self, obj):
        deadline = self.get_cancellation_deadline(obj)
        return bool(
            deadline
            and timezone.now() <= deadline
            and obj.status in {Order.Status.PENDING, Order.Status.CONFIRMED}
        )

    def get_preparation_estimate_days(self, obj):
        return self._store_settings().default_preparation_days

    def get_customer_name(self, obj):
        full_name = f"{obj.user.first_name} {obj.user.last_name}".strip()
        return full_name or obj.user.username or obj.user.email

    def get_payment_summary(self, obj):
        snapshot = obj.payment_snapshot or {}
        return {
            key: snapshot[key]
            for key in ("brand", "last4", "masked", "message")
            if snapshot.get(key) not in (None, "")
        }


class StaffOrderSerializer(OrderSerializer):
    available_status_transitions = serializers.SerializerMethodField()
    status_history = OrderStatusEventSerializer(many=True, read_only=True)

    class Meta(OrderSerializer.Meta):
        fields = OrderSerializer.Meta.fields + (
            "available_status_transitions",
            "geocoding_provider",
            "distance_provider",
            "payment_snapshot",
            "internal_notes",
            "stock_decremented_at",
            "stock_released_at",
        )
        read_only_fields = fields

    def get_available_status_transitions(self, obj):
        return obj.available_status_transitions()


class DeliveryAddressInputSerializer(serializers.Serializer):
    street = serializers.CharField(max_length=180)
    exterior_number = serializers.CharField(
        max_length=40,
        required=False,
        allow_blank=True,
    )
    interior_number = serializers.CharField(
        max_length=40,
        required=False,
        allow_blank=True,
    )
    neighborhood = serializers.CharField(
        max_length=120,
        required=False,
        allow_blank=True,
    )
    city = serializers.CharField(max_length=120)
    state = serializers.CharField(max_length=120)
    postal_code = serializers.CharField(max_length=10)
    country = serializers.CharField(
        max_length=80,
        required=False,
        allow_blank=True,
        default="México",
    )
    reference = serializers.CharField(
        max_length=180,
        required=False,
        allow_blank=True,
    )

    def validate_postal_code(self, value):
        digits = re.sub(r"\D", "", value or "")
        if len(digits) != 5:
            raise serializers.ValidationError(
                "El código postal debe contener cinco dígitos."
            )
        return digits


class CheckoutSerializer(serializers.Serializer):
    delivery_address = DeliveryAddressInputSerializer(required=False)
    original_address = serializers.CharField(
        max_length=500,
        required=False,
        allow_blank=True,
    )
    formatted_address = serializers.CharField(
        max_length=500,
        required=False,
        allow_blank=True,
    )
    latitude = serializers.DecimalField(
        max_digits=12,
        decimal_places=8,
        min_value=Decimal("-90.00000000"),
        max_value=Decimal("90.00000000"),
        required=False,
    )
    longitude = serializers.DecimalField(
        max_digits=12,
        decimal_places=8,
        min_value=Decimal("-180.00000000"),
        max_value=Decimal("180.00000000"),
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
    delivery_notes = serializers.CharField(max_length=600, required=False, allow_blank=True)
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
            raise serializers.ValidationError({"cart": "Tu carrito está vacío."})

        items = list(cart.items.select_related("product", "product__category"))
        if not items:
            raise serializers.ValidationError({"cart": "Tu carrito está vacío."})

        store_settings = StoreSettings.get_active()
        if not store_settings.storefront_available:
            raise serializers.ValidationError({"storefront": "Las compras están pausadas temporalmente. Tu carrito se conserva."})

        unavailable_items = [
            item.product.name
            for item in items
            if not item.product.active
            or not item.product.category.active
            or item.product.stock < item.quantity
        ]
        if unavailable_items:
            raise serializers.ValidationError(
                {
                    "cart": (
                        "Algunos productos ya no tienen disponibilidad suficiente: "
                        + ", ".join(sorted(unavailable_items))
                    )
                }
            )

        products_subtotal = sum((item.line_total for item in items), Decimal("0.00"))
        original_address, formatted_address = self._resolve_address(attrs)
        latitude = attrs.get("latitude")
        longitude = attrs.get("longitude")

        if (latitude is None) ^ (longitude is None):
            raise serializers.ValidationError(
                {
                    "delivery_address": (
                        "Envía latitud y longitud juntas o no envíes coordenadas."
                    )
                }
            )

        server_estimate = None
        delivery_fee = calculate_delivery_fee(
            Decimal("0.000"),
            order_subtotal=products_subtotal,
            store_settings=store_settings,
        )
        distance_provider = ""

        if latitude is not None and longitude is not None:
            server_estimate = estimate_delivery(
                latitude,
                longitude,
                order_subtotal=products_subtotal,
                store_settings=store_settings,
            )
            if server_estimate.distance_km > store_settings.maximum_delivery_radius_km:
                raise serializers.ValidationError(
                    {
                        "delivery_address": (
                            f"La dirección está fuera del radio de entrega de {store_settings.maximum_delivery_radius_km} km."
                        )
                    }
                )
            delivery_fee = server_estimate.delivery_fee
            distance_provider = server_estimate.distance_provider

        attrs.update(
            original_address=original_address,
            formatted_address=formatted_address,
            latitude=latitude,
            longitude=longitude,
            distance_km=server_estimate.distance_km if server_estimate else None,
            estimated_duration_minutes=(
                server_estimate.estimated_duration_minutes if server_estimate else None
            ),
            delivery_fee=delivery_fee,
            distance_provider=distance_provider,
            geocoding_provider=attrs.get("geocoding_provider", ""),
        )
        attrs["cart"] = cart
        attrs["cart_signature"] = self._cart_signature(items)
        attrs["payment_fields"] = self._build_payment_fields(attrs)
        return attrs

    def _resolve_address(self, attrs):
        delivery_address = attrs.get("delivery_address")
        if delivery_address:
            street_bits = [delivery_address.get("street", "").strip()]
            if delivery_address.get("exterior_number"):
                street_bits.append(delivery_address["exterior_number"].strip())
            if delivery_address.get("interior_number"):
                street_bits.append(f"Int. {delivery_address['interior_number'].strip()}")
            street = " ".join(bit for bit in street_bits if bit).strip()
            original = build_structured_address(
                street=street,
                neighborhood=delivery_address.get("neighborhood", ""),
                city=delivery_address.get("city", ""),
                state=delivery_address.get("state", ""),
                postal_code=delivery_address.get("postal_code", ""),
            )
            parts = [original]
            if delivery_address.get("reference"):
                parts.append(f"Referencia: {delivery_address['reference'].strip()}")
            return original, ". ".join(part for part in parts if part).strip()

        original = (attrs.get("original_address") or "").strip()
        formatted = (attrs.get("formatted_address") or original).strip()
        if not original:
            raise serializers.ValidationError(
                {
                    "delivery_address": (
                        "La calle, ciudad, estado y código postal son obligatorios."
                    )
                }
            )
        return original, formatted or original

    @staticmethod
    def _cart_signature(items):
        return tuple(
            sorted(
                (
                    item.id,
                    item.product_id,
                    int(item.quantity),
                    str(item.product.price),
                )
                for item in items
            )
        )

    def _build_payment_fields(self, attrs):
        method = attrs.get("payment_method") or Order.PaymentMethod.CASH
        reference = self._build_payment_reference(method)
        processed_at = timezone.now()

        if method == Order.PaymentMethod.CARD:
            last4, brand = self._validate_card_details(attrs)
            return {
                "payment_method": method,
                "payment_status": Order.PaymentStatus.AUTHORIZED,
                "payment_reference": reference,
                "payment_processed_at": processed_at,
                "payment_snapshot": {
                    "provider": "daybed_checkout",
                    "brand": brand,
                    "last4": last4,
                    "masked": f"**** **** **** {last4}",
                    "message": "Autorización de pago registrada.",
                },
            }

        if method == Order.PaymentMethod.TRANSFER:
            return {
                "payment_method": method,
                "payment_status": Order.PaymentStatus.AWAITING_TRANSFER,
                "payment_reference": reference,
                "payment_processed_at": processed_at,
                "payment_snapshot": {
                    "provider": "daybed_checkout",
                    "message": "Transferencia pendiente de confirmación.",
                },
            }

        return {
            "payment_method": Order.PaymentMethod.CASH,
            "payment_status": Order.PaymentStatus.PAY_ON_DELIVERY,
            "payment_reference": reference,
            "payment_processed_at": processed_at,
            "payment_snapshot": {
                "provider": "daybed_checkout",
                "message": "Pago en efectivo registrado para cobro contra entrega.",
            },
        }

    def _validate_card_details(self, attrs):
        card_digits = re.sub(r"\D", "", attrs.get("card_number") or "")
        expiry = (attrs.get("card_expiry") or "").strip()
        cvv = (attrs.get("card_cvv") or "").strip()

        if not 13 <= len(card_digits) <= 19:
            raise serializers.ValidationError(
                {
                    "card_number": (
                        "Ingresa un número de tarjeta válido."
                    )
                }
            )

        if card_digits[-4:] == "0000":
            raise serializers.ValidationError(
                {"payment": "No fue posible autorizar la tarjeta."}
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
                {"card_expiry": "La tarjeta está vencida."}
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
        return "Tarjeta"

    @staticmethod
    def _build_payment_reference(method):
        method_value = getattr(method, "value", method)
        return f"DAY-{method_value.upper()}-{uuid.uuid4().hex[:10].upper()}"

    @transaction.atomic
    def create(self, validated_data):
        cart = validated_data.pop("cart")
        expected_cart_signature = validated_data.pop("cart_signature")
        payment_fields = validated_data.pop("payment_fields")
        validated_data.pop("payment_method", None)
        validated_data.pop("card_number", None)
        validated_data.pop("card_expiry", None)
        validated_data.pop("card_cvv", None)
        validated_data.pop("delivery_address", None)

        locked_cart = Cart.objects.select_for_update().get(
            pk=cart.pk,
            user=self.context["request"].user,
        )
        items = list(
            locked_cart.items.select_for_update()
            .select_related("product", "product__category")
            .order_by("id")
        )
        if not items:
            raise serializers.ValidationError({"cart": "Tu carrito está vacío."})

        product_ids = [item.product_id for item in items]
        locked_products = {
            product.id: product
            for product in Product.objects.select_for_update()
            .select_related("category")
            .filter(id__in=product_ids)
        }
        for item in items:
            if item.product_id in locked_products:
                item.product = locked_products[item.product_id]

        if self._cart_signature(items) != expected_cart_signature:
            raise serializers.ValidationError(
                {
                    "cart": (
                        "El carrito cambió mientras confirmabas la compra. "
                        "Revisa cantidades y precios antes de continuar."
                    )
                }
            )

        unavailable = []
        for item in items:
            product = locked_products.get(item.product_id)
            if (
                product is None
                or not product.active
                or not product.category.active
                or product.stock < item.quantity
            ):
                unavailable.append(item.product.name)
        if unavailable:
            raise serializers.ValidationError(
                {"cart": "Ya no hay existencias suficientes para: " + ", ".join(sorted(unavailable))}
            )

        products_subtotal = sum((item.line_total for item in items), Decimal("0.00"))
        discount_total = Decimal("0.00")
        total = products_subtotal + validated_data["delivery_fee"] - discount_total

        order = Order.objects.create(
            user=self.context["request"].user,
            products_subtotal=products_subtotal,
            discount_total=discount_total,
            total=total,
            **payment_fields,
            **validated_data,
        )
        OrderItem.objects.bulk_create(
            [OrderItem.from_cart_item(order, item) for item in items]
        )

        for item in items:
            product = locked_products[item.product_id]
            previous_stock = product.stock
            product.stock -= item.quantity
            product.save(update_fields=("stock", "updated_at"))
            record_inventory_movement(
                product=product,
                movement_type=InventoryMovement.Types.ORDER_RESERVED,
                previous_stock=previous_stock,
                new_stock=product.stock,
                reason=f"Stock reserved for {order.order_code}",
                order=order,
                created_by=self.context["request"].user,
            )

        order.stock_decremented_at = timezone.now()
        order.save(update_fields=("stock_decremented_at", "updated_at"))
        OrderStatusEvent.objects.create(
            order=order,
            from_status="",
            to_status=order.status,
            note="Pedido recibido por Daybed.",
            actor=self.context["request"].user,
        )
        cart.items.all().delete()
        return order


class OrderStatusSerializer(serializers.ModelSerializer):
    status_note = serializers.CharField(max_length=300, required=False, allow_blank=True, write_only=True)

    class Meta:
        model = Order
        fields = ("status", "payment_status", "internal_notes", "status_note")

    def validate(self, attrs):
        if "status" in attrs:
            target = attrs["status"]
            if target == self.instance.status:
                raise serializers.ValidationError({"status": "El pedido ya se encuentra en ese estado."})
            if not self.instance.can_transition_to(target):
                raise serializers.ValidationError(
                    {"status": "Esa transición no es válida para el estado actual del pedido."}
                )
        if "payment_status" in attrs:
            self._validate_payment_status(attrs["payment_status"])
        return attrs

    def _validate_payment_status(self, payment_status):
        if payment_status == self.instance.payment_status:
            raise serializers.ValidationError(
                {"payment_status": "El pago ya se encuentra en ese estado."}
            )

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
        status_note = validated_data.pop("status_note", "")

        if "internal_notes" in validated_data:
            instance.internal_notes = validated_data["internal_notes"]
            instance.save(update_fields=("internal_notes", "updated_at"))

        if "status" in validated_data:
            try:
                instance.transition_to(validated_data["status"], actor=actor, note=status_note)
            except DjangoValidationError as exc:
                raise serializers.ValidationError({"status": exc.messages}) from exc

        if "payment_status" in validated_data:
            instance.payment_status = validated_data["payment_status"]
            if instance.payment_status == Order.PaymentStatus.AUTHORIZED:
                instance.payment_snapshot = {
                    **(instance.payment_snapshot or {}),
                    "message": "Pago recibido.",
                }
            elif instance.payment_status == Order.PaymentStatus.FAILED:
                instance.payment_snapshot = {
                    **(instance.payment_snapshot or {}),
                    "message": "Pago marcado como no aprobado.",
                }
            instance.save(update_fields=("payment_status", "payment_snapshot", "updated_at"))
        return instance
