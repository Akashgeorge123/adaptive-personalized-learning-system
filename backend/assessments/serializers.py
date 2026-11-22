from rest_framework import serializers
from .models import Assessment,Question,AnswerOption, AssessmentResult

class AssessmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Assessment
        fields = '__all__'

class QuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Question
        fields = '__all__'

class AnswerOptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = AnswerOption
        fields = '__all__'

class StudentAnswerOptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = AnswerOption
        fields = ['option_id', 'question', 'option_text']

class AssessmentResultSerializer(serializers.ModelSerializer):
    class Meta:
        model = AssessmentResult
        fields = '__all__'