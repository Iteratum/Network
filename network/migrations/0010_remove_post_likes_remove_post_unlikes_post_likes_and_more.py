# Generated by Django 4.2.5 on 2024-05-24 08:54

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('network', '0009_remove_post_likes_remove_post_unlikes_post_likes_and_more'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='post',
            name='likes',
        ),
        migrations.RemoveField(
            model_name='post',
            name='unlikes',
        ),
        migrations.AddField(
            model_name='post',
            name='likes',
            field=models.PositiveIntegerField(default=0),
        ),
        migrations.AddField(
            model_name='post',
            name='unlikes',
            field=models.PositiveIntegerField(default=0),
        ),
    ]
