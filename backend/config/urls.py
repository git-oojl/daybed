"""
URL configuration for config project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""

from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView
from rest_framework_simplejwt.views import TokenRefreshView

from apps.accounts.views import LoginTokenView, LogoutView
from config.views import health_check

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/health/", health_check, name="api-health"),
    path("api/accounts/", include("apps.accounts.urls")),
    path("api/cart/", include("apps.cart.urls")),
    path("api/catalog/", include("apps.catalog.urls")),
    path("api/dashboard/", include("apps.dashboard.urls")),
    path("api/delivery/", include("apps.delivery.urls")),
    path("api/inventory/", include("apps.inventory.urls")),
    path("api/", include("apps.orders.urls")),
    path("api/auth/token/", LoginTokenView.as_view(), name="token_obtain_pair"),
    path(
        "api/auth/token/refresh/",
        TokenRefreshView.as_view(),
        name="token_refresh",
    ),
    path("api/auth/logout/", LogoutView.as_view(), name="token_logout"),
    path(
        "api/schema/",
        SpectacularAPIView.as_view(permission_classes=[]),
        name="schema",
    ),
    path(
        "api/docs/",
        SpectacularSwaggerView.as_view(url_name="schema", permission_classes=[]),
        name="swagger-ui",
    ),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
