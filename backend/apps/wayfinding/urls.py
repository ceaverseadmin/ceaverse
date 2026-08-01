from rest_framework.routers import DefaultRouter

from .views import RoomLocationViewSet

router = DefaultRouter()
router.register("locations", RoomLocationViewSet, basename="locations")

urlpatterns = router.urls
