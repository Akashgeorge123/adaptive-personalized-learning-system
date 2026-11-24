from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.contrib.auth.hashers import check_password
from .serializers import StudentSerializer,StudentRegistrationSerializer
from .models import Student,Admin
from django.core import signing
from django.contrib.auth.hashers import make_password
from django.core.mail import send_mail
from django.conf import settings
from django.urls import reverse


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


@api_view(['POST'])
def forgot_password(request):
    email = request.data.get('email', '').strip().lower()

    if not email:
        return Response(
            {'error': 'Email is required'},
            status=400
        )

    try:
        student = Student.objects.get(email__iexact=email)
    except Student.DoesNotExist:
        # Avoid revealing whether an email is registered.
        return Response({
            'message': 'If the email is registered, a reset link will be sent.'
        })

    token = signing.dumps(
        {
            'student_id': student.student_id,
            'password': student.password
        },
        salt='student-password-reset'
    )

    reset_url = (
        f'http://localhost:5173/reset-password?token={token}'
    )

    send_mail(
        subject='Password Reset Request',
        message=(
            f'Hello {student.name},\n\n'
            f'Click the link below to reset your password:\n\n'
            f'{reset_url}\n\n'
            'This link expires in 15 minutes.\n'
            'If you did not request this, ignore this email.'
        ),
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[student.email],
        fail_silently=False
    )

    return Response({
        'message': 'If the email is registered, a reset link will be sent.'
    })


@api_view(['POST'])
def reset_password(request):
    token = request.data.get('token')
    new_password = request.data.get('password')

    if not token or not new_password:
        return Response(
            {'error': 'Token and new password are required'},
            status=400
        )

    if len(new_password) < 8:
        return Response(
            {'error': 'Password must contain at least 8 characters'},
            status=400
        )

    try:
        data = signing.loads(
            token,
            salt='student-password-reset',
            max_age=900
        )

        student = Student.objects.get(
            student_id=data['student_id']
        )

        # Reject old links after the password has changed.
        if student.password != data['password']:
            return Response(
                {'error': 'This reset link is invalid or expired'},
                status=400
            )

        student.password = make_password(new_password)
        student.save(update_fields=['password'])

        return Response({
            'message': 'Password reset successfully'
        })

    except (
        signing.SignatureExpired,
        signing.BadSignature,
        Student.DoesNotExist,
        KeyError
    ):
        return Response(
            {'error': 'This reset link is invalid or expired'},
            status=400
        )

@api_view(['GET'])
def admin_students_list(request):
    admin = get_admin_from_token(request)

    if not admin:
        return Response(
            {"error": "Unauthorized"},
            status=401
        )

    students = Student.objects.all().values(
        'student_id',
        'name',
        'email'
    )

    return Response(list(students))