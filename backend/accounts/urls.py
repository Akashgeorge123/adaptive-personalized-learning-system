from django.urls import path
from . import views

urlpatterns = [
    path('students/',views.student_list,name='student-list'),
    path('admins/',views.admin_list,name='admin-list'),
    path('register/', views.student_register, name='student-register'),
    path('login/', views.student_login, name='student-login'),
    path('profile/', views.student_profile, name='student-profile'),
    path('admin-login/', views.admin_login, name='admin-login'),
    path('admin-profile/', views.admin_profile, name='admin-profile'),
]