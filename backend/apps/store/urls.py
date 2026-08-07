from django.urls import path

from apps.store.views import ContactRequestView, StoreSettingsView

urlpatterns = [
    path("settings/", StoreSettingsView.as_view(), name="store-settings"),
    path("contact/", ContactRequestView.as_view(), name="store-contact"),
]

