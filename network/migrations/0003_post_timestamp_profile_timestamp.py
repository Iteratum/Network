# Generated by Django 4.2.5 on 2024-05-17 14:54

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('network', '0002_profile_post'),
    ]

    operations = [
        migrations.AddField(
            model_name='post',
            name='timestamp',
            field=models.DateTimeField(auto_now_add=True, null=True),
        ),
        migrations.AddField(
            model_name='profile',
            name='timestamp',
            field=models.DateTimeField(auto_now_add=True, null=True),
        ),
    ]
