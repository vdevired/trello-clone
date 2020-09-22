from django.shortcuts import render
from django.http import Http404
from projects.serializer import ProjectMembershipSerializer, ProjectSerializer
from projects.models import Project, ProjectMembership
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework import mixins
from rest_framework import generics


class ProjectList(mixins.ListModelMixin
                , mixins.CreateModelMixin
                , generics.GenericAPIView):
    serializer_class = ProjectSerializer

    def get_queryset(self, request, *args, **kwargs):
        return Project.objects.filter(owner=request.user)

    def get(self, request, *args, **kwargs):
        return self.list(request, *args, **kwargs)
    
    def post(self, request, *args, **kwargs):
        return self.create(request, *args, **kwargs)

class ProjectDetail(APIView ):
    serializer_class = ProjectSerializer
    
    def post(self, request)