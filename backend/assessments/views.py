from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Assessment,Question,AnswerOption,AssessmentResult,StudentAnswer
from .serializers import (
    AssessmentSerializer,
    QuestionSerializer,
    AnswerOptionSerializer,
    AssessmentResultSerializer,
    StudentAnswerOptionSerializer
    )
from accounts.views import get_student_from_token
from django.utils import timezone

@api_view(['GET'])
def assessment_list(request):
    assessments = Assessment.objects.all()
    serializer = AssessmentSerializer(assessments, many=True)
    return Response(serializer.data)

@api_view(['GET'])
def question_list(request):
    assessment_id = request.query_params.get('assessment')

    if assessment_id:
        questions = Question.objects.filter(
            assessment_id = assessment_id
        )
    else:
        questions = Question.objects.all()

    serializer = QuestionSerializer(questions, many=True)
    return Response(serializer.data)

@api_view(['GET'])
def answer_option_list(request):
    options = AnswerOption.objects.all()
    serializer = StudentAnswerOptionSerializer(options, many=True)
    return Response(serializer.data)

@api_view(['GET'])
def assessment_result_list(request):

    student = get_student_from_token(request)

    if not student:
        return Response(
            {'error': 'Invalid or expired token'},
            status=401
        )

    results = AssessmentResult.objects.filter(
        student=student
    )

    serializer = AssessmentResultSerializer(
        results,
        many=True
    )

    return Response(serializer.data)


@api_view(['GET'])
def assessment_review(request, result_id):

    student = get_student_from_token(request)

    if not student:
        return Response(
            {'error': 'Invalid or expired token'},
            status=401
        )

    try:
        result = AssessmentResult.objects.get(
            result_id=result_id,
            student=student
        )
    except AssessmentResult.DoesNotExist:
        return Response(
            {'error': 'Assessment result not found'},
            status=404
        )

    answers = StudentAnswer.objects.filter(
        result=result
    ).select_related(
        'question',
        'selected_option'
    )

    review_data = []

    for answer in answers:

        correct_option = AnswerOption.objects.filter(
            question=answer.question,
            is_correct=True
        ).first()

        review_data.append({
            'question_id': answer.question.question_id,
            'question_text': answer.question.question_text,
            'marks': str(answer.question.marks),
            'selected_option': answer.selected_option.option_text,
            'correct_option': (
                correct_option.option_text
                if correct_option else None
            ),
            'is_correct': answer.is_correct
        })

    return Response({
        'result_id': result.result_id,
        'assessment': result.assessment.title,
        'score': str(result.score),
        'total_marks': str(result.assessment.total_marks),
        'attempted_at': result.attempted_at,
        'answers': review_data
    })


@api_view(['POST'])
def assessment_create(request):
    from accounts.views import get_admin_from_token

    admin = get_admin_from_token(request)

    if not admin:
        return Response(
            {
                "error" : "Admin authentication required",
            },
            status=401
        )
    
    serializer = AssessmentSerializer(data=request.data)

    if serializer.is_valid():
        course = serializer.validated_data['course']

        if course.admin_id != admin.admin_id:
            return Response(
                {
                    "error" : "You cannot create assessments for another admin\'s course"
                },
                status=403
            )

        assessment = serializer.save()

        return Response(
            {
                'message' : 'Assessment created successfully',
                'assessment_id' : assessment.assessment_id
            },
            status=201
        )

    return Response(serializer.errors, status=400)

@api_view(['POST'])
def question_create(request):
    from accounts.views import get_admin_from_token

    admin = get_admin_from_token(request)

    if not admin:
        return Response(
            {
                "error" : "Admin authentication required!"
            },
            status=401
        )
    
    serializer = QuestionSerializer(data=request.data)

    if serializer.is_valid():
        assessment = serializer.validated_data['assessment']

        if assessment.course.admin_id != admin.admin_id:
            return Response(
                {
                    "error" : "You cannot add questions to another admin\'s assessment"
                },
                status=403
            )
        question = serializer.save()

        return Response(
            {
                'message' : 'Question created successfully',
                'question_id' : question.question_id
            },
            status=201
        )

    return Response(serializer.errors, status=400)


@api_view(['POST'])
def answer_option_create(request):
    from accounts.views import get_admin_from_token

    admin = get_admin_from_token(request)

    if not admin:
        return Response(
            {
                "error" : "Admin authentication required"
            },
            status=401
        )
    
    serializer = AnswerOptionSerializer(data=request.data)

    if serializer.is_valid():
        question = serializer.validated_data['question']

        if question.assessment.course.admin_id != admin.admin_id:
            return Response(
                {
                    "error" : "You cannot add options to another admin\'s assessment"
                },
                status=403
            )
        
        option = serializer.save()

        return Response(
            {
                'message' : 'Answer option created successfully',
                'option_id' : option.option_id
            },
            status=201
        )

    return Response(serializer.errors ,status=400)



@api_view(['POST'])
def submit_assessment(request):

    student = get_student_from_token(request)

    if not student:
        return Response(
            {"error": "Authentication required"},
            status=401
        )

    assessment_id = request.data.get('assessment')
    answers = request.data.get('answers')

    if not assessment_id or not isinstance(answers, list) or not answers:
        return Response(
            {"error": "Assessment and answers are required"},
            status=400
        )

    if len(answers) != len(set(answers)):
        return Response(
            {"error": "Duplicate answer options are not allowed"},
            status=400
        )

    try:
        assessment = Assessment.objects.get(
            assessment_id=assessment_id
        )
    except Assessment.DoesNotExist:
        return Response(
            {"error": "Assessment not found"},
            status=404
        )

    questions = list(
        Question.objects.filter(assessment=assessment)
    )

    if len(answers) != len(questions):
        return Response(
            {"error": "Answer every question before submitting"},
            status=400
        )

    options = list(
        AnswerOption.objects.filter(
            option_id__in=answers,
            question__assessment=assessment
        ).select_related('question')
    )

    if len(options) != len(answers):
        return Response(
            {"error": "Invalid answer options"},
            status=400
        )

    selected_by_question = {
        option.question_id: option
        for option in options
    }

    if len(selected_by_question) != len(questions):
        return Response(
            {"error": "Select exactly one option per question"},
            status=400
        )

    score = 0

    for question in questions:
        selected_option = selected_by_question.get(
            question.question_id
        )

        if not selected_option:
            return Response(
                {"error": "Missing answer for a question"},
                status=400
            )

        if selected_option.is_correct:
            score += question.marks

    from django.db import transaction
    from django.utils import timezone

    with transaction.atomic():

        result = AssessmentResult.objects.create(
            student=student,
            assessment=assessment,
            score=score,
            attempted_at=timezone.now()
        )

        student_answers = []

        for question in questions:

            selected_option = selected_by_question[
                question.question_id
            ]

            student_answers.append(
                StudentAnswer(
                    result=result,
                    question=question,
                    selected_option=selected_option,
                    is_correct=selected_option.is_correct
                )
            )

        StudentAnswer.objects.bulk_create(student_answers)

    return Response({
        "message": "Assessment submitted successfully",
        "result_id": result.result_id,
        "score": str(score),
        "total_marks": str(assessment.total_marks)
    })
