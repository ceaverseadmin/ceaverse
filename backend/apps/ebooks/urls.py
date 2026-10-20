from rest_framework.routers import DefaultRouter

from .views import BookAdminViewSet, BookViewSet

router = DefaultRouter()
router.register("admin/books", BookAdminViewSet, basename="admin-ebooks")
router.register("", BookViewSet, basename="ebooks")

urlpatterns = router.urls
