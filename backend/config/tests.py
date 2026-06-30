from django.conf import settings
from django.test import SimpleTestCase
from django.urls import reverse
from rest_framework.test import APIClient


class FoundationApiTests(SimpleTestCase):
    def setUp(self):
        self.client = APIClient()

    def test_health_endpoint_is_public(self):
        response = self.client.get(reverse("api-health"))

        assert response.status_code == 200
        assert response.json() == {"status": "ok"}

    def test_schema_endpoint_is_available(self):
        response = self.client.get(reverse("schema"))

        assert response.status_code == 200
        assert b"openapi" in response.content

    def test_backend_foundation_apps_are_registered(self):
        expected_apps = {
            "corsheaders",
            "django_filters",
            "drf_spectacular",
            "rest_framework",
            "apps.accounts",
            "apps.catalog",
            "apps.cart",
            "apps.orders",
            "apps.inventory",
            "apps.delivery",
            "apps.dashboard",
        }

        assert expected_apps.issubset(set(settings.INSTALLED_APPS))

    def test_drf_defaults_include_jwt_filters_and_schema(self):
        assert settings.REST_FRAMEWORK["DEFAULT_AUTHENTICATION_CLASSES"] == (
            "rest_framework_simplejwt.authentication.JWTAuthentication",
        )
        assert (
            "django_filters.rest_framework.DjangoFilterBackend"
            in settings.REST_FRAMEWORK["DEFAULT_FILTER_BACKENDS"]
        )
        assert (
            settings.REST_FRAMEWORK["DEFAULT_SCHEMA_CLASS"]
            == "drf_spectacular.openapi.AutoSchema"
        )

    def test_simplejwt_signing_key_is_not_the_short_placeholder_secret(self):
        assert len(settings.SIMPLE_JWT["SIGNING_KEY"]) >= 32
        assert settings.SIMPLE_JWT["SIGNING_KEY"] != "change-me"
