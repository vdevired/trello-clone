from rest_framework import permissions
from projects.models import ProjectMembership


class IsProjectAdminOrMemberReadOnly(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        try: 
            pmem = ProjectMembership.objects.get(member=request.user, project=obj)
        except ProjectMembership.DoesNotExist:
            return False
        
        if request.method in permissions.SAFE_METHODS:
            return True
        return pmem.access_level == 2

class IsProjectMember(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        try:
            pmem = ProjectMembership.objects.get(member=request.user, project=obj)
        except ProjectMembership.DoesNotExist:
            return False
        return True