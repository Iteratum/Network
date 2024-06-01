document.addEventListener('DOMContentLoaded', function() {
    
    const followButton = document.getElementById('follow-unfollow-btn');
    if (followButton) {
        followButton.addEventListener('click', () => {
            const userId = followButton.dataset.userId;
            followOrUnfollowUser(userId);
        });
    }
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
        followButton.innerText = data.is_following ? 'Unfollow' : 'Follow';
    } else {
        console.error('Failed to follow/unfollow user');
    }
}