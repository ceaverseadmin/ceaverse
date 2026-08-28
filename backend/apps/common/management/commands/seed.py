"""Seed development data for the EA-CSC Web Portal.

Idempotent by default: existing rows are left untouched so re-running the
command never duplicates content. Use ``--force`` to wipe the seeded content
and restore the defaults (useful after schema changes or experiments).
"""
import io

from accounts.models import User
from django.core.files.base import ContentFile
from django.core.management.base import BaseCommand
from ebooks.models import Book
from floorplans.models import Building, FloorPlan
from landing.models import (
    AboutSection,
    ContactSection,
    DownloadableLink,
    Hero,
    MissionSection,
    ServiceCard,
    VisionSection,
)
from wayfinding.models import RoomLocation

DEFAULT_PASSWORD = "TestPass123!"


def build_placeholder_pdf(text: str = "EA-CSC Web Portal") -> bytes:
    """Return a small, structurally valid single-page PDF."""
    content = f"BT /F1 24 Tf 72 720 Td ({text}) Tj ET".encode()
    objects = [
        b"<< /Type /Catalog /Pages 2 0 R >>",
        b"<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
        b"<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] "
        b"/Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>",
        b"<< /Length %d >>\nstream\n%s\nendstream" % (len(content), content),
        b"<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    ]
    body = io.BytesIO()
    body.write(b"%PDF-1.4\n")
    offsets = []
    for index, obj in enumerate(objects, start=1):
        offsets.append(body.tell())
        body.write(f"{index} 0 obj\n".encode())
        body.write(obj)
        body.write(b"\nendobj\n")
    xref_position = body.tell()
    body.write(f"xref\n0 {len(objects) + 1}\n".encode())
    body.write(b"0000000000 65535 f \n")
    for offset in offsets:
        body.write(f"{offset:010d} 00000 n \n".encode())
    body.write(f"trailer\n<< /Size {len(objects) + 1} /Root 1 0 R >>\n".encode())
    body.write(f"startxref\n{xref_position}\n%%EOF\n".encode())
    return body.getvalue()


def save_pdf(field, text: str, filename: str):
    """Save generated PDF bytes onto a FileField."""
    field.save(f"seed/{filename}", ContentFile(build_placeholder_pdf(text)))


class Command(BaseCommand):
    help = "Seed development content for the EA-CSC Web Portal."

    def add_arguments(self, parser):
        parser.add_argument(
            "--force",
            action="store_true",
            help="Delete existing seeded content and restore defaults.",
        )

    def handle(self, *args, **options):
        force = options["force"]
        self.seed_users()
        self.seed_landing(force=force)
        self.seed_ebooks(force=force)
        self.seed_buildings(force=force)
        self.stdout.write(self.style.SUCCESS("Seed complete."))

    # ------------------------------------------------------------------
    # Users
    # ------------------------------------------------------------------
    def seed_users(self):
        if not User.objects.filter(role=User.Role.SUPER_ADMIN).exists():
            User.objects.create_superuser(
                email="admin@ea.edu",
                full_name="Portal Administrator",
                password=DEFAULT_PASSWORD,
            )
            self.stdout.write("  + super admin admin@ea.edu")

        for email, name, role in (
            ("officer@ea.edu", "Student Affairs Officer", User.Role.OFFICER),
            ("admin2@ea.edu", "Department Admin", User.Role.ADMIN),
        ):
            user, created = User.objects.get_or_create(
                email=email,
                defaults={
                    "full_name": name,
                    "role": role,
                    "is_active": True,
                },
            )
            if created:
                user.set_password(DEFAULT_PASSWORD)
                user.save(update_fields=["password"])
                self.stdout.write(f"  + {role} {email}")

    # ------------------------------------------------------------------
    # Landing
    # ------------------------------------------------------------------
    def seed_landing(self, *, force):
        if force:
            ServiceCard.objects.all().delete()
            DownloadableLink.objects.all().delete()

        defaults = {
            "hero": {
                "title": "College of Engineering & Architecture",
                "subtitle": (
                    "One portal for ebooks, lost & found, student voice, "
                    "floor plans, and wayfinding."
                ),
                "cta_label": "Browse resources",
                "cta_url": "/ebooks",
                "is_active": True,
            },
            "about": {
                "title": "About the college",
                "content": (
                    "The College of Engineering & Architecture prepares future "
                    "engineers and architects through hands-on learning, strong "
                    "industry links, and a culture of service."
                ),
            },
            "mission": {
                "content": (
                    "To produce competent, ethical, and globally competitive "
                    "engineering and architecture professionals."
                ),
            },
            "vision": {
                "content": (
                    "To be a center of excellence in engineering and "
                    "architecture education."
                ),
            },
            "contact": {
                "email": "cea@university.edu.ph",
                "phone": "(02) 8123-4567",
                "address": "Engineering Building, Main Campus",
                "map_link": "",
                "working_hours": "Mon-Fri, 8:00 AM - 5:00 PM",
            },
        }

        sections = {
            "hero": (Hero, defaults["hero"]),
            "about": (AboutSection, defaults["about"]),
            "mission": (MissionSection, defaults["mission"]),
            "vision": (VisionSection, defaults["vision"]),
            "contact": (ContactSection, defaults["contact"]),
        }
        for _name, (model, values) in sections.items():
            if force or not model.objects.exists():
                instance = model.load()
                for key, value in values.items():
                    setattr(instance, key, value)
                instance.save()
                self.stdout.write(f"  + landing/{_name}")

        if force or not ServiceCard.objects.exists():
            for index, card in enumerate(
                (
                    ("book", "Ebook library", "Download study materials and references."),
                    ("search", "Lost & found", "Report and track lost items on campus."),
                    ("message-square", "Student voice", "Share feedback and shout-outs."),
                    ("compass", "Wayfinding", "Find rooms and offices by building."),
                )
            ):
                ServiceCard.objects.create(
                    icon=card[0],
                    title=card[1],
                    description=card[2],
                    order=index,
                )
            self.stdout.write("  + landing/service-cards (4)")

        if force or not DownloadableLink.objects.exists():
            for index, link in enumerate(
                (
                    (
                        "College handbook",
                        "Official student handbook and policies.",
                        "https://example.edu/cea-handbook.pdf",
                    ),
                    (
                        "Curriculum checklist",
                        "Curriculum and subject checklist per program.",
                        "https://example.edu/cea-curriculum.pdf",
                    ),
                    (
                        "Scholarship forms",
                        "Application forms for available scholarships.",
                        "https://example.edu/cea-scholarships.pdf",
                    ),
                )
            ):
                DownloadableLink.objects.create(
                    label=link[0],
                    description=link[1],
                    external_url=link[2],
                    order=index,
                )
            self.stdout.write("  + landing/downloadable-links (3)")

    # ------------------------------------------------------------------
    # Ebooks
    # ------------------------------------------------------------------
    def seed_ebooks(self, *, force):
        if force:
            Book.objects.all().delete()

        if Book.objects.exists():
            self.stdout.write("  - ebooks skipped (use --force to reset)")
            return

        catalog = [
            {
                "title": "Engineering Mathematics",
                "author": "K. A. Stroud",
                "description": "Foundation math for engineering students.",
                "category": Book.Category.TEXTBOOK,
                "pages": 528,
                "order": 1,
                "slug": "engineering-mathematics",
            },
            {
                "title": "Statics & Dynamics",
                "author": "R. C. Hibbeler",
                "description": "Mechanics fundamentals with worked examples.",
                "category": Book.Category.TEXTBOOK,
                "pages": 752,
                "order": 2,
                "slug": "statics-and-dynamics",
            },
            {
                "title": "Structural Analysis Module",
                "author": "CEA Faculty",
                "description": "Course module on structural analysis.",
                "category": Book.Category.MODULE,
                "pages": 64,
                "order": 3,
                "slug": "structural-analysis",
            },
            {
                "title": "Architectural Design Reference",
                "author": "CEA Library",
                "description": "Quick reference for architectural design basics.",
                "category": Book.Category.REFERENCE,
                "pages": 120,
                "order": 4,
                "slug": "architectural-design",
            },
            {
                "title": "BS Architecture Syllabus",
                "author": "College Registrar",
                "description": "Official curriculum and syllabus document.",
                "category": Book.Category.SYLLABUS,
                "pages": 36,
                "order": 5,
                "slug": "bs-architecture-syllabus",
            },
            {
                "title": "Electrical Circuits Module",
                "author": "ECE Department",
                "description": "Introductory module for electrical circuits.",
                "category": Book.Category.MODULE,
                "pages": 88,
                "order": 6,
                "slug": "electrical-circuits",
            },
        ]
        for entry in catalog:
            book = Book(
                title=entry["title"],
                author=entry["author"],
                description=entry["description"],
                category=entry["category"],
                pages=entry["pages"],
                order=entry["order"],
                is_active=True,
            )
            save_pdf(book.file, entry["title"], entry["slug"])
            book.save()
            self.stdout.write(f"  + ebook {entry['title']}")
        self.stdout.write(f"  + ebooks ({len(catalog)})")

    # ------------------------------------------------------------------
    # Buildings, floor plans, wayfinding
    # ------------------------------------------------------------------
    def seed_buildings(self, *, force):
        if force:
            RoomLocation.objects.all().delete()
            FloorPlan.objects.all().delete()
            Building.objects.all().delete()

        if Building.objects.exists():
            self.stdout.write("  - buildings skipped (use --force to reset)")
            return

        buildings = (
            {
                "name": "Engineering Building",
                "code": "ENG",
                "description": "Main engineering classrooms and faculty offices.",
                "order": 1,
                "slug": "engineering",
                "floors": ("Ground Floor", "Second Floor", "Third Floor"),
                "rooms": (
                    ("Room 101", "101", RoomLocation.Category.CLASSROOM, "1"),
                    ("Computer Lab A", "LAB-A", RoomLocation.Category.LABORATORY, "2"),
                    ("Faculty Office", "ENG-201", RoomLocation.Category.OFFICE, "2"),
                    ("Registrar Window", None, RoomLocation.Category.SERVICE, "1"),
                    ("Main Entrance", None, RoomLocation.Category.ENTRANCE, "1"),
                ),
            },
            {
                "name": "Architecture Building",
                "code": "ARCH",
                "description": "Design studios and architecture classrooms.",
                "order": 2,
                "slug": "architecture",
                "floors": ("Ground Floor", "Second Floor"),
                "rooms": (
                    ("Design Studio 1", "STU-1", RoomLocation.Category.CLASSROOM, "2"),
                    ("Materials Lab", None, RoomLocation.Category.LABORATORY, "1"),
                    ("Architecture Library", None, RoomLocation.Category.SERVICE, "2"),
                ),
            },
            {
                "name": "ECE Building",
                "code": "ECE",
                "description": "Electronics and communications laboratories.",
                "order": 3,
                "slug": "ece",
                "floors": ("Ground Floor", "Second Floor", "Third Floor", "Fourth Floor"),
                "rooms": (
                    ("Electronics Lab", "ELEC-1", RoomLocation.Category.LABORATORY, "2"),
                    ("Robotics Lab", None, RoomLocation.Category.LABORATORY, "3"),
                    ("ECE Department Office", None, RoomLocation.Category.OFFICE, "2"),
                    ("Lecture Hall B", "LH-B", RoomLocation.Category.CLASSROOM, "1"),
                ),
            },
            {
                "name": "Main Library",
                "code": "LIB",
                "description": "University library with engineering and architecture sections.",
                "order": 4,
                "slug": "library",
                "floors": ("Ground Floor", "Second Floor"),
                "rooms": (
                    ("Reference Section", None, RoomLocation.Category.SERVICE, "2"),
                    ("Circulation Desk", None, RoomLocation.Category.SERVICE, "1"),
                    ("Reading Area", None, RoomLocation.Category.OTHER, "1"),
                    ("Restrooms", None, RoomLocation.Category.RESTROOM, "1"),
                ),
            },
        )

        for entry in buildings:
            building = Building.objects.create(
                name=entry["name"],
                code=entry["code"],
                description=entry["description"],
                order=entry["order"],
                is_active=True,
            )
            for floor in entry["floors"]:
                plan = FloorPlan(
                    building=building,
                    floor_label=floor,
                    order=0,
                    is_active=True,
                )
                save_pdf(
                    plan.file,
                    f"{entry['name']} - {floor}",
                    f"{entry['slug']}-{floor.lower().replace(' ', '-')}",
                )
                plan.save()
            for room_name, code, category, floor in entry["rooms"]:
                RoomLocation.objects.create(
                    building=building,
                    name=room_name,
                    code=code or "",
                    category=category,
                    floor=floor,
                    description="",
                    is_active=True,
                )
            self.stdout.write(f"  + building {entry['name']}")
        self.stdout.write(f"  + buildings ({len(buildings)})")
