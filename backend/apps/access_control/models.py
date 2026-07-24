from django.db import models


class OperationalPermission(models.Model):
    class Meta:
        managed = False
        default_permissions = ()
        verbose_name = "operational permission"
        verbose_name_plural = "operational permissions"

