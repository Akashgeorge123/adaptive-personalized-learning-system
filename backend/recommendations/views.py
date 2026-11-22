from ml_engine.service import get_topic_mastery_predictions
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.utils import timezone

from .models import Recommendation
from .serializers import RecommendationSerializer
from accounts.views import get_student_from_token
from assessments.models import StudentAnswer


@api_view(['GET'])
def recommendation_list(request):
    student = get_student_from_token(request)

    if not student:
        return Response(
            {"error": "Authentication required"},
            status=401
        )

    answers = StudentAnswer.objects.filter(
        result__student=student
    ).select_related(
        'question__topic',
        'question__assessment__course'
    )

    course_stats = {}

    for answer in answers:
        question = answer.question
        topic = question.topic
        course = question.assessment.course

        if course.pk not in course_stats:
            course_stats[course.pk] = {
                'course': course,
                'total': 0,
                'wrong': 0,
                'topics': {}
            }

        stats = course_stats[course.pk]
        stats['total'] += 1

        if not answer.is_correct:
            stats['wrong'] += 1

            topic_id = topic.pk

            if topic_id not in stats['topics']:
                stats['topics'][topic_id] = {
                    'name': str(topic),
                    'wrong': 0
                }

            stats['topics'][topic_id]['wrong'] += 1

    recommended_course_ids = []

    for course_id, stats in course_stats.items():
        if stats['wrong'] == 0:
            continue

        course = stats['course']
        recommended_course_ids.append(course_id)

        weak_topics = sorted(
            stats['topics'].values(),
            key=lambda item: item['wrong'],
            reverse=True
        )

        topic_names = [
            topic['name'] for topic in weak_topics[:3]
        ]

        error_percentage = round(
            (stats['wrong'] / stats['total']) * 100, 2
        )

        reason = (
            f"You answered {stats['wrong']} out of "
            f"{stats['total']} questions incorrectly. "
            f"Focus on improving these topics: "
            f"{', '.join(topic_names)}."
        )

        recommendation, created = Recommendation.objects.update_or_create(
            student=student,
            course=course,
            defaults={
                'reason': reason,
                'suitability_score': error_percentage,
                'created_at': timezone.now()
            }
        )

    # Remove outdated recommendations for this student.
    Recommendation.objects.filter(
        student=student
    ).exclude(
        course_id__in=recommended_course_ids
    ).delete()

    recommendations = Recommendation.objects.filter(
        student=student
    ).order_by('-suitability_score')

    serializer = RecommendationSerializer(
        recommendations,
        many=True
    )

    response_data = serializer.data

    for item in response_data:
        stats = course_stats.get(item['course'], {})

        weak_topics = sorted(
            stats.get('topics', {}).items(),
            key=lambda topic: topic[1]['wrong'],
            reverse=True
        )

        item['weak_topics'] = [
            {
                'topic_id': topic_id,
                'topic_name': topic_data['name'],
                'wrong_answers': topic_data['wrong']
            }
            for topic_id, topic_data in weak_topics
        ]


    # Generate ML-based topic mastery predictions
    ml_predictions = get_topic_mastery_predictions(student)

    return Response({
        "recommendations": response_data,
        "topic_mastery": ml_predictions
    })
