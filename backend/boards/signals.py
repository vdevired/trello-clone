from django.contrib.contenttypes.models import ContentType
from django.db.models.signals import post_delete, post_save
from django.dispatch import receiver

from . import models


label_colors = ["4680ff", "61bd4f", "ffab4a", "ff0000",
                "ffb64d", "c377e0", "ff80ce", "00c2e0", "51e898", "42548e"]


@receiver(post_save, sender=models.Board)
def create_board_labels(sender, instance, created, **kwargs):
    if created:
        for color in label_colors:
            models.Label.objects.create(board=instance, color=color)


@receiver(post_save, sender=models.Comment)
def create_comment_notification(sender, instance, created, **kwargs):
    if created:
        for user in instance.item.assigned_to.all():
            if instance.author == user:  # Don't create notification if you comment
                continue
            models.Notification.objects.create(
                actor=instance.author, recipient=user,
                verb='commented', action_object=instance, target=instance.item)


@receiver(post_delete, sender=models.Comment)
def delete_comment_notification(sender, instance, **kwargs):
    models.Notification.objects.filter(
        action_object_model=ContentType.objects.get(model='comment'),
        action_object_id=instance.id).delete()

# Handle other notifications in views as we need to know request.user
