from rest_framework import serializers


class OrdersByStatusSerializer(serializers.Serializer):
    status = serializers.CharField()
    count = serializers.IntegerField()


class RecentOrderSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    status = serializers.CharField()
    total = serializers.DecimalField(max_digits=10, decimal_places=2)
    created_at = serializers.DateTimeField()


class DashboardMetricsSerializer(serializers.Serializer):
    total_orders = serializers.IntegerField()
    total_simulated_sales = serializers.DecimalField(max_digits=12, decimal_places=2)
    orders_by_status = OrdersByStatusSerializer(many=True)
    low_stock_count = serializers.IntegerField()
    recent_orders = RecentOrderSerializer(many=True)
    average_delivery_fee = serializers.DecimalField(max_digits=10, decimal_places=2)
    average_delivery_distance = serializers.DecimalField(
        max_digits=10, decimal_places=3
    )
