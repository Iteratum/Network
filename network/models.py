from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    pass

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    bio = models.TextField(max_length=500, blank=True)
    location = models.CharField(max_length=30, blank=True)
    birth_date = models.DateField(null=True, blank=True)
    profile_image = models.ImageField(upload_to='profile_images', null=True, blank=True)
    followers = models.ManyToManyField(User, related_name='follower', blank=True)
    followings= models.ManyToManyField(User, related_name='following', blank=True)

    def __str__(self):
        return self.user.username

class Post(models.Model):
    poster = models.ForeignKey(User, on_delete=models.CASCADE)
    post = models.TextField(null=True, blank=True)
    likes = models.ManyToManyField(User, related_name='liked_posts', blank=True)
    unlikes = models.ManyToManyField(User, related_name='unliked_posts', blank=True)
    timestamp = models.DateTimeField(auto_now_add=True, null=True)
