import re

from django.conf import settings
from django.contrib.auth import authenticate, get_user_model
from django.contrib.auth.password_validation import validate_password
from django.contrib.auth.tokens import default_token_generator
from django.core.mail import send_mail
from django.utils.encoding import force_bytes, force_str
from django.utils.http import urlsafe_base64_decode, urlsafe_base64_encode
from rest_framework import serializers
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.token_blacklist.models import (
    BlacklistedToken,
    OutstandingToken,
)
from rest_framework_simplejwt.tokens import RefreshToken

from apps.access_control.services import PERMISSION_BY_CODE, get_effective_permission_codes

User = get_user_model()

PASSWORD_RESET_SENT_MESSAGE = (
    "Si existe una cuenta con ese correo, enviaremos instrucciones para "
    "restablecer la contraseña."
)


def normalize_email(value):
    return User.objects.normalize_email(value).lower()


def build_username_from_email(email):
    base = email.split("@", maxsplit=1)[0]
    base = re.sub(r"[^\w.@+-]", "_", base)[:140] or "cliente"
    username = base
    suffix = 1

    while User.objects.filter(username=username).exists():
        suffix += 1
        username = f"{base[:140 - len(str(suffix)) - 1]}-{suffix}"

    return username


class CustomerRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, trim_whitespace=False)
    confirmPassword = serializers.CharField(
        write_only=True,
        required=False,
        trim_whitespace=False,
    )
    nombre = serializers.CharField(
        source="first_name",
        write_only=True,
        required=False,
        allow_blank=True,
    )
    apellido = serializers.CharField(
        source="last_name",
        write_only=True,
        required=False,
        allow_blank=True,
    )
    telefono = serializers.CharField(
        source="phone",
        write_only=True,
        required=False,
        allow_blank=True,
    )
    estado = serializers.CharField(
        source="state",
        write_only=True,
        required=False,
        allow_blank=True,
    )
    ciudad = serializers.CharField(
        source="city",
        write_only=True,
        required=False,
        allow_blank=True,
    )
    role = serializers.CharField(read_only=True)

    class Meta:
        model = User
        fields = (
            "id",
            "username",
            "email",
            "password",
            "confirmPassword",
            "first_name",
            "last_name",
            "phone",
            "state",
            "city",
            "nombre",
            "apellido",
            "telefono",
            "estado",
            "ciudad",
            "role",
        )
        read_only_fields = ("id", "role")
        extra_kwargs = {
            "username": {"required": False},
            "first_name": {"required": False, "allow_blank": True},
            "last_name": {"required": False, "allow_blank": True},
            "phone": {"required": False, "allow_blank": True},
            "state": {"required": False, "allow_blank": True},
            "city": {"required": False, "allow_blank": True},
        }

    def validate_email(self, value):
        email = normalize_email(value)
        if User.objects.filter(email__iexact=email).exists():
            raise serializers.ValidationError("Ya existe una cuenta con este correo.")
        return email

    def validate_password(self, value):
        validate_password(value)
        return value

    def validate(self, attrs):
        confirm_password = attrs.pop("confirmPassword", None)
        if confirm_password is not None and attrs.get("password") != confirm_password:
            raise serializers.ValidationError(
                {"confirmPassword": "Las contraseñas no coinciden."}
            )
        return attrs

    def create(self, validated_data):
        password = validated_data.pop("password")
        email = validated_data["email"]
        validated_data.setdefault("username", build_username_from_email(email))
        user = User(**validated_data, role=User.Roles.CUSTOMER)
        user.set_password(password)
        user.save()
        return user


class UserProfileSerializer(serializers.ModelSerializer):
    effective_permission_codes = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = (
            "id",
            "username",
            "email",
            "first_name",
            "last_name",
            "phone",
            "state",
            "city",
            "role",
            "effective_permission_codes",
        )
        read_only_fields = ("id", "username", "role", "effective_permission_codes")

    def validate_email(self, value):
        email = normalize_email(value)
        duplicate_query = User.objects.filter(email__iexact=email).exclude(
            pk=self.instance.pk
        )
        if duplicate_query.exists():
            raise serializers.ValidationError("Ya existe una cuenta con este correo.")
        return email

    def get_effective_permission_codes(self, obj) -> list[str]:
        return get_effective_permission_codes(obj)


def blacklist_user_refresh_tokens(user):
    for outstanding_token in OutstandingToken.objects.filter(user=user):
        BlacklistedToken.objects.get_or_create(token=outstanding_token)


class PasswordChangeSerializer(serializers.Serializer):
    current_password = serializers.CharField(write_only=True, trim_whitespace=False)
    new_password = serializers.CharField(write_only=True, trim_whitespace=False)
    confirm_password = serializers.CharField(write_only=True, trim_whitespace=False)

    def validate_current_password(self, value):
        user = self.context["request"].user
        if not user.check_password(value):
            raise serializers.ValidationError("La contraseña actual es incorrecta.")
        return value

    def validate(self, attrs):
        if attrs["new_password"] != attrs["confirm_password"]:
            raise serializers.ValidationError(
                {"confirm_password": "Las contraseñas no coinciden."}
            )
        validate_password(attrs["new_password"], self.context["request"].user)
        return attrs

    def save(self, **kwargs):
        user = self.context["request"].user
        user.set_password(self.validated_data["new_password"])
        user.save(update_fields=("password",))
        blacklist_user_refresh_tokens(user)
        return user


class PasswordResetRequestSerializer(serializers.Serializer):
    email = serializers.EmailField(write_only=True)

    def validate_email(self, value):
        return normalize_email(value)

    def save(self, **kwargs):
        email = self.validated_data["email"]
        user = User.objects.filter(email__iexact=email, is_active=True).first()
        if user is not None:
            self._send_reset_email(user)
        return {"detail": PASSWORD_RESET_SENT_MESSAGE}

    def _send_reset_email(self, user):
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        token = default_token_generator.make_token(user)
        reset_url = f"{settings.FRONTEND_PASSWORD_RESET_URL}?uid={uid}&token={token}"
        send_mail(
            subject="Restablece tu contraseña de Daybed",
            message=(
                "Recibimos una solicitud para restablecer tu contraseña.\n\n"
                f"Abre este enlace para continuar:\n{reset_url}\n\n"
                "Si no solicitaste este cambio, ignora este mensaje."
            ),
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            fail_silently=False,
        )


class PasswordResetConfirmSerializer(serializers.Serializer):
    uid = serializers.CharField(write_only=True)
    token = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True, trim_whitespace=False)
    confirm_password = serializers.CharField(write_only=True, trim_whitespace=False)

    def validate(self, attrs):
        user = self._get_user(attrs["uid"])
        if user is None or not default_token_generator.check_token(
            user,
            attrs["token"],
        ):
            raise serializers.ValidationError(
                {"token": "El enlace de restablecimiento no es válido o expiró."}
            )
        if attrs["new_password"] != attrs["confirm_password"]:
            raise serializers.ValidationError(
                {"confirm_password": "Las contraseñas no coinciden."}
            )
        validate_password(attrs["new_password"], user)
        attrs["user"] = user
        return attrs

    def _get_user(self, uid):
        try:
            user_id = force_str(urlsafe_base64_decode(uid))
            return User.objects.get(pk=user_id, is_active=True)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            return None

    def save(self, **kwargs):
        user = self.validated_data["user"]
        user.set_password(self.validated_data["new_password"])
        user.save(update_fields=("password",))
        blacklist_user_refresh_tokens(user)
        return user


class InternalUserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        required=False,
        write_only=True,
        trim_whitespace=False,
    )
    effective_permission_codes = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = (
            "id",
            "username",
            "email",
            "password",
            "first_name",
            "last_name",
            "phone",
            "state",
            "city",
            "role",
            "operational_permission_codes",
            "effective_permission_codes",
            "is_active",
            "is_staff",
            "is_superuser",
            "date_joined",
            "last_login",
        )
        read_only_fields = (
            "id",
            "is_staff",
            "is_superuser",
            "date_joined",
            "last_login",
            "effective_permission_codes",
        )

    def get_effective_permission_codes(self, obj) -> list[str]:
        return get_effective_permission_codes(obj)

    def validate_operational_permission_codes(self, value):
        if value is None:
            return None
        unknown_codes = sorted(set(value) - set(PERMISSION_BY_CODE))
        if unknown_codes:
            raise serializers.ValidationError(
                f"Permisos no compatibles: {', '.join(unknown_codes)}."
            )
        return sorted(set(value))

    def validate_email(self, value):
        email = normalize_email(value)
        duplicate_query = User.objects.filter(email__iexact=email)
        if self.instance is not None:
            duplicate_query = duplicate_query.exclude(pk=self.instance.pk)
        if duplicate_query.exists():
            raise serializers.ValidationError("Ya existe una cuenta con este correo.")
        return email

    def validate_password(self, value):
        validate_password(value)
        return value

    def validate(self, attrs):
        next_role = attrs.get("role", getattr(self.instance, "role", None))
        if next_role != User.Roles.EMPLOYEE:
            attrs["operational_permission_codes"] = None
        if self.instance is not None and (
            self.instance.role == User.Roles.ADMIN or self.instance.is_superuser
        ):
            if next_role != User.Roles.ADMIN or attrs.get("is_active", True) is False:
                raise serializers.ValidationError(
                    {
                        "role": (
                            "Las cuentas administradoras están protegidas. "
                            "Puedes actualizar sus datos, pero no degradarlas ni desactivarlas."
                        )
                    }
                )
        if self.instance is None and not attrs.get("password"):
            raise serializers.ValidationError({"password": "La contraseña es obligatoria."})
        if self.instance is not None and self._would_remove_last_admin(attrs):
            raise serializers.ValidationError(
                {
                    "role": (
                        "Debe permanecer al menos una cuenta administradora activa."
                    )
                }
            )
        return attrs

    def _would_remove_last_admin(self, attrs):
        next_role = attrs.get("role", self.instance.role)
        next_is_active = attrs.get("is_active", self.instance.is_active)

        if next_is_active and (
            next_role == User.Roles.ADMIN or self.instance.is_superuser
        ):
            return False

        was_active_admin = (
            self.instance.is_active
            and (self.instance.role == User.Roles.ADMIN or self.instance.is_superuser)
        )
        if not was_active_admin:
            return False

        return not User.objects.exclude(pk=self.instance.pk).filter(
            is_active=True,
            role=User.Roles.ADMIN,
        ).exists() and not User.objects.exclude(pk=self.instance.pk).filter(
            is_active=True,
            is_superuser=True,
        ).exists()

    def create(self, validated_data):
        password = validated_data.pop("password")
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user

    def update(self, instance, validated_data):
        password = validated_data.pop("password", None)
        for field, value in validated_data.items():
            setattr(instance, field, value)
        if password:
            instance.set_password(password)
        instance.save()
        return instance


class LoginTokenSerializer(TokenObtainPairSerializer):
    email = serializers.EmailField(required=False, write_only=True)
    username = serializers.CharField(required=False, write_only=True)

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields["username"].required = False

    def validate(self, attrs):
        password = attrs.get("password")
        login = attrs.get("email") or attrs.get("username")
        if not login:
            raise serializers.ValidationError(
                {"email": "Este campo es requerido para iniciar sesión."}
            )

        user = User.objects.filter(email__iexact=login).first()
        if user is None and attrs.get("username"):
            user = User.objects.filter(username=login).first()

        if user is None:
            raise serializers.ValidationError(
                {"detail": "Correo o contraseña incorrectos."}
            )

        authenticated_user = authenticate(
            request=self.context.get("request"),
            username=user.get_username(),
            password=password,
        )
        if authenticated_user is None:
            raise serializers.ValidationError(
                {"detail": "Correo o contraseña incorrectos."}
            )

        refresh = self.get_token(authenticated_user)
        return {
            "refresh": str(refresh),
            "access": str(refresh.access_token),
            "user": UserProfileSerializer(authenticated_user).data,
        }


class LogoutSerializer(serializers.Serializer):
    refresh = serializers.CharField(write_only=True)

    def save(self, **kwargs):
        try:
            token = RefreshToken(self.validated_data["refresh"])
            token.blacklist()
        except TokenError as exc:
            raise serializers.ValidationError(
                {"refresh": "Token de refresh inválido o ya cerrado."}
            ) from exc
