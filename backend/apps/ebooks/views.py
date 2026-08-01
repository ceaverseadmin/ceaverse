"""Ebook views.

Public visitors can browse the active catalog; only staff roles can manage
books. The queryset automatically hides inactive books from the public.
"""
from accounts.permissions import IsAdminOrReadOnly
from rest_framework import viewsets

from .models import Book
from .serializers import BookSerializer


class BookViewSet(viewsets.ModelViewSet):
    queryset = Book.objects.all()
    serializer_class = BookSerializer
    permission_classes = (IsAdminOrReadOnly,)
    http_method_names = ["get", "post", "patch", "delete"]
    filterset_fields = ["category", "is_active"]
    search_fields = ["title", "author", "description"]
    ordering_fields = ["order", "created_at", "title"]
    ordering = ["order", "-created_at"]

    def get_queryset(self):
        queryset = super().get_queryset()
        user = self.request.user
        if not (user and user.is_authenticated and user.is_administrator):
            queryset = queryset.filter(is_active=True)
        return queryset
