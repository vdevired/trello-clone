from projects.models import Project, ProjectMembership
from rest_framework import serializers

class ProjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Project
        fields = [
            'owner', 
            'title', 
            'description', 
            'profile_picture',
            'members'
        ]
        
class ProjectMembershipSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProjectMembership
        fields = [
            'project', 
            'member',
            'access_level'
        ]