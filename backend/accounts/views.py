from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.contrib.auth.hashers import check_password
from .serializers import StudentSerializer,StudentRegistrationSerializer
from .models import Student,Admin
from django.core import signing


def get_student_from_token(request):
    token = request.headers.get('Authorization', '').strip()

    if not token:
        return None

    try:
        data = signing.loads(
            token,
            salt='student-auth',
            max_age=86400
        )

        student_id = data.get('student_id')

        if not student_id:
            return None

        student = Student.objects.get(student_id=student_id)

        return student

    except signing.SignatureExpired:
        return None

    except signing.BadSignature:
        return None

    except Student.DoesNotExist:
        return None

def get_admin_from_token(request):
    token = request.headers.get('Authorization', '').strip()

    if not token:
        return None

    try:
        data = signing.loads(
            token,
            salt='admin-auth',
            max_age=86400
        )

        admin_id = data.get('admin_id')

        if not admin_id:
            return None

        admin = Admin.objects.get(admin_id=admin_id)
        return admin

    except (
        signing.SignatureExpired,
        signing.BadSignature,
        Admin.DoesNotExist
    ):
        return None




@api_view(['GET'])
def student_list(request):
    student = get_student_from_token(request)
    if not student:
        return Response(
            {'error': 'Invalid or expired token'},
            status=401
        )
    serializer = StudentSerializer(student)
    return Response(serializer.data)

@api_view(['GET'])
def admin_list(request):
    admin = get_admin_from_token(request)

    if not admin:
        return Response(
            {
                "error" : "Admin authentication required"
            },
            status=401
        )
    
    return Response(
        {
            "admin_id" : admin.admin_id,
            "name" : admin.name,
            "email" : admin.email
        }
    )

@api_view(['POST'])
def student_register(request):
    serializer = StudentRegistrationSerializer(data=request.data)

    if serializer.is_valid():
        student = serializer.save()

        return Response(
            {
                'message': 'Student registered successfully',
                'student_id': student.student_id
            },
            status=201
        )

    return Response(serializer.errors, status=400)

@api_view(['POST'])
def student_login(request):
    email = request.data.get('email')
    password = request.data.get('password')

    if not email or not password:
        return Response(
            {'error': 'Email and password are required'},
            status=400
        )

    try:
        student = Student.objects.get(email=email)
    except Student.DoesNotExist:
        return Response(
            {'error': 'Invalid email or password'},
            status=401
        )

    if not check_password(password, student.password):
        return Response(
            {'error': 'Invalid email or password'},
            status=401
        )

    token = signing.dumps(
        {'student_id': student.student_id},
        salt='student-auth'
    )

    return Response({
        'message': 'Login successful',
        'token': token,
        'student_id': student.student_id,
        'name': student.name,
        'email': student.email
    })

@api_view(['POST'])
def admin_login(request):
    email = request.data.get('email')
    password = request.data.get('password')

    if not email or not password:
        return Response(
            {
                "error" : "Email and password are required"
            },
            status=400
        )

    try:
        admin = Admin.objects.get(email=email)
    except Admin.DoesNotExist:
        return Response(
            {
                "error" : "Invalid email or password"
            },
            status=401
        )

    if not check_password(password, admin.password):
        return Response(
            {
                "error" : "Invalid email or password"
            },
            status=401
        )

    token = signing.dumps(
        {
            'admin_id' : admin.admin_id
        },
        salt='admin-auth'
    )

    return Response(
        {
            'message' : 'Admin login successful',
            'token' : token,
            'admin_id' : admin.admin_id,
            'name' : admin.name,
            'email' : admin.email
        }
    )



@api_view(['GET'])
def student_profile(request):
    student = get_student_from_token(request)

    if not student:
        return Response(
            {'error': 'Invalid or expired token'},
            status=401
        )

    serializer = StudentSerializer(student)

    return Response(serializer.data)

@api_view(['GET'])
def admin_profile(request):
    admin = get_admin_from_token(request)

    if not admin:
        return Response(
            {
                "error" : "Admin authentication required"
            },
            status=401
        )

    return Response(
        {
            'admin_id' : admin.admin_id,
            'name' : admin.name,
            'email' : admin.email
        }
    )
