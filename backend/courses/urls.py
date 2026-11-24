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
    path('admin/courses/', views.admin_course_list, name='admin-course-list'),
    path('admin/courses/<int:course_id>/', views.admin_course_detail, name='admin-course-detail'),
    path('admin/topics/', views.admin_topic_list, name='admin-topic-list'),
    path('admin/topics/<int:topic_id>/', views.admin_topic_detail, name='admin-topic-detail'),
    path('admin/resources/',views.admin_resource_list,name='admin-resource-list'),
    path('admin/resources/<int:resource_id>/',views.admin_resource_detail,name='admin-resource-detail'),
]