from django.urls import path

from apps.dashboard.views import DashboardMetricsView

urlpatterns = [
    path("metrics/", DashboardMetricsView.as_view(), name="dashboard-metrics"),
]
