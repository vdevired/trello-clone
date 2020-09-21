import pytest

from mixer.backend.django import mixer
from projects.models import Project, ProjectMembership
from users.models import User

@pytest.mark.django_db
class TestProject:
    def test_project_create(self):
        user = mixer.blend(User, username='test')
        proj = mixer.blend(Project, owner = user)
        assert proj.owner == user

    def test_project_str(self):
        proj = mixer.blend(Project)
        assert str(proj) == proj.title

@pytest.mark.django_db
class TestProjectMembers:
    def test_member(self):
        proj = mixer.blend(Project)
        user = mixer.blend(User, username='test')
        mixer.blend(ProjectMembership, member=user, project=proj)
        assert proj.members.get(username='test') == user 
    
    def test_proj_member_str(self):
        pmem = mixer.blend(ProjectMembership)
        assert str(pmem) == f'{pmem.member.full_name} , {pmem.project.title}'