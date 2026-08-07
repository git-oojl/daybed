from django.db import models
from django.utils.text import slugify


class Category(models.Model):
    name = models.CharField(max_length=120, unique=True)
    slug = models.SlugField(max_length=140, unique=True, blank=True)
    description = models.TextField(blank=True)
    specification_schema = models.JSONField(default=list, blank=True)
    filter_attributes = models.JSONField(default=list, blank=True)
    image = models.ImageField(upload_to="collections/", blank=True)
    display_order = models.PositiveIntegerField(default=0)
    homepage_visible = models.BooleanField(default=False)
    active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ("display_order", "name")
        verbose_name_plural = "categories"

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class Product(models.Model):
    sku = models.CharField(max_length=64, unique=True, null=True, blank=True)
    name = models.CharField(max_length=180)
    description = models.TextField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    category = models.ForeignKey(
        Category,
        on_delete=models.PROTECT,
        related_name="products",
    )
    material = models.CharField(max_length=120, blank=True)
    color = models.CharField(max_length=80, blank=True)
    style = models.CharField(max_length=80, blank=True)
    room = models.CharField(max_length=80, blank=True)
    furniture_type = models.CharField(max_length=80, blank=True)
    has_storage = models.BooleanField(default=False)
    is_sofa_bed = models.BooleanField(default=False)
    featured = models.BooleanField(default=False)
    featured_order = models.PositiveIntegerField(default=0)
    width_cm = models.DecimalField(
        max_digits=8, decimal_places=2, null=True, blank=True
    )
    height_cm = models.DecimalField(
        max_digits=8, decimal_places=2, null=True, blank=True
    )
    depth_cm = models.DecimalField(
        max_digits=8, decimal_places=2, null=True, blank=True
    )
    length_cm = models.DecimalField(
        max_digits=8, decimal_places=2, null=True, blank=True
    )
    diameter_cm = models.DecimalField(
        max_digits=8, decimal_places=2, null=True, blank=True
    )
    weight_kg = models.DecimalField(
        max_digits=8, decimal_places=2, null=True, blank=True
    )
    specifications = models.JSONField(default=dict, blank=True)
    main_image = models.ImageField(upload_to="products/", blank=True)
    stock = models.PositiveIntegerField(default=0)
    minimum_stock = models.PositiveIntegerField(default=0)
    active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ("featured_order", "name")
        indexes = [
            models.Index(fields=("active", "category")),
            models.Index(fields=("price",)),
            models.Index(fields=("featured", "featured_order")),
            models.Index(fields=("room",)),
            models.Index(fields=("width_cm",)),
            models.Index(fields=("height_cm",)),
            models.Index(fields=("depth_cm",)),
        ]
        constraints = [
            models.CheckConstraint(
                condition=models.Q(width_cm__gte=0) | models.Q(width_cm__isnull=True),
                name="product_width_cm_non_negative",
            ),
            models.CheckConstraint(
                condition=models.Q(height_cm__gte=0) | models.Q(height_cm__isnull=True),
                name="product_height_cm_non_negative",
            ),
            models.CheckConstraint(
                condition=models.Q(depth_cm__gte=0) | models.Q(depth_cm__isnull=True),
                name="product_depth_cm_non_negative",
            ),
            models.CheckConstraint(
                condition=models.Q(length_cm__gte=0) | models.Q(length_cm__isnull=True),
                name="product_length_cm_non_negative",
            ),
            models.CheckConstraint(
                condition=(
                    models.Q(diameter_cm__gte=0) | models.Q(diameter_cm__isnull=True)
                ),
                name="product_diameter_cm_non_negative",
            ),
            models.CheckConstraint(
                condition=models.Q(weight_kg__gte=0) | models.Q(weight_kg__isnull=True),
                name="product_weight_kg_non_negative",
            ),
        ]

    @property
    def low_stock(self):
        return self.stock <= self.minimum_stock

    @property
    def structured_dimensions(self):
        return {
            "width_cm": self.width_cm,
            "height_cm": self.height_cm,
            "depth_cm": self.depth_cm,
            "length_cm": self.length_cm,
            "diameter_cm": self.diameter_cm,
            "weight_kg": self.weight_kg,
        }

    def save(self, *args, **kwargs):
        if self.sku == "":
            self.sku = None
        should_generate_sku = not self.sku
        super().save(*args, **kwargs)
        if should_generate_sku:
            self.sku = f"DAY-{self.pk:05d}"
            type(self).objects.filter(pk=self.pk, sku__isnull=True).update(sku=self.sku)

    def __str__(self):
        return self.name


class ProductImage(models.Model):
    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name="images",
    )
    image = models.ImageField(upload_to="products/gallery/")
    alt_text = models.CharField(max_length=180, blank=True)
    sort_order = models.PositiveIntegerField(default=0)
    active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ("sort_order", "id")

    def __str__(self):
        return self.alt_text or f"Image for {self.product}"


class ProductReview(models.Model):
    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name="reviews",
    )
    user = models.ForeignKey(
        "accounts.User",
        on_delete=models.CASCADE,
        related_name="product_reviews",
    )
    rating = models.PositiveSmallIntegerField()
    title = models.CharField(max_length=120)
    body = models.TextField()
    verified_purchase = models.BooleanField(default=False)
    active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ("-created_at", "-id")
        constraints = [
            models.UniqueConstraint(
                fields=("product", "user"),
                name="unique_product_review_per_user",
            ),
            models.CheckConstraint(
                condition=models.Q(rating__gte=1, rating__lte=5),
                name="product_review_rating_between_1_and_5",
            ),
        ]

    def __str__(self):
        return f"{self.product} · {self.rating}/5 · {self.user}"
