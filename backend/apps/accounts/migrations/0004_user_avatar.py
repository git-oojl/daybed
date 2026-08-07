from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [("accounts", "0003_user_operational_permission_codes")]

    operations = [
        migrations.AddField(
            model_name="user",
            name="avatar",
            field=models.ImageField(blank=True, upload_to="avatars/"),
        ),
    ]
