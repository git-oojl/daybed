from django.urls import path

from apps.store.views import StoreSettingsView

urlpatterns = [
    path("settings/", StoreSettingsView.as_view(), name="store-settings"),
]

