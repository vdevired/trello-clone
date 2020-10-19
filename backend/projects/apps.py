from django.apps import AppConfig


class ProjectsConfig(AppConfig):
    name = 'projects'
    
    def ready(self):
        import projects.signals
