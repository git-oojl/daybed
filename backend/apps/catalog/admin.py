from django.contrib import admin

from apps.catalog.models import Category, Product, ProductImage, ProductReview


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ("name", "slug", "active")
    list_filter = ("active",)
    prepopulated_fields = {"slug": ("name",)}
    search_fields = ("name", "description")


class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 0


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    inlines = (ProductImageInline,)
    list_display = (
        "sku",
        "name",
        "category",
        "price",
        "stock",
        "minimum_stock",
        "low_stock",
        "active",
    )
    list_filter = ("active", "category", "material", "color", "style")
    search_fields = ("sku", "name", "description", "material", "color", "style")
    fieldsets = (
        (
            None,
            {
                "fields": (
                    "sku",
                    "name",
                    "description",
                    "category",
                    "active",
                    "main_image",
                )
            },
        ),
        (
            "Precio e inventario",
            {"fields": ("price", "stock", "minimum_stock")},
        ),
        (
            "Atributos principales",
            {"fields": ("material", "color", "style")},
        ),
        (
            "Dimensiones estructuradas",
            {
                "fields": (
                    "width_cm",
                    "height_cm",
                    "depth_cm",
                    "length_cm",
                    "diameter_cm",
                    "weight_kg",
                )
            },
        ),
        ("Especificaciones flexibles", {"fields": ("specifications",)}),
    )


@admin.register(ProductImage)
class ProductImageAdmin(admin.ModelAdmin):
    list_display = ("product", "alt_text", "sort_order", "active")
    list_filter = ("active",)
    search_fields = ("product__name", "alt_text")


@admin.register(ProductReview)
class ProductReviewAdmin(admin.ModelAdmin):
    list_display = ("product", "user", "rating", "verified_purchase", "active", "created_at")
    list_filter = ("rating", "verified_purchase", "active")
    search_fields = ("product__name", "user__email", "title", "body")
    list_select_related = ("product", "user")
