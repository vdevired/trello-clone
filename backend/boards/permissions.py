from rest_framework import permissions
from .models import Board
from projects.models import ProjectMembership
from django.contrib.contenttypes.models import ContentType


class CanViewBoard(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if obj.owner_model == ContentType.objects.get(model='project'):
            try: 
                pmem = ProjectMembership.objects.get(member=request.user, project__id=obj.owner_id)
            except ProjectMembership.DoesNotExist:
                return False
        else:
            if obj.owner_id != request.user.id:
                return False
        return True
        