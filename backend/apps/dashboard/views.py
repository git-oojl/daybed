from decimal import Decimal

from django.db.models import Avg, Count, F, Q, Sum
from drf_spectacular.utils import extend_schema
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.access_control.permissions import operational_permission
from apps.catalog.models import Product
from apps.dashboard.serializers import DashboardMetricsSerializer
from apps.orders.models import Order


@extend_schema(
    summary="Consultar métricas del dashboard",
    description=(
        "Devuelve métricas administrativas sobre pedidos, ventas simuladas, "
        "inventario bajo, pedidos recientes y costos de entrega."
    ),
    responses=DashboardMetricsSerializer,
    tags=["Dashboard"],
)
class DashboardMetricsView(APIView):
    permission_classes = (operational_permission("dashboard.view"),)

    def get(self, request):
        status_counts = {
            row["status"]: row["count"]
            for row in Order.objects.values("status").annotate(count=Count("id"))
        }
        order_aggregates = Order.objects.aggregate(
            total_orders=Count("id"),
            total_simulated_sales=Sum(
                "total",
                filter=~Q(status=Order.Status.CANCELLED),
                default=Decimal("0.00"),
            ),
            average_delivery_fee=Avg("delivery_fee", default=Decimal("0.00")),
            average_delivery_distance=Avg("distance_km", default=Decimal("0.000")),
        )
        low_stock_count = Product.objects.filter(
            active=True,
            stock__lte=F("minimum_stock"),
        ).count()
        recent_orders = Order.objects.order_by("-created_at", "-id")[:5]

        payload = {
            "total_orders": order_aggregates["total_orders"],
            "total_simulated_sales": order_aggregates["total_simulated_sales"],
            "orders_by_status": [
                {"status": status, "count": status_counts.get(status, 0)}
                for status, _label in Order.Status.choices
            ],
            "low_stock_count": low_stock_count,
            "recent_orders": [
                {
                    "id": order.id,
                    "status": order.status,
                    "total": order.total,
                    "created_at": order.created_at,
                }
                for order in recent_orders
            ],
            "average_delivery_fee": order_aggregates["average_delivery_fee"],
            "average_delivery_distance": order_aggregates["average_delivery_distance"],
        }
        return Response(DashboardMetricsSerializer(payload).data)
