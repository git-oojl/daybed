from django.urls import path

from apps.delivery.views import DeliveryEstimateView, GeocodeView

urlpatterns = [
    path("geocode/", GeocodeView.as_view(), name="delivery-geocode"),
    path("estimate/", DeliveryEstimateView.as_view(), name="delivery-estimate"),
]
