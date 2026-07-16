from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    class Roles(models.TextChoices):
        CUSTOMER = "cliente", "Cliente"
        EMPLOYEE = "empleado", "Empleado"
        ADMIN = "administrador", "Administrador"

    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=32, blank=True)
    state = models.CharField(max_length=120, blank=True)
    city = models.CharField(max_length=120, blank=True)
    role = models.CharField(
        max_length=20,
        choices=Roles.choices,
        default=Roles.CUSTOMER,
    )

    @property
    def is_customer(self):
        return self.role == self.Roles.CUSTOMER

    @property
    def is_employee(self):
        return self.role == self.Roles.EMPLOYEE

    @property
    def is_administrator(self):
        return self.role == self.Roles.ADMIN or self.is_superuser
