document.addEventListener('DOMContentLoaded', function() {

    const followButton = document.getElementById('follow-unfollow-btn');
    if (followButton) {
        followButton.addEventListener('click', () => {
            const userId = followButton.dataset.userId;
            followOrUnfollowUser(userId);
        });
    }

    document.addEventListener('click', function(event) {
        if (event.target.classList.contains('edit-btn')) {
            const postId = event.target.closest('.card').dataset.postId;
            showEditTextarea(postId);
        } else if (event.target.classList.contains('save-edit-btn')) {
            const postId = event.target.closest('.card').dataset.postId;
            saveEdit(postId);
        } else if (event.target.classList.contains('like-btn')) {
            const postId = event.target.closest('.card').dataset.postId;
            likePost(postId);
        } else if (event.target.classList.contains('unlike-btn')) {
            const postId = event.target.closest('.card').dataset.postId;
            unlikePost(postId);
        }
    });
});

async function followOrUnfollowUser(userId) {
    const followButton = document.getElementById('follow-unfollow-btn');
    const response = await fetch(`/follow_unfollow/${userId}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        }
    });

    if (response.ok) {
        const data = await response.json();
        document.getElementById('follower-count').innerText = data.follower_count;
        document.getElementById('following-count').innerText = data.following_count;
        followButton.innerHTML = data.is_following ? '<p>Unfollow</p>' : '<p>Follow</p>';
    } else {
        console.error('Failed to follow/unfollow user');
    }
}

async function showEditTextarea(postId) {
    const postDiv = document.querySelector(`[data-post-id="${postId}"]`);
    const postContent = postDiv.querySelector('.card-text').innerText;

    const response = await fetch(`/edit_access/${postId}`);
    if (response.ok) {
        postDiv.querySelector('.card-text').innerHTML = `
            <textarea class="form-control edit-textarea" rows="3">${postContent}</textarea>`;
        postDiv.querySelector('.edit-btn').style.display = 'none';
        postDiv.querySelector('.save-edit-btn').style.display = 'inline-block';
    } else {
        showAlert('Access denied', 'danger', postDiv);
    }
}

async function saveEdit(postId) {
    const postDiv = document.querySelector(`[data-post-id="${postId}"]`);
    const newContent = postDiv.querySelector('.edit-textarea').value;

    const response = await fetch(`/edit/${postId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ newContent })
    });

    if (response.ok) {
        const updatedPost = await response.json();
        postDiv.querySelector('.card-text').innerText = updatedPost.post;
        postDiv.querySelector('.edit-btn').style.display = 'inline-block';
        postDiv.querySelector('.save-edit-btn').style.display = 'none';
        showAlert('Post updated successfully', 'success', postDiv);
    } else {
        showAlert('Failed to update post', 'danger', postDiv);
    }
}

async function likePost(postId) {
    const response = await fetch(`like/${postId}`, {
        method: 'POST',
    });

    if (response.ok) {
        const data = await response.json();
        document.querySelector(`[data-post-id="${postId}"] .like-count`).innerText = data.likes;
        document.querySelector(`[data-post-id="${postId}"] .unlike-count`).innerText = data.unlikes;
    } else {
        console.error('Failed to like post');
    }
}

async function unlikePost(postId) {
    const response = await fetch(`unlike/${postId}`, {
        method: 'POST',
    });

    if (response.ok) {
        const data = await response.json();
        document.querySelector(`[data-post-id="${postId}"] .like-count`).innerText = data.likes;
        document.querySelector(`[data-post-id="${postId}"] .unlike-count`).innerText = data.unlikes;
    } else {
        console.error('Failed to unlike post');
    }
}


function showAlert(message, type, parentElement) {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
    alertDiv.role = 'alert';
    alertDiv.style.position = 'absolute';
    alertDiv.style.top = '10px';
    alertDiv.style.right = '10px';
    alertDiv.style.zIndex = '1';
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    parentElement.appendChild(alertDiv);
    setTimeout(() => {
        alertDiv.remove();
    }, 10000);
}