from django.contrib.contenttypes.models import ContentType
from django.core.exceptions import MultipleObjectsReturned, ObjectDoesNotExist
from django.urls import Resolver404
from django.urls.base import resolve, reverse
from django.utils.module_loading import import_string
from projects.models import Project
from rest_framework import serializers
from rest_framework.fields import Field
from users.models import User
from users.serializers import UserSerializer

from .models import Attachment, Board, Comment, Item, Label, List, Notification


class LabelSerializer(serializers.ModelSerializer):

    class Meta:
        model = Label
        exclude = ('board',)


class CommentSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)

    class Meta:
        model = Comment
        exclude = ['item']


class AttachmentSerializer(serializers.ModelSerializer):

    class Meta:
        model = Attachment
        fields = '__all__'


class ItemSerializer(serializers.ModelSerializer):
    labels = LabelSerializer(many=True, read_only=True)
    attachments = AttachmentSerializer(many=True, read_only=True)
    assigned_to = serializers.SerializerMethodField()

    class Meta:
        model = Item
        exclude = ['list']

    def get_assigned_to(self, obj):
        queryset = obj.assigned_to.all()
        return UserSerializer(queryset, many=True).data


class ListSerializer(serializers.ModelSerializer):
    items = serializers.SerializerMethodField()

    class Meta:
        model = List
        exclude = ['board']

    def get_items(self, obj):
        queryset = Item.objects.filter(list=obj).order_by('order')
        return ItemSerializer(queryset, many=True).data
        

# For homepage, exclude lists
class ShortBoardSerializer(serializers.ModelSerializer):
    owner = serializers.SerializerMethodField()
    is_starred = serializers.SerializerMethodField()
    list_count = serializers.SerializerMethodField()
    item_count = serializers.SerializerMethodField()

    class Meta:
        model = Board
        fields = ['id', 'title', 'image', 'image_url',
                  'color', 'owner', 'is_starred', 'list_count', 'item_count']

    def get_is_starred(self, obj):
        request_user = self.context.get('request').user
        return request_user.starred_boards.filter(pk=obj.pk).exists()

    def get_owner(self, obj):
        object_app = obj.owner._meta.app_label
        object_name = obj.owner._meta.object_name
        if object_name == 'Project':
            object_name = 'Short' + object_name
        serializer_module_path = f'{object_app}.serializers.{object_name}Serializer'
        serializer_class = import_string(serializer_module_path)
        return serializer_class(obj.owner).data

    def get_list_count(self, obj):
        return List.objects.filter(board=obj).count()

    def get_item_count(self, obj):
        lists = List.objects.filter(board=obj)
        return Item.objects.filter(list__in=lists).count()

    def validate(self, data):
        background_keys = ["image", "image_url", "color"]
        if any(item in data.keys() for item in background_keys) == False:
            raise serializers.ValidationError(
                "A board background must be provided")

        return data


class BoardSerializer(ShortBoardSerializer):
    lists = serializers.SerializerMethodField()

    class Meta:
        model = Board
        fields = ['id', 'title', 'description', 'image', 'image_url',
                  'color', 'created_at', 'owner', 'lists', 'is_starred', ]

    def get_lists(self, obj):
        queryset = List.objects.filter(board=obj).order_by('order')
        return ListSerializer(queryset, many=True).data

    def validate(self, data):
        return data  # No need to pass in image/image_url/color while editing board


class NotificationSerializer(serializers.ModelSerializer):
    actor = UserSerializer(read_only=True)
    target_model = serializers.SerializerMethodField()
    target = serializers.SerializerMethodField()
    action_object = serializers.SerializerMethodField()

    class Meta:
        model = Notification
        fields = ['id', 'actor', 'verb', 'target_model',
                  'target', 'action_object', 'unread', 'created_at']

    def get_target_model(self, obj):
        object_name = obj.target._meta.object_name
        return object_name

    def get_target(self, obj):
        object_app = obj.target._meta.app_label
        object_name = obj.target._meta.object_name
        if object_name == 'Project':
            object_name = 'Short' + object_name
        serializer_module_path = f'{object_app}.serializers.{object_name}Serializer'
        serializer_class = import_string(serializer_module_path)
        return serializer_class(obj.target).data

    def get_action_object(self, obj):
        object_app = obj.action_object._meta.app_label
        object_name = obj.action_object._meta.object_name
        serializer_module_path = f'{object_app}.serializers.{object_name}Serializer'
        serializer_class = import_string(serializer_module_path)
        return serializer_class(obj.action_object).data
