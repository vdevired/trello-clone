from django.db import models
from django.utils import timezone
from users.models import User

class Board(models.Model):
    title = models.CharField(max_length=255, blank=False, null=False)
    description = models.TextField(blank=True, null=False)
    image = models.ImageField(blank=True, upload_to='board_images')
    created_at = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return self.title

class List(models.Model):
    board = models.ForeignKey(Board, on_delete=models.CASCADE, related_name="lists")
    title = models.CharField(max_length=255, blank=False, null=False)
    created_at = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return self.title

class Item(models.Model):
    title = models.CharField(max_length=255, blank=False, null=False)
    description = models.TextField(blank=True, null=False)
    image = models.ImageField(blank=True, upload_to='item_images')
    created_at = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return self.title

class Label(models.Model):
    item = models.ForeignKey(Item, on_delete=models.CASCADE, related_name='labels')
    title = models.CharField(max_length=255, blank=False, null=False)
    color = models.CharField(max_length=255, blank=False, null=False)

    def __str__(self):
        return self.title

class Comment(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='comments')
    item = models.ForeignKey(Item, on_delete=models.CASCADE, related_name='comments')
    description = models.TextField(blank=True, null=False)

class Attachment(models.Model):
    item = models.ForeignKey(Item, on_delete=models.CASCADE, related_name='attachments')
    upload = models.FileField(upload_to='attachments')
