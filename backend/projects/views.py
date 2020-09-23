from django.core.mail import send_mail
from django.http import Http404
from django.shortcuts import get_object_or_404
from django.utils.encoding import force_bytes, force_text
from django.utils.http import urlsafe_base64_decode, urlsafe_base64_encode
from projects.models import Project, ProjectMembership
from projects.permissions import IsProjectAdminOrMemberReadOnly
from projects.serializers import ProjectMembershipSerializer, ProjectSerializer
from rest_framework import generics, mixins, status
from rest_framework.response import Response
from rest_framework.views import APIView
from users.models import User

from .tokens import project_invitation_token


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

site_url = "http://localhost:8000/"
class SendProjectInvite(APIView):
    permission_classes = [IsProjectAdminOrMemberReadOnly]

    def get_object(self, pk):
        project = get_object_or_404(Project, pk=pk)
        self.check_object_permissions(self.request, project)
        return project

    def post(self, request, pk):
        project = self.get_object(pk)
        users = request.data.get('users', None)
    
        if users is None:
            return Response({'error' : 'No users provided'}, status=status.HTTP_400_BAD_REQUEST)
        for username in users:
            try:
                user = User.objects.get(username=username)
                if ProjectMembership.objects.filter(project=project, member=user).exists() or project.owner == user: # Can't invite a member
                    continue

                subject = f'{request.user.full_name} has invited you to join {project.title}'
                message = (f'Click on the following link to accept: {site_url}projects/join'
                f'/{urlsafe_base64_encode(force_bytes(username))}'
                f'/{urlsafe_base64_encode(force_bytes(project.pk))}'
                f'/{project_invitation_token.make_token(user)}')
                to_email = user.email

                send_mail(subject, message, from_email=None, recipient_list=[to_email]) # if from_email=None, uses DEFAULT_FROM_EMAIL from settings.py
            except User.DoesNotExist:
                continue
        return Response(status=status.HTTP_204_NO_CONTENT)

class AcceptProjectInvite(APIView):
    def post(self, request, format=None):
        usernameb64 = request.data['usernameb64']
        pidb64 = request.data['pidb64']
        token = request.data['token']
        try:
            username = force_text(urlsafe_base64_decode(usernameb64))
            user = User.objects.get(username=username)
            pid = force_text(urlsafe_base64_decode(pidb64))
            project = Project.objects.get(pk=pid)
        except(TypeError, ValueError, OverflowError, User.DoesNotExist, Project.DoesNotExist):
            user = None
        if user is not None and project_invitation_token.check_token(user, token) and ProjectMembership.objects.filter(project=project, member=user).exists() == False:
            ProjectMembership.objects.create(project=project, member=user)
            return Response(status=status.HTTP_204_NO_CONTENT)
        else:
            return Response(status=status.HTTP_400_BAD_REQUEST)
