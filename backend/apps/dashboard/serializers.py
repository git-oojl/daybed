from rest_framework import serializers


class OrdersByStatusSerializer(serializers.Serializer):
    status = serializers.CharField()
    count = serializers.IntegerField()


class RecentOrderSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    customer_name = serializers.CharField()
    customer_email = serializers.EmailField()
    status = serializers.CharField()
    total = serializers.DecimalField(max_digits=10, decimal_places=2)
    created_at = serializers.DateTimeField()


class LowStockProductSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    name = serializers.CharField()
    sku = serializers.CharField(allow_blank=True, allow_null=True)
    stock = serializers.IntegerField()
    minimum_stock = serializers.IntegerField()


class SalesByMonthSerializer(serializers.Serializer):
    month = serializers.CharField()
    total = serializers.DecimalField(max_digits=12, decimal_places=2)


class DashboardMetricsSerializer(serializers.Serializer):
    range_days = serializers.IntegerField()
    range_start = serializers.DateTimeField()
    total_orders = serializers.IntegerField()
    total_products = serializers.IntegerField()
    total_simulated_sales = serializers.DecimalField(max_digits=12, decimal_places=2)
    total_sales = serializers.DecimalField(max_digits=12, decimal_places=2)
    orders_by_status = OrdersByStatusSerializer(many=True)
    low_stock_count = serializers.IntegerField()
    low_stock = LowStockProductSerializer(many=True)
    sales_by_month = SalesByMonthSerializer(many=True)
    recent_orders = RecentOrderSerializer(many=True)
    average_delivery_fee = serializers.DecimalField(max_digits=10, decimal_places=2)
    average_delivery_distance = serializers.DecimalField(
        max_digits=10, decimal_places=3
    )
