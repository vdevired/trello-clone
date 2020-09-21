import pytest
from django.test import Client
from mixer.backend.django import mixer

from ..models import User

pytestmark = pytest.mark.django_db

class TestUserModel:
    def test_model(self):
        user = mixer.blend(User)
        assert user.pk == 1

    def test_username_case_insensitive(self):
        user = mixer.blend(User, username='john')
        assert User.objects.get(username='JOhn') == user

    def test_username_case_insensitive2(self):
        user = mixer.blend(User, username='john')
        assert User.objects.filter(username='JOhn').count() == 1

    def test_email_case_insensitive(self):
        user = mixer.blend(User, email='johndoe@gmail.com')
        assert User.objects.get(email='JoHnDoe@Gmail.com') == user

    def test_email_case_insensitive2(self):
        user = mixer.blend(User, email='johndoe@gmail.com')
        assert User.objects.filter(email='JoHnDoe@Gmail.com').count() == 1

    def test_full_name(self):
        user = mixer.blend(User, first_name='John', last_name='Doe')
        assert user.full_name == 'John Doe'

class TestUserLogin:
    def test_username_case_insensitive(self):
        c = Client()
        user = mixer.blend(User, username='john')
        user.set_password('}P-9(e,W')
        user.save()
        assert c.login(username='JohN', password='}P-9(e,W') == True
