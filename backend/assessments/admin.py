from django.contrib import admin
from assessments.models import (AnswerOption,
                                Assessment,
                                AssessmentResult,
                                Question)

admin.site.register(AnswerOption)
admin.site.register(Assessment)
admin.site.register(AssessmentResult)
admin.site.register(Question)
