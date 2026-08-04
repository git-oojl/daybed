from decimal import Decimal

from django.db.models import Avg, Count, F, Q, Sum
from django.db.models.functions import TruncMonth
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
        low_stock_products = Product.objects.filter(
            active=True,
            stock__lte=F("minimum_stock"),
        ).order_by("stock", "name")[:5]
        low_stock_count = Product.objects.filter(
            active=True,
            stock__lte=F("minimum_stock"),
        ).count()
        recent_orders = Order.objects.select_related("user").order_by(
            "-created_at",
            "-id",
        )[:5]
        sales_by_month = (
            Order.objects.exclude(status=Order.Status.CANCELLED)
            .annotate(month=TruncMonth("created_at"))
            .values("month")
            .annotate(total=Sum("total", default=Decimal("0.00")))
            .order_by("month")
        )
        total_sales = order_aggregates["total_simulated_sales"]

        payload = {
            "total_orders": order_aggregates["total_orders"],
            "total_products": Product.objects.filter(active=True).count(),
            "total_simulated_sales": total_sales,
            "total_sales": total_sales,
            "orders_by_status": [
                {"status": status, "count": status_counts.get(status, 0)}
                for status, _label in Order.Status.choices
            ],
            "low_stock_count": low_stock_count,
            "low_stock": [
                {
                    "id": product.id,
                    "name": product.name,
                    "sku": product.sku,
                    "stock": product.stock,
                    "minimum_stock": product.minimum_stock,
                }
                for product in low_stock_products
            ],
            "sales_by_month": [
                {
                    "month": row["month"].strftime("%Y-%m"),
                    "total": row["total"],
                }
                for row in sales_by_month
                if row["month"] is not None
            ],
            "recent_orders": [
                {
                    "id": order.id,
                    "customer_name": self._customer_name(order),
                    "customer_email": order.user.email,
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

    def _customer_name(self, order):
        full_name = f"{order.user.first_name} {order.user.last_name}".strip()
        return full_name or order.user.username or order.user.email
