from django.urls import include, path
from rest_framework.routers import DefaultRouter

from apps.accounts.views import (
    CurrentUserView,
    InternalUserViewSet,
    PasswordChangeView,
    PasswordResetConfirmView,
    PasswordResetRequestView,
    RegisterCustomerView,
)

router = DefaultRouter()
router.register("users", InternalUserViewSet, basename="internal-user")

urlpatterns = [
    path("register/", RegisterCustomerView.as_view(), name="customer-register"),
    path("me/", CurrentUserView.as_view(), name="current-user"),
    path(
        "password/change/",
        PasswordChangeView.as_view(),
        name="password-change",
    ),
    path(
        "password/reset/",
        PasswordResetRequestView.as_view(),
        name="password-reset-request",
    ),
    path(
        "password/reset/confirm/",
        PasswordResetConfirmView.as_view(),
        name="password-reset-confirm",
    ),
    path("", include(router.urls)),
]
