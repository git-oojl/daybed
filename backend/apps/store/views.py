from drf_spectacular.utils import extend_schema
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.accounts.permissions import IsAdmin
from apps.store.models import StoreSettings
from apps.store.serializers import ContactRequestSerializer, StoreSettingsSerializer


@extend_schema(tags=["Configuración de Daybed"])
class StoreSettingsView(APIView):
    def get_permissions(self):
        if self.request.method == "PATCH":
            return [IsAdmin()]
        return [AllowAny()]

    @extend_schema(
        summary="Consultar configuración global de Daybed",
        responses=StoreSettingsSerializer,
    )
    def get(self, request):
        serializer = StoreSettingsSerializer(StoreSettings.get_active())
        return Response(serializer.data)

    @extend_schema(
        summary="Actualizar configuración global de Daybed",
        request=StoreSettingsSerializer,
        responses=StoreSettingsSerializer,
    )
    def patch(self, request):
        settings_object = StoreSettings.get_active()
        serializer = StoreSettingsSerializer(
            settings_object,
            data=request.data,
            partial=True,
        )
        serializer.is_valid(raise_exception=True)
        serializer.save(updated_by=request.user)
        return Response(serializer.data)



@extend_schema(tags=["Contacto"])
class ContactRequestView(APIView):
    permission_classes = (AllowAny,)

    @extend_schema(
        summary="Enviar solicitud de contacto",
        request=ContactRequestSerializer,
        responses={201: ContactRequestSerializer},
    )
    def post(self, request):
        serializer = ContactRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        contact_request = serializer.save()
        return Response(ContactRequestSerializer(contact_request).data, status=201)
