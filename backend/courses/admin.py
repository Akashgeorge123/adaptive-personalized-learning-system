from django.contrib import admin
from courses.models import Course, Topic, LearningResource


@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ('course_id', 'title', 'level', 'admin')
    list_filter = ('level',)
    search_fields = ('title', 'description')

admin.site.register(Topic)
admin.site.register(LearningResource)