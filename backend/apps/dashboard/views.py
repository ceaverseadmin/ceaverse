"""Dashboard views — aggregate admin statistics."""
from accounts.models import ActivityLog
from accounts.permissions import IsAdminOrHigher
from accounts.serializers import ActivityLogSerializer
from django.contrib.auth import get_user_model
from ebooks.models import Book
from floorplans.models import Building
from lost_found.models import LostFoundItem
from rest_framework.response import Response
from rest_framework.views import APIView
from student_voice.models import VoiceSubmission
from wayfinding.models import RoomLocation

User = get_user_model()


class DashboardSummaryView(APIView):
    """Admin dashboard: content and moderation counts plus recent activity."""

    permission_classes = (IsAdminOrHigher,)

    def get(self, request):
        users = User.objects.all()
        lost_found = LostFoundItem.objects.all()
        voice = VoiceSubmission.objects.all()

        counts = {
            "users": {
                "total": users.count(),
                "super_admins": users.filter(role=User.Role.SUPER_ADMIN).count(),
                "admins": users.filter(role=User.Role.ADMIN).count(),
                "officers": users.filter(role=User.Role.OFFICER).count(),
            },
            "books": Book.objects.count(),
            "buildings": Building.objects.count(),
            "locations": RoomLocation.objects.count(),
            "lost_found": {
                "total": lost_found.count(),
                "open": lost_found.filter(
                    status=LostFoundItem.Status.OPEN
                ).count(),
                "matched": lost_found.filter(
                    status=LostFoundItem.Status.MATCHED
                ).count(),
                "resolved": lost_found.filter(
                    status=LostFoundItem.Status.RESOLVED
                ).count(),
            },
            "voice": {
                "total": voice.count(),
                "pending": voice.filter(status=VoiceSubmission.Status.PENDING).count(),
                "published": voice.filter(
                    status=VoiceSubmission.Status.PUBLISHED
                ).count(),
                "rejected": voice.filter(
                    status=VoiceSubmission.Status.REJECTED
                ).count(),
            },
        }

        recent_activity = ActivityLog.objects.select_related("user")[:10]
        return Response(
            {
                "success": True,
                "message": None,
                "data": {
                    "counts": counts,
                    "recent_activity": ActivityLogSerializer(
                        recent_activity, many=True
                    ).data,
                },
                "errors": None,
            }
        )
