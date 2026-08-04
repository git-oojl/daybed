from decimal import Decimal

from django.core.exceptions import ValidationError as DjangoValidationError
from django.db import transaction
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
        return attrs

    @transaction.atomic
    def create(self, validated_data):
        cart = validated_data.pop("cart")
        items = validated_data.pop("cart_items")
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
        request = self.context.get("request")
        actor = request.user if request and request.user.is_authenticated else None
        try:
            instance.transition_to(status, actor=actor)
        except DjangoValidationError as exc:
            raise serializers.ValidationError({"status": exc.messages}) from exc
        return instance
