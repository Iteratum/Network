# Generated by Django 4.2.5 on 2024-05-21 16:09

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('network', '0005_profile_post'),
    ]

    operations = [
        migrations.AlterField(
            model_name='post',
            name='poster',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL),
        ),
    ]
