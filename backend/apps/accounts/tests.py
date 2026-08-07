import pytest
from django.contrib.auth import get_user_model
from django.contrib.auth.tokens import default_token_generator
from django.core import mail
from django.core.files.uploadedfile import SimpleUploadedFile
from django.core.management import call_command
from django.test import override_settings
from django.urls import reverse
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode
from rest_framework.test import APIClient
from rest_framework_simplejwt.token_blacklist.models import BlacklistedToken

from apps.access_control.services import get_effective_permission_codes
from apps.accounts.permissions import is_admin, is_customer, is_employee_or_admin
from apps.accounts.serializers import PASSWORD_RESET_SENT_MESSAGE
from apps.cart.models import CartItem
from apps.catalog.models import Category, Product, ProductImage
from apps.inventory.models import InventoryMovement
from apps.orders.models import Order
from apps.store.models import StoreSettings

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


def test_password_change_requires_authentication():
    client = api_client()

    response = client.post(reverse("password-change"), {}, format="json")

    assert response.status_code == 401


def test_password_change_rejects_wrong_current_password():
    user = create_user("password_change_wrong")
    client = api_client()
    client.force_authenticate(user=user)

    response = client.post(
        reverse("password-change"),
        {
            "current_password": "WrongPass123!",
            "new_password": "NewStrongPass123!",
            "confirm_password": "NewStrongPass123!",
        },
        format="json",
    )

    assert response.status_code == 400
    user.refresh_from_db()
    assert user.check_password("StrongPass123!")


def test_password_change_updates_password_and_blacklists_refresh_tokens():
    user = create_user("password_change_success")
    client = api_client()
    login_response = client.post(
        reverse("token_obtain_pair"),
        {"email": user.email, "password": "StrongPass123!"},
        format="json",
    )
    client.force_authenticate(user=user)

    response = client.post(
        reverse("password-change"),
        {
            "current_password": "StrongPass123!",
            "new_password": "NewStrongPass123!",
            "confirm_password": "NewStrongPass123!",
        },
        format="json",
    )

    assert response.status_code == 204
    user.refresh_from_db()
    assert user.check_password("NewStrongPass123!")
    assert BlacklistedToken.objects.filter(token__user=user).exists()

    old_login_response = api_client().post(
        reverse("token_obtain_pair"),
        {"email": user.email, "password": "StrongPass123!"},
        format="json",
    )
    new_login_response = api_client().post(
        reverse("token_obtain_pair"),
        {"email": user.email, "password": "NewStrongPass123!"},
        format="json",
    )
    refresh_response = api_client().post(
        reverse("token_refresh"),
        {"refresh": login_response.data["refresh"]},
        format="json",
    )

    assert old_login_response.status_code == 400
    assert new_login_response.status_code == 200
    assert refresh_response.status_code == 401


def test_password_change_enforces_password_validation_and_confirmation():
    user = create_user("password_change_validation")
    client = api_client()
    client.force_authenticate(user=user)

    mismatch_response = client.post(
        reverse("password-change"),
        {
            "current_password": "StrongPass123!",
            "new_password": "NewStrongPass123!",
            "confirm_password": "DifferentStrongPass123!",
        },
        format="json",
    )
    weak_response = client.post(
        reverse("password-change"),
        {
            "current_password": "StrongPass123!",
            "new_password": "123",
            "confirm_password": "123",
        },
        format="json",
    )

    assert mismatch_response.status_code == 400
    assert weak_response.status_code == 400


@override_settings(
    EMAIL_BACKEND="django.core.mail.backends.locmem.EmailBackend",
    FRONTEND_PASSWORD_RESET_URL="https://daybed.example/reset-password",
)
def test_password_reset_request_is_generic_and_emails_existing_active_user():
    user = create_user("password_reset_request")
    client = api_client()

    existing_response = client.post(
        reverse("password-reset-request"),
        {"email": user.email.upper()},
        format="json",
    )
    missing_response = client.post(
        reverse("password-reset-request"),
        {"email": "missing@example.com"},
        format="json",
    )

    assert existing_response.status_code == 200
    assert missing_response.status_code == 200
    assert existing_response.data == {"detail": PASSWORD_RESET_SENT_MESSAGE}
    assert missing_response.data == {"detail": PASSWORD_RESET_SENT_MESSAGE}
    assert len(mail.outbox) == 1
    assert user.email in mail.outbox[0].to
    assert "https://daybed.example/reset-password?uid=" in mail.outbox[0].body
    assert "&token=" in mail.outbox[0].body


@override_settings(EMAIL_BACKEND="django.core.mail.backends.locmem.EmailBackend")
def test_password_reset_request_does_not_email_inactive_user():
    user = create_user("password_reset_inactive")
    user.is_active = False
    user.save(update_fields=("is_active",))

    response = api_client().post(
        reverse("password-reset-request"),
        {"email": user.email},
        format="json",
    )

    assert response.status_code == 200
    assert len(mail.outbox) == 0


def test_password_reset_confirm_rejects_invalid_token():
    user = create_user("password_reset_invalid")
    uid = urlsafe_base64_encode(force_bytes(user.pk))

    response = api_client().post(
        reverse("password-reset-confirm"),
        {
            "uid": uid,
            "token": "invalid-token",
            "new_password": "ResetStrongPass123!",
            "confirm_password": "ResetStrongPass123!",
        },
        format="json",
    )

    assert response.status_code == 400
    user.refresh_from_db()
    assert user.check_password("StrongPass123!")


def test_password_reset_confirm_updates_password_and_blacklists_refresh_tokens():
    user = create_user("password_reset_success")
    login_response = api_client().post(
        reverse("token_obtain_pair"),
        {"email": user.email, "password": "StrongPass123!"},
        format="json",
    )
    uid = urlsafe_base64_encode(force_bytes(user.pk))
    token = default_token_generator.make_token(user)

    response = api_client().post(
        reverse("password-reset-confirm"),
        {
            "uid": uid,
            "token": token,
            "new_password": "ResetStrongPass123!",
            "confirm_password": "ResetStrongPass123!",
        },
        format="json",
    )

    assert response.status_code == 204
    user.refresh_from_db()
    assert user.check_password("ResetStrongPass123!")
    assert BlacklistedToken.objects.filter(token__user=user).exists()

    old_login_response = api_client().post(
        reverse("token_obtain_pair"),
        {"email": user.email, "password": "StrongPass123!"},
        format="json",
    )
    new_login_response = api_client().post(
        reverse("token_obtain_pair"),
        {"email": user.email, "password": "ResetStrongPass123!"},
        format="json",
    )
    refresh_response = api_client().post(
        reverse("token_refresh"),
        {"refresh": login_response.data["refresh"]},
        format="json",
    )

    assert old_login_response.status_code == 400
    assert new_login_response.status_code == 200
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


@pytest.mark.parametrize(
    "role",
    [User.Roles.CUSTOMER, User.Roles.EMPLOYEE, User.Roles.ADMIN],
)
def test_current_user_profile_supports_all_authenticated_roles(role):
    user = create_user(f"profile_{role}", role=role)
    client = api_client()
    client.force_authenticate(user=user)

    response = client.get(reverse("current-user"))

    assert response.status_code == 200
    assert response.data == {
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "first_name": "",
        "last_name": "",
        "phone": "",
        "avatar": None,
        "state": "",
        "city": "",
        "role": role,
        "effective_permission_codes": get_effective_permission_codes(user),
    }


@pytest.mark.parametrize(
    "role",
    [User.Roles.CUSTOMER, User.Roles.EMPLOYEE, User.Roles.ADMIN],
)
def test_current_user_profile_updates_supported_fields_for_all_roles(role):
    user = create_user(f"profile_update_{role}", role=role)
    original_username = user.username
    client = api_client()
    client.force_authenticate(user=user)

    response = client.patch(
        reverse("current-user"),
        {
            "username": "ignored_username",
            "email": f"UPDATED.{role}@example.com",
            "first_name": "Nombre",
            "last_name": "Apellido",
            "phone": "6645550199",
            "state": "Baja California",
            "city": "Tijuana",
            "role": User.Roles.ADMIN
            if role != User.Roles.ADMIN
            else User.Roles.CUSTOMER,
            "effective_permission_codes": ["products.view"],
        },
        format="json",
    )

    assert response.status_code == 200
    assert response.data["email"] == f"updated.{role}@example.com"
    assert response.data["first_name"] == "Nombre"
    assert response.data["last_name"] == "Apellido"
    assert response.data["phone"] == "6645550199"
    assert response.data["state"] == "Baja California"
    assert response.data["city"] == "Tijuana"
    assert response.data["role"] == role
    effective_permission_codes = get_effective_permission_codes(user)
    assert response.data["effective_permission_codes"] == effective_permission_codes

    user.refresh_from_db()
    assert user.username == original_username
    assert user.role == role
    assert user.email == f"updated.{role}@example.com"
    assert user.first_name == "Nombre"
    assert user.last_name == "Apellido"
    assert user.phone == "6645550199"
    assert user.state == "Baja California"
    assert user.city == "Tijuana"


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


def test_seed_demo_command_creates_repeatable_local_dataset(settings, tmp_path):
    settings.MEDIA_ROOT = tmp_path

    call_command("seed_demo")

    customer = User.objects.get(email="cliente@example.com")
    employee = User.objects.get(email="empleado@example.com")
    assert customer.role == User.Roles.CUSTOMER
    assert customer.check_password("DemoPassword123!")
    assert employee.role == User.Roles.EMPLOYEE
    assert get_effective_permission_codes(employee)
    assert (
        User.objects.get(email="cliente.plus@example.com").role == User.Roles.CUSTOMER
    )
    assert User.objects.get(email="admin@example.com").role == User.Roles.ADMIN

    assert Category.objects.count() == 9
    assert Product.objects.count() == 27
    seeded_product = Product.objects.get(sku="DAY-SOFA-ROB-001")
    assert seeded_product.width_cm == 200
    assert seeded_product.specifications["assembly_required"] is False
    assert seeded_product.main_image.name.startswith("products/demo/day-sofa-rob-001")
    assert Product.objects.filter(category__slug="oficina", active=True).count() == 3
    assert Product.objects.filter(main_image="").count() == 0
    assert ProductImage.objects.filter(active=True).count() >= 20
    assert CartItem.objects.filter(cart__user=customer).count() == 3
    assert (
        CartItem.objects.filter(cart__user__email="cliente.plus@example.com").count()
        == 2
    )
    assert Order.objects.filter(user=customer).count() == 6
    assert Order.objects.count() == 12
    assert Order.objects.filter(payment_status=Order.PaymentStatus.FAILED).exists()
    assert Order.objects.filter(
        payment_method=Order.PaymentMethod.TRANSFER,
        payment_status=Order.PaymentStatus.AUTHORIZED,
    ).exists()
    assert Order.objects.filter(
        user=customer,
        items__product_snapshot__sku="DAY-SOFA-LIN-002",
    ).exists()
    assert InventoryMovement.objects.count() == 14
    assert StoreSettings.get_active().free_shipping_threshold == 15000

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

    assert User.objects.filter(email__endswith="@example.com").count() == 4
    assert Order.objects.filter(user__email="cliente@example.com").count() == 6


def test_internal_admin_account_cannot_be_demoted_or_deactivated():
    acting_admin = create_user("protected_admin_actor", role=User.Roles.ADMIN)
    protected_admin = create_user("protected_admin_target", role=User.Roles.ADMIN)
    client = api_client()
    client.force_authenticate(user=acting_admin)

    demote_response = client.patch(
        reverse("internal-user-detail", args=[protected_admin.id]),
        {"role": User.Roles.EMPLOYEE},
        format="json",
    )
    deactivate_response = client.patch(
        reverse("internal-user-detail", args=[protected_admin.id]),
        {"is_active": False},
        format="json",
    )

    assert demote_response.status_code == 400
    assert deactivate_response.status_code == 400
    protected_admin.refresh_from_db()
    assert protected_admin.role == User.Roles.ADMIN
    assert protected_admin.is_active is True


def test_authenticated_user_can_upload_optional_profile_avatar(settings, tmp_path):
    settings.MEDIA_ROOT = tmp_path
    user = create_user("avatar_customer")
    client = api_client()
    client.force_authenticate(user=user)
    avatar = SimpleUploadedFile(
        "avatar.gif",
        b"GIF87a\x01\x00\x01\x00\x80\x01\x00\x00\x00\x00ccc,\x00\x00"
        b"\x00\x00\x01\x00\x01\x00\x00\x02\x02D\x01\x00;",
        content_type="image/gif",
    )

    response = client.patch(
        reverse("current-user"),
        {"avatar": avatar},
        format="multipart",
    )

    assert response.status_code == 200
    assert response.data["avatar"]
    user.refresh_from_db()
    assert user.avatar.name.startswith("avatars/avatar")
