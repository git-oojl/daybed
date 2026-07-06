from django.shortcuts import get_object_or_404
from drf_spectacular.utils import extend_schema, extend_schema_view
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.accounts.permissions import IsCustomer
from apps.cart.models import Cart, CartItem
from apps.cart.serializers import (
    CartItemQuantitySerializer,
    CartItemSerializer,
    CartItemWriteSerializer,
    CartSerializer,
)


class CustomerCartMixin:
    permission_classes = (IsCustomer,)

    def get_cart(self):
        cart, _created = Cart.objects.get_or_create(user=self.request.user)
        return cart


@extend_schema_view(
    get=extend_schema(
        summary="Consultar carrito",
        description="Devuelve el carrito activo del cliente autenticado.",
        responses=CartSerializer,
        tags=["Carrito"],
    ),
    delete=extend_schema(
        summary="Vaciar carrito",
        description="Elimina todos los productos del carrito del cliente.",
        responses=CartSerializer,
        tags=["Carrito"],
    ),
)
class CartDetailView(CustomerCartMixin, APIView):
    def get(self, request):
        return Response(CartSerializer(self.get_cart()).data)

    def delete(self, request):
        cart = self.get_cart()
        cart.items.all().delete()
        return Response(CartSerializer(cart).data)


@extend_schema_view(
    get=extend_schema(
        summary="Listar productos del carrito",
        description="Devuelve los productos agregados al carrito del cliente.",
        responses=CartItemSerializer(many=True),
        tags=["Carrito"],
    ),
    post=extend_schema(
        summary="Agregar producto al carrito",
        description=(
            "Agrega un producto activo al carrito. Si el producto ya existe en el "
            "carrito, se incrementa la cantidad."
        ),
        request=CartItemWriteSerializer,
        responses={201: CartItemSerializer, 200: CartItemSerializer},
        tags=["Carrito"],
    ),
)
class CartItemListView(CustomerCartMixin, generics.ListCreateAPIView):
    serializer_class = CartItemSerializer

    def get_queryset(self):
        if getattr(self, "swagger_fake_view", False):
            return CartItem.objects.none()
        return (
            self.get_cart()
            .items.select_related("product", "product__category")
            .prefetch_related("product__images")
        )

    def create(self, request, *args, **kwargs):
        serializer = CartItemWriteSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        cart = self.get_cart()
        product = serializer.validated_data["product"]
        quantity = serializer.validated_data["quantity"]

        item, created = CartItem.objects.get_or_create(
            cart=cart,
            product=product,
            defaults={"quantity": quantity},
        )
        if not created:
            item.quantity += quantity
            item.save(update_fields=("quantity", "updated_at"))

        status_code = status.HTTP_201_CREATED if created else status.HTTP_200_OK
        return Response(CartItemSerializer(item).data, status=status_code)


@extend_schema_view(
    get=extend_schema(
        summary="Consultar producto del carrito",
        description="Devuelve el detalle de un producto específico dentro del carrito.",
        responses=CartItemSerializer,
        tags=["Carrito"],
    ),
    put=extend_schema(
        summary="Actualizar cantidad del producto",
        description="Actualiza la cantidad de un producto dentro del carrito.",
        request=CartItemQuantitySerializer,
        responses=CartItemSerializer,
        tags=["Carrito"],
    ),
    patch=extend_schema(
        summary="Actualizar cantidad del producto parcialmente",
        description="Actualiza la cantidad de un producto dentro del carrito.",
        request=CartItemQuantitySerializer,
        responses=CartItemSerializer,
        tags=["Carrito"],
    ),
    delete=extend_schema(
        summary="Eliminar producto del carrito",
        description="Elimina un producto específico del carrito.",
        responses={204: None},
        tags=["Carrito"],
    ),
)
class CartItemDetailView(CustomerCartMixin, generics.RetrieveUpdateDestroyAPIView):
    serializer_class = CartItemSerializer
    http_method_names = ["get", "patch", "put", "delete", "head", "options"]

    def get_queryset(self):
        if getattr(self, "swagger_fake_view", False):
            return CartItem.objects.none()
        return (
            self.get_cart()
            .items.select_related("product", "product__category")
            .prefetch_related("product__images")
        )

    def update(self, request, *args, **kwargs):
        item = self.get_object()
        serializer = CartItemQuantitySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        item.quantity = serializer.validated_data["quantity"]
        item.save(update_fields=("quantity", "updated_at"))
        return Response(CartItemSerializer(item).data)

    def destroy(self, request, *args, **kwargs):
        item = get_object_or_404(self.get_queryset(), pk=kwargs["pk"])
        item.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
