import pytest
from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework.test import APIClient

from apps.accounts.permissions import is_admin, is_customer, is_employee_or_admin

pytestmark = pytest.mark.django_db

User = get_user_model()


def api_client():
    return APIClient()


def create_user(username, role=User.Roles.CUSTOMER, password="StrongPass123!"):
    return User.objects.create_user(
        username=username,
        email=f"{username}@example.com",
        password=password,
        role=role,
    )


def test_customer_registration_creates_cliente_even_if_role_is_submitted():
    client = api_client()

    response = client.post(
        reverse("customer-register"),
        {
            "username": "cliente1",
            "email": "cliente1@example.com",
            "password": "StrongPass123!",
            "first_name": "Cliente",
            "last_name": "Uno",
            "phone": "555-0101",
            "role": User.Roles.ADMIN,
        },
        format="json",
    )

    assert response.status_code == 201
    assert response.data["role"] == User.Roles.CUSTOMER
    assert "password" not in response.data

    user = User.objects.get(username="cliente1")
    assert user.role == User.Roles.CUSTOMER
    assert user.check_password("StrongPass123!")


def test_jwt_login_returns_access_and_refresh_tokens():
    create_user("cliente2")
    client = api_client()

    response = client.post(
        reverse("token_obtain_pair"),
        {"username": "cliente2", "password": "StrongPass123!"},
        format="json",
    )

    assert response.status_code == 200
    assert response.data["access"]
    assert response.data["refresh"]


def test_current_user_profile_requires_authentication():
    client = api_client()

    response = client.get(reverse("current-user"))

    assert response.status_code == 401


def test_current_user_profile_update_cannot_change_role():
    user = create_user("cliente3")
    client = api_client()
    client.force_authenticate(user=user)

    response = client.patch(
        reverse("current-user"),
        {"first_name": "Actualizado", "role": User.Roles.ADMIN},
        format="json",
    )

    assert response.status_code == 200

    user.refresh_from_db()
    assert user.first_name == "Actualizado"
    assert user.role == User.Roles.CUSTOMER


def test_admin_can_create_internal_employee_user():
    admin = create_user("admin1", role=User.Roles.ADMIN)
    client = api_client()
    client.force_authenticate(user=admin)

    response = client.post(
        reverse("internal-user-list"),
        {
            "username": "empleado1",
            "email": "empleado1@example.com",
            "password": "StrongPass123!",
            "role": User.Roles.EMPLOYEE,
            "first_name": "Empleado",
        },
        format="json",
    )

    assert response.status_code == 201
    assert response.data["role"] == User.Roles.EMPLOYEE

    employee = User.objects.get(username="empleado1")
    assert employee.role == User.Roles.EMPLOYEE
    assert employee.check_password("StrongPass123!")


def test_employee_cannot_manage_internal_users_or_assign_roles():
    employee = create_user("empleado2", role=User.Roles.EMPLOYEE)
    client = api_client()
    client.force_authenticate(user=employee)

    response = client.get(reverse("internal-user-list"))

    assert response.status_code == 403


def test_role_permission_helpers():
    customer = create_user("cliente4")
    employee = create_user("empleado3", role=User.Roles.EMPLOYEE)
    admin = create_user("admin2", role=User.Roles.ADMIN)

    assert is_customer(customer)
    assert not is_customer(employee)
    assert is_employee_or_admin(employee)
    assert is_employee_or_admin(admin)
    assert is_admin(admin)
    assert not is_admin(employee)
