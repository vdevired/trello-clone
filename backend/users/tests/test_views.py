import pytest
from mixer.backend.django import mixer
from rest_framework.test import APIClient

from ..models import User

pytestmark = pytest.mark.django_db

register_request_data = {
    'username': 'john',
    'email' : 'johndoe@gmail.com',
    'first_name' : 'John',
    'last_name' : 'Doe',
    'password' : '}P-9(e,W'
}

class TestRegistration:
    def test_can_register(self):
        client = APIClient()
        response = client.post('/register/', register_request_data)
        assert response.status_code == 201

    def test_username_unique(self):
        client = APIClient()
        response = client.post('/register/', register_request_data)
        response = client.post('/register/', register_request_data)
        assert response.status_code == 400
        assert 'with this username already exists' in response.data['username'][0]

    def test_email_unique(self):
        client = APIClient()
        response = client.post('/register/', register_request_data)
        response = client.post('/register/', register_request_data)
        assert response.status_code == 400
        assert 'with this email already exists' in response.data['email'][0]

    def test_username_required(self):
        del register_request_data['username']
        client = APIClient()
        response = client.post('/register/', register_request_data)
        assert response.status_code == 400
        assert 'is required' in response.data['username'][0]

    def test_email_required(self):
        del register_request_data['email']
        client = APIClient()
        response = client.post('/register/', register_request_data)
        assert response.status_code == 400
        assert 'is required' in response.data['email'][0]

    def test_username_max_length(self):
        register_request_data['username'] = 'johnnyjohnsondoe'
        client = APIClient()
        response = client.post('/register/', register_request_data)
        assert response.status_code == 400
        assert 'no more than 15 characters' in response.data['username'][0]

    def test_username_regex(self):
        register_request_data['username'] = 'jdoe@gmail.com'
        client = APIClient()
        response = client.post('/register/', register_request_data)
        assert response.status_code == 400
        assert 'allowed in your username' in response.data['username'][0]

login_request_data = {
    'username': 'john',
    'password' : '}P-9(e,W'
}

class TestLogin:
    def test_can_login(self):
        client = APIClient()
        user = mixer.blend(User, username=login_request_data['username'])
        user.set_password(login_request_data['password'])
        user.save()
        response = client.post('/token/', login_request_data)
        assert response.status_code == 200

    def test_can_login_with_email(self):
        client = APIClient()
        user = mixer.blend(User, username=login_request_data['username'], email='johndoe@gmail.com')
        user.set_password(login_request_data['password'])
        user.save()
        login_request_data['username'] = 'johndoe@gmail.com'
        response = client.post('/token/', login_request_data)
        assert response.status_code == 200

    def test_incorrect_password(self):
        client = APIClient()
        user = mixer.blend(User, username=login_request_data['username'])
        user.set_password('xdcftvygbh')
        user.save()
        response = client.post('/token/', login_request_data)
        assert response.status_code == 401
        assert  'No active account found' in response.data['detail']
