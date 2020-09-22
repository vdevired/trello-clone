from django.shortcuts import get_object_or_404
from django.http import Http404
from projects.serializers import ProjectMembershipSerializer, ProjectSerializer
from projects.models import Project, ProjectMembership
from projects.permissions import IsProjectAdminOrMemberReadOnly
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework import mixins
from rest_framework import generics


class ProjectList(mixins.ListModelMixin
                ,mixins.CreateModelMixin, 
                generics.GenericAPIView):
    serializer_class = ProjectSerializer

    def get_queryset(self):
        return Project.objects.filter(owner=self.request.user)
    
    def perform_create(self,serializer):
        serializer.save(owner=self.request.user)
        
    def get(self, request, *args, **kwargs):
        return self.list(request, *args, **kwargs)
    
    def post(self, request, *args, **kwargs):
        return self.create(request, *args, **kwargs)
        
    
class ProjectDetail(APIView):
    serializer_class = ProjectSerializer
    permission_classes = [IsProjectAdminOrMemberReadOnly]

    def get(self, request, pk):
        proj = get_object_or_404(Project, pk=pk)
        self.check_object_permissions(self.request,proj)
        serializer = ProjectSerializer(proj)
        return Response(serializer.data)
    
    def put(self, request, pk):
        proj = get_object_or_404(Project, pk=pk)
        self.check_object_permissions(self.request,proj)
        serializer = ProjectSerializer(proj, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def delete(self, request, pk):
        proj = get_object_or_404(Project, pk=pk)
        self.check_object_permissions(self.request,proj)
        proj.delete()
        return Response(status=status.HTTP_200_OK)

class ProjectMemberList( mixins.ListModelMixin, 
                         generics.GenericAPIView, 
                         mixins.CreateModelMixin):
    serializer_class = ProjectMembershipSerializer
    permission_classes = [IsProjectAdminOrMemberReadOnly]

    def get_queryset(self):
        try:
            project = Project.objects.get(pk=self.kwargs['pk'])
            query_set = ProjectMembership.objects.filter(project=project)
        except:
            raise Http404 
        return query_set    
    
    def get(self, request, *args, **kwargs):
        return self.list(request, *args, **kwargs)

class ProjectMemberDetail(APIView):
    serializer_class = ProjectMembershipSerializer
    permission_classes = [IsProjectAdminOrMemberReadOnly]

    def get_object(self, pk):
        obj = get_object_or_404(ProjectMembership, pk=pk)
        self.check_object_permissions(self.request,obj.project)
        return obj

    def put(self, request, pk1, pk2):
        pmem = self.get_object(pk2)
        serializer = ProjectMembershipSerializer(pmem, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk1, pk2):
        pmem = self.get_object(pk2)
        pmem.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)