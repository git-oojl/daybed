from django.db.models import Prefetch
from rest_framework import generics, viewsets
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError

from apps.access_control.permissions import operational_permission
from apps.catalog.filters import (
    ProductFilter,
    SpecificationFilterMixin,
    StaffProductFilter,
)
from apps.catalog.models import Category, Product, ProductImage, ProductReview
from apps.catalog.serializers import (
    CategorySerializer,
    ProductReviewSerializer,
    ProductSerializer,
)


class PublicCategoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Category.objects.filter(active=True)
    serializer_class = CategorySerializer
    permission_classes = (AllowAny,)
    lookup_field = "slug"
    search_fields = ("name", "description")
    ordering_fields = ("name",)


class PublicProductViewSet(SpecificationFilterMixin, viewsets.ReadOnlyModelViewSet):
    serializer_class = ProductSerializer
    permission_classes = (AllowAny,)
    filterset_class = ProductFilter
    search_fields = (
        "sku",
        "name",
        "description",
        "material",
        "color",
        "style",
    )
    ordering_fields = ("name", "price", "stock", "created_at")

    def get_queryset(self):
        return (
            Product.objects.filter(active=True, category__active=True)
            .select_related("category")
            .prefetch_related(
                Prefetch(
                    "images",
                    queryset=ProductImage.objects.filter(active=True).order_by(
                        "sort_order",
                        "id",
                    ),
                ),
                Prefetch(
                    "reviews",
                    queryset=ProductReview.objects.filter(active=True)
                    .select_related("user")
                    .order_by("-created_at", "-id"),
                ),
            )
        )


class ProductReviewListCreateView(generics.ListCreateAPIView):
    serializer_class = ProductReviewSerializer

    def get_permissions(self):
        if self.request.method == "GET":
            return [AllowAny()]
        return [IsAuthenticated()]

    def get_queryset(self):
        return (
            ProductReview.objects.filter(
                product_id=self.kwargs["product_id"],
                product__active=True,
                active=True,
            )
            .select_related("user", "product")
            .order_by("-created_at", "-id")
        )

    def perform_create(self, serializer):
        product = Product.objects.filter(
            pk=self.kwargs["product_id"],
            active=True,
        ).first()
        if product is None:
            raise ValidationError({"product": "El producto no está disponible."})
        if ProductReview.objects.filter(product=product, user=self.request.user).exists():
            raise ValidationError(
                {"detail": "Ya publicaste una reseña para este producto."}
            )

        from apps.orders.models import OrderItem

        verified_purchase = OrderItem.objects.filter(
            order__user=self.request.user,
            product=product,
            order__status="delivered",
        ).exists()
        serializer.save(
            product=product,
            user=self.request.user,
            verified_purchase=verified_purchase,
        )


class StaffCategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.order_by("name")
    serializer_class = CategorySerializer
    lookup_field = "slug"
    search_fields = ("name", "description")
    ordering_fields = ("name", "active", "created_at")

    def get_permissions(self):
        permission_by_action = {
            "list": "products.view",
            "retrieve": "products.view",
            "create": "products.create",
            "update": "products.update",
            "partial_update": "products.update",
            "destroy": "products.deactivate",
        }
        permission_code = permission_by_action.get(self.action, "products.view")
        return [operational_permission(permission_code)()]

    def destroy(self, request, *args, **kwargs):
        category = self.get_object()
        category.active = False
        category.save(update_fields=("active", "updated_at"))
        return Response(self.get_serializer(category).data)


class StaffProductViewSet(SpecificationFilterMixin, viewsets.ModelViewSet):
    queryset = (
        Product.objects.select_related("category")
        .prefetch_related(
            "images",
            Prefetch(
                "reviews",
                queryset=ProductReview.objects.filter(active=True)
                .select_related("user")
                .order_by("-created_at", "-id"),
            ),
        )
        .order_by("name")
    )
    serializer_class = ProductSerializer
    filterset_class = StaffProductFilter
    search_fields = (
        "sku",
        "name",
        "description",
        "material",
        "color",
        "style",
    )
    ordering_fields = (
        "name",
        "price",
        "stock",
        "minimum_stock",
        "active",
        "created_at",
    )

    def get_permissions(self):
        permission_by_action = {
            "list": "products.view",
            "retrieve": "products.view",
            "create": "products.create",
            "update": "products.update",
            "partial_update": "products.update",
            "destroy": "products.deactivate",
        }
        permission_code = permission_by_action.get(self.action, "products.view")
        return [operational_permission(permission_code)()]

    def destroy(self, request, *args, **kwargs):
        product = self.get_object()
        product.active = False
        product.save(update_fields=("active", "updated_at"))
        return Response(self.get_serializer(product).data)
