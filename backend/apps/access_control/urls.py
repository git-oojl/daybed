from django.urls import path

from apps.access_control.views import EmployeeRoleAccessView, RolesAccessView

urlpatterns = [
    path("roles/", RolesAccessView.as_view(), name="access-roles"),
    path(
        "roles/empleado/",
        EmployeeRoleAccessView.as_view(),
        name="access-employee-role",
    ),
]
