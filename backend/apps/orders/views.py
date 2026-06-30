from rest_framework import mixins, status, viewsets
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.accounts.permissions import IsCustomer, IsEmployeeOrAdmin
from apps.orders.models import Order
from apps.orders.serializers import (
    CheckoutSerializer,
    OrderSerializer,
    OrderStatusSerializer,
)


class CheckoutView(APIView):
    permission_classes = (IsCustomer,)

    def post(self, request):
        serializer = CheckoutSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        order = serializer.save()
        return Response(OrderSerializer(order).data, status=status.HTTP_201_CREATED)


class CustomerOrderViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = OrderSerializer
    permission_classes = (IsCustomer,)

    def get_queryset(self):
        return (
            Order.objects.filter(user=self.request.user)
            .prefetch_related("items")
            .order_by("-created_at", "-id")
        )


class StaffOrderViewSet(
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    viewsets.GenericViewSet,
):
    queryset = Order.objects.prefetch_related("items").order_by("-created_at", "-id")
    permission_classes = (IsEmployeeOrAdmin,)
    filterset_fields = ("status", "delivery_zone")
    search_fields = ("user__username", "user__email", "original_address")
    ordering_fields = ("created_at", "total", "delivery_fee", "distance_km")

    def get_serializer_class(self):
        if self.action in {"update", "partial_update"}:
            return OrderStatusSerializer
        return OrderSerializer

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop("partial", False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        order = serializer.save()
        return Response(OrderSerializer(order).data)
