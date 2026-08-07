from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [("store", "0002_global_daybed_settings")]

    operations = [
        migrations.CreateModel(
            name="ContactRequest",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("name", models.CharField(max_length=160)),
                ("email", models.EmailField(max_length=254)),
                ("subject", models.CharField(max_length=180)),
                ("message", models.TextField(max_length=2000)),
                ("order_code", models.CharField(blank=True, max_length=24)),
                ("status", models.CharField(choices=[("new", "Nuevo"), ("in_progress", "En seguimiento"), ("resolved", "Resuelto")], default="new", max_length=20)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
            ],
            options={"ordering": ("-created_at", "-id")},
        ),
    ]
