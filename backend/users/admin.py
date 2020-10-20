from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as DjangoUserAdmin

from .models import User


class BoardsInline(admin.TabularInline):
    model = User.starred_boards.through
    verbose_name = "Starred Board"
    verbose_name_plural = "Starred Boards"
    extra = 0


class UserAdmin(DjangoUserAdmin):
    fieldsets = (
        (('Basic Info'), {'fields': ('username', 'email', 'first_name',
                                     'last_name', 'profile_pic', 'password')}),
        (('Permissions'), {'fields': ('is_active', 'is_staff', 'is_superuser',
                                      'groups', 'user_permissions')}),
        (('Important dates'), {'fields': ('last_login', 'date_joined')}),
    )

    add_fieldsets = (
        (None, {'fields': ('username', 'email', 'first_name',
                           'last_name', 'profile_pic', 'password1', 'password2')}),
    )

    inlines = [BoardsInline]


admin.site.register(User, UserAdmin)
