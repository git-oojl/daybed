from decimal import Decimal
from django.db import migrations, models
from django.core.validators import MinValueValidator


class Migration(migrations.Migration):
    dependencies = [("store", "0001_initial")]

    operations = [
        migrations.AddField(model_name="storesettings", name="announcement_message", field=models.CharField(blank=True, max_length=220)),
        migrations.AddField(model_name="storesettings", name="business_hours", field=models.CharField(default="Lun–Sáb · 10:00–19:00", max_length=220)),
        migrations.AddField(model_name="storesettings", name="cancellation_window_hours", field=models.PositiveIntegerField(default=12)),
        migrations.AddField(model_name="storesettings", name="currency", field=models.CharField(default="MXN", max_length=8)),
        migrations.AddField(model_name="storesettings", name="default_low_stock_threshold", field=models.PositiveIntegerField(default=2)),
        migrations.AddField(model_name="storesettings", name="default_preparation_days", field=models.PositiveIntegerField(default=4)),
        migrations.AddField(model_name="storesettings", name="facebook_url", field=models.URLField(blank=True)),
        migrations.AddField(model_name="storesettings", name="instagram_url", field=models.URLField(blank=True)),
        migrations.AddField(model_name="storesettings", name="maximum_delivery_radius_km", field=models.DecimalField(decimal_places=2, default=Decimal("80.00"), max_digits=8, validators=[MinValueValidator(Decimal("0.00"))])),
        migrations.AddField(model_name="storesettings", name="storefront_available", field=models.BooleanField(default=True)),
        migrations.AddField(model_name="storesettings", name="support_instructions", field=models.TextField(blank=True, default="Escríbenos con tu número de pedido y te ayudaremos.")),
    ]
