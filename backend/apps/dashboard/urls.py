from django.urls import path

from .views import DashboardSummaryView, PublicStatsView

urlpatterns = [
    path("summary/", DashboardSummaryView.as_view(), name="dashboard-summary"),
    path("public-stats/", PublicStatsView.as_view(), name="public-stats"),
]
