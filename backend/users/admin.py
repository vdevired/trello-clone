from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as DjangoUserAdmin

from .models import User


class UserAdmin(DjangoUserAdmin):
    fieldsets = (
        (('Basic Info'), {'fields': ('username', 'email', 'first_name', 'last_name', 'profile_pic', 'password')}),
        (('Permissions'), {'fields': ('is_active', 'is_staff', 'is_superuser',
                                       'groups', 'user_permissions')}),
        (('Important dates'), {'fields': ('last_login', 'date_joined')}),
    )

    add_fieldsets = (
        (None, {'fields': ('username', 'email', 'first_name', 'last_name', 'profile_pic', 'password1', 'password2')}),
    )

admin.site.register(User, UserAdmin)
