from django.db import models

class Course(models.Model):
    course_id = models.AutoField(primary_key=True)
    title = models.CharField(max_length=150)
    description = models.TextField(blank=True, null=True)
    level = models.CharField(max_length=30)
    admin = models.ForeignKey('accounts.Admin', models.DO_NOTHING, db_column='admin_id')

    class Meta:
        managed = False
        db_table = 'course'

    def __str__(self):
        return self.title


class LearningResource(models.Model):
    resource_id = models.AutoField(primary_key=True)
    topic = models.ForeignKey('Topic', models.DO_NOTHING)
    title = models.CharField(max_length=200)
    resource_type = models.CharField(max_length=30)
    url = models.TextField()
    created_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'learning_resource'

    def __str__(self):
        return self.title


class Topic(models.Model):
    topic_id = models.AutoField(primary_key=True)
    course = models.ForeignKey(Course, models.DO_NOTHING)
    title = models.CharField(max_length=150)
    description = models.TextField(blank=True, null=True)
    sequence_number = models.IntegerField()

    class Meta:
        managed = False
        db_table = 'topic'

    def __str__(self):
        return self.title

class StudentCourseEnrollment(models.Model):
    enrollment_id = models.AutoField(primary_key=True)

    student = models.ForeignKey(
        'accounts.Student',
        models.DO_NOTHING,
        db_column='student_id'
    )

    course = models.ForeignKey(
        Course,
        models.DO_NOTHING,
        db_column='course_id'
    )

    enrolled_at = models.DateTimeField(auto_now_add=True)

    status = models.CharField(max_length=20, default='active')

    class Meta:
        managed = False
        db_table = 'student_course_enrollment'
        unique_together = (('student', 'course'),)

    def __str__(self):
        return f"Enrollment {self.enrollment_id}: Student {self.student_id} - {self.course.title}"