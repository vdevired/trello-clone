from rest_framework import serializers
from .models import Board, List, Item, Comment, Label, Attachment
from users.models import User
from projects.models import Project
from rest_framework.fields import Field
from django.urls.base import resolve, reverse
from django.urls import Resolver404
from django.core.exceptions import MultipleObjectsReturned, ObjectDoesNotExist
from django.contrib.contenttypes.models import ContentType
from django.utils.module_loading import import_string


class BoardSerializer(serializers.ModelSerializer):

    owner = serializers.SerializerMethodField()

    class Meta:
        model = Board
        fields = ['id' , 'title', 'description', 'image', 'created_at', 'owner']
    
    def get_owner(self, obj):
        object_app = obj.owner._meta.app_label
        object_name = obj.owner._meta.object_name
        if object_name == 'Project':
            object_name = 'Short' + object_name
        serializer_module_path = f'{object_app}.serializers.{object_name}Serializer'
        serializer_class = import_string(serializer_module_path)
        return serializer_class(obj.owner).data
            

class ListSerializer(serializers.ModelSerializer):

    class Meta:
        model = List
        exclude = ['board']

class ItemSerializer(serializers.ModelSerializer):

    class Meta:
        model = Item
        fields = '__all__'

class CommentSerializer(serializers.ModelSerializer):

    class Meta:
        model = Comment
        fields = '__all__'

class LabelSerializer(serializers.ModelSerializer):

    class Meta:
        model = Label
        fields = '__all__'

class AttachmentSerializer(serializers.ModelSerializer):

    class Meta:
        model = Attachment
        fields = '__all__'