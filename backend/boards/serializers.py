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


class BoardSerializer(serializers.ModelSerializer):
    owner = serializers.SerializerMethodField()
    is_starred = serializers.SerializerMethodField()

    class Meta:
        model = Board
        fields = ['id', 'title', 'description', 'image',
                  'created_at', 'owner', 'is_starred']

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


class LabelSerializer(serializers.ModelSerializer):

    class Meta:
        model = Label
        exclude = ('id', 'item',)


class ItemSerializer(serializers.ModelSerializer):
    labels = LabelSerializer(many=True, read_only=True)

    class Meta:
        model = Item
        exclude = ['list']


class ListSerializer(serializers.ModelSerializer):
    items = ItemSerializer(many=True, read_only=True)

    class Meta:
        model = List
        exclude = ['board']


class CommentSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)

    class Meta:
        model = Comment
        exclude = ['item']


class AttachmentSerializer(serializers.ModelSerializer):

    class Meta:
        model = Attachment
        fields = '__all__'


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
