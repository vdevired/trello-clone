import pytest
from rest_framework.test import APIClient
from mixer.backend.django import mixer
from users.models import User
from projects.models import Project, ProjectMembership
from ..models import Board, List

from .. import views

pytestmark = pytest.mark.django_db

class TestBoardListView:
    def test_get(self):
        user = mixer.blend(User)
        client = APIClient()
        client.force_authenticate(user)
        project = mixer.blend(Project, owner=user)
        board1 = mixer.blend(Board, owner=project)
        board2 = mixer.blend(Board, owner=user)
        response = client.get('/boards/')
        assert response.status_code == 200
        assert board1.owner.title == project.title
        assert board2.owner.username == user.username

    def test_post(self):
        user = mixer.blend(User)
        client = APIClient()
        client.force_authenticate(user)
        response = client.post('/boards/', {
            "title": "Vik",
            "description": "Small"
        })
        assert response.status_code == 201, "Should be created"
        proj = mixer.blend(Project, owner=user)
        response = client.post('/boards/', {
            "title": "Small",
            "description": "Vik",
            "project": proj.id
        })
        assert response.status_code == 201, "Should be created(Project)"

class TestBoardDetailView:
    @pytest.fixture
    def make_board(self):
        user = mixer.blend(User)
        project = mixer.blend(Project, owner=user)
        board1 = mixer.blend(Board, owner=project)
        board2 = mixer.blend(Board, owner=user)
        return (user, project, board1, board2)

    def test_get(self, make_board):
        (user, project, board1, board2) = make_board
        client = APIClient()
        client.force_authenticate(user)
        response = client.get('/boards/1/')
        assert response.status_code == 200, "Should be accessible"
        user1 = mixer.blend(User)
        client.force_authenticate(user1)
        response = client.get('/boards/1/')
        assert response.status_code == 404, "Should be inaccessible"

    def test_put(self, make_board):
        (user, project, board1, board2) = make_board
        client = APIClient()
        client.force_authenticate(user)
        response = client.put('/boards/1/', 
        {"title": "Vs",
         "description": "Test"
        })
        assert response.status_code == 200
        assert (response.data['title'] == "Vs" and response.data['description'] == "Test"), "Should be edited"
        user1 = mixer.blend(User)
        client.force_authenticate(user1)
        response = client.put('/boards/1/', 
        {"title": "Vs",
         "description": "Test"
        })
        assert response.status_code == 404, "Should be inaccessible"

    def test_delete(self, make_board):
        (user, project, board1, board2) = make_board
        client = APIClient()
        client.force_authenticate(user)
        response = client.delete('/boards/1/')
        assert response.status_code == 204, "Should be deleted"
        response = client.get('/boards/1/')
        assert response.status_code == 404, "Should be invalid"
        user1 = mixer.blend(User)
        client.force_authenticate(user1)
        response = client.delete('/boards/2/')
        assert response.status_code == 404, "Should be inaccessible"

class TestListShowView:
    @pytest.fixture
    def make_list(self):
        user = mixer.blend(User)
        proj = mixer.blend(Project, owner=user)
        board = mixer.blend(Board, owner=proj)
        list = mixer.blend(List, board=board)
        user1 = mixer.blend(User)
        user2 = mixer.blend(User)
        pmem = mixer.blend(ProjectMembership, access_level=1, project=proj, member=user1)
        return (user, proj, board, list, user1, user2, pmem)

    def test_get(self, make_list):
        (user, proj, board, list, user1, user2, pmem) = make_list
        client = APIClient()
        client.force_authenticate(user)
        response = client.get('/boards/lists/?board=1')
        assert response.status_code == 200
        client.force_authenticate(user1)
        response = client.get('/boards/lists/?board=1')
        assert response.status_code == 200
        client.force_authenticate(user2)
        response = client.get('/boards/lists/?board=1')
        assert response.status_code == 403

    def test_post(self, make_list):
        (user, proj, board, list, user1, user2, pmem) = make_list
        client = APIClient()
        client.force_authenticate(user)
        response = client.post('/boards/lists/',
        {
            "title": "FPL",
            "board": 1
        })
        assert response.status_code == 201
        client.force_authenticate(user1)
        response = client.post('/boards/lists/',
        {
            "title": "Rodriguez",
            "board": 1
        })
        assert response.status_code == 201
        client.force_authenticate(user2)
        response = client.post('/boards/lists/',
        {
            "title": "Salah",
            "board": 1
        })
        assert response.status_code == 403

class TestListDetailView:
    @pytest.fixture
    def make_list(self):
        user = mixer.blend(User)
        proj = mixer.blend(Project, owner=user)
        board = mixer.blend(Board, owner=proj)
        list = mixer.blend(List, board=board)
        user1 = mixer.blend(User)
        user2 = mixer.blend(User)
        pmem = mixer.blend(ProjectMembership, access_level=1, project=proj, member=user1)
        return (user, proj, board, list, user1, user2, pmem)

    def test_get(self, make_list):
        (user, proj, board, list, user1, user2, pmem) = make_list
        client = APIClient()
        client.force_authenticate(user)
        response = client.get('/boards/lists/1/?board=1')
        assert response.status_code == 200
        client.force_authenticate(user1)
        response = client.get('/boards/lists/1/?board=1')
        assert response.status_code == 200
        client.force_authenticate(user2)
        response = client.get('/boards/lists/1/?board=1')
        assert response.status_code == 403

    def test_put(self, make_list):
        (user, proj, board, list, user1, user2, pmem) = make_list
        client = APIClient()
        client.force_authenticate(user)
        response = client.put('/boards/lists/1/',
        {
            "title": "Check"   
        })
        assert response.status_code == 200 and response.data['title'] == "Check"
        client.force_authenticate(user1)
        response = client.put('/boards/lists/1/',
        {
            "title": "Checkmate"   
        })
        assert response.status_code == 200 and response.data['title'] == "Checkmate"
        client.force_authenticate(user2)
        response = client.put('/boards/lists/1/',
        {
            "title": "Chess"   
        })
        assert response.status_code == 403

    def test_delete(self, make_list):
        (user, proj, board, list, user1, user2, pmem) = make_list
        list1 = mixer.blend(List, board=board)
        list2 = mixer.blend(List, board=board)
        client = APIClient()
        client.force_authenticate(user)
        response = client.delete('/boards/lists/1/')
        assert response.status_code == 204
        client.force_authenticate(user1)
        response = client.delete('/boards/lists/2/')
        assert response.status_code == 204
        client.force_authenticate(user2)
        response = client.delete('/boards/lists/3/')
        assert response.status_code == 403
