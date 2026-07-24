from django.contrib.auth import get_user_model
from drf_spectacular.utils import extend_schema
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.access_control.serializers import EmployeeRolePatchSerializer
from apps.access_control.services import (
    get_effective_permission_codes,
    get_employee_permission_codes,
    permission_catalog_payload,
    set_employee_permission_codes,
)
from apps.accounts.permissions import IsAdmin

User = get_user_model()


def _role_count(role):
    return User.objects.filter(role=role).count()


def _roles_payload():
    employee_permissions = get_employee_permission_codes()
    admin_permissions = [
        permission["code"] for permission in permission_catalog_payload()
    ]
    return {
        "permission_catalog": permission_catalog_payload(),
        "roles": [
            {
                "id": User.Roles.ADMIN,
                "name": "Administrador",
                "description": "Control interno completo. No configurable.",
                "user_count": _role_count(User.Roles.ADMIN),
                "editable": False,
                "permission_codes": admin_permissions,
                "effective_permission_codes": admin_permissions,
            },
            {
                "id": User.Roles.EMPLOYEE,
                "name": "Empleado",
                "description": "Permisos operativos configurables por administrador.",
                "user_count": _role_count(User.Roles.EMPLOYEE),
                "editable": True,
                "permission_codes": employee_permissions,
                "effective_permission_codes": employee_permissions,
            },
            {
                "id": User.Roles.CUSTOMER,
                "name": "Cliente",
                "description": "Permisos fijos de cliente con reglas de propiedad.",
                "user_count": _role_count(User.Roles.CUSTOMER),
                "editable": False,
                "permission_codes": [],
                "effective_permission_codes": [],
            },
        ],
    }


@extend_schema(tags=["Acceso"])
class RolesAccessView(APIView):
    permission_classes = (IsAdmin,)

    @extend_schema(
        summary="Consultar roles y permisos operativos",
        responses=None,
    )
    def get(self, request):
        return Response(_roles_payload())


@extend_schema(tags=["Acceso"])
class EmployeeRoleAccessView(APIView):
    permission_classes = (IsAdmin,)

    @extend_schema(
        summary="Actualizar permisos operativos del rol empleado",
        request=EmployeeRolePatchSerializer,
        responses=None,
    )
    def patch(self, request):
        serializer = EmployeeRolePatchSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        set_employee_permission_codes(serializer.validated_data["permission_codes"])
        payload = _roles_payload()
        payload["effective_permission_codes"] = get_effective_permission_codes(
            request.user
        )
        return Response(payload)

