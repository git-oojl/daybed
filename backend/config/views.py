from drf_spectacular.utils import extend_schema, inline_serializer
from rest_framework import serializers
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response


@extend_schema(
    summary="Verificar estado del backend",
    description="Endpoint público para confirmar que la API está disponible.",
    responses=inline_serializer(
        name="HealthCheckResponse",
        fields={
            "status": serializers.CharField(),
        },
    ),
    tags=["Sistema"],
)
@api_view(["GET"])
@permission_classes([AllowAny])
def health_check(request):
    return Response({"status": "ok"})
