from rest_framework import serializers
from .models import Course,Topic,LearningResource,StudentCourseEnrollment

class CourseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Course
        fields = '__all__'
        read_only_fields = ['admin']


class TopicSerializer(serializers.ModelSerializer):
    class Meta:
        model = Topic
        fields = '__all__'

class LearningResourceSerializer(serializers.ModelSerializer):
    class Meta:
        model = LearningResource
        fields = '__all__'

class StudentCourseEnrollmentSerializer(serializers.ModelSerializer):
    course_details = CourseSerializer(source='course', read_only=True)

    class Meta:
        model = StudentCourseEnrollment
        fields = [
            'enrollment_id',
            'student',
            'course',
            'course_details',
            'enrolled_at',
            'status'
        ]
        read_only_fields = ['enrollment_id', 'student', 'enrolled_at']