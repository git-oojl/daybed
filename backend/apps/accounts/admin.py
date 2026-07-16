from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

from apps.accounts.models import User


@admin.register(User)
class DaybedUserAdmin(UserAdmin):
    fieldsets = UserAdmin.fieldsets + (
        ("Daybed", {"fields": ("role", "phone", "state", "city")}),
    )
    add_fieldsets = UserAdmin.add_fieldsets + (
        ("Daybed", {"fields": ("email", "role", "phone", "state", "city")}),
    )
    list_display = (
        "username",
        "email",
        "first_name",
        "last_name",
        "role",
        "state",
        "city",
        "is_active",
        "is_staff",
    )
    list_filter = UserAdmin.list_filter + ("role",)
    search_fields = ("username", "email", "first_name", "last_name")
