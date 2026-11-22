from rest_framework import serializers
from .models import Student, Admin
from django.contrib.auth.hashers import make_password

class StudentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Student
        fields = ['student_id', 'name', 'email', 'interests']

class AdminSerializer(serializers.ModelSerializer):
    class Meta:
        model = Admin
        fields = ['admin_id', 'name', 'email']


class StudentRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True,
        min_length=8
    )

    class Meta:
        model = Student
        fields = ['name', 'email', 'password', 'interests']

    def create(self, validated_data):
        validated_data['password'] = make_password(
            validated_data['password']
        )

        return Student.objects.create(**validated_data)