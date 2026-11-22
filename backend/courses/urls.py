from django.urls import path
from . import views

urlpatterns = [
    path('courses/',views.course_list, name='course-list'),
    path('topics/',views.topic_list, name='topic-list'),
    path('resources/',views.learning_resource_list, name='resources'),
    path('courses/create/',views.course_create, name='course-create'),
    path('topics/create/',views.topic_create, name='topic-create'),
    path('resources/create/',views.resource_create, name='resources-create'),
    path('enrollments/', views.enrollment_list, name='enrollment-list'),
]