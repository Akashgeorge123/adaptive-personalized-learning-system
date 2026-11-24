from django.db import models

class Admin(models.Model):
    admin_id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=100)
    email = models.CharField(unique=True, max_length=150)
    password = models.CharField(max_length=255)

    class Meta:
        managed = False
        db_table = 'admin'

    def __str__(self):
        return self.name


class Student(models.Model):
    student_id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=100)
    email = models.CharField(unique=True, max_length=150)
    password = models.CharField(max_length=255)
    interests = models.TextField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'student'

    def __str__(self):
            return self.name

