# Generated manually for the Daybed product review feature.

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("catalog", "0003_remove_product_dimensions"),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name="ProductReview",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("rating", models.PositiveSmallIntegerField()),
                ("title", models.CharField(max_length=120)),
                ("body", models.TextField()),
                ("verified_purchase", models.BooleanField(default=False)),
                ("active", models.BooleanField(default=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("product", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="reviews", to="catalog.product")),
                ("user", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="product_reviews", to=settings.AUTH_USER_MODEL)),
            ],
            options={"ordering": ("-created_at", "-id")},
        ),
        migrations.AddConstraint(
            model_name="productreview",
            constraint=models.UniqueConstraint(fields=("product", "user"), name="unique_product_review_per_user"),
        ),
        migrations.AddConstraint(
            model_name="productreview",
            constraint=models.CheckConstraint(condition=models.Q(rating__gte=1, rating__lte=5), name="product_review_rating_between_1_and_5"),
        ),
    ]
