from django.db import transaction
from courses.models import Topic
from ml_engine.service import get_topic_mastery_predictions

from .serializers import (
    LearningPathSerializer,
    LearningPathItemSerializer,
    StudentProgressSerializer,
    StudentVideoProgressSerializer
)
from .models import (
    LearningPath,
    LearningPathItem, 
    StudentProgress,
    StudentVideoProgress
)

from accounts.views import get_student_from_token
from accounts.serializers import StudentSerializer
from assessments.models import AssessmentResult
from assessments.serializers import AssessmentResultSerializer
from recommendations.models import Recommendation
from recommendations.serializers import RecommendationSerializer

from rest_framework.decorators import api_view
from rest_framework.response import Response

from django.utils import timezone

@api_view(['GET'])
def learning_path_list(request):
    student = get_student_from_token(request)

    if not student:
        return Response(
            {
                "error" : "Authentication required"
            },
            status=401
        )

    paths = LearningPath.objects.filter(student=student)
    serializer = LearningPathSerializer(paths, many=True)

    return Response(serializer.data)

@api_view(['GET'])
def learning_path_item_list(request):
    student = get_student_from_token(request)

    if not student:
        return Response(
            {
                "error" : "Authentication required"
            },
            status=401
        )
    
    items = LearningPathItem.objects.filter(path__student=student)
    serializer = LearningPathItemSerializer(items, many=True)
    return Response(serializer.data)

@api_view(['GET'])
def student_progress_list(request):
    student = get_student_from_token(request)

    if not student:
        return Response(
            {
                "error" : "Authentication required",
            },
            status=401
        )

    progress = StudentProgress.objects.filter(student=student)

    serializer = StudentProgressSerializer(progress, many=True)

    return Response(serializer.data)

@api_view(['PATCH'])
def update_student_progress(request, progress_id):
    student = get_student_from_token(request)

    if not student:
        return Response(
            {"error": "Authentication required"},
            status=401
        )

    try:
        progress = StudentProgress.objects.get(
            progress_id=progress_id,
            student=student
        )
    except StudentProgress.DoesNotExist:
        return Response(
            {"error": "Progress record not found"},
            status=404
        )

    completion_status = request.data.get('completion_status')

    allowed_statuses = [
        'not started',
        'in progress',
        'completed'
    ]

    if completion_status not in allowed_statuses:
        return Response(
            {"error": "Invalid completion status"},
            status=400
        )

    progress.completion_status = completion_status

    if completion_status == 'completed':
        progress.completed_at = timezone.now()
    else:
        progress.completed_at = None

    progress.save()

    return Response(StudentProgressSerializer(progress).data)

@api_view(['GET'])
def student_dashboard(request):
    student = get_student_from_token(request)

    if not student:
        return Response(
            {
                "error" : "Authentication Required"
            },
            status=401
        )

    paths = LearningPath.objects.filter(student=student)
    progress = StudentProgress.objects.filter(student=student)
    results = AssessmentResult.objects.filter(student=student)
    recommendations = Recommendation.objects.filter(student=student)

    return Response(
        {
            "student" : StudentSerializer(student).data,
            "learning_paths" : LearningPathSerializer(paths, many=True).data,
            "progress" : StudentProgressSerializer(progress, many=True).data,
            "assessment_results" : AssessmentResultSerializer(results, many=True).data,
            "recommendations" : RecommendationSerializer(recommendations, many=True).data
        }
    )


@api_view(['GET', 'POST'])
def student_video_progress(request):
    student = get_student_from_token(request)

    if not student:
        return Response(
            {"error": "Authentication required"},
            status=401
        )

    if request.method == 'GET':
        progress = StudentVideoProgress.objects.filter(
            student=student
        ).order_by('-last_watched_at')

        serializer = StudentVideoProgressSerializer(
            progress,
            many=True
        )

        return Response(serializer.data)

    serializer = StudentVideoProgressSerializer(
        data=request.data
    )

    if serializer.is_valid():
        resource = serializer.validated_data['resource']

        progress, created = StudentVideoProgress.objects.update_or_create(
            student=student,
            resource=resource,
            defaults={
                'last_position_seconds': serializer.validated_data.get(
                    'last_position_seconds', 0
                ),
                'duration_seconds': serializer.validated_data.get(
                    'duration_seconds', 0
                ),
                'completed': serializer.validated_data.get(
                    'completed', False
                ),
                'last_watched_at': timezone.now(),
            }
        )

        return Response(
            StudentVideoProgressSerializer(progress).data,
            status=201 if created else 200
        )

    return Response(serializer.errors, status=400)

@api_view(['POST'])
def generate_personalized_learning_path(request):
    student = get_student_from_token(request)

    if not student:
        return Response(
            {"error": "Authentication required"},
            status=401
        )

    # Get ML predictions for this student's assessment performance
    predictions = get_topic_mastery_predictions(student)

    # Keep only topics classified as Low Mastery
    weak_topics = [
        item for item in predictions
        if item['mastery_level'] == 'Low'
    ]

    if not weak_topics:
        return Response({
            "message": "No low-mastery topics found. Complete more assessments to generate a learning path.",
            "learning_paths": []
        })

    # Group weak topics by course
    topics_by_course = {}

    for item in weak_topics:
        course_id = item['course_id']
        topics_by_course.setdefault(course_id, []).append(item)

    generated_paths = []

    with transaction.atomic():

        for course_id, course_topics in topics_by_course.items():

            # Sort weakest topics first
            course_topics.sort(
                key=lambda item: (
                    item['topic_accuracy_pct'],
                    item['recent_accuracy_pct']
                )
            )

            first_topic = Topic.objects.select_related('course').get(
                topic_id=course_topics[0]['topic_id']
            )

            course = first_topic.course
            path_title = f"AI Revision Path - {course.title}"

            # Reuse an existing active path instead of creating duplicates
            path, path_created = LearningPath.objects.get_or_create(
                student=student,
                title=path_title,
                status='active',
                defaults={
                    'description': (
                        f"An AI-generated revision path for {course.title}, "
                        "based on your assessment performance."
                    ),
                    'created_at': timezone.now()
                }
            )

            # Continue numbering after any existing path items
            last_item = LearningPathItem.objects.filter(
                path=path
            ).order_by('-sequence_number').first()

            next_sequence = (
                last_item.sequence_number + 1 if last_item else 1
            )

            for prediction in course_topics:

                topic = Topic.objects.get(
                    topic_id=prediction['topic_id']
                )

                path_item, item_created = LearningPathItem.objects.get_or_create(
                    path=path,
                    topic=topic,
                    defaults={
                        'sequence_number': next_sequence
                    }
                )

                if item_created:
                    next_sequence += 1

                # Create progress only if it doesn't already exist
                StudentProgress.objects.get_or_create(
                    student=student,
                    item=path_item,
                    defaults={
                        'completion_status': 'not started',
                        'completed_at': None
                    }
                )

            generated_paths.append({
                "path_id": path.path_id,
                "title": path.title,
                "course": course.title,
                "topics_added": len(course_topics)
            })

    return Response({
        "message": "Personalized learning paths generated successfully.",
        "learning_paths": generated_paths
    })

