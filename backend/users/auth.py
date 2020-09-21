from django.contrib.auth import get_user_model
from django.contrib.auth.backends import ModelBackend

# Whatever the user types into the username field is passed into the standard backend and then here
# If my email is another user's username and I try logging in with my email
# It will match the other user's account before mine as the standard authentication backend is used first
# So I can only log in with my username
# Hence, we will now allow '@' in usernames - peep the RegexValidator in models.py

class EmailBackend(ModelBackend):
    def authenticate(self, request, username=None, password=None, **kwargs):
        UserModel = get_user_model()
        try:
            user = UserModel.objects.get(email=username)
        except UserModel.DoesNotExist:
            return None
        else:
            if user.check_password(password):
                return user
        return None