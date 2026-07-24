from rest_framework.permissions import BasePermission

from apps.access_control.services import user_has_operational_permission


class HasOperationalPermission(BasePermission):
    required_permission = None

    def has_permission(self, request, view):
        permission_code = getattr(view, "required_permission", None)
        if permission_code is None:
            permission_code = self.required_permission
        return user_has_operational_permission(request.user, permission_code)


def operational_permission(permission_code):
    class PermissionClass(HasOperationalPermission):
        required_permission = permission_code

    permission_name = "".join(
        part.capitalize() for part in permission_code.replace(".", "_").split("_")
    )
    PermissionClass.__name__ = f"Has{permission_name}Permission"
    return PermissionClass
