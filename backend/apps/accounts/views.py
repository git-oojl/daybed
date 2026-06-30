from django.contrib.auth import get_user_model
from rest_framework import generics, viewsets
from rest_framework.permissions import AllowAny, IsAuthenticated

from apps.accounts.permissions import IsAdmin
from apps.accounts.serializers import (
    CustomerRegistrationSerializer,
    InternalUserSerializer,
    UserProfileSerializer,
)

User = get_user_model()


class RegisterCustomerView(generics.CreateAPIView):
    permission_classes = (AllowAny,)
    serializer_class = CustomerRegistrationSerializer


class CurrentUserView(generics.RetrieveUpdateAPIView):
    permission_classes = (IsAuthenticated,)
    serializer_class = UserProfileSerializer

    def get_object(self):
        return self.request.user


class InternalUserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.order_by("id")
    serializer_class = InternalUserSerializer
    permission_classes = (IsAdmin,)
    http_method_names = ["get", "post", "put", "patch", "head", "options"]
