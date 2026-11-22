from django.urls import path
from . import views

urlpatterns = [
    path('paths/',views.learning_path_list,name='learning-path-list'),
    path('learning-path-items/',views.learning_path_item_list,name='learning-path-item-list'),
    path('progress/',views.student_progress_list,name='student-progress-list'),
    path('dashboard/',views.student_dashboard,name='student-dashboard'),
    path( 'video-progress/', views.student_video_progress, name='student-video-progress' ),
    path( 'paths/generate/', views.generate_personalized_learning_path, name='generate-personalized-learning-path' ),
    path( 'progress/<int:progress_id>/', views.update_student_progress, name='update-student-progress' ),
]