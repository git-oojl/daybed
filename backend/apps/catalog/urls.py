from django.urls import include, path
from rest_framework.routers import DefaultRouter

from apps.catalog.views import (
    PublicCategoryViewSet,
    PublicProductViewSet,
    ProductReviewListCreateView,
    StaffCategoryViewSet,
    StaffProductViewSet,
)

public_router = DefaultRouter()
public_router.register("categories", PublicCategoryViewSet, basename="catalog-category")
public_router.register("products", PublicProductViewSet, basename="catalog-product")

staff_router = DefaultRouter()
staff_router.register("categories", StaffCategoryViewSet, basename="staff-category")
staff_router.register("products", StaffProductViewSet, basename="staff-product")

urlpatterns = [
    path(
        "products/<int:product_id>/reviews/",
        ProductReviewListCreateView.as_view(),
        name="product-review-list-create",
    ),
    path("", include(public_router.urls)),
    path("manage/", include(staff_router.urls)),
]
