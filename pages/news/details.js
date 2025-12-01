import { mountHeader } from '../../components/Header.js';
import { mountFooter } from '../../components/Footer.js';
import { Security } from '../../js/security.js';
import { API_BASE } from '../../js/config.js';

// Get post slug from URL
const urlParams = new URLSearchParams(window.location.search);
const postSlug = urlParams.get("slug");
let postId = null; // Will be set after fetching post

let currentPost = null;
let allPosts = [];

document.addEventListener("DOMContentLoaded", () => {
    mountHeader('.mount-header', 'news');
    mountFooter('.mount-footer');

    if (!postSlug) {
        window.location.href = './news.html';
        return;
    }

    initializeApp();
});

function initializeApp() {
    setupEventListeners();
    loadPost();
    loadComments();
    loadRelatedPosts();
    setupBackToTop();
}

// =========================
// Event Listeners
// =========================
function setupEventListeners() {
    // Comment form
    const form = document.getElementById('commentForm');
    form?.addEventListener('submit', handleCommentSubmit);

    // Share buttons
    document.querySelector('.social-btn.facebook')?.addEventListener('click', () => shareOnSocial('facebook'));
    document.querySelector('.social-btn.twitter')?.addEventListener('click', () => shareOnSocial('twitter'));
    document.querySelector('.social-btn.linkedin')?.addEventListener('click', () => shareOnSocial('linkedin'));
    document.querySelector('.social-btn.copy')?.addEventListener('click', copyLink);

    // Action buttons
    document.getElementById('shareBtn')?.addEventListener('click', () => {
        document.querySelector('.social-share')?.scrollIntoView({ behavior: 'smooth' });
    });

    document.getElementById('bookmarkBtn')?.addEventListener('click', toggleBookmark);
}

// =========================
// Load Post
// =========================
async function loadPost() {
    const loadingState = document.getElementById('loadingState');

    try {
        // Try to fetch by slug first
        const res = await fetch(`${API_BASE}/posts?slug=${encodeURIComponent(postSlug)}&status=published`);
        const data = await res.json();

        if (data.success && data.data && data.data.length > 0) {
            currentPost = data.data[0];
            postId = currentPost.id; // Set postId for comments
            renderPost(currentPost);
            hideLoading();
        } else {
            showError('Không tìm thấy bài viết');
        }
    } catch (err) {
        console.error('Error loading post:', err);
        showError('Không thể kết nối đến server');
    }
}

function renderPost(post) {
    // Update page title
    document.getElementById('pageTitle').textContent = `${post.title} - Shoe Store`;
    document.getElementById('breadcrumbTitle').textContent = truncateText(post.title, 50);

    // Article header
    document.getElementById('articleTitle').textContent = post.title;

    const authorName = post.author_name || 'Admin';
    const authorInitial = authorName[0].toUpperCase();
    document.getElementById('authorAvatar').textContent = authorInitial;
    document.getElementById('authorName').textContent = authorName;
    document.getElementById('articleDate').textContent = formatDate(post.published_at || post.created_at);

    // Featured image
    const imageContainer = document.getElementById('articleImageContainer');
    if (post.image) {
        imageContainer.innerHTML = `
            <img src="${post.image}" alt="${post.title}" class="featured-image">
        `;
    } else {
        imageContainer.style.display = 'none';
    }

    // Article body
    // Assuming post.content is safe HTML from trusted admin, but if user generated, it should be sanitized on server.
    // For now, we trust the content from API for the post body as it's likely from admin.
    document.getElementById('articleBody').innerHTML = post.content || post.excerpt || '<p>Nội dung đang được cập nhật...</p>';

    // Tags (if available)
    const tagsContainer = document.getElementById('articleTags');
    if (post.tags && post.tags.length > 0) {
        tagsContainer.innerHTML = post.tags.map(tag => `
            <span class="tag">
                <i class="fas fa-tag"></i> ${Security.escapeHtml(tag)}
            </span>
        `).join('');
    }
}

// =========================
// Load Comments
// =========================
async function loadComments() {
    try {
        const res = await fetch(`${API_BASE}/comments?post_id=${postId}`);
        const data = await res.json();

        if (data.success) {
            renderComments(data.data || []);
        }
    } catch (err) {
        console.error('Error loading comments:', err);
    }
}

function renderComments(comments) {
    const commentsList = document.getElementById('commentsList');
    const commentCount = document.getElementById('commentCount');

    commentCount.textContent = `(${comments.length})`;

    if (comments.length === 0) {
        commentsList.innerHTML = `
            <div class="empty-comments">
                <i class="far fa-comments"></i>
                <p>Chưa có bình luận nào. Hãy là người đầu tiên bình luận!</p>
            </div>
        `;
        return;
    }

    commentsList.innerHTML = comments.map(comment => {
        const userName = comment.user_name || 'Khách';
        const userInitial = userName[0].toUpperCase();

        return `
            <div class="comment-item">
                <div class="comment-avatar">${userInitial}</div>
                <div class="comment-content">
                    <div class="comment-header">
                        <span class="comment-author">${Security.escapeHtml(userName)}</span>
                        <span class="comment-time">${formatCommentDate(comment.created_at)}</span>
                    </div>
                    <p class="comment-text">${Security.escapeHtml(comment.content)}</p>
                </div>
            </div>
        `;
    }).join('');
}

// =========================
// Handle Comment Submit
// =========================
async function handleCommentSubmit(e) {
    e.preventDefault();

    const commentInput = document.getElementById('commentContent');
    const content = commentInput.value.trim();

    if (!content) {
        showNotification('⚠️ Vui lòng nhập nội dung bình luận', 'warning');
        return;
    }

    const submitBtn = e.target.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang gửi...';

    try {
        const res = await fetch(`${API_BASE}/comments`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                post_id: postId,
                user_id: 1, // Demo user
                content: content
            })
        });

        const data = await res.json();

        if (data.success) {
            commentInput.value = '';
            showNotification('✅ Bình luận của bạn đã được gửi!', 'success');
            await loadComments();
        } else {
            showNotification('❌ Không thể gửi bình luận', 'error');
        }
    } catch (err) {
        console.error('Error submitting comment:', err);
        showNotification('❌ Lỗi kết nối. Vui lòng thử lại', 'error');
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Gửi bình luận';
    }
}

// =========================
// Load Related Posts
// =========================
async function loadRelatedPosts() {
    try {
        const res = await fetch(`${API_BASE}/posts?status=published&limit=3`);
        const data = await res.json();

        if (data.success && data.data) {
            allPosts = data.data;
            // Filter out current post
            const related = allPosts.filter(p => p.id != postId).slice(0, 3);
            renderRelatedPosts(related);
        }
    } catch (err) {
        console.error('Error loading related posts:', err);
    }
}

function renderRelatedPosts(posts) {
    const relatedGrid = document.getElementById('relatedGrid');

    if (posts.length === 0) {
        document.getElementById('relatedSection').style.display = 'none';
        return;
    }

    relatedGrid.innerHTML = posts.map(post => `
        <a href="./detail.html?slug=${encodeURIComponent(post.slug || createSlug(post.title))}" class="related-card">
            <div class="related-image">
                <img src="${post.image || '../../assets/images/placeholder.png'}" alt="${post.title}">
            </div>
            <div class="related-content">
                <h3 class="related-title">${Security.escapeHtml(post.title)}</h3>
                <p class="related-date">
                    <i class="far fa-calendar"></i>
                    ${formatDate(post.published_at || post.created_at)}
                </p>
            </div>
        </a>
    `).join('');
}

// =========================
// Social Sharing
// =========================
function shareOnSocial(platform) {
    const url = window.location.href;
    const title = currentPost?.title || 'Bài viết hay';

    let shareUrl = '';

    switch (platform) {
        case 'facebook':
            shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
            break;
        case 'twitter':
            shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`;
            break;
        case 'linkedin':
            shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
            break;
    }

    if (shareUrl) {
        window.open(shareUrl, '_blank', 'width=600,height=400');
    }
}

function copyLink() {
    const url = window.location.href;

    navigator.clipboard.writeText(url).then(() => {
        showNotification('✅ Đã sao chép link!', 'success');
    }).catch(err => {
        console.error('Error copying:', err);
        showNotification('❌ Không thể sao chép link', 'error');
    });
}

function toggleBookmark() {
    const btn = document.getElementById('bookmarkBtn');
    const icon = btn.querySelector('i');

    if (icon.classList.contains('far')) {
        icon.classList.remove('far');
        icon.classList.add('fas');
        showNotification('✅ Đã lưu bài viết', 'success');
    } else {
        icon.classList.remove('fas');
        icon.classList.add('far');
        showNotification('ℹ️ Đã bỏ lưu', 'info');
    }
}

// =========================
// Back to Top
// =========================
function setupBackToTop() {
    const backToTop = document.querySelector('#backToTop');
    if (!backToTop) return;

    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            backToTop.classList.add('visible');
        } else {
            backToTop.classList.remove('visible');
        }
    });

    backToTop.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

// =========================
// Utility Functions
// =========================
function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

function formatCommentDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;

    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Vừa xong';
    if (minutes < 60) return `${minutes} phút trước`;
    if (hours < 24) return `${hours} giờ trước`;
    if (days < 7) return `${days} ngày trước`;

    return date.toLocaleDateString('vi-VN');
}

function truncateText(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
}

function hideLoading() {
    const loadingState = document.getElementById('loadingState');
    if (loadingState) {
        loadingState.style.opacity = '0';
        setTimeout(() => {
            loadingState.style.display = 'none';
        }, 300);
    }
}

function showError(message) {
    const loadingState = document.getElementById('loadingState');
    if (loadingState) {
        loadingState.innerHTML = `
            <div class="error-state">
                <i class="fas fa-exclamation-circle"></i>
                <h2>${message}</h2>
                <p>Vui lòng thử lại sau hoặc <a href="./news.html">quay lại danh sách tin tức</a></p>
            </div>
        `;
    }
}

function showNotification(message, type = 'info') {
    // Simple alert for now - can be enhanced with toast notifications
    alert(message);
}

// =========================
// Slug Helper
// =========================
function createSlug(title) {
    if (!title) return 'bai-viet';

    // Vietnamese to Latin conversion map
    const vietnameseMap = {
        'à': 'a', 'á': 'a', 'ả': 'a', 'ã': 'a', 'ạ': 'a',
        'ă': 'a', 'ằ': 'a', 'ắ': 'a', 'ẳ': 'a', 'ẵ': 'a', 'ặ': 'a',
        'â': 'a', 'ầ': 'a', 'ấ': 'a', 'ẩ': 'a', 'ẫ': 'a', 'ậ': 'a',
        'è': 'e', 'é': 'e', 'ẻ': 'e', 'ẽ': 'e', 'ẹ': 'e',
        'ê': 'e', 'ề': 'e', 'ế': 'e', 'ể': 'e', 'ễ': 'e', 'ệ': 'e',
        'ì': 'i', 'í': 'i', 'ỉ': 'i', 'ĩ': 'i', 'ị': 'i',
        'ò': 'o', 'ó': 'o', 'ỏ': 'o', 'õ': 'o', 'ọ': 'o',
        'ô': 'o', 'ồ': 'o', 'ố': 'o', 'ổ': 'o', 'ỗ': 'o', 'ộ': 'o',
        'ơ': 'o', 'ờ': 'o', 'ớ': 'o', 'ở': 'o', 'ỡ': 'o', 'ợ': 'o',
        'ù': 'u', 'ú': 'u', 'ủ': 'u', 'ũ': 'u', 'ụ': 'u',
        'ư': 'u', 'ừ': 'u', 'ứ': 'u', 'ử': 'u', 'ữ': 'u', 'ự': 'u',
        'ỳ': 'y', 'ý': 'y', 'ỷ': 'y', 'ỹ': 'y', 'ỵ': 'y',
        'đ': 'd',
        'À': 'A', 'Á': 'A', 'Ả': 'A', 'Ã': 'A', 'Ạ': 'A',
        'Ă': 'A', 'Ằ': 'A', 'Ắ': 'A', 'Ẳ': 'A', 'Ẵ': 'A', 'Ặ': 'A',
        'Â': 'A', 'Ầ': 'A', 'Ấ': 'A', 'Ẩ': 'A', 'Ẫ': 'A', 'Ậ': 'A',
        'È': 'E', 'É': 'E', 'Ẻ': 'E', 'Ẽ': 'E', 'Ẹ': 'E',
        'Ê': 'E', 'Ề': 'E', 'Ế': 'E', 'Ể': 'E', 'Ễ': 'E', 'Ệ': 'E',
        'Ì': 'I', 'Í': 'I', 'Ỉ': 'I', 'Ĩ': 'I', 'Ị': 'I',
        'Ò': 'O', 'Ó': 'O', 'Ỏ': 'O', 'Õ': 'O', 'Ọ': 'O',
        'Ô': 'O', 'Ồ': 'O', 'Ố': 'O', 'Ổ': 'O', 'Ỗ': 'O', 'Ộ': 'O',
        'Ơ': 'O', 'Ờ': 'O', 'Ớ': 'O', 'Ở': 'O', 'Ỡ': 'O', 'Ợ': 'O',
        'Ù': 'U', 'Ú': 'U', 'Ủ': 'U', 'Ũ': 'U', 'Ụ': 'U',
        'Ư': 'U', 'Ừ': 'U', 'Ứ': 'U', 'Ử': 'U', 'Ữ': 'U', 'Ự': 'U',
        'Ỳ': 'Y', 'Ý': 'Y', 'Ỷ': 'Y', 'Ỹ': 'Y', 'Ỵ': 'Y',
        'Đ': 'D'
    };

    let slug = title.toLowerCase();

    // Replace Vietnamese characters
    for (const [viet, latin] of Object.entries(vietnameseMap)) {
        slug = slug.replace(new RegExp(viet, 'g'), latin);
    }

    // Replace special characters and spaces with hyphens
    slug = slug
        .replace(/[^a-z0-9\s-]/g, '') // Remove special chars
        .replace(/\s+/g, '-')          // Replace spaces with -
        .replace(/-+/g, '-')           // Replace multiple - with single -
        .replace(/^-+|-+$/g, '');      // Trim - from start/end

    return slug || 'bai-viet';
}
