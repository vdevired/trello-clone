import pytest
from django.core import mail
from mixer.backend.django import mixer
from projects.models import Project, ProjectMembership
from projects.serializers import ProjectMembershipSerializer, ProjectSerializer
from rest_framework.test import APIClient
from users.models import User
from boards.models import Notification
from django.contrib.contenttypes.models import ContentType

pytestmark = pytest.mark.django_db


class TestProjectList:
    def test_get(self):
        user = mixer.blend(User)
        project1 = mixer.blend(Project, owner=user)
        project2 = mixer.blend(Project, owner=user)
        client = APIClient()
        client.force_authenticate(user=user)
        response = client.get('/projects/')
        assert response.status_code == 200
        assert len(response.data) == 2

    def test_post(self):
        user1 = mixer.blend(User)
        client = APIClient()
        client.force_authenticate(user1)
        response = client.post('/projects/', {
            "title": "Trial",
            "description": "stuff",
            "profile_picture": ""
        })
        assert response.status_code == 201


class TestProjectDetail:
    @pytest.fixture
    def make_proj(self):
        user1 = mixer.blend(User)
        proj = mixer.blend(Project, owner=user1)
        return (user1, proj)

    @pytest.fixture
    def make_proj_user(self):
        user1 = mixer.blend(User)
        user2 = mixer.blend(User)
        proj = mixer.blend(Project, owner=user1)
        return (user1, user2, proj)

    def test_get_permission(self, make_proj_user):
        (user1, user2, proj) = make_proj_user
        client = APIClient()
        client.force_authenticate(user=user2)
        response = client.get('/projects/1/')
        assert response.status_code == 403
        client.force_authenticate(user=user1)
        response = client.get('/projects/1/')
        assert response.status_code == 200

    def test_put_permission(self, make_proj_user):
        (user1, user2, proj) = make_proj_user
        client = APIClient()
        client.force_authenticate(user=user2)
        modproj = ProjectSerializer(proj).data
        del modproj['owner']
        response = client.put('/projects/1/', modproj)
        assert response.status_code == 403
        client.force_authenticate(user=user1)
        response = client.put('/projects/1/', modproj)
        assert response.status_code == 200

    def test_put_inconsistent(self, make_proj):
        (user1, proj) = make_proj
        client = APIClient()
        client.force_authenticate(user=user1)
        req = ProjectSerializer(proj).data
        req['owner'] = 3
        response = client.put('/projects/1/', req)
        assert response.status_code == 400

    def test_delete_permission(self, make_proj_user):
        (user1, user2, proj) = make_proj_user
        client = APIClient()
        client.force_authenticate(user=user2)
        response = client.delete('/projects/1/')
        assert response.status_code == 403
        client.force_authenticate(user=user1)
        response = client.delete('/projects/1/')
        assert response.status_code == 200

    def test_authenticated(self):
        user1 = mixer.blend(User)
        proj = mixer.blend(Project, owner=user1)
        client = APIClient()
        client.force_authenticate(user=mixer.blend(User))
        response = client.get('/projects/1/')
        assert response.status_code == 403
        client.force_authenticate(user=user1)
        response = client.get('/projects/1/')
        assert response.status_code == 200

    def test_get_consistent(self, make_proj):
        (user1, proj) = make_proj
        client = APIClient()
        client.force_authenticate(user=user1)
        response = client.get('/projects/1/')
        assert response.data == ProjectSerializer(proj).data

    def test_put_consistent(self, make_proj):
        (user1, proj) = make_proj
        client = APIClient()
        client.force_authenticate(user=user1)
        modproj = ProjectSerializer(proj).data
        del modproj['owner']
        response = client.put('/projects/1/', modproj)
        assert response.data == ProjectSerializer(proj).data

    def test_delete_consistent(self, make_proj):
        (user1, proj) = make_proj
        client = APIClient()
        client.force_authenticate(user=user1)
        response = client.delete('/projects/1/')
        assert response.data is None


class TestProjectMember:
    @pytest.fixture
    def make_proj(self):
        user1 = mixer.blend(User)
        proj = mixer.blend(Project, owner=user1)
        return (user1, proj)

    def test_all_get(self, make_proj):
        (user1, proj) = make_proj
        client = APIClient()
        client.force_authenticate(user=user1)
        response = client.get('/projects/1/members/')
        assert response.status_code == 200
        user2 = mixer.blend(User)
        client.force_authenticate(user2)
        response = client.get('/projects/1/members/')
        assert response.status_code == 200

    def test_admin_put(self, make_proj):
        (user1, proj) = make_proj
        pmem1 = mixer.blend(ProjectMembership, project=proj, access_level=2)
        client = APIClient()
        client.force_authenticate(pmem1.member)
        response = client.put('/projects/members/1/', {
            "access_level": 2
        })
        assert response.data['access_level'] == 2

    def test_unauth_put(self, make_proj):
        (user1, proj) = make_proj
        pmem1 = mixer.blend(ProjectMembership, project=proj, access_level=1)
        client = APIClient()
        client.force_authenticate(pmem1.member)
        response = client.put('/projects/members/1/', {"access_level": 2})
        assert response.status_code == 403

    def test_admin_delete(self, make_proj):
        (user1, proj) = make_proj
        pmem1 = mixer.blend(ProjectMembership, project=proj, access_level=1)
        client = APIClient()
        client.force_authenticate(user1)
        response = client.delete('/projects/members/2/')
        assert response.status_code == 204

    def test_unauth_delete(self, make_proj):
        (user1, proj) = make_proj
        pmem1 = mixer.blend(ProjectMembership, project=proj, access_level=1)
        client = APIClient()
        client.force_authenticate(pmem1.member)
        response = client.delete('/projects/members/1/')
        assert response.status_code == 403

    def test_put_inconsistent(self, make_proj):
        (user1, proj) = make_proj
        pmem1 = mixer.blend(ProjectMembership, project=proj)
        client = APIClient()
        client.force_authenticate(user1)
        modproj = ProjectMembershipSerializer(pmem1).data
        modproj['access_level'] = 3
        response = client.put('/projects/members/1/', modproj, format='json')
        assert response.status_code == 400

    def test_project_members_get(self, make_proj):
        (user1, proj) = make_proj
        pmem1 = mixer.blend(ProjectMembership, project=proj)
        client = APIClient()
        response = client.get('/projects/members/')
        assert response.status_code == 404


class TestProjectInvite:
    @pytest.fixture
    def make_proj(self):
        user1 = mixer.blend(User)
        proj = mixer.blend(Project, owner=user1)
        return (user1, proj)

    def test_can_invite(self, make_proj, mailoutbox):
        (owner, project) = make_proj
        user2 = mixer.blend(User)
        client = APIClient()
        client.force_authenticate(owner)
        response = client.post('/projects/1/invite/', {
            'users': [user2.username]
        }, format='json')
        assert response.status_code == 204
        assert len(mailoutbox) == 1

        activation_link = mailoutbox[0].body.split(" ")[-1]
        token = activation_link.split("/")[-1]
        client.force_authenticate(user2)

        assert ProjectMembership.objects.filter(
            project=project, member=user2).exists() == False
        response = client.post(f'/projects/join/{token}/')

        assert response.status_code == 204
        assert ProjectMembership.objects.filter(
            project=project, member=user2).exists()

    def test_invite_no_users_specified(self, make_proj):
        (owner, project) = make_proj
        client = APIClient()
        client.force_authenticate(owner)
        response = client.post('/projects/1/invite/')
        assert response.status_code == 400
        assert 'No users provided' in response.data['error']

    def test_invite_can_use_link_only_once(self, make_proj, mailoutbox):
        (owner, project) = make_proj
        user2 = mixer.blend(User)
        client = APIClient()
        client.force_authenticate(owner)
        response = client.post('/projects/1/invite/', {
            'users': [user2.username]
        }, format='json')

        activation_link = mailoutbox[0].body.split(" ")[-1]
        token = activation_link.split("/")[-1]
        client.force_authenticate(user2)

        response = client.post(f'/projects/join/{token}/')
        response = client.post(f'/projects/join/{token}/')

        assert response.status_code == 400


class TestNotification:
    @pytest.fixture
    def make_proj(self):
        user1 = mixer.blend(User)
        proj = mixer.blend(Project, owner=user1)
        return (user1, proj)

    def test_invite_notif(self, make_proj, mailoutbox):
        (owner, project) = make_proj
        user2 = mixer.blend(User)
        client = APIClient()
        client.force_authenticate(owner)
        response = client.post('/projects/1/invite/', {
            'users': [user2.username]
        }, format='json')

        activation_link = mailoutbox[0].body.split(" ")[-1]
        token = activation_link.split("/")[-1]
        client.force_authenticate(user2)

        assert Notification.objects.filter(
            actor=owner, recipient=user2,
            verb="invited you to",
            target_id=project.id, target_model=ContentType.objects.get(model='project')).exists() == True
        response = client.post(f'/projects/join/{token}/')

        assert Notification.objects.filter(
            actor=owner, recipient=user2,
            verb="invited you to",
            target_id=project.id, target_model=ContentType.objects.get(model='project')).exists() == False

    def test_admin_notif(self, make_proj):
        (owner, project) = make_proj
        user2 = mixer.blend(User)
        ProjectMembership.objects.create(
            member=user2, project=project, access_level=1)
        client = APIClient()
        client.force_authenticate(owner)
        response = client.put('/projects/members/2/', {
            'access_level': 2
        }, format='json')

        assert Notification.objects.filter(
            actor=owner, recipient=user2,
            verb="made you admin of",
            target_id=project.id, target_model=ContentType.objects.get(model='project')).exists() == True

        response = client.put('/projects/members/2/', {
            'access_level': 1
        }, format='json')

        assert Notification.objects.filter(
            actor=owner, recipient=user2,
            verb="made you admin of",
            target_id=project.id, target_model=ContentType.objects.get(model='project')).exists() == False
