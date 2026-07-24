# Generated manually for the Daybed store configuration app.

from decimal import Decimal

import django.core.validators
import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):
    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name="StoreSettings",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("store_name", models.CharField(default="Daybed", max_length=160)),
                (
                    "contact_phone",
                    models.CharField(default="+52 664 000 0000", max_length=32),
                ),
                (
                    "contact_email",
                    models.EmailField(default="contacto@daybed.local", max_length=254),
                ),
                (
                    "street",
                    models.CharField(default="Sucursal principal", max_length=180),
                ),
                (
                    "neighborhood",
                    models.CharField(default="Zona Centro", max_length=120),
                ),
                ("city", models.CharField(default="Tijuana", max_length=120)),
                (
                    "state",
                    models.CharField(default="Baja California", max_length=120),
                ),
                ("postal_code", models.CharField(default="22000", max_length=20)),
                (
                    "latitude",
                    models.DecimalField(decimal_places=8, max_digits=12),
                ),
                (
                    "longitude",
                    models.DecimalField(decimal_places=8, max_digits=12),
                ),
                (
                    "delivery_base_fee",
                    models.DecimalField(
                        decimal_places=2,
                        max_digits=10,
                        validators=[
                            django.core.validators.MinValueValidator(Decimal("0.00"))
                        ],
                    ),
                ),
                (
                    "delivery_price_per_km",
                    models.DecimalField(
                        decimal_places=2,
                        max_digits=10,
                        validators=[
                            django.core.validators.MinValueValidator(Decimal("0.00"))
                        ],
                    ),
                ),
                (
                    "free_shipping_threshold",
                    models.DecimalField(
                        blank=True,
                        decimal_places=2,
                        max_digits=10,
                        null=True,
                        validators=[
                            django.core.validators.MinValueValidator(Decimal("0.00"))
                        ],
                    ),
                ),
                ("show_cart_estimate", models.BooleanField(default=True)),
                ("is_active", models.BooleanField(default=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                (
                    "updated_by",
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.SET_NULL,
                        related_name="store_settings_updates",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
            ],
            options={
                "verbose_name": "store settings",
                "verbose_name_plural": "store settings",
            },
        ),
        migrations.AddConstraint(
            model_name="storesettings",
            constraint=models.UniqueConstraint(
                condition=models.Q(("is_active", True)),
                fields=("is_active",),
                name="store_single_active_settings",
            ),
        ),
    ]
