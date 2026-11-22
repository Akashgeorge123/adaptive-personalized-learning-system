from django.urls import path
from . import views

urlpatterns = [
    path('recommendations/',views.recommendation_list,name='recommendation-list')
]