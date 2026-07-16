import pytest
from django.contrib.auth import get_user_model
from django.core.management import call_command
from django.urls import reverse
from rest_framework.test import APIClient

from apps.accounts.permissions import is_admin, is_customer, is_employee_or_admin
from apps.cart.models import CartItem
from apps.catalog.models import Category, Product
from apps.inventory.models import InventoryMovement
from apps.orders.models import Order

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


def test_customer_registration_accepts_frontend_spanish_payload():
    client = api_client()

    response = client.post(
        reverse("customer-register"),
        {
            "nombre": "Cliente",
            "apellido": "Frontend",
            "email": "CLIENTE.FRONTEND@example.com",
            "telefono": "5512345678",
            "estado": "Baja California",
            "ciudad": "Tijuana",
            "password": "Daybed123!",
            "confirmPassword": "Daybed123!",
        },
        format="json",
    )

    assert response.status_code == 201
    assert response.data["email"] == "cliente.frontend@example.com"
    assert response.data["first_name"] == "Cliente"
    assert response.data["last_name"] == "Frontend"
    assert response.data["phone"] == "5512345678"
    assert response.data["state"] == "Baja California"
    assert response.data["city"] == "Tijuana"
    assert response.data["role"] == User.Roles.CUSTOMER
    assert response.data["username"]

    user = User.objects.get(email="cliente.frontend@example.com")
    assert user.check_password("Daybed123!")


def test_jwt_login_with_email_returns_tokens_and_user_payload():
    create_user("cliente2")
    client = api_client()

    response = client.post(
        reverse("token_obtain_pair"),
        {"email": "cliente2@example.com", "password": "StrongPass123!"},
        format="json",
    )

    assert response.status_code == 200
    assert response.data["access"]
    assert response.data["refresh"]
    assert response.data["user"]["email"] == "cliente2@example.com"
    assert response.data["user"]["role"] == User.Roles.CUSTOMER


def test_jwt_login_still_accepts_username_for_manual_scripts():
    create_user("cliente_username")
    client = api_client()

    response = client.post(
        reverse("token_obtain_pair"),
        {"username": "cliente_username", "password": "StrongPass123!"},
        format="json",
    )

    assert response.status_code == 200
    assert response.data["access"]


def test_jwt_logout_blacklists_refresh_token():
    create_user("cliente_logout")
    client = api_client()
    login_response = client.post(
        reverse("token_obtain_pair"),
        {"email": "cliente_logout@example.com", "password": "StrongPass123!"},
        format="json",
    )

    response = client.post(
        reverse("token_logout"),
        {"refresh": login_response.data["refresh"]},
        format="json",
    )

    assert response.status_code == 204

    refresh_response = client.post(
        reverse("token_refresh"),
        {"refresh": login_response.data["refresh"]},
        format="json",
    )
    assert refresh_response.status_code == 401


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
        {
            "first_name": "Actualizado",
            "state": "Baja California",
            "city": "Tijuana",
            "role": User.Roles.ADMIN,
        },
        format="json",
    )

    assert response.status_code == 200

    user.refresh_from_db()
    assert user.first_name == "Actualizado"
    assert user.state == "Baja California"
    assert user.city == "Tijuana"
    assert user.role == User.Roles.CUSTOMER


def test_current_user_profile_update_normalizes_email_and_rejects_duplicate():
    user = create_user("cliente_email_update")
    other = create_user("cliente_email_existing")
    client = api_client()
    client.force_authenticate(user=user)

    update_response = client.patch(
        reverse("current-user"),
        {"email": "CLIENTE.UPDATED@example.com"},
        format="json",
    )
    duplicate_response = client.patch(
        reverse("current-user"),
        {"email": other.email.upper()},
        format="json",
    )

    assert update_response.status_code == 200
    assert update_response.data["email"] == "cliente.updated@example.com"
    assert duplicate_response.status_code == 400
    assert "Ya existe" in str(duplicate_response.data)

    user.refresh_from_db()
    assert user.email == "cliente.updated@example.com"


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


def test_seed_demo_command_creates_repeatable_local_dataset():
    call_command("seed_demo")

    customer = User.objects.get(email="cliente@example.com")
    assert customer.role == User.Roles.CUSTOMER
    assert customer.check_password("DemoPassword123!")
    assert User.objects.get(email="empleado@example.com").role == User.Roles.EMPLOYEE
    assert User.objects.get(email="admin@example.com").role == User.Roles.ADMIN

    assert Category.objects.count() == 5
    assert Product.objects.count() == 7
    seeded_product = Product.objects.get(sku="DAY-SOFA-ROB-001")
    assert seeded_product.width_cm == 200
    assert seeded_product.specifications["assembly_required"] is False
    assert CartItem.objects.filter(cart__user=customer).count() == 2
    assert Order.objects.filter(user=customer).count() == 6
    assert Order.objects.filter(
        user=customer,
        items__product_snapshot__sku="DAY-SOFA-LIN-002",
    ).exists()
    assert InventoryMovement.objects.count() == 6

    first_counts = {
        "users": User.objects.count(),
        "categories": Category.objects.count(),
        "products": Product.objects.count(),
        "orders": Order.objects.count(),
        "cart_items": CartItem.objects.count(),
        "movements": InventoryMovement.objects.count(),
    }

    call_command("seed_demo")

    second_counts = {
        "users": User.objects.count(),
        "categories": Category.objects.count(),
        "products": Product.objects.count(),
        "orders": Order.objects.count(),
        "cart_items": CartItem.objects.count(),
        "movements": InventoryMovement.objects.count(),
    }
    assert second_counts == first_counts

    call_command("seed_demo", reset=True)

    assert User.objects.filter(email__endswith="@example.com").count() == 3
    assert Order.objects.filter(user__email="cliente@example.com").count() == 6
