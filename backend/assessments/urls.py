from django.urls import path
from . import views

urlpatterns = [
    path('assessments/',views.assessment_list,name='assessment-list'),
    path('questions/',views.question_list,name='question-list'),
    path('answer-options/',views.answer_option_list,name='answer-option-list'),
    path('results/',views.assessment_result_list,name='assessment-result-list'),
    path('assessments/create/',views.assessment_create,name='assessment-create'),
    path('questions/create/',views.question_create,name='question-create'),
    path('answer-options/create/',views.answer_option_create,name='answer-option-create'),
    path('assessments/submit/',views.submit_assessment,name='assessment-submit'),
    path( 'results/<int:result_id>/review/', views.assessment_review, name='assessment-review' ),
]