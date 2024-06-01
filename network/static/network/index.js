let currentPage = 1;
const pageSize = 10;

document.addEventListener('DOMContentLoaded', function() {
    fetchPosts(currentPage);

    document.querySelector('#post-form button').addEventListener('click', () => submitPost());

    // Add event listener for the "Following" link
    document.querySelector('#following-link').addEventListener('click', (event) => {
        event.preventDefault();
        following(currentPage);
    });

    document.addEventListener('click', function(event) {
        if (event.target.classList.contains('edit-btn')) {
            const postId = event.target.closest('.card').dataset.postId;
            showEditTextarea(postId);
        } else if (event.target.classList.contains('like-btn')) {
            likePost(event.target.closest('.card').dataset.postId);
        } else if (event.target.classList.contains('unlike-btn')) {
            unlikePost(event.target.closest('.card').dataset.postId);
        } else if (event.target.classList.contains('save-edit-btn')) {
            const postId = event.target.closest('.card').dataset.postId;
            saveEdit(postId);
        } else if (event.target.classList.contains('posts-page-link')) {
            event.preventDefault();
            const page = parseInt(event.target.dataset.page);
            fetchPosts(page);
        } else if (event.target.classList.contains('following-page-link')) {
            event.preventDefault();
            const page = parseInt(event.target.dataset.page);
            following(page);
        }
    });
});

async function submitPost() {
    const content = document.getElementById('post-content').value;
    const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;

    const response = await fetch('new_post', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrfToken
        },
        body: JSON.stringify({ content })
    });

    if (response.ok) {
        const post = await response.json();
        addPostToPage(post);
        document.getElementById('post-content').value = '';  // Clear the textarea
    } else {
        console.error('Failed to submit post');
    }
}

function addPostToPage(post) {
    const postDiv = document.createElement('div');
    postDiv.className = 'card mb-2';
    postDiv.dataset.postId = post.id;
    postDiv.innerHTML = `
        <div class="card-body">
            <a href="/profile/${post.poster}"><h5 class="card-title">${post.poster}</h5></a>
            <p class="card-text">${post.post}</p>
            <p class="card-text"><small class="text-muted">${post.timestamp}</small></p>
            <button class="btn btn-secondary btn-sm edit-btn">Edit</button>
            <button class="btn btn-primary btn-sm save-edit-btn" style="display: none;">Save</button>
            <button class="btn btn-success btn-sm like-btn">Like <span class="like-count">${post.likes}</span></button>
            <button class="btn btn-danger btn-sm unlike-btn">Unlike <span class="unlike-count">${post.unlikes}</span></button>
        </div>
    `;
    document.getElementById('all-posts').prepend(postDiv);
}

async function fetchPosts(page) {
    const response = await fetch(`/get?page=${page}&page_size=${pageSize}`);
    if (response.ok) {
        const data = await response.json();
        document.getElementById('all-posts').innerHTML = ''; // Clear existing posts

        // Reverse the order of posts
        const reversedPosts = data.posts.reverse();

        reversedPosts.forEach(post => {
            addPostToPage(post);
        });

        const paginationControls = document.getElementById('pagination-controls');
        paginationControls.innerHTML = '';

        if (data.has_previous) {
            paginationControls.innerHTML += `
                <li class="page-item">
                    <a class="page-link posts-page-link" href="#" data-page="${data.page - 1}">Previous</a>
                </li>
            `;
        }

        for (let i = 1; i <= data.pages; i++) {
            paginationControls.innerHTML += `
                <li class="page-item ${i === data.page ? 'active' : ''}">
                    <a class="page-link posts-page-link" href="#" data-page="${i}">${i}</a>
                </li>
            `;
        }

        if (data.has_next) {
            paginationControls.innerHTML += `
                <li class="page-item">
                    <a class="page-link posts-page-link" href="#" data-page="${data.page + 1}">Next</a>
                </li>
            `;
        }

        currentPage = data.page;
    } else {
        console.error('Failed to fetch posts');
    }
}


async function following(page) {
    document.querySelector('#post-form').style.display = 'none';

    const response = await fetch(`/following?page=${page}&page_size=${pageSize}`);
    if (response.ok) {
        const data = await response.json();
        document.getElementById('all-posts').innerHTML = ''; // Clear existing posts
        
        // Reverse the order of posts
         const reversedPosts = data.posts.reverse();

         reversedPosts.forEach(post => {
            addPostToPage(post);
         });

        const paginationControls = document.getElementById('pagination-controls');
        paginationControls.innerHTML = '';

        if (data.has_previous) {
            paginationControls.innerHTML += `
                <li class="page-item">
                    <a class="page-link following-page-link" href="#" data-page="${data.page - 1}">Previous</a>
                </li>
            `;
        }

        for (let i = 1; i <= data.pages; i++) {
            paginationControls.innerHTML += `
                <li class="page-item ${i === data.page ? 'active' : ''}">
                    <a class="page-link following-page-link" href="#" data-page="${i}">${i}</a>
                </li>
            `;
        }

        if (data.has_next) {
            paginationControls.innerHTML += `
                <li class="page-item">
                    <a class="page-link following-page-link" href="#" data-page="${data.page + 1}">Next</a>
                </li>
            `;
        }

        currentPage = data.page;
    } else {
        console.error('Failed to fetch followed users\' posts');
    }
}

async function likePost(postId) {
    const response = await fetch(`like/${postId}`, {
        method: 'POST',
        headers: { 'X-CSRFToken': document.querySelector('[name=csrfmiddlewaretoken]').value }
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
        headers: { 'X-CSRFToken': document.querySelector('[name=csrfmiddlewaretoken]').value }
    });

    if (response.ok) {
        const data = await response.json();
        document.querySelector(`[data-post-id="${postId}"] .like-count`).innerText = data.likes;
        document.querySelector(`[data-post-id="${postId}"] .unlike-count`).innerText = data.unlikes;
    } else {
        console.error('Failed to unlike post');
    }
}

function showEditTextarea(postId) {
    getEditAccess(postId);
}

async function getEditAccess(postId) {
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

async function saveEdit(postId) {
    const postDiv = document.querySelector(`[data-post-id="${postId}"]`);
    const newContent = postDiv.querySelector('.edit-textarea').value;

    const response = await fetch(`/edit/${postId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': document.querySelector('[name=csrfmiddlewaretoken]').value
        },
        body: JSON.stringify({ post: newContent })
    });

    if (response.ok) {
        const data = await response.json();
        postDiv.querySelector('.card-text').innerText = data.post;
        postDiv.querySelector('.edit-btn').style.display = 'inline-block';
        postDiv.querySelector('.save-edit-btn').style.display = 'none';
        showAlert('Post updated successfully', 'success', postDiv);
    } else {
        showAlert('Failed to update post', 'danger', postDiv);
    }
}
