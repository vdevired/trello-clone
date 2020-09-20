from django.contrib import admin
from .models import Board, List, Item, Label, Comment, Attachment

admin.site.register(Board)
admin.site.register(List)
admin.site.register(Item)
admin.site.register(Label)
admin.site.register(Comment)
admin.site.register(Attachment)