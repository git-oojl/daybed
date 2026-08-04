from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [("accounts", "0002_user_city_user_state")]

    operations = [
        migrations.AddField(
            model_name="user",
            name="operational_permission_codes",
            field=models.JSONField(
                blank=True,
                default=None,
                help_text="Optional per-employee operational permission override.",
                null=True,
            ),
        ),
    ]
