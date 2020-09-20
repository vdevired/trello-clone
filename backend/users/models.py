from django.contrib.auth.models import AbstractUser, UserManager
from django.db import models


class CustomUserManager(UserManager):
    def get_by_natural_key(self, username):
        case_insensitive_username_field = '{}__iexact'.format(self.model.USERNAME_FIELD)
        return self.get(**{case_insensitive_username_field: username})

    def filter(self, **kwargs):
        if 'email' in kwargs:
            kwargs['email__iexact'] = kwargs['email']
            del kwargs['email']
        return super(CustomUserManager, self).filter(**kwargs)

    def get(self, **kwargs):
        if 'email' in kwargs:
            kwargs['email__iexact'] = kwargs['email']
            del kwargs['email']
        return super(CustomUserManager, self).get(**kwargs)

class User(AbstractUser):
    username = models.CharField(max_length=15, blank=False, null=False, unique=True)
    email = models.EmailField(max_length=255, blank=False, null=False, unique=True)
    first_name = models.CharField(max_length=255, blank=False, null=False)
    last_name = models.CharField(max_length=255, blank=False, null=False)

    profile_pic = models.ImageField(blank=True, upload_to='profile_pics')

    objects = CustomUserManager()
