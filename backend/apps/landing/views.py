"""Landing page views.

The public content endpoint is open to everyone; content administration is
restricted to staff roles via the section and list viewsets.
"""
from accounts.permissions import IsAdminOrHigher
from rest_framework import viewsets
from rest_framework.generics import RetrieveUpdateAPIView
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import (
    AboutSection,
    ContactSection,
    DownloadableLink,
    Hero,
    MissionSection,
    ServiceCard,
    VisionSection,
)
from .serializers import (
    AboutSectionSerializer,
    ContactSectionSerializer,
    DownloadableLinkSerializer,
    HeroSerializer,
    LandingContentSerializer,
    MissionSectionSerializer,
    ServiceCardSerializer,
    VisionSectionSerializer,
)


class LandingContentView(APIView):
    """Public aggregate of every landing page section."""

    permission_classes = (AllowAny,)

    def get(self, request):
        content = {
            "hero": Hero.load(),
            "about": AboutSection.load(),
            "mission": MissionSection.load(),
            "vision": VisionSection.load(),
            "contact": ContactSection.load(),
            "service_cards": ServiceCard.objects.filter(is_active=True),
            "downloadable_links": DownloadableLink.objects.filter(is_active=True),
        }
        serializer = LandingContentSerializer(
            content, context={"request": request}
        )
        return Response(
            {
                "success": True,
                "message": None,
                "data": serializer.data,
                "errors": None,
            }
        )


class SingletonSectionView(RetrieveUpdateAPIView):
    """Admin view that reads/updates a single-instance landing section."""

    permission_classes = (IsAdminOrHigher,)
    model_class = None
    serializer_class = None

    def get_object(self):
        return self.model_class.load()


class HeroView(SingletonSectionView):
    model_class = Hero
    serializer_class = HeroSerializer


class AboutView(SingletonSectionView):
    model_class = AboutSection
    serializer_class = AboutSectionSerializer


class MissionView(SingletonSectionView):
    model_class = MissionSection
    serializer_class = MissionSectionSerializer


class VisionView(SingletonSectionView):
    model_class = VisionSection
    serializer_class = VisionSectionSerializer


class ContactView(SingletonSectionView):
    model_class = ContactSection
    serializer_class = ContactSectionSerializer


class ServiceCardViewSet(viewsets.ModelViewSet):
    queryset = ServiceCard.objects.all()
    serializer_class = ServiceCardSerializer
    permission_classes = (IsAdminOrHigher,)
    http_method_names = ["get", "post", "patch", "delete"]
    filterset_fields = ["is_active"]
    ordering_fields = ["order", "created_at"]
    ordering = ["order", "created_at"]


class DownloadableLinkViewSet(viewsets.ModelViewSet):
    queryset = DownloadableLink.objects.all()
    serializer_class = DownloadableLinkSerializer
    permission_classes = (IsAdminOrHigher,)
    http_method_names = ["get", "post", "patch", "delete"]
    filterset_fields = ["is_active"]
    ordering_fields = ["order", "created_at"]
    ordering = ["order", "created_at"]
