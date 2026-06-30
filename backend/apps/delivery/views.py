from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.accounts.permissions import IsCustomer
from apps.delivery.serializers import (
    DeliveryEstimateRequestSerializer,
    DeliveryEstimateResponseSerializer,
    GeocodeRequestSerializer,
    GeocodeResponseSerializer,
)
from apps.delivery.services import (
    DeliveryServiceError,
    estimate_delivery,
    geocode_address,
)


def _error_response(exc):
    return Response(
        {"detail": str(exc)},
        status=getattr(exc, "status_code", status.HTTP_502_BAD_GATEWAY),
    )


class GeocodeView(APIView):
    permission_classes = (IsCustomer,)

    def post(self, request):
        serializer = GeocodeRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            result = geocode_address(serializer.validated_data["address"])
        except DeliveryServiceError as exc:
            return _error_response(exc)

        response_serializer = GeocodeResponseSerializer(result)
        return Response(response_serializer.data)


class DeliveryEstimateView(APIView):
    permission_classes = (IsCustomer,)

    def post(self, request):
        serializer = DeliveryEstimateRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        geocode_result = None
        try:
            if serializer.validated_data.get("address"):
                geocode_result = geocode_address(serializer.validated_data["address"])
                latitude = geocode_result.latitude
                longitude = geocode_result.longitude
            else:
                latitude = serializer.validated_data["latitude"]
                longitude = serializer.validated_data["longitude"]

            estimate = estimate_delivery(latitude, longitude)
        except DeliveryServiceError as exc:
            return _error_response(exc)

        payload = {
            **estimate.__dict__,
            "delivery_zone": "standard",
        }
        if geocode_result:
            payload["geocoding_provider"] = geocode_result.provider

        response_serializer = DeliveryEstimateResponseSerializer(payload)
        return Response(response_serializer.data)
