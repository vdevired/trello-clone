from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Project, ProjectMembership

@receiver(post_save, sender=Project)
def create_project_owner_membership(sender, instance, created, **kwargs):
    if created:
        ProjectMembership.objects.create(member=instance.owner, project=instance, access_level=2)