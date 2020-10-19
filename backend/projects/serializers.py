from projects.models import Project, ProjectMembership
from users.models import User
from users.serializers import UserSerializer
from rest_framework import serializers


class ProjectMembershipSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(
        source='member.full_name', read_only=True)
    username = serializers.CharField(source='member.username', read_only=True)
    email = serializers.CharField(source='member.email', read_only=True)
    profile_pic = serializers.SerializerMethodField()

    def get_profile_pic(self, obj):
        if obj.member.profile_pic:
            return self.context['request'].build_absolute_uri(obj.member.profile_pic.url)
        return None

    class Meta:
        model = ProjectMembership
        fields = ['id', 'full_name', 'username',
                  'email', 'profile_pic', 'access_level']


class ProjectSerializer(serializers.ModelSerializer):
    owner = UserSerializer(read_only=True)
    members = serializers.SerializerMethodField()

    def get_members(self, obj):
        queryset = ProjectMembership.objects.filter(project=obj)
        return ProjectMembershipSerializer(queryset, many=True, context={"request": self.context['request']}).data

    class Meta:
        model = Project
        fields = [
            'id',
            'owner',
            'title',
            'description',
            'members'
        ]
        read_only_fields = ['owner']


class ShortProjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Project
        fields = ['id', 'title']
