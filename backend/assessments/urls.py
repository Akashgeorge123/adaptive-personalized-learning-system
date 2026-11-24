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
    path('results/<int:result_id>/review/', views.assessment_review, name='assessment-review' ),
    path('admin/assessments/',views.admin_assessment_list,name='admin-assessment-list'),
    path('admin/assessments/<int:assessment_id>/',views.admin_assessment_detail,name='admin-assessment-detail'),
    path( 'admin/assessments/<int:assessment_id>/questions/', views.admin_question_list, name='admin-question-list' ),
    path( 'admin/questions/<int:question_id>/options/', views.admin_answer_option_list, name='admin-answer-option-list' ),
    path( 'admin/questions/create/', views.admin_create_question, name='admin-create-question' ),
]