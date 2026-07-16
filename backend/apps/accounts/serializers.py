import re

from django.contrib.auth import authenticate, get_user_model
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.tokens import RefreshToken

User = get_user_model()


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
        )
        read_only_fields = ("id", "username", "role")

    def validate_email(self, value):
        email = normalize_email(value)
        duplicate_query = User.objects.filter(email__iexact=email).exclude(
            pk=self.instance.pk
        )
        if duplicate_query.exists():
            raise serializers.ValidationError("Ya existe una cuenta con este correo.")
        return email


class InternalUserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        required=False,
        write_only=True,
        trim_whitespace=False,
    )

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
        )

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
        if self.instance is None and not attrs.get("password"):
            raise serializers.ValidationError({"password": "This field is required."})
        return attrs

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
