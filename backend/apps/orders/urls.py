from django.urls import include, path
from rest_framework.routers import DefaultRouter

from apps.orders.views import CheckoutView, CustomerOrderViewSet, StaffOrderViewSet

router = DefaultRouter()
router.register("orders", CustomerOrderViewSet, basename="customer-order")
router.register("manage/orders", StaffOrderViewSet, basename="staff-order")

urlpatterns = [
    path("checkout/", CheckoutView.as_view(), name="checkout"),
    path("", include(router.urls)),
]
