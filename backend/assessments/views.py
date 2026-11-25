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
from courses.models import Topic
from accounts.views import get_student_from_token
from django.db import transaction
from django.utils import timezone
from decimal import Decimal, InvalidOperation

@api_view(['GET'])
def assessment_list(request):

    student = get_student_from_token(request)

    if not student:
        return Response(
            {"error": "Authentication required"},
            status=401
        )

    assessments = Assessment.objects.filter(
        course__studentcourseenrollment__student=student,
        course__studentcourseenrollment__status='active'
    ).distinct()

    serializer = AssessmentSerializer(assessments, many=True)

    return Response(serializer.data)

@api_view(['GET'])
def question_list(request):

    student = get_student_from_token(request)

    if not student:
        return Response(
            {"error": "Authentication required"},
            status=401
        )

    assessment_id = request.query_params.get('assessment')

    if assessment_id and not assessment_id.isdigit():
        return Response(
            {"error": "Invalid assessment ID"},
            status=400
        )

    questions = Question.objects.filter(
        assessment__course__studentcourseenrollment__student=student,
        assessment__course__studentcourseenrollment__status='active'
    ).distinct()

    if assessment_id:
        questions = questions.filter(
            assessment_id=int(assessment_id)
        )

    serializer = QuestionSerializer(questions, many=True)

    return Response(serializer.data)

@api_view(['GET'])
def answer_option_list(request):

    student = get_student_from_token(request)

    if not student:
        return Response(
            {"error": "Authentication required"},
            status=401
        )

    options = AnswerOption.objects.filter(
        question__assessment__course__studentcourseenrollment__student=student,
        question__assessment__course__studentcourseenrollment__status='active'
    ).distinct()

    serializer = StudentAnswerOptionSerializer(
        options,
        many=True
    )

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
        result = AssessmentResult.objects.select_related(
            'assessment'
        ).get(
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

    correct_options = {
        option.question_id: option.option_text
        for option in AnswerOption.objects.filter(
            question__assessment=result.assessment,
            is_correct=True
        )
    }

    review_data = []

    for answer in answers:

        review_data.append({
            'question_id': answer.question.question_id,
            'question_text': answer.question.question_text,
            'marks': str(answer.question.marks),
            'selected_option': answer.selected_option.option_text,
            'correct_option': correct_options.get(answer.question_id),
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
        topic = serializer.validated_data['topic']

        if topic.course_id != assessment.course_id:
            return Response(
                {
                    "error": "The selected topic must belong to the assessment's course"
                },
                status=400
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

    if (
        not isinstance(assessment_id, (int, str))
        or isinstance(assessment_id, bool)
        or not str(assessment_id).isdigit()
    ):
        return Response(
            {"error": "Invalid assessment ID"},
            status=400
        )

    if not isinstance(answers, list) or not answers:
        return Response(
            {"error": "Assessment and answers are required"},
            status=400
        )

    if not all(
        isinstance(answer, (int, str)) and not isinstance(answer, bool) and str(answer).isdigit()
        for answer in answers
    ):
        return Response(
            {"error": "Invalid answer format"},
            status=400
        )

    answers = [int(answer) for answer in answers]

    if len(answers) != len(set(answers)):
        return Response(
            {"error": "Duplicate answer options are not allowed"},
            status=400
        )

    try:
        assessment = Assessment.objects.get(
            assessment_id=assessment_id,
            course__studentcourseenrollment__student=student,
            course__studentcourseenrollment__status='active'
        )
    except Assessment.DoesNotExist:
        return Response(
            {"error": "Assessment not found or you are not enrolled in its course"},
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


@api_view(['GET'])
def admin_assessment_list(request):
    from accounts.views import get_admin_from_token

    admin = get_admin_from_token(request)

    if not admin:
        return Response(
            {"error": "Admin authentication required"},
            status=401
        )

    assessments = Assessment.objects.filter(
        course__admin=admin
    ).select_related('course')

    serializer = AssessmentSerializer(assessments, many=True)

    return Response(serializer.data)


@api_view(['GET', 'PUT', 'PATCH', 'DELETE'])
def admin_assessment_detail(request, assessment_id):
    from accounts.views import get_admin_from_token

    admin = get_admin_from_token(request)

    if not admin:
        return Response(
            {"error": "Admin authentication required"},
            status=401
        )

    try:
        assessment = Assessment.objects.get(
            assessment_id=assessment_id,
            course__admin=admin
        )
    except Assessment.DoesNotExist:
        return Response(
            {"error": "Assessment not found"},
            status=404
        )

    if request.method == 'GET':
        serializer = AssessmentSerializer(assessment)
        return Response(serializer.data)

    elif request.method in ['PUT', 'PATCH']:
        serializer = AssessmentSerializer(
            assessment,
            data=request.data,
            partial=request.method == 'PATCH'
        )

        if serializer.is_valid():
            course = serializer.validated_data.get(
                'course',
                assessment.course
            )

            if course.admin_id != admin.admin_id:
                return Response(
                    {"error": "You cannot assign an assessment to another admin's course"},
                    status=403
                )

            serializer.save()

            return Response({
                "message": "Assessment updated successfully",
                "assessment": serializer.data
            })

        return Response(serializer.errors, status=400)

    elif request.method == 'DELETE':

        has_results = AssessmentResult.objects.filter(
            assessment=assessment
        ).exists()

        has_questions = Question.objects.filter(
            assessment=assessment
        ).exists()

        if has_results or has_questions:
            return Response(
                {
                    "error": "Cannot delete this assessment because it has questions or student results."
                },
                status=400
            )

        assessment.delete()

        return Response({
            "message": "Assessment deleted successfully"
        })

@api_view(['GET'])
def admin_question_list(request, assessment_id):
    from accounts.views import get_admin_from_token

    admin = get_admin_from_token(request)

    if not admin:
        return Response(
            {"error": "Admin authentication required"},
            status=401
        )

    try:
        assessment = Assessment.objects.get(
            assessment_id=assessment_id,
            course__admin=admin
        )
    except Assessment.DoesNotExist:
        return Response(
            {"error": "Assessment not found"},
            status=404
        )

    questions = Question.objects.filter(
        assessment=assessment
    ).select_related('topic')

    serializer = QuestionSerializer(questions, many=True)

    return Response(serializer.data)

@api_view(['GET'])
def admin_answer_option_list(request, question_id):
    from accounts.views import get_admin_from_token

    admin = get_admin_from_token(request)

    if not admin:
        return Response(
            {"error": "Admin authentication required"},
            status=401
        )

    try:
        question = Question.objects.get(
            question_id=question_id,
            assessment__course__admin=admin
        )
    except Question.DoesNotExist:
        return Response(
            {"error": "Question not found"},
            status=404
        )

    options = AnswerOption.objects.filter(
        question=question
    )

    serializer = AnswerOptionSerializer(options, many=True)

    return Response(serializer.data)


@api_view(['POST'])
def admin_create_question(request):
    from accounts.views import get_admin_from_token

    admin = get_admin_from_token(request)

    if not admin:
        return Response(
            {"error": "Admin authentication required"},
            status=401
        )

    # Get submitted data
    assessment_id = request.data.get('assessment')
    topic_id = request.data.get('topic')
    question_text = request.data.get('question_text')
    marks_value = request.data.get('marks')
    difficulty = request.data.get('difficulty')
    options = request.data.get('options')

    # Validate required fields
    if not all([
        assessment_id,
        topic_id,
        question_text,
        marks_value,
        difficulty
    ]):
        return Response(
            {"error": "All question fields are required"},
            status=400
        )

    if not isinstance(question_text, str) or not question_text.strip():
        return Response(
            {"error": "Question text cannot be empty"},
            status=400
        )

    # Validate marks
    try:
        marks = Decimal(str(marks_value))

        if not marks.is_finite() or marks <= 0:
            raise ValueError

    except (InvalidOperation, ValueError):
        return Response(
            {"error": "Marks must be a valid positive number"},
            status=400
        )

    # Validate difficulty
    if difficulty not in ['easy', 'medium', 'hard']:
        return Response(
            {"error": "Invalid difficulty"},
            status=400
        )

    # Validate options
    if not isinstance(options, list) or len(options) != 4:
        return Response(
            {"error": "Exactly four answer options are required"},
            status=400
        )

    if any(not isinstance(option, dict) for option in options):
        return Response(
            {"error": "Invalid answer option format"},
            status=400
        )

    option_texts = []

    for option in options:
        text = option.get('option_text')
        is_correct = option.get('is_correct')

        if not isinstance(text, str) or not text.strip():
            return Response(
                {"error": "All four options must have text"},
                status=400
            )

        if not isinstance(is_correct, bool):
            return Response(
                {"error": "Invalid correct-answer selection"},
                status=400
            )

        option_texts.append(text.strip())

    if len(set(text.lower() for text in option_texts)) != 4:
        return Response(
            {"error": "Answer options must be different"},
            status=400
        )

    if sum(option['is_correct'] for option in options) != 1:
        return Response(
            {"error": "Exactly one option must be correct"},
            status=400
        )

    try:
        assessment = Assessment.objects.get(
            assessment_id=assessment_id,
            course__admin=admin
        )

        topic = Topic.objects.get(
            topic_id=topic_id,
            course_id=assessment.course_id
        )

        # Check total question marks
        existing_marks = sum(
            Question.objects.filter(
                assessment=assessment
            ).values_list('marks', flat=True),
            Decimal('0')
        )

        if existing_marks + marks > assessment.total_marks:
            return Response(
                {"error": "Question marks exceed the assessment's total marks"},
                status=400
            )

        # Save question and options together
        with transaction.atomic():

            question = Question.objects.create(
                assessment=assessment,
                topic=topic,
                question_text=question_text.strip(),
                marks=marks,
                difficulty=difficulty
            )

            created_options = []

            for option in options:
                created_options.append(
                    AnswerOption.objects.create(
                        question=question,
                        option_text=option['option_text'].strip(),
                        is_correct=option['is_correct']
                    )
                )

        return Response({
            "message": "Question created successfully",
            "question_id": question.question_id,
            "options": AnswerOptionSerializer(
                created_options,
                many=True
            ).data
        }, status=201)

    except Assessment.DoesNotExist:
        return Response(
            {"error": "Assessment not found or access denied"},
            status=404
        )

    except Topic.DoesNotExist:
        return Response(
            {"error": "Topic does not belong to this assessment's course"},
            status=400
        )


@api_view(['PUT'])
def admin_update_question(request, question_id):
    from accounts.views import get_admin_from_token

    admin = get_admin_from_token(request)

    if not admin:
        return Response(
            {"error": "Admin authentication required"},
            status=401
        )

    try:
        question = Question.objects.select_related(
            'assessment'
        ).get(
            question_id=question_id,
            assessment__course__admin=admin
        )
    except Question.DoesNotExist:
        return Response(
            {"error": "Question not found"},
            status=404
        )

    # Protect submitted assessment history
    if AssessmentResult.objects.filter(
        assessment=question.assessment
    ).exists():
        return Response(
            {"error": "Questions cannot be edited after students have attempted this assessment"},
            status=400
        )

    topic_id = request.data.get('topic')
    question_text = request.data.get('question_text')
    marks_value = request.data.get('marks')
    difficulty = request.data.get('difficulty')
    options = request.data.get('options')

    if not all([
        topic_id,
        question_text,
        marks_value,
        difficulty
    ]):
        return Response(
            {"error": "All question fields are required"},
            status=400
        )

    if not isinstance(question_text, str) or not question_text.strip():
        return Response(
            {"error": "Question text cannot be empty"},
            status=400
        )

    # Validate marks
    try:
        marks = Decimal(str(marks_value))

        if not marks.is_finite() or marks <= 0:
            raise ValueError

    except (InvalidOperation, ValueError):
        return Response(
            {"error": "Marks must be a valid positive number"},
            status=400
        )

    # Validate difficulty
    if difficulty not in ['easy', 'medium', 'hard']:
        return Response(
            {"error": "Invalid difficulty"},
            status=400
        )

    # Validate options
    if not isinstance(options, list) or len(options) != 4:
        return Response(
            {"error": "Exactly four answer options are required"},
            status=400
        )

    if any(not isinstance(option, dict) for option in options):
        return Response(
            {"error": "Invalid answer option format"},
            status=400
        )

    option_texts = []

    for option in options:
        text = option.get('option_text')
        is_correct = option.get('is_correct')

        if not isinstance(text, str) or not text.strip():
            return Response(
                {"error": "All four options must have text"},
                status=400
            )

        if not isinstance(is_correct, bool):
            return Response(
                {"error": "Invalid correct-answer selection"},
                status=400
            )

        option_texts.append(text.strip())

    if len(set(text.lower() for text in option_texts)) != 4:
        return Response(
            {"error": "Answer options must be different"},
            status=400
        )

    if sum(option['is_correct'] for option in options) != 1:
        return Response(
            {"error": "Exactly one option must be correct"},
            status=400
        )

    # Validate topic belongs to the same course
    try:
        topic = Topic.objects.get(
            topic_id=topic_id,
            course_id=question.assessment.course_id
        )
    except Topic.DoesNotExist:
        return Response(
            {"error": "Topic does not belong to this assessment's course"},
            status=400
        )

    # Check total question marks
    existing_marks = sum(
        Question.objects.filter(
            assessment=question.assessment
        ).exclude(
            question_id=question.question_id
        ).values_list('marks', flat=True),
        Decimal('0')
    )

    if existing_marks + marks > question.assessment.total_marks:
        return Response(
            {"error": "Question marks exceed the assessment's total marks"},
            status=400
        )

    # Update question and options together
    with transaction.atomic():
        question.topic = topic
        question.question_text = question_text.strip()
        question.marks = marks
        question.difficulty = difficulty
        question.save()

        AnswerOption.objects.filter(
            question=question
        ).delete()

        updated_options = []

        for option in options:
            updated_options.append(
                AnswerOption.objects.create(
                    question=question,
                    option_text=option['option_text'].strip(),
                    is_correct=option['is_correct']
                )
            )

    return Response({
        "message": "Question updated successfully",
        "question_id": question.question_id,
        "options": AnswerOptionSerializer(
            updated_options,
            many=True
        ).data
    })


@api_view(['DELETE'])
def admin_delete_question(request, question_id):
    from accounts.views import get_admin_from_token

    admin = get_admin_from_token(request)

    if not admin:
        return Response(
            {"error" : "Admin authentication required"},
            status=401
        )

    try:
        question = Question.objects.get(
            question_id = question_id,
            assessment__course__admin = admin
        )
    except Question.DoesNotExist:
        return Response(
            {"error" : "Question not found"},
            status=404
        )

    # Protect submitted assessment history
    if AssessmentResult.objects.filter(
        assessment = question.assessment
    ).exists():
        return Response(
            {"error" : "Questions cannot be deleted after students have attempted this assessment"},
            status=400
        )

    with transaction.atomic():
        AnswerOption.objects.filter(
            question = question
        ).delete()

        question.delete()

    return Response(
        {"message" : "Question deleted successfully"}
    )