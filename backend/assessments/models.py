from django.db import models

class AnswerOption(models.Model):
    option_id = models.AutoField(primary_key=True)
    question = models.ForeignKey('Question', models.DO_NOTHING)
    option_text = models.TextField()
    is_correct = models.BooleanField()

    class Meta:
        managed = False
        db_table = 'answer_option'
        unique_together = (('question', 'option_text'),)

    def __str__(self):
        return self.option_text[:50]


class Assessment(models.Model):
    assessment_id = models.AutoField(primary_key=True)
    course = models.ForeignKey('courses.Course', models.DO_NOTHING,  db_column='course_id')
    title = models.CharField(max_length=50)
    type = models.CharField(max_length=30)
    total_marks = models.DecimalField(max_digits=6, decimal_places=2)
    created_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'assessment'

    def __str__(self):
        return self.title


class AssessmentResult(models.Model):
    result_id = models.AutoField(primary_key=True)
    student = models.ForeignKey('accounts.Student', models.DO_NOTHING, db_column='student_id')
    assessment = models.ForeignKey(Assessment, models.DO_NOTHING)
    score = models.DecimalField(max_digits=6, decimal_places=2)
    attempted_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'assessment_result'

    def __str__(self):
        return f"{self.student.name} - {self.score}"


class Question(models.Model):
    question_id = models.AutoField(primary_key=True)
    assessment = models.ForeignKey(Assessment, models.DO_NOTHING)
    topic = models.ForeignKey(
        'courses.Topic',
        models.DO_NOTHING,
        db_column='topic_id'
    )
    question_text = models.TextField()
    marks = models.DecimalField(max_digits=5, decimal_places=2)
    difficulty = models.CharField(max_length=20)
    created_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'question'

    def __str__(self):
        return self.question_text[:50]

class StudentAnswer(models.Model):
    student_answer_id = models.AutoField(primary_key=True)

    result = models.ForeignKey(
        AssessmentResult,
        models.DO_NOTHING,
        db_column='result_id'
    )

    question = models.ForeignKey(
        Question,
        models.DO_NOTHING,
        db_column='question_id'
    )

    selected_option = models.ForeignKey(
        AnswerOption,
        models.DO_NOTHING,
        db_column='selected_option_id'
    )

    is_correct = models.BooleanField()

    class Meta:
        managed = False
        db_table = 'student_answer'
        unique_together = (('result', 'question'),)