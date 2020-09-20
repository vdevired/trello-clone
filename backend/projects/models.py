from django.db import models
from users.models import User
from django.utils import timezone

# Create your models here.


class Project(models.Model):
    owner = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name='owned_projects')
    title = models.CharField(max_length=255, blank=False, null=False)
    description = models.TextField(blank=True, null=False)
    profile_picture = models.ImageField(
        blank=True, upload_to="project_profile_pics")
    created_at = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return self.title


class ProjectMembership(models.Model):
    class Access(models.IntegerChoices):
        BASE = 1            # Can view and create and move only own items
        INTERMEDIATE = 2    # Can create lists and move others items.
        OWNER = 3          # Can perform destructive actions on other's items.

    project = models.ForeignKey(
        Project, on_delete=models.CASCADE, related_name='memberships')
    member = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name='memberships')
    access_level = models.IntegerField(choices=Access.choices)
    created_at = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f'{self.member.full_name} , {self.project.title}'

    class Meta:
        unique_together = ('project', 'member')