import redis
from django.conf import settings
from django.contrib.contenttypes.models import ContentType
from django.db.models import Case, Q, When
from django.shortcuts import get_object_or_404, render
from django.utils import timezone
from django.utils.module_loading import import_string
from projects.models import Project, ProjectMembership
from projects.permissions import (IsProjectAdminOrMemberReadOnly,
                                  IsProjectMember)
from rest_framework import generics, permissions, serializers, status
from rest_framework.exceptions import PermissionDenied
from rest_framework.response import Response
from rest_framework.views import APIView
from users.models import User

from .models import Attachment, Board, Comment, Item, Label, List, Notification
from .permissions import CanViewBoard, IsAuthorOrReadOnly
from .serializers import (AttachmentSerializer, BoardSerializer,
                          CommentSerializer, ItemSerializer, LabelSerializer,
                          ListSerializer, NotificationSerializer,
                          ShortBoardSerializer)

r = redis.Redis(
    host=settings.REDIS_HOST, port=settings.REDIS_PORT, db=settings.REDIS_DB,
    charset="utf-8", decode_responses=True
)


class BoardList(generics.ListCreateAPIView):

    serializer_class = ShortBoardSerializer
    permission_classes = [IsProjectMember]

    def get_project(self, pk):
        project = get_object_or_404(Project, pk=pk)
        self.check_object_permissions(self.request, project)
        return project

    def get_queryset(self, *args, **kwargs):

        project_id = self.request.GET.get('project', None)
        sort = self.request.GET.get('sort', None)
        search = self.request.GET.get('q', None)

        if sort == "recent":
            redis_key = f'{self.request.user.username}:RecentlyViewedBoards'
            board_ids = r.zrange(redis_key, 0, 3, desc=True)

            preserved = Case(*[When(pk=pk, then=pos)
                               for pos, pk in enumerate(board_ids)])
            return Board.objects.filter(pk__in=board_ids).order_by(preserved)

        if project_id is None:
            project_ids = ProjectMembership.objects.filter(
                member=self.request.user).values_list('project__id', flat=True)
            queryset = Board.objects.filter(Q(owner_id=self.request.user.id, owner_model=ContentType.objects.get(model='user')) |
                                            Q(owner_id__in=project_ids, owner_model=ContentType.objects.get(model='project')))
        else:
            queryset = Board.objects.filter(
                owner_id=project_id, owner_model=ContentType.objects.get(model='project'))
            project = self.get_project(project_id)

        if search is not None:
            return queryset.filter(title__icontains=search)[:2]
        return queryset

    def post(self, request, *args, **kwargs):
        serializer = ShortBoardSerializer(
            data=request.data, context={"request": request})

        if serializer.is_valid():
            if 'project' in request.data.keys():
                project = self.get_project(request.data['project'])
                serializer.save(
                    owner_id=project.id, owner_model=ContentType.objects.get(model='project'))
            else:
                serializer.save(owner_id=request.user.id,
                                owner_model=ContentType.objects.get(model='user'))
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class BoardDetail(generics.RetrieveUpdateDestroyAPIView):

    serializer_class = BoardSerializer
    permission_classes = [CanViewBoard]

    def get_queryset(self, *args, **kwargs):
        project_ids = ProjectMembership.objects.filter(
            member=self.request.user).values_list('project__id', flat=True)
        return Board.objects.filter(Q(owner_id=self.request.user.id, owner_model=ContentType.objects.get(model='user')) |
                                    Q(owner_id__in=project_ids, owner_model=ContentType.objects.get(model='project')))

    def get_object(self):
        board_id = self.kwargs.get('pk')
        redis_key = f'{self.request.user.username}:RecentlyViewedBoards'
        cur_time_int = int(timezone.now().strftime("%Y%m%d%H%M%S"))
        r.zadd(redis_key, {board_id: cur_time_int})
        return super().get_object()

    def perform_update(self, serializer):
        # When you update, you may pass in a new image/image_url/color
        # If an image is passed, we need to clear the existing background - image_url/color
        # and so on
        req_data = self.request.data

        if "image" in req_data:
            serializer.save(image_url="", color="")
        elif "image_url" in req_data:
            serializer.save(image=None, color="")
        elif "color" in req_data:
            serializer.save(image=None, image_url="")


class BoardStar(APIView):
    permission_classes = [CanViewBoard]

    def get_board(self, pk):
        board = get_object_or_404(Board, pk=pk)
        self.check_object_permissions(self.request, board)
        return board

    def post(self, request, *args, **kwargs):
        if 'board' in request.data.keys():
            board_id = request.data['board']
        else:
            return Response(status=status.HTTP_400_BAD_REQUEST)

        board = self.get_board(board_id)

        if request.user.starred_boards.filter(pk=board.pk).exists():
            request.user.starred_boards.remove(board)
        else:
            request.user.starred_boards.add(board)

        return Response(status=status.HTTP_204_NO_CONTENT)


class ListShow(generics.ListCreateAPIView):

    serializer_class = ListSerializer
    permission_classes = [CanViewBoard]

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
    permission_classes = [CanViewBoard]

    def get_object(self):
        pk = self.kwargs.get('pk')
        list = get_object_or_404(List, pk=pk)
        self.check_object_permissions(self.request, list.board)
        return list


class ItemList(generics.ListCreateAPIView):

    serializer_class = ItemSerializer
    permission_classes = [CanViewBoard]

    def get_list(self, pk):
        list = get_object_or_404(List, pk=pk)
        self.check_object_permissions(self.request, list.board)
        return list

    def get_queryset(self, *args, **kwargs):

        list_id = self.request.GET.get('list', None)
        search = self.request.GET.get('q', None)

        if list_id is not None:
            list = self.get_list(list_id)

        if search is not None:
            project_ids = ProjectMembership.objects.filter(
                member=self.request.user).values_list('project__id', flat=True)
            boards = Board.objects.filter(Q(owner_id__in=project_ids, owner_model=ContentType.objects.get(model='project')) |
                                          Q(owner_id=self.request.user.id, owner_model=ContentType.objects.get(model='user')))
            if list_id is not None:
                return Item.objects.filter(list=list, title__icontains=search)[:2]
            lists = List.objects.filter(board__in=boards)
            return Item.objects.filter(list__in=lists, title__icontains=search)[:2]

        return Item.objects.filter(list=list).order_by('order')

    def get(self, request, *args, **kwargs):

        list_id = self.request.GET.get('list', None)
        search = self.request.GET.get('q', None)

        if list_id is None and search is None:
            return Response(status=status.HTTP_400_BAD_REQUEST)

        return super().get(request, *args, **kwargs)

    def post(self, request, *args, **kwargs):
        if 'list' in request.data.keys():
            list = self.get_list(request.data['list'])
            return super().post(request, *args, **kwargs)
        return Response(status=status.HTTP_400_BAD_REQUEST)

    def perform_create(self, serializer):
        list = self.get_list(self.request.data['list'])
        serializer.save(list=list)


class ItemDetail(generics.RetrieveUpdateDestroyAPIView):

    serializer_class = ItemSerializer
    permission_classes = [CanViewBoard]

    def get_user(self, username, board):
        user = get_object_or_404(User, username=username)
        # Can this user view the board though?
        if user.can_view_board(board):
            return user
        return None

    def get_label(self, pk, board):
        label = get_object_or_404(Label, pk=pk)
        # Does this label belong to this item's board?
        if board == label.board:
            return label
        return None

    def get_list(self, pk, board):
        list = get_object_or_404(List, pk=pk)
        if board == list.board:
            return list
        return None

    def get_object(self):
        pk = self.kwargs.get('pk')
        item = get_object_or_404(Item, pk=pk)
        self.check_object_permissions(self.request, item.list.board)
        return item

    def put(self, request, *args, **kwargs):
        item = self.get_object()
        if "assigned_to" in request.data:
            user = self.get_user(request.data["assigned_to"], item.list.board)
            if user is None:
                return Response({"assigned_to": ["This user cannot view this board"]}, status=status.HTTP_400_BAD_REQUEST)

        if "labels" in request.data:
            label = self.get_label(request.data["labels"], item.list.board)
            if label is None:
                return Response({"labels": ["This label doees not belong to this board"]}, status=status.HTTP_400_BAD_REQUEST)

        if "list" in request.data:
            list = self.get_list(request.data['list'], item.list.board)
            if list is None:
                return Response({'list': ["This list doesn't belong to this baord"]}, status=status.HTTP_400_BAD_REQUEST)

        return super().put(request, *args, **kwargs)

    def perform_update(self, serializer):
        # Same logic as BoardDetail
        req_data = self.request.data

        if "image" in req_data:
            item = serializer.save(image_url="", color="")
        elif "image_url" in req_data:
            item = serializer.save(image=None, color="")
        elif "color" in req_data:
            item = serializer.save(image=None, image_url="")
        else:
            item = serializer.save()

        # Assigning or removing someone?
        if "assigned_to" in req_data:
            user = self.get_user(req_data["assigned_to"], item.list.board)

            if item.assigned_to.filter(pk=user.pk).exists():
                item.assigned_to.remove(user)
            else:
                item.assigned_to.add(user)

        # Adding or removing a label?
        if "labels" in req_data:
            label = self.get_label(req_data["labels"], item.list.board)

            if item.labels.filter(pk=label.pk).exists():
                item.labels.remove(label)
            else:
                item.labels.add(label)

        if "list" in req_data:
            list = self.get_list(req_data["list"], item.list.board)
            serializer.save(list=list)


class CommentList(generics.ListCreateAPIView):

    serializer_class = CommentSerializer
    permission_classes = [CanViewBoard]

    def get_item(self, pk):
        item = get_object_or_404(Item, pk=pk)
        self.check_object_permissions(self.request, item.list.board)
        return item

    def get_queryset(self, *args, **kwargs):

        item_id = self.request.GET.get('item', None)

        item = self.get_item(item_id)
        return Comment.objects.filter(item=item)

    def get(self, request, *args, **kwargs):

        item_id = self.request.GET.get('item', None)

        if item_id is None:
            return Response(status=status.HTTP_400_BAD_REQUEST)

        return super().get(request, *args, **kwargs)

    def post(self, request, *args, **kwargs):
        if 'item' in request.data.keys():
            item = self.get_item(request.data['item'])
            return super().post(request, *args, **kwargs)
        return Response(status=status.HTTP_400_BAD_REQUEST)

    def perform_create(self, serializer):
        item = self.get_item(self.request.data['item'])
        serializer.save(item=item, author=self.request.user)


class CommentDetail(generics.RetrieveUpdateDestroyAPIView):

    serializer_class = CommentSerializer
    permission_classes = [IsAuthorOrReadOnly]

    def get_object(self):
        pk = self.kwargs.get('pk')
        comment = get_object_or_404(Comment, pk=pk)
        self.check_object_permissions(self.request, comment)
        return comment


class LabelList(generics.ListCreateAPIView):
    serializer_class = LabelSerializer
    permission_classes = [
        CanViewBoard
    ]

    def get_board(self, pk):
        board = get_object_or_404(Board, pk=pk)
        self.check_object_permissions(self.request, board)
        return board

    def get_queryset(self, *args, **kwargs):

        board_id = self.request.GET.get('board', None)

        board = self.get_board(board_id)
        return Label.objects.filter(board=board)

    def post(self, request, *args, **kwargs):
        if 'board' in request.data.keys():
            board = self.get_board(request.data['board'])
            return super().post(request, *args, **kwargs)
        return Response(status=status.HTTP_400_BAD_REQUEST)

    def perform_create(self, serializer):
        board = self.get_board(self.request.data['board'])
        serializer.save(board=board)


class LabelDetail(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = LabelSerializer
    permission_classes = [CanViewBoard]

    def get_object(self):
        pk = self.kwargs.get('pk')
        label = get_object_or_404(Label, pk=pk)
        self.check_object_permissions(self.request, label.board)
        return label


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


class NotificationList(APIView):
    def get(self, *args, **kwargs):
        notifications = Notification.objects.filter(
            recipient=self.request.user).order_by('-created_at')
        serializer = NotificationSerializer(notifications, many=True)
        return Response(serializer.data)

    def post(self, request, *args, **kwargs):  # Mark all as read
        Notification.objects.filter(
            recipient=self.request.user, unread=True).update(unread=False)
        return Response(status=status.HTTP_204_NO_CONTENT)
