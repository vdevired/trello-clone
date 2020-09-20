from django.contrib import admin
from .models import Project, ProjectMembership

admin.site.register(Project)
admin.site.register(ProjectMembership)