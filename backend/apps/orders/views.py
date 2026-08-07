import re

from django.db.models import Prefetch
from django.shortcuts import get_object_or_404
from drf_spectacular.utils import OpenApiParameter, extend_schema, extend_schema_view
from rest_framework import mixins, status, viewsets
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.access_control.permissions import operational_permission
from rest_framework.permissions import IsAuthenticated
from apps.orders.models import Order, OrderItem, OrderStatusEvent
from apps.delivery.services import DeliveryServiceError

from apps.orders.serializers import (
    CheckoutSerializer,
    OrderSerializer,
    OrderStatusSerializer,
    StaffOrderSerializer,
)

ORDER_ID_PARAMETER = OpenApiParameter(
    name="id",
    type=str,
    location=OpenApiParameter.PATH,
    description="ID numérico o código Daybed, por ejemplo DAY-00801.",
)


def order_queryset():
    return Order.objects.select_related("user").prefetch_related(
        Prefetch(
            "items",
            queryset=OrderItem.objects.select_related("product").order_by("id"),
        ),
        Prefetch(
            "status_history",
            queryset=OrderStatusEvent.objects.select_related("actor").order_by("created_at", "id"),
        ),
    )


class OrderLookupMixin:
    """Resolve both database IDs and public DAY-00000 order codes."""

    @staticmethod
    def _order_pk(value):
        match = re.fullmatch(r"(?:DAY-)?0*(\d+)", str(value or "").strip(), re.IGNORECASE)
        return int(match.group(1)) if match else None

    def get_object(self):
        lookup_url_kwarg = self.lookup_url_kwarg or self.lookup_field
        raw_lookup = self.kwargs.get(lookup_url_kwarg)
        order_pk = self._order_pk(raw_lookup)
        if order_pk is None:
            # Return the same safe 404 used by normal DRF lookup behavior.
            return get_object_or_404(self.filter_queryset(self.get_queryset()), pk=-1)
        obj = get_object_or_404(self.filter_queryset(self.get_queryset()), pk=order_pk)
        self.check_object_permissions(self.request, obj)
        return obj


@extend_schema(
    summary="Confirmar pedido",
    description=(
        "Crea un pedido a partir del carrito del cliente. Durante el proceso se "
        "validan los datos de entrega, se calcula el total y se registra el pedido."
    ),
    request=CheckoutSerializer,
    responses={201: OrderSerializer},
    tags=["Pedidos"],
)
class CheckoutView(APIView):
    permission_classes = (IsAuthenticated,)

    def post(self, request):
        serializer = CheckoutSerializer(data=request.data, context={"request": request})
        try:
            serializer.is_valid(raise_exception=True)
            order = serializer.save()
        except DeliveryServiceError as exc:
            return Response(
                {
                    "detail": str(exc),
                    "user_message": exc.user_message,
                    "code": exc.code,
                    "feature": exc.feature,
                },
                status=exc.status_code,
            )
        order = order_queryset().get(pk=order.pk)
        return Response(OrderSerializer(order).data, status=status.HTTP_201_CREATED)


@extend_schema_view(
    list=extend_schema(
        summary="Listar pedidos del cliente",
        description="Devuelve el historial de pedidos del cliente autenticado.",
        tags=["Pedidos"],
    ),
    retrieve=extend_schema(
        summary="Consultar pedido del cliente",
        description="Devuelve el detalle de un pedido del cliente autenticado.",
        parameters=[ORDER_ID_PARAMETER],
        tags=["Pedidos"],
    ),
)
class CustomerOrderViewSet(OrderLookupMixin, viewsets.ReadOnlyModelViewSet):
    serializer_class = OrderSerializer
    permission_classes = (IsAuthenticated,)

    def get_queryset(self):
        if getattr(self, "swagger_fake_view", False):
            return Order.objects.none()
        return (
            order_queryset()
            .filter(user=self.request.user)
            .order_by("-created_at", "-id")
        )


@extend_schema_view(
    list=extend_schema(
        summary="Listar pedidos administrativos",
        description="Permite al personal consultar y filtrar pedidos.",
        tags=["Pedidos administrativos"],
    ),
    retrieve=extend_schema(
        summary="Consultar pedido administrativo",
        description="Permite al personal consultar el detalle de un pedido.",
        parameters=[ORDER_ID_PARAMETER],
        tags=["Pedidos administrativos"],
    ),
    update=extend_schema(
        summary="Actualizar estado del pedido",
        description="Permite al personal actualizar el estado de un pedido.",
        request=OrderStatusSerializer,
        responses=StaffOrderSerializer,
        parameters=[ORDER_ID_PARAMETER],
        tags=["Pedidos administrativos"],
    ),
    partial_update=extend_schema(
        summary="Actualizar estado del pedido parcialmente",
        description="Permite al personal modificar el estado de un pedido.",
        request=OrderStatusSerializer,
        responses=StaffOrderSerializer,
        parameters=[ORDER_ID_PARAMETER],
        tags=["Pedidos administrativos"],
    ),
)
class StaffOrderViewSet(
    OrderLookupMixin,
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    viewsets.GenericViewSet,
):
    queryset = order_queryset().order_by("-created_at", "-id")
    filterset_fields = ("status", "delivery_zone")
    search_fields = ("user__username", "user__email", "original_address")
    ordering_fields = ("created_at", "total", "delivery_fee", "distance_km")

    def get_serializer_class(self):
        if self.action in {"update", "partial_update"}:
            return OrderStatusSerializer
        return StaffOrderSerializer

    def get_permissions(self):
        if self.action in {"update", "partial_update"}:
            return [operational_permission("orders.status.update")()]
        return [operational_permission("orders.view")()]

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop("partial", False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        order = serializer.save()
        order = order_queryset().get(pk=order.pk)
        return Response(StaffOrderSerializer(order).data)
