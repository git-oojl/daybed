from decimal import Decimal
from pathlib import Path

import environ

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

env = environ.Env(
    DJANGO_DEBUG=(bool, True),
    DJANGO_ALLOWED_HOSTS=(list, ["localhost", "127.0.0.1"]),
    CORS_ALLOWED_ORIGINS=(list, ["http://localhost:5173"]),
    DJANGO_JWT_SIGNING_KEY=(str, ""),
    NOMINATIM_BASE_URL=(str, "https://nominatim.openstreetmap.org"),
    NOMINATIM_USER_AGENT=(str, "daybed-student-project/1.0"),
    OPENROUTESERVICE_BASE_URL=(str, "https://api.openrouteservice.org"),
    OPENROUTESERVICE_API_KEY=(str, ""),
    STORE_LATITUDE=(float, 32.5149),
    STORE_LONGITUDE=(float, -117.0382),
    DELIVERY_BASE_FEE=(str, "80.00"),
    DELIVERY_PRICE_PER_KM=(str, "8.00"),
    EMAIL_BACKEND=(str, "django.core.mail.backends.console.EmailBackend"),
    DEFAULT_FROM_EMAIL=(str, "no-reply@daybed.local"),
    FRONTEND_PASSWORD_RESET_URL=(str, "http://localhost:5173/restablecer-password"),
)

env_file = BASE_DIR / ".env"
if env_file.exists():
    environ.Env.read_env(env_file)

SECRET_KEY = env(
    "DJANGO_SECRET_KEY",
    default="django-insecure-daybed-local-development-only",
)
JWT_SIGNING_KEY = env("DJANGO_JWT_SIGNING_KEY") or SECRET_KEY
if len(JWT_SIGNING_KEY) < 32:
    JWT_SIGNING_KEY = "django-insecure-daybed-local-jwt-signing-key-change-me"

DEBUG = env("DJANGO_DEBUG")

ALLOWED_HOSTS = env("DJANGO_ALLOWED_HOSTS")


# Application definition

INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "corsheaders",
    "django_filters",
    "drf_spectacular",
    "rest_framework",
    "rest_framework_simplejwt",
    "rest_framework_simplejwt.token_blacklist",
    "apps.accounts",
    "apps.access_control",
    "apps.catalog",
    "apps.cart",
    "apps.orders",
    "apps.inventory",
    "apps.delivery",
    "apps.store",
    "apps.dashboard",
    "django_extensions",
]

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "corsheaders.middleware.CorsMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "config.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "config.wsgi.application"

AUTH_USER_MODEL = "accounts.User"


DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": BASE_DIR / "db.sqlite3",
    }
}


AUTH_PASSWORD_VALIDATORS = [
    {
        "NAME": (
            "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"
        ),
    },
    {
        "NAME": "django.contrib.auth.password_validation.MinimumLengthValidator",
        "OPTIONS": {"min_length": 6},
    },
    {
        "NAME": "django.contrib.auth.password_validation.CommonPasswordValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.NumericPasswordValidator",
    },
]


LANGUAGE_CODE = "es-mx"

TIME_ZONE = "UTC"

USE_I18N = True

USE_TZ = True


STATIC_URL = "static/"
STATIC_ROOT = BASE_DIR / "staticfiles"

MEDIA_URL = "media/"
MEDIA_ROOT = BASE_DIR / "media"

CORS_ALLOWED_ORIGINS = env("CORS_ALLOWED_ORIGINS")

NOMINATIM_BASE_URL = env("NOMINATIM_BASE_URL").rstrip("/")
NOMINATIM_USER_AGENT = env("NOMINATIM_USER_AGENT")
OPENROUTESERVICE_BASE_URL = env("OPENROUTESERVICE_BASE_URL").rstrip("/")
OPENROUTESERVICE_API_KEY = env("OPENROUTESERVICE_API_KEY")
STORE_LATITUDE = env("STORE_LATITUDE")
STORE_LONGITUDE = env("STORE_LONGITUDE")
DELIVERY_BASE_FEE = Decimal(env("DELIVERY_BASE_FEE"))
DELIVERY_PRICE_PER_KM = Decimal(env("DELIVERY_PRICE_PER_KM"))
EMAIL_BACKEND = env("EMAIL_BACKEND")
DEFAULT_FROM_EMAIL = env("DEFAULT_FROM_EMAIL")
FRONTEND_PASSWORD_RESET_URL = env("FRONTEND_PASSWORD_RESET_URL")

REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ),
    "DEFAULT_FILTER_BACKENDS": (
        "django_filters.rest_framework.DjangoFilterBackend",
        "rest_framework.filters.SearchFilter",
        "rest_framework.filters.OrderingFilter",
    ),
    "DEFAULT_PAGINATION_CLASS": "rest_framework.pagination.PageNumberPagination",
    "DEFAULT_PERMISSION_CLASSES": ("rest_framework.permissions.IsAuthenticated",),
    "DEFAULT_SCHEMA_CLASS": "drf_spectacular.openapi.AutoSchema",
    "PAGE_SIZE": 20,
}

SIMPLE_JWT = {
    "SIGNING_KEY": JWT_SIGNING_KEY,
    "ROTATE_REFRESH_TOKENS": True,
    "BLACKLIST_AFTER_ROTATION": True,
    "UPDATE_LAST_LOGIN": True,
}

SPECTACULAR_SETTINGS = {
    "TITLE": "API de Daybed",
    "DESCRIPTION": (
        "Documentación de la API REST del backend para la tienda de muebles Daybed. "
        "Incluye autenticación, cuentas, catálogo, carrito, pedidos, inventario, "
        "entregas y dashboard administrativo."
    ),
    "VERSION": "0.1.0",
    "SERVE_INCLUDE_SCHEMA": False,
}

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"
