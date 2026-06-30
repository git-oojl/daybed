from rest_framework.permissions import BasePermission

from apps.accounts.models import User


def is_customer(user):
    return bool(user and user.is_authenticated and user.role == User.Roles.CUSTOMER)


def is_employee_or_admin(user):
    return bool(
        user
        and user.is_authenticated
        and (user.role in {User.Roles.EMPLOYEE, User.Roles.ADMIN} or user.is_superuser)
    )


def is_admin(user):
    return bool(
        user
        and user.is_authenticated
        and (user.role == User.Roles.ADMIN or user.is_superuser)
    )


class IsCustomer(BasePermission):
    def has_permission(self, request, view):
        return is_customer(request.user)


class IsEmployeeOrAdmin(BasePermission):
    def has_permission(self, request, view):
        return is_employee_or_admin(request.user)


class IsAdmin(BasePermission):
    def has_permission(self, request, view):
        return is_admin(request.user)


class IsCustomerOwner(BasePermission):
    def has_object_permission(self, request, view, obj):
        owner = getattr(obj, "user", obj)
        return bool(
            request.user
            and request.user.is_authenticated
            and owner == request.user
            and is_customer(request.user)
        )
