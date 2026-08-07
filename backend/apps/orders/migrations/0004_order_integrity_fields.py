from decimal import Decimal
from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    dependencies = [
        ("orders", "0003_order_payment_simulation"),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.AddField(model_name="order", name="delivery_notes", field=models.TextField(blank=True)),
        migrations.AddField(model_name="order", name="discount_total", field=models.DecimalField(decimal_places=2, default=Decimal("0.00"), max_digits=10)),
        migrations.AddField(model_name="order", name="internal_notes", field=models.TextField(blank=True)),
        migrations.AddField(model_name="order", name="stock_released_at", field=models.DateTimeField(blank=True, null=True)),
        migrations.CreateModel(
            name="OrderStatusEvent",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("from_status", models.CharField(blank=True, max_length=20)),
                ("to_status", models.CharField(choices=[("pending", "Pending"), ("confirmed", "Confirmed"), ("preparing", "Preparing"), ("shipped", "Shipped"), ("delivered", "Delivered"), ("cancelled", "Cancelled")], max_length=20)),
                ("note", models.CharField(blank=True, max_length=300)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("actor", models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name="order_status_events", to=settings.AUTH_USER_MODEL)),
                ("order", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="status_history", to="orders.order")),
            ],
            options={"ordering": ("created_at", "id")},
        ),
    ]
