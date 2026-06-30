from django.urls import path

from apps.cart.views import CartDetailView, CartItemDetailView, CartItemListView

urlpatterns = [
    path("", CartDetailView.as_view(), name="cart-detail"),
    path("items/", CartItemListView.as_view(), name="cart-item-list"),
    path("items/<int:pk>/", CartItemDetailView.as_view(), name="cart-item-detail"),
]
