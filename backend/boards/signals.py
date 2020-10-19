from django.contrib.contenttypes.models import ContentType
from django.db.models.signals import post_delete, post_save
from django.dispatch import receiver

from . import models


@receiver(post_save, sender=models.Comment)
def create_comment_notification(sender, instance, created, **kwargs):
    if created:
        for user in instance.item.assigned_to.all():
            models.Notification.objects.create(
                actor=instance.author, recipient=user,
                verb='commented', action_object=instance, target=instance.item)


@receiver(post_delete, sender=models.Comment)
def delete_comment_notification(sender, instance, **kwargs):
    models.Notification.objects.filter(
        action_object_model=ContentType.objects.get(model='comment'),
        action_object_id=instance.id).delete()

# Handle other notifications in views as we need to know request.user
