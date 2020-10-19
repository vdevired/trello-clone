from django.apps import AppConfig


class BoardsConfig(AppConfig):
    name = 'boards'

    def ready(self):
        import boards.signals
