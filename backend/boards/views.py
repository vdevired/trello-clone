import redis
from django.conf import settings
from django.contrib.contenttypes.models import ContentType
from django.db.models import Q, Case, When
from django.shortcuts import get_object_or_404, render
from django.utils import timezone
from django.utils.module_loading import import_string
from projects.models import Project, ProjectMembership
from projects.permissions import (IsProjectAdminOrMemberReadOnly,
                                  IsProjectMember)
from rest_framework import generics, permissions, serializers, status
from rest_framework.exceptions import PermissionDenied
from rest_framework.response import Response

from .models import Attachment, Board, Comment, Item, Label, List
from .permissions import CanViewBoard
from .serializers import (AttachmentSerializer, BoardSerializer,
                          CommentSerializer, ItemSerializer, LabelSerializer,
                          ListSerializer)

r = redis.Redis(
    host=settings.REDIS_HOST, port=settings.REDIS_PORT, db=settings.REDIS_DB,
    charset="utf-8", decode_responses=True
)

class BoardList(generics.ListCreateAPIView):

    serializer_class = BoardSerializer
    permission_classes = [IsProjectMember]
    
    def get_project(self, pk):
        project = get_object_or_404(Project, pk=pk)
        self.check_object_permissions(self.request, project)
        return project

    def get_queryset(self, *args, **kwargs):
        
        project_id = self.request.GET.get('project', None)
        sort = self.request.GET.get('sort', None)

        if sort == "recent":
            redis_key = f'{self.request.user.username}:RecentlyViewedBoards'
            board_ids = r.zrange(redis_key, 0, 3, desc=True)
            
            preserved = Case(*[When(pk=pk, then=pos)
                           for pos, pk in enumerate(board_ids)])
            return Board.objects.filter(pk__in=board_ids).order_by(preserved)
        
        if project_id is None:
            project_ids = ProjectMembership.objects.filter(member=self.request.user).values_list('project__id', flat=True)
            return Board.objects.filter(Q(owner_id=self.request.user.id, owner_model=ContentType.objects.get(model='user')) |
                                       Q(owner_id__in=project_ids, owner_model=ContentType.objects.get(model='project')))
        
        project = self.get_project(project_id)
        return Board.objects.filter(owner_id=project_id, owner_model=ContentType.objects.get(model='project'))

    def post(self, request, *args, **kwargs):
        serializer = BoardSerializer(data=request.data)                 
        
        if serializer.is_valid():
            if 'project' in request.data.keys():
                project = self.get_project(request.data['project'])
                serializer.save(owner_id=project.id, owner_model=ContentType.objects.get(model='project'))
            else:
                serializer.save(owner_id=request.user.id, owner_model=ContentType.objects.get(model='user'))
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            

class BoardDetail(generics.RetrieveUpdateDestroyAPIView):

    serializer_class = BoardSerializer
    permission_classes = [ CanViewBoard ]

    def get_queryset(self, *args, **kwargs):
        project_ids = ProjectMembership.objects.filter(member=self.request.user).values_list('project__id', flat=True)
        return Board.objects.filter(Q(owner_id=self.request.user.id, owner_model=ContentType.objects.get(model='user')) |
                                    Q(owner_id__in=project_ids, owner_model=ContentType.objects.get(model='project')))

    def get_object(self):
        board_id = self.kwargs.get('pk')
        redis_key = f'{self.request.user.username}:RecentlyViewedBoards'
        cur_time_int = int(timezone.now().strftime("%Y%m%d%H%M%S"))
        r.zadd(redis_key, {board_id: cur_time_int})
        return super().get_object()
        
class ListShow(generics.ListCreateAPIView):

    serializer_class = ListSerializer
    permission_classes = [  CanViewBoard  ]

    def get_board(self, pk):
        board = get_object_or_404(Board, pk=pk)
        self.check_object_permissions(self.request, board)
        return board

    def get_queryset(self, *args, **kwargs):
        
        board_id = self.request.GET.get('board', None)
        
        board = self.get_board(board_id)
        return List.objects.filter(board=board).order_by('order')

    def get(self, request, *args, **kwargs):

        board_id = self.request.GET.get('board', None)

        if board_id is None:
            return Response(status=status.HTTP_400_BAD_REQUEST)
        
        return super().get(request, *args, **kwargs)

    def post(self, request, *args, **kwargs):
        if 'board' in request.data.keys():
            board = self.get_board(request.data['board'])
            return super().post(request, *args, **kwargs)
        return Response(status=status.HTTP_400_BAD_REQUEST)

    def perform_create(self, serializer):
        board = self.get_board(self.request.data['board'])
        serializer.save(board=board)



class ListDetail(generics.RetrieveUpdateDestroyAPIView):

    serializer_class = ListSerializer
    permission_classes = [ CanViewBoard ]

    def get_object(self):
        pk = self.kwargs.get('pk')
        list = get_object_or_404(List, pk=pk)
        self.check_object_permissions(self.request, list.board)
        return list



class ItemList(generics.ListCreateAPIView):

    queryset = Item.objects.all()
    serializer_class = ItemSerializer
    permission_classes = [
        permissions.AllowAny
    ]

class ItemDetail(generics.RetrieveUpdateDestroyAPIView):

    queryset = Item.objects.all()
    serializer_class = ItemSerializer
    permission_classes = [
        permissions.AllowAny
    ]

class CommentList(generics.ListCreateAPIView):

    queryset = Comment.objects.all()
    serializer_class = CommentSerializer
    permission_classes = [
        permissions.AllowAny
    ]

class CommentDetail(generics.RetrieveUpdateDestroyAPIView):

    queryset = Comment.objects.all()
    serializer_class = CommentSerializer
    permission_classes = [
        permissions.AllowAny
    ]

class LabelList(generics.ListCreateAPIView):

    queryset = Label.objects.all()
    serializer_class = LabelSerializer
    permission_classes = [
        permissions.AllowAny
    ]

class LabelDetail(generics.RetrieveUpdateDestroyAPIView):

    queryset = Label.objects.all()
    serializer_class = LabelSerializer
    permission_classes = [
        permissions.AllowAny
    ]

class AttachmentList(generics.ListCreateAPIView):

    queryset = Attachment.objects.all()
    serializer_class = AttachmentSerializer
    permission_classes = [
        permissions.AllowAny
    ]

class AttachmentDetail(generics.RetrieveUpdateDestroyAPIView):

    queryset = Attachment.objects.all()
    serializer_class = AttachmentSerializer
    permission_classes = [
        permissions.AllowAny
    ]
