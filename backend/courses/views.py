from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Course,Topic,LearningResource, StudentCourseEnrollment
from .serializers import CourseSerializer, TopicSerializer, LearningResourceSerializer, StudentCourseEnrollmentSerializer
from rest_framework import status
  

@api_view(['GET'])
def course_list(request):
    courses = Course.objects.all()
    serializer = CourseSerializer(courses, many=True)
    return Response(serializer.data)

@api_view(['GET'])
def topic_list(request):
    topics = Topic.objects.all()
    serializer = TopicSerializer(topics, many=True)
    return Response(serializer.data)

@api_view(['GET'])
def learning_resource_list(request):
    resources = LearningResource.objects.all()
    serializer = LearningResourceSerializer(resources, many=True)
    return Response(serializer.data)

@api_view(['POST'])
def course_create(request):
    from accounts.views import get_admin_from_token

    admin = get_admin_from_token(request)

    if not admin:
        return Response(
            {
                "error" : "Admin authentication required!"
            },
            status=401
        )
    
    serializer = CourseSerializer(data = request.data)

    if serializer.is_valid():
        serializer.save(admin=admin)

        return Response(
            {
                'message':'Course created successfully',
                'course_id':serializer.data['course_id'],
            },
            status=201
        )
    return Response(serializer.errors, status=400)

@api_view(['POST'])
def topic_create(request):
    from accounts.views import get_admin_from_token

    admin = get_admin_from_token(request)

    if not admin:
        return Response(
            {
                "error" : "Admin authentication required"
            },
            status=401
        )
    
    serializer = TopicSerializer(data = request.data)

    if serializer.is_valid():
        course = serializer.validated_data['course']

        if course.admin_id != admin.admin_id:
            return Response(
                {
                    "error" : "You cannot add topics to another admin\'s course"
                },
                status=403
            )

        serializer.save()

        return Response(
            {
                'message':'Topic created successfully',
                'topic_id':serializer.data['topic_id'],
            },
            status=201
        )

    return Response(serializer.errors, status=400)

@api_view(['POST'])
def resource_create(request):
    from accounts.views import get_admin_from_token

    admin = get_admin_from_token(request)

    if not admin:
        return Response(
            {
                "error" : "Admin authentication required"
            },
            status=401
        )
    
    serializer = LearningResourceSerializer(data=request.data)

    if serializer.is_valid():
        topic = serializer.validated_data['topic']

        if topic.course.admin_id != admin.admin_id:
            return Response(
                {
                    "error" : "You cannot add resources to another admin\'s course"
                },
                status=403
            )

        resource = serializer.save()

        return Response(
            {
                'message': 'Learning resource created successfully',
                'resource_id': resource.resource_id
            },
            status=201
        )

    return Response(serializer.errors, status=400)

@api_view(['GET', 'POST'])
def enrollment_list(request):
    from accounts.views import get_student_from_token

    student = get_student_from_token(request)

    if not student:
        return Response(
            {"error": "Student authentication required"},
            status=status.HTTP_401_UNAUTHORIZED
        )

    # GET: Retrieve student's enrollments
    if request.method == 'GET':
        enrollments = StudentCourseEnrollment.objects.filter(
            student=student,
            status='active'
        ).select_related('course')

        serializer = StudentCourseEnrollmentSerializer(
            enrollments,
            many=True
        )

        return Response(serializer.data)

    # POST: Enroll student in a course
    course_id = request.data.get('course')

    if not course_id:
        return Response(
            {"error": "Course ID is required"},
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        course = Course.objects.get(course_id=course_id)
    except Course.DoesNotExist:
        return Response(
            {"error": "Course not found"},
            status=status.HTTP_404_NOT_FOUND
        )

    enrollment, created = StudentCourseEnrollment.objects.update_or_create(
        student=student,
        course=course,
        defaults={'status': 'active'}
    )

    serializer = StudentCourseEnrollmentSerializer(enrollment)

    return Response(
        {
            "message": (
                "Enrolled successfully" if created
                else "Enrollment already exists or has been reactivated"
            ),
            "enrollment": serializer.data
        },
        status=status.HTTP_201_CREATED if created else status.HTTP_200_OK
    )

