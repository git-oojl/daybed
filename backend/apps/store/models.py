from decimal import Decimal

from django.conf import settings
from django.core.exceptions import ValidationError
from django.core.validators import MinValueValidator
from django.db import models


def _decimal_setting(name):
    return Decimal(str(getattr(settings, name)))


class StoreSettings(models.Model):
    store_name = models.CharField(max_length=160, default="Daybed")
    contact_phone = models.CharField(max_length=32, default="+52 664 000 0000")
    contact_email = models.EmailField(default="contacto@daybed.local")
    business_hours = models.CharField(max_length=220, default="Lun–Sáb · 10:00–19:00")
    support_instructions = models.TextField(blank=True, default="Escríbenos con tu número de pedido y te ayudaremos.")
    street = models.CharField(max_length=180, default="Sucursal principal")
    neighborhood = models.CharField(max_length=120, default="Zona Centro")
    city = models.CharField(max_length=120, default="Tijuana")
    state = models.CharField(max_length=120, default="Baja California")
    postal_code = models.CharField(max_length=20, default="22000")
    latitude = models.DecimalField(max_digits=12, decimal_places=8)
    longitude = models.DecimalField(max_digits=12, decimal_places=8)
    delivery_base_fee = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(Decimal("0.00"))],
    )
    delivery_price_per_km = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(Decimal("0.00"))],
    )
    maximum_delivery_radius_km = models.DecimalField(
        max_digits=8,
        decimal_places=2,
        validators=[MinValueValidator(Decimal("0.00"))],
        default=Decimal("80.00"),
    )
    free_shipping_threshold = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(Decimal("0.00"))],
        null=True,
        blank=True,
    )
    currency = models.CharField(max_length=8, default="MXN")
    cancellation_window_hours = models.PositiveIntegerField(default=12)
    default_low_stock_threshold = models.PositiveIntegerField(default=2)
    default_preparation_days = models.PositiveIntegerField(default=4)
    announcement_message = models.CharField(max_length=220, blank=True)
    instagram_url = models.URLField(blank=True)
    facebook_url = models.URLField(blank=True)
    storefront_available = models.BooleanField(default=True)
    show_cart_estimate = models.BooleanField(default=True)
    is_active = models.BooleanField(default=True)
    updated_at = models.DateTimeField(auto_now=True)
    updated_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        related_name="store_settings_updates",
        null=True,
        blank=True,
    )

    class Meta:
        verbose_name = "store settings"
        verbose_name_plural = "store settings"
        constraints = [
            models.UniqueConstraint(
                fields=("is_active",),
                condition=models.Q(is_active=True),
                name="store_single_active_settings",
            ),
        ]

    def __str__(self):
        return self.store_name

    @classmethod
    def bootstrap_defaults(cls):
        return {
            "store_name": "Daybed",
            "contact_phone": "+52 664 000 0000",
            "contact_email": "contacto@daybed.local",
            "business_hours": "Lun–Sáb · 10:00–19:00",
            "support_instructions": "Escríbenos con tu número de pedido y te ayudaremos.",
            "street": "Sucursal principal",
            "neighborhood": "Zona Centro",
            "city": "Tijuana",
            "state": "Baja California",
            "postal_code": "22000",
            "latitude": _decimal_setting("STORE_LATITUDE"),
            "longitude": _decimal_setting("STORE_LONGITUDE"),
            "delivery_base_fee": _decimal_setting("DELIVERY_BASE_FEE"),
            "delivery_price_per_km": _decimal_setting("DELIVERY_PRICE_PER_KM"),
            "maximum_delivery_radius_km": Decimal("80.00"),
            "free_shipping_threshold": None,
            "currency": "MXN",
            "cancellation_window_hours": 12,
            "default_low_stock_threshold": 2,
            "default_preparation_days": 4,
            "announcement_message": "",
            "instagram_url": "",
            "facebook_url": "",
            "storefront_available": True,
            "show_cart_estimate": True,
            "is_active": True,
        }

    @classmethod
    def get_active(cls):
        settings_object = cls.objects.filter(is_active=True).first()
        if settings_object:
            return settings_object

        settings_object = cls(**cls.bootstrap_defaults())
        settings_object.full_clean()
        settings_object.save()
        return settings_object

    def clean(self):
        errors = {}

        if self.latitude is not None and not (
            Decimal("-90.00000000") <= self.latitude <= Decimal("90.00000000")
        ):
            errors["latitude"] = "Latitude must be between -90 and 90."

        if self.longitude is not None and not (
            Decimal("-180.00000000")
            <= self.longitude
            <= Decimal("180.00000000")
        ):
            errors["longitude"] = "Longitude must be between -180 and 180."

        for field in (
            "delivery_base_fee",
            "delivery_price_per_km",
            "maximum_delivery_radius_km",
            "free_shipping_threshold",
        ):
            value = getattr(self, field)
            if value is not None and value < Decimal("0.00"):
                errors[field] = "Value cannot be negative."

        if self.is_active:
            duplicate = type(self).objects.filter(is_active=True)
            if self.pk:
                duplicate = duplicate.exclude(pk=self.pk)
            if duplicate.exists():
                errors["is_active"] = (
                    "Only one active store settings record is allowed."
                )

        if self.pk is None and type(self).objects.exists():
            errors["is_active"] = "Store settings are singleton-style."

        if errors:
            raise ValidationError(errors)

    def save(self, *args, **kwargs):
        self.full_clean()
        return super().save(*args, **kwargs)


class ContactRequest(models.Model):
    class Status(models.TextChoices):
        NEW = "new", "Nuevo"
        IN_PROGRESS = "in_progress", "En seguimiento"
        RESOLVED = "resolved", "Resuelto"

    name = models.CharField(max_length=160)
    email = models.EmailField()
    subject = models.CharField(max_length=180)
    message = models.TextField(max_length=2000)
    order_code = models.CharField(max_length=24, blank=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.NEW)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ("-created_at", "-id")

    def __str__(self):
        return f"{self.subject} · {self.email}"
