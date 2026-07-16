from django.contrib.auth import get_user_model
from rest_framework import generics, status, viewsets
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView

from apps.accounts.permissions import IsAdmin
from apps.accounts.serializers import (
    CustomerRegistrationSerializer,
    InternalUserSerializer,
    LoginTokenSerializer,
    LogoutSerializer,
    UserProfileSerializer,
)

User = get_user_model()


class RegisterCustomerView(generics.CreateAPIView):
    permission_classes = (AllowAny,)
    serializer_class = CustomerRegistrationSerializer


class LoginTokenView(TokenObtainPairView):
    permission_classes = (AllowAny,)
    serializer_class = LoginTokenSerializer


class LogoutView(generics.GenericAPIView):
    permission_classes = (AllowAny,)
    serializer_class = LogoutSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(status=status.HTTP_204_NO_CONTENT)


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
