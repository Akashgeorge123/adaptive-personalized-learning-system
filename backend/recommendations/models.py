from django.db import models

class Recommendation(models.Model):
    recommendation_id = models.AutoField(primary_key=True)
    student = models.ForeignKey('accounts.Student', models.DO_NOTHING, db_column='student_id')
    course = models.ForeignKey('courses.Course', models.DO_NOTHING, db_column='course_id')
    reason = models.TextField()
    suitability_score = models.DecimalField(max_digits=5, decimal_places=2)
    created_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'recommendation'

    def __str__(self):
            return self.reason[:50]
