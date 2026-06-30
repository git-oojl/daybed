from django.urls import include, path
from rest_framework.routers import DefaultRouter

from apps.accounts.views import (
    CurrentUserView,
    InternalUserViewSet,
    RegisterCustomerView,
)

router = DefaultRouter()
router.register("users", InternalUserViewSet, basename="internal-user")

urlpatterns = [
    path("register/", RegisterCustomerView.as_view(), name="customer-register"),
    path("me/", CurrentUserView.as_view(), name="current-user"),
    path("", include(router.urls)),
]
