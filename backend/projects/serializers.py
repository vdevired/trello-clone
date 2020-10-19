from projects.models import Project, ProjectMembership
from users.models import User
from users.serializers import UserSerializer
from rest_framework import serializers


class ProjectSerializer(serializers.ModelSerializer):
    owner = UserSerializer(read_only=True)
    members = UserSerializer(read_only=True,many=True)
    class Meta:
        model = Project
        fields = [
            'id',
            'owner',
            'title',
            'description',
            'profile_picture',
            'members'
        ]
        read_only_fields = ['owner']

class ShortProjectSerializer(serializers.ModelSerializer):

    class Meta:
        model = Project
        fields = ['id', 'title']

class ProjectMembershipSerializer(serializers.ModelSerializer):
    project = serializers.CharField(source='project.title', read_only=True)
    member = UserSerializer(read_only=True)
    class Meta:
        model = ProjectMembership
        fields = ['id','project', 'member', 'access_level']
        read_only_fields = ['project', 'member']