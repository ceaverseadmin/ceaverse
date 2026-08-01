import factory
from django.contrib.auth import get_user_model

User = get_user_model()

PASSWORD = "TestPass123!"


class UserFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = User
        django_get_or_create = ("email",)

    email = factory.Sequence(lambda n: f"user{n}@ea-csc.test")
    full_name = factory.Faker("name")
    role = User.Role.OFFICER
    password = factory.PostGenerationMethodCall("set_password", PASSWORD)


class AdminFactory(UserFactory):
    role = User.Role.ADMIN


class SuperAdminFactory(UserFactory):
    role = User.Role.SUPER_ADMIN
