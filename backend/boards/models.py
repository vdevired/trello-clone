from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType
from django.db import models
from django.db.models import Max
from django.utils import timezone
from users.models import User


class Board(models.Model):
    owner_model = models.ForeignKey(ContentType, blank=False, null=False,
                                    related_name='board',
                                    on_delete=models.CASCADE,
                                    limit_choices_to=models.Q(app_label='users', model='user') | models.Q(app_label='projects', model='project'))
    owner_id = models.PositiveIntegerField(null=True, blank=True)
    owner = GenericForeignKey('owner_model', 'owner_id')

    title = models.CharField(max_length=255, blank=False, null=False)
    description = models.TextField(blank=True, null=False)
    image = models.ImageField(blank=True, upload_to='board_images')
    created_at = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return self.title


class List(models.Model):
    board = models.ForeignKey(
        Board, on_delete=models.CASCADE, related_name="lists")
    title = models.CharField(max_length=255, blank=False, null=False)
    order = models.IntegerField(blank=True, null=True)
    created_at = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return self.title

    def save(self, *args, **kwargs):
        filtered_objects = List.objects.filter(board=self.board)
        if not self.order and filtered_objects.count() == 0:
            self.order = 1
        elif not self.order:
            self.order = filtered_objects.aggregate(Max('order'))[
                'order__max'] + 1
        return super().save(*args, **kwargs)


class Item(models.Model):
    list = models.ForeignKey(
        List, on_delete=models.CASCADE, related_name='items')
    title = models.CharField(max_length=255, blank=False, null=False)
    description = models.TextField(blank=True, null=False)
    image = models.ImageField(blank=True, upload_to='item_images')
    order = models.IntegerField(blank=True, null=True)
    assigned_to = models.ManyToManyField(User, blank=True)
    due_date = models.DateTimeField(blank=True, null=True)
    created_at = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return self.title

    def save(self, *args, **kwargs):
        filtered_objects = Item.objects.filter(list=self.list)
        if not self.order and filtered_objects.count() == 0:
            self.order = 1
        elif not self.order:
            self.order = filtered_objects.aggregate(Max('order'))[
                'order__max'] + 1
        return super().save(*args, **kwargs)


class Label(models.Model):
    item = models.ForeignKey(
        Item, on_delete=models.CASCADE, related_name='labels')
    title = models.CharField(max_length=255, blank=False, null=False)
    color = models.CharField(max_length=255, blank=False, null=False)

    def __str__(self):
        return self.title


class Comment(models.Model):
    author = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name='comments')
    item = models.ForeignKey(
        Item, on_delete=models.CASCADE, related_name='comments')
    body = models.TextField(blank=False, null=False)

    def __str__(self):
        return f'{self.author.full_name} - {self.body[:12]}'


class Attachment(models.Model):
    item = models.ForeignKey(
        Item, on_delete=models.CASCADE, related_name='attachments')
    upload = models.FileField(upload_to='attachments')


# https://help.trello.com/article/793-receiving-trello-notifications
extra_word_dict = {'commented': 'on',
                   'assigned': 'to', 'invited': 'to', 'made': 'you'}


class Notification(models.Model):
    actor = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name='actions')
    verb = models.CharField(max_length=255, blank=False, null=False)
    unread = models.BooleanField(default=True, blank=False, db_index=True)

    created_at = models.DateTimeField(default=timezone.now)

    # Optional, <actor> opened <board>
    target_model = models.ForeignKey(ContentType, blank=True, null=True,
                                     related_name='target_obj',
                                     on_delete=models.CASCADE)
    target_id = models.PositiveIntegerField(null=True, blank=True)
    target = GenericForeignKey('target_model', 'target_id')

    action_object_model = models.ForeignKey(ContentType, blank=True, null=True,
                                            related_name='action_object_obj',
                                            on_delete=models.CASCADE)
    action_object_id = models.PositiveIntegerField(null=True, blank=True)
    action_object = GenericForeignKey(
        'action_object_model', 'action_object_id')

    def __str__(self):
        if self.target:
            if self.action_object:
                return f'{self.actor.full_name} {self.verb} {extra_word_dict[self.verb]} {self.target}'
            else:
                return f'{self.actor.full_name} {self.verb} {self.target}'
        else:
            return f'{self.actor.full_name} {self.verb}'

    """
    <actor> commented <comment> on <item>, you were assigned to this item
    <actor> assigned <you> to <item>
    <actor> invited <you> to <project>
    <actor> made <you> admin of <project>
    """
