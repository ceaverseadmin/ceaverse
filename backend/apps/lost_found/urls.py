from django.urls import path
from rest_framework.routers import DefaultRouter

from .views import (
    ClaimItemView,
    LostFoundItemViewSet,
    PublicItemListView,
)

router = DefaultRouter()
router.register("admin/items", LostFoundItemViewSet, basename="lost-found-items")

urlpatterns = [
    path("items/", PublicItemListView.as_view(), name="lost-found-items-public"),
    path(
        "items/<uuid:pk>/claim/",
        ClaimItemView.as_view(),
        name="lost-found-claim",
    ),
]
urlpatterns += router.urls
