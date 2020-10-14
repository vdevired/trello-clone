from django.db.models.signals import post_save, m2m_changed
from django.dispatch import receiver
from . import models


@receiver(post_save, sender=models.Comment)
def create_comment_notification(sender, instance, created, **kwargs):
    if created:
        models.Notification.objects.create(
            actor=instance.author, verb='commented', action_object=instance, target=instance.item)

# Handle notification for assigning user via views as we need to know who assigned the user
# and cannot access request.user in signals
