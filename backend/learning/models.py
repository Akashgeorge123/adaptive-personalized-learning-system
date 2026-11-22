from django.db import models

class LearningPath(models.Model):
    path_id = models.AutoField(primary_key=True)
    student = models.ForeignKey('accounts.Student', models.DO_NOTHING, db_column='student_id')
    title = models.CharField(max_length=150)
    description = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(blank=True, null=True)
    status = models.CharField(max_length=20)

    class Meta:
        managed = False
        db_table = 'learning_path'

    def __str__(self):
        return self.title


class LearningPathItem(models.Model):
    item_id = models.AutoField(primary_key=True)
    path = models.ForeignKey(LearningPath, models.DO_NOTHING)
    topic = models.ForeignKey('courses.Topic', models.DO_NOTHING, db_column='topic_id')
    sequence_number = models.IntegerField()

    class Meta:
        managed = False
        db_table = 'learning_path_item'
        unique_together = (('path', 'topic'),)

    def __str__(self):
        return f"{self.path.title} - {self.topic.title}"


class StudentProgress(models.Model):
    progress_id = models.AutoField(primary_key=True)
    student = models.ForeignKey('accounts.Student', models.DO_NOTHING, db_column='student_id')
    item = models.ForeignKey(LearningPathItem, models.DO_NOTHING)
    completion_status = models.CharField(max_length=20)
    completed_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'student_progress'
        unique_together = (('student', 'item'),)

    def __str__(self):
        return f"{self.student.name} - {self.completion_status}"


class StudentVideoProgress(models.Model):
    video_progress_id = models.AutoField(primary_key=True)

    student = models.ForeignKey(
        'accounts.Student',
        models.DO_NOTHING,
        db_column='student_id'
    )

    resource = models.ForeignKey(
        'courses.LearningResource',
        models.DO_NOTHING,
        db_column='resource_id'
    )

    last_position_seconds = models.IntegerField(default=0)
    duration_seconds = models.IntegerField(default=0)
    completed = models.BooleanField(default=False)
    last_watched_at = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'student_video_progress'
        unique_together = (('student', 'resource'),)

    def __str__(self):
        return f"{self.student.name} - {self.resource.title}"

