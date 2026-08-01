from django.urls import path
from rest_framework.routers import DefaultRouter

from .views import LostFoundItemViewSet, PublicItemListView, TrackItemView

router = DefaultRouter()
router.register("admin/items", LostFoundItemViewSet, basename="lost-found-items")

urlpatterns = [
    path("items/", PublicItemListView.as_view(), name="lost-found-items-public"),
    path("track/<str:tracking_code>/", TrackItemView.as_view(), name="lost-found-track"),
]
urlpatterns += router.urls
