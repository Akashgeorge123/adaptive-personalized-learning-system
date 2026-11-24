from rest_framework import serializers
from .models import LearningPath,LearningPathItem,StudentProgress,StudentVideoProgress

class LearningPathSerializer(serializers.ModelSerializer):
    class Meta:
        model = LearningPath
        fields = '__all__'


class LearningPathItemSerializer(serializers.ModelSerializer):
    topic_title = serializers.CharField(
        source='topic.title',
        read_only=True
    )

    course_title = serializers.CharField(
        source='topic.course.title',
        read_only=True
    )

    class Meta:
        model = LearningPathItem
        fields = '__all__'


class StudentProgressSerializer(serializers.ModelSerializer):
    topic_title = serializers.CharField(
        source='item.topic.title',
        read_only=True
    )

    course_title = serializers.CharField(
        source='item.topic.course.title',
        read_only=True
    )

    course_id = serializers.IntegerField(
            source = 'item.topic.course.course_id',
            read_only = True
        )

    path_title = serializers.CharField(
        source='item.path.title',
        read_only=True
    )

    sequence_number = serializers.IntegerField(
        source='item.sequence_number',
        read_only=True
    )

    class Meta:
        model = StudentProgress
        fields = '__all__'

class StudentVideoProgressSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudentVideoProgress
        fields = [
            'video_progress_id',
            'student',
            'resource',
            'last_position_seconds',
            'duration_seconds',
            'completed',
            'last_watched_at',
        ]
        read_only_fields = [
            'video_progress_id',
            'student',
            'last_watched_at',
        ]


