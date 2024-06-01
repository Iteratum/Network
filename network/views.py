from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render
from django.urls import reverse
from django.http import JsonResponse, HttpResponseBadRequest
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt
from django.shortcuts import render, get_object_or_404
from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger
from .models import *
import json

@login_required
def index(request):
    return render(request, "network/index.html")

@login_required
def profile(request, username):
    user = get_object_or_404(User, username=username)
    user_profile = get_object_or_404(UserProfile, user=user)
    # Ensure the UserProfile exists
    profile, created = UserProfile.objects.get_or_create(user=user)
    posts = Post.objects.filter(poster=user).order_by('-timestamp')
    is_following = profile.followers.filter(id=request.user.id).exists()
    context = {
        'profile': profile,
        'posts': posts,
        'is_following': is_following,
        'follower_count': profile.followers.count(),
        'following_count': user_profile.followings.count(),
        'user_id': user.id  # Add the user ID to the context
    }
    return render(request, 'network/profile.html', context)

@login_required
@csrf_exempt
def follow_unfollow(request, user_id):
    user_to_follow = get_object_or_404(User, pk=user_id)
    profile_to_follow = get_object_or_404(UserProfile, user=user_to_follow)

    current_user_profile = get_object_or_404(UserProfile, user=request.user)

    if request.method == "POST":
        if request.user in profile_to_follow.followers.all():
            profile_to_follow.followers.remove(request.user)
            current_user_profile.followings.remove(user_to_follow)
            is_following = False
        else:
            profile_to_follow.followers.add(request.user)
            current_user_profile.followings.add(user_to_follow)
            is_following = True


        return JsonResponse({
            'follower_count': profile_to_follow.followers.count(),
            'following_count': profile_to_follow.followings.count(),
            'is_following': is_following
        })

@login_required
def following(request):
    current_user_profile = get_object_or_404(UserProfile, user=request.user)

    # Get the profiles of users the current user is following
    following_profiles = current_user_profile.followings.all()
    all_posts = Post.objects.filter(poster__in=following_profiles).order_by('-timestamp')  # Order by latest posts

    # Implement pagination
    page_number = request.GET.get('page', 1)
    page_size = int(request.GET.get('page_size', 10))
    paginator = Paginator(all_posts, page_size)

    try:
        page_obj = paginator.page(page_number)
    except EmptyPage:
        page_obj = paginator.page(paginator.num_pages)
    except PageNotAnInteger:
        page_obj = paginator.page(1)

    # Serialize the post data for the current page only
    posts_data = [
        {
            'id': post.id,
            'poster': post.poster.username,
            'post': post.post,
            'likes': post.likes.count(),
            'unlikes': post.unlikes.count(),
            'timestamp': post.timestamp.strftime('%Y-%m-%d %H:%M:%S')
        } for post in page_obj.object_list
    ]

    response_data = {
        'posts': posts_data,
        'page': page_obj.number,
        'pages': paginator.num_pages,
        'has_next': page_obj.has_next(),
        'has_previous': page_obj.has_previous(),
    }

    return JsonResponse(response_data, safe=False)

@login_required
def get(request):
    if request.method == "GET" or request.headers.get('x-requested-with') == 'fetch':
        posts = Post.objects.all().order_by('-timestamp')  # Order by latest posts
        # Implement pagination
        page_number = request.GET.get('page', 1)
        page_size = int(request.GET.get('page_size', 10))
        paginator = Paginator(posts, page_size)

        try:
            page_obj = paginator.page(page_number)
        except EmptyPage:
            page_obj = paginator.page(paginator.num_pages)
        except PageNotAnInteger:
            page_obj = paginator.page(1)

        # Serialize the post data for the current page only
        posts_data = [
            {
                'id': post.id,
                'poster': post.poster.username,
                'post': post.post,
                'likes': post.likes.count(),
                'unlikes': post.unlikes.count(),
                'timestamp': post.timestamp.strftime('%Y-%m-%d %H:%M:%S')
            } for post in page_obj.object_list
        ]

        response_data = {
            'posts': posts_data,
            'page': page_obj.number,
            'pages': paginator.num_pages,
            'has_next': page_obj.has_next(),
            'has_previous': page_obj.has_previous(),
        }

        return JsonResponse(response_data, safe=False)
    else:
        return render(request, "network/index.html")
    
@login_required
@csrf_exempt
def new_post(request):
    if request.method == "POST":
        data = json.loads(request.body)
        content = data.get('content', '')

        if content:
            post = Post(poster=request.user, post=content)
            post.save()
            return JsonResponse({
                'id': post.id,
                'poster': post.poster.username,
                'post': post.post,
                'likes': post.likes.count(),
                'unlikes': post.unlikes.count(),
                'timestamp': post.timestamp.strftime('%Y-%m-%d %H:%M:%S')
            })

        return JsonResponse({'error': 'Content cannot be empty.'}, status=400)

@login_required
@csrf_exempt
def like_post(request, post_id):
    post = get_object_or_404(Post, pk=post_id)
    user = request.user

    if user in post.unlikes.all():
        post.unlikes.remove(user)
    
    if user in post.likes.all():
        post.likes.remove(user)
    else:
        post.likes.add(user)
    
    return JsonResponse({'likes': post.likes.count(), 'unlikes': post.unlikes.count()})

@login_required
@csrf_exempt
def unlike_post(request, post_id):
    post = get_object_or_404(Post, pk=post_id)
    user = request.user

    if user in post.likes.all():
        post.likes.remove(user)
    
    if user in post.unlikes.all():
        post.unlikes.remove(user)
    else:
        post.unlikes.add(user)
    
    return JsonResponse({'likes': post.likes.count(), 'unlikes': post.unlikes.count()})

@login_required
@csrf_exempt
def edit_access(request, post_id):
    poster = Post.objects.get(pk=post_id).poster
    if poster != request.user:
        return JsonResponse({'error': 'You cannot edit this post.'}, status=400)
    else:
        return JsonResponse({'Ok': 'Access accepted'}, status=200)
        

@login_required
@csrf_exempt
def edit_post(request, post_id):
    try:
        post = Post.objects.get(pk=post_id)
    except Post.DoesNotExist:
        return JsonResponse({'error': 'Post not found.'}, status=404)

    if request.method == "PUT":
        poster = Post.objects.get(pk=post_id).poster
        if poster != request.user:
            return JsonResponse({'error': 'You cannot edit this post.'}, status=501)
        else:
            data = json.loads(request.body)
            post.post = data.get('content', post.post)
            post.save()
            return JsonResponse({
                'id': post.id,
                'poster': post.poster.username,
                'post': post.post,
                'likes': post.likes.count(),
                'unlikes': post.unlikes.count(),
                'timestamp': post.timestamp.strftime('%Y-%m-%d %H:%M:%S')
            })
    else:
        return JsonResponse({'error': 'PUT request required.'}, status=400)


def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "network/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "network/login.html")


def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("login"))


def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "network/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(request, "network/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "network/register.html")
