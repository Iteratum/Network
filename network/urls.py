# urls.py
from django.urls import path
from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("get", views.get, name="get"),
    path("following", views.following, name="following"),
    path('profile/<str:username>', views.profile, name='profile'),
    path('follow_unfollow/<int:user_id>', views.follow_unfollow, name='follow_unfollow'),
    path("edit_access/<int:post_id>", views.edit_access, name="edit_access"),
    path("new_post", views.new_post, name="new_post"),
    path("like/<int:post_id>", views.like_post, name="like_post"),
    path("unlike/<int:post_id>", views.unlike_post, name="unlike_post"),
    path('profile/like/<int:post_id>', views.like_post, name='like_post_profile'),
    path('profile/unlike/<int:post_id>', views.unlike_post, name='unlike_post_profile'),
    path("edit/<int:post_id>", views.edit_post, name="edit_post"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),
]
