from rest_framework.routers import DefaultRouter

from .views import BuildingViewSet, FloorPlanViewSet

router = DefaultRouter()
router.register("buildings", BuildingViewSet, basename="buildings")
router.register("floor-plans", FloorPlanViewSet, basename="floor-plans")

urlpatterns = router.urls
