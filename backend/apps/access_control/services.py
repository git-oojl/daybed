from dataclasses import dataclass

from django.contrib.auth.models import Group, Permission
from django.contrib.contenttypes.models import ContentType

from apps.accounts.models import User

EMPLOYEE_GROUP_NAME = "Daybed Empleado"


@dataclass(frozen=True)
class OperationalPermissionSpec:
    code: str
    codename: str
    label: str
    category: str
    description: str


PERMISSION_CATALOG = (
    OperationalPermissionSpec(
        "dashboard.view",
        "dashboard_view",
        "Ver dashboard",
        "Dashboard",
        "Consultar métricas operativas internas.",
    ),
    OperationalPermissionSpec(
        "products.view",
        "products_view",
        "Ver productos",
        "Productos",
        "Consultar catálogo interno, colecciones y productos.",
    ),
    OperationalPermissionSpec(
        "products.create",
        "products_create",
        "Crear productos",
        "Productos",
        "Crear productos o colecciones desde el back-office.",
    ),
    OperationalPermissionSpec(
        "products.update",
        "products_update",
        "Actualizar productos",
        "Productos",
        "Editar productos o colecciones desde el back-office.",
    ),
    OperationalPermissionSpec(
        "products.deactivate",
        "products_deactivate",
        "Desactivar productos",
        "Productos",
        "Desactivar productos o colecciones sin borrado físico.",
    ),
    OperationalPermissionSpec(
        "inventory.view",
        "inventory_view",
        "Ver inventario",
        "Inventario",
        "Consultar stock y productos con bajo inventario.",
    ),
    OperationalPermissionSpec(
        "inventory.adjust",
        "inventory_adjust",
        "Ajustar inventario",
        "Inventario",
        "Modificar stock y mínimo de inventario.",
    ),
    OperationalPermissionSpec(
        "inventory.movements.view",
        "inventory_movements_view",
        "Ver movimientos de inventario",
        "Inventario",
        "Consultar historial de movimientos de inventario.",
    ),
    OperationalPermissionSpec(
        "orders.view",
        "orders_view",
        "Ver pedidos",
        "Pedidos",
        "Consultar pedidos de clientes y su detalle operativo.",
    ),
    OperationalPermissionSpec(
        "orders.status.update",
        "orders_status_update",
        "Actualizar estado de pedidos",
        "Pedidos",
        "Cambiar el estado operativo de pedidos.",
    ),
)

PERMISSION_BY_CODE = {permission.code: permission for permission in PERMISSION_CATALOG}
PERMISSION_BY_CODENAME = {
    permission.codename: permission for permission in PERMISSION_CATALOG
}


def _content_type():
    return ContentType.objects.get_or_create(
        app_label="access_control",
        model="operationalpermission",
    )[0]


def ensure_operational_permissions():
    content_type = _content_type()
    by_codename = {
        permission.codename: permission
        for permission in Permission.objects.filter(
            content_type=content_type,
            codename__in=[item.codename for item in PERMISSION_CATALOG],
        )
    }
    missing = [
        Permission(
            content_type=content_type,
            codename=permission.codename,
            name=permission.label,
        )
        for permission in PERMISSION_CATALOG
        if permission.codename not in by_codename
    ]
    if missing:
        Permission.objects.bulk_create(missing, ignore_conflicts=True)
        by_codename = {
            permission.codename: permission
            for permission in Permission.objects.filter(
                content_type=content_type,
                codename__in=[item.codename for item in PERMISSION_CATALOG],
            )
        }

    permission_objects = {}
    for permission in PERMISSION_CATALOG:
        permission_object = by_codename.get(permission.codename)
        if permission_object is not None:
            permission_objects[permission.code] = permission_object
    return permission_objects


def get_employee_group():
    permission_objects = ensure_operational_permissions()
    group, created = Group.objects.get_or_create(name=EMPLOYEE_GROUP_NAME)
    if created:
        group.permissions.set(permission_objects.values())
    return group


def sync_user_employee_group(user):
    if not user.pk:
        return

    group = get_employee_group()
    if user.role == User.Roles.EMPLOYEE:
        user.groups.add(group)
        return

    user.groups.remove(group)


def get_employee_permission_codes():
    group = get_employee_group()
    codenames = set(
        group.permissions.filter(content_type=_content_type()).values_list(
            "codename",
            flat=True,
        )
    )
    return sorted(
        permission.code
        for permission in PERMISSION_CATALOG
        if permission.codename in codenames
    )


def set_employee_permission_codes(codes):
    unknown_codes = sorted(set(codes) - set(PERMISSION_BY_CODE))
    if unknown_codes:
        return unknown_codes

    permission_objects = ensure_operational_permissions()
    group = get_employee_group()
    group.permissions.set(permission_objects[code] for code in sorted(set(codes)))
    return []


def user_is_administrator(user):
    return bool(
        user
        and user.is_authenticated
        and (user.role == User.Roles.ADMIN or user.is_superuser)
    )


def user_has_operational_permission(user, code):
    if not user or not user.is_authenticated:
        return False

    if user_is_administrator(user):
        return True

    if user.role != User.Roles.EMPLOYEE:
        return False

    permission = PERMISSION_BY_CODE.get(code)
    if not permission:
        return False

    if user.operational_permission_codes is not None:
        return code in set(user.operational_permission_codes)

    sync_user_employee_group(user)
    return user.groups.filter(
        name=EMPLOYEE_GROUP_NAME,
        permissions__content_type=_content_type(),
        permissions__codename=permission.codename,
    ).exists()


def get_effective_permission_codes(user):
    if not user or not user.is_authenticated:
        return []

    if user_is_administrator(user):
        return [permission.code for permission in PERMISSION_CATALOG]

    if user.role == User.Roles.EMPLOYEE:
        if user.operational_permission_codes is not None:
            configured = set(user.operational_permission_codes)
            return [
                permission.code
                for permission in PERMISSION_CATALOG
                if permission.code in configured
            ]
        return [
            permission.code
            for permission in PERMISSION_CATALOG
            if user_has_operational_permission(user, permission.code)
        ]

    return []


def permission_catalog_payload():
    return [
        {
            "code": permission.code,
            "label": permission.label,
            "category": permission.category,
            "description": permission.description,
        }
        for permission in PERMISSION_CATALOG
    ]
