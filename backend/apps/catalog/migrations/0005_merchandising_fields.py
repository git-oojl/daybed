from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [("catalog", "0004_productreview")]

    operations = [
        migrations.AddField(model_name="category", name="display_order", field=models.PositiveIntegerField(default=0)),
        migrations.AddField(model_name="category", name="filter_attributes", field=models.JSONField(blank=True, default=list)),
        migrations.AddField(model_name="category", name="homepage_visible", field=models.BooleanField(default=False)),
        migrations.AddField(model_name="category", name="image", field=models.ImageField(blank=True, upload_to="collections/")),
        migrations.AddField(model_name="product", name="featured", field=models.BooleanField(default=False)),
        migrations.AddField(model_name="product", name="featured_order", field=models.PositiveIntegerField(default=0)),
        migrations.AddField(model_name="product", name="furniture_type", field=models.CharField(blank=True, max_length=80)),
        migrations.AddField(model_name="product", name="has_storage", field=models.BooleanField(default=False)),
        migrations.AddField(model_name="product", name="is_sofa_bed", field=models.BooleanField(default=False)),
        migrations.AddField(model_name="product", name="room", field=models.CharField(blank=True, max_length=80)),
        migrations.AlterModelOptions(name="category", options={"ordering": ("display_order", "name"), "verbose_name_plural": "categories"}),
        migrations.AlterModelOptions(name="product", options={"ordering": ("featured_order", "name")}),
        migrations.AddIndex(model_name="product", index=models.Index(fields=["featured", "featured_order"], name="catalog_pro_feature_d38956_idx")),
        migrations.AddIndex(model_name="product", index=models.Index(fields=["room"], name="catalog_pro_room_aaf7dd_idx")),
    ]
