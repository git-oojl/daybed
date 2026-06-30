from decimal import Decimal

from django.core.exceptions import ValidationError as DjangoValidationError
from django.db import transaction
from rest_framework import serializers

from apps.cart.models import Cart
from apps.orders.models import Order, OrderItem


class OrderItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItem
        fields = (
            "id",
            "product",
            "product_name",
            "unit_price",
            "quantity",
            "line_total",
        )
        read_only_fields = fields


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)

    class Meta:
        model = Order
        fields = (
            "id",
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
            "stock_decremented_at",
            "created_at",
            "updated_at",
        )
        read_only_fields = fields


class CheckoutSerializer(serializers.Serializer):
    original_address = serializers.CharField(max_length=500)
    formatted_address = serializers.CharField(max_length=500)
    latitude = serializers.DecimalField(max_digits=12, decimal_places=8)
    longitude = serializers.DecimalField(max_digits=12, decimal_places=8)
    distance_km = serializers.DecimalField(max_digits=10, decimal_places=3)
    estimated_duration_minutes = serializers.DecimalField(
        max_digits=10, decimal_places=1
    )
    delivery_fee = serializers.DecimalField(max_digits=10, decimal_places=2)
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

    def validate(self, attrs):
        user = self.context["request"].user
        cart = Cart.objects.filter(user=user).prefetch_related("items__product").first()
        if not cart or not cart.items.exists():
            raise serializers.ValidationError("Cart is empty.")
        attrs["cart"] = cart
        return attrs

    @transaction.atomic
    def create(self, validated_data):
        cart = validated_data.pop("cart")
        items = list(cart.items.select_related("product"))
        products_subtotal = sum(
            (item.line_total for item in items),
            Decimal("0.00"),
        )
        total = products_subtotal + validated_data["delivery_fee"]

        order = Order.objects.create(
            user=self.context["request"].user,
            products_subtotal=products_subtotal,
            total=total,
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
        fields = ("status",)

    def update(self, instance, validated_data):
        status = validated_data["status"]
        try:
            instance.transition_to(status)
        except DjangoValidationError as exc:
            raise serializers.ValidationError({"status": exc.messages}) from exc
        return instance
