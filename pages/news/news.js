import { mountHeader } from '../../components/Header.js';
import { mountFooter } from '../../components/Footer.js';

const API_BASE = window.__ENV__?.API_BASE || "http://localhost:8000";

// State
let allPosts = [];
let currentView = 'grid';
let currentPage = 1;
const postsPerPage = 6;
let searchTimeout = null;

// Helper function to format image URL
function formatImageUrl(imagePath) {
    if (!imagePath) return '../../assets/images/placeholder.png';
    if (imagePath.startsWith('http')) return imagePath;
    if (imagePath.startsWith('/')) return `${API_BASE}${imagePath}`;
    return `${API_BASE}/storage/${imagePath}`;
}

document.addEventListener("DOMContentLoaded", () => {
    mountHeader('.mount-header', 'news');
    mountFooter('.mount-footer');
    
    initializeApp();
});

function initializeApp() {
    setupEventListeners();
    loadPosts();
    setupBackToTop();
}

// =========================
// Event Listeners
// =========================
function setupEventListeners() {
    // Search
    const searchInput = document.querySelector('#searchInput');
    const searchBtn = document.querySelector('.search-btn');
    
    searchInput?.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            loadPosts(e.target.value);
        }, 500);
    });
    
    searchBtn?.addEventListener('click', () => {
        loadPosts(searchInput.value);
    });
    
    // View Toggle
    const toggleBtns = document.querySelectorAll('.toggle-btn');
    toggleBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            toggleBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentView = btn.dataset.view;
            renderPosts();
        });
    });
    
    // Newsletter
    const newsletterBtn = document.querySelector('.newsletter-btn');
    newsletterBtn?.addEventListener('click', handleNewsletter);
}

// =========================
// Load Posts from API
// =========================
async function loadPosts(keyword = "") {
    try {
        const url = keyword 
            ? `${API_BASE}/posts?search=${encodeURIComponent(keyword)}&status=published`
            : `${API_BASE}/posts?status=published`;
            
        const res = await fetch(url);
        const data = await res.json();

        if (data.success && data.data) {
            allPosts = data.data;
            currentPage = 1;
            renderFeaturedPosts();
            renderPosts();
            renderPagination();
        } else {
            showEmptyState();
        }
    } catch (err) {
        console.error('Error loading posts:', err);
        showErrorState();
    }
}

// =========================
// Render Featured Posts
// =========================
function renderFeaturedPosts() {
    const featuredGrid = document.querySelector('#featuredGrid');
    if (!featuredGrid) return;
    
    const featured = allPosts.slice(0, 2);
    
    if (featured.length === 0) {
        featuredGrid.innerHTML = '<p class="text-center">Chưa có bài viết nổi bật</p>';
        return;
    }
    
    featuredGrid.innerHTML = featured.map(post => `
        <div class="featured-card" onclick="window.location.href='./detail.html?slug=${encodeURIComponent(post.slug || createSlug(post.title))}'">
            <img src="${formatImageUrl(post.image)}" alt="${post.title}">
            <div class="featured-content">
                <span class="featured-badge">Nổi bật</span>
                <h3 class="featured-title">${post.title}</h3>
                <div class="featured-meta">
                    <span><i class="fas fa-user"></i> ${post.author_name || 'Admin'}</span>
                    <span><i class="fas fa-calendar"></i> ${formatDate(post.published_at || post.created_at)}</span>
                </div>
            </div>
        </div>
    `).join('');
}

// =========================
// Render Posts
// =========================
function renderPosts() {
    const newsGrid = document.querySelector('#newsGrid');
    if (!newsGrid) return;
    
    // Skip featured posts
    const posts = allPosts.slice(2);
    
    // Pagination
    const startIndex = (currentPage - 1) * postsPerPage;
    const endIndex = startIndex + postsPerPage;
    const paginatedPosts = posts.slice(startIndex, endIndex);
    
    if (paginatedPosts.length === 0) {
        newsGrid.innerHTML = '<p class="text-center" style="grid-column: 1/-1;">Không có bài viết nào.</p>';
        return;
    }
    
    newsGrid.className = `news-grid ${currentView === 'list' ? 'list-view' : ''}`;
    
    newsGrid.innerHTML = paginatedPosts.map(post => createPostCard(post)).join('');
}

function createPostCard(post) {
    const excerpt = stripHtml(post.excerpt || post.content || '').substring(0, 150);
    const authorInitial = (post.author_name || 'A')[0].toUpperCase();
    
    return `
        <article class="news-card" onclick="window.location.href='./detail.html?slug=${encodeURIComponent(post.slug || createSlug(post.title))}'">
            <div class="news-image">
                <img src="${formatImageUrl(post.image)}" alt="${post.title}">
                <span class="news-badge">Mới</span>
            </div>
            <div class="news-body">
                <h3 class="news-title">${post.title}</h3>
                <p class="news-excerpt">${excerpt}...</p>
                <div class="news-footer">
                    <div class="news-author">
                        <div class="author-avatar">${authorInitial}</div>
                        <div class="author-info">
                            <div class="author-name">${post.author_name || 'Admin'}</div>
                            <div class="news-date">${formatDate(post.published_at || post.created_at)}</div>
                        </div>
                    </div>
                    <a href="./detail.html?slug=${encodeURIComponent(post.slug || createSlug(post.title))}" class="read-more" onclick="event.stopPropagation()">
                        Đọc thêm <i class="fas fa-arrow-right"></i>
                    </a>
                </div>
            </div>
        </article>
    `;
}

// =========================
// Pagination
// =========================
function renderPagination() {
    const pagination = document.querySelector('#pagination');
    if (!pagination) return;
    
    const posts = allPosts.slice(2); // Skip featured
    const totalPages = Math.ceil(posts.length / postsPerPage);
    
    if (totalPages <= 1) {
        pagination.innerHTML = '';
        return;
    }
    
    let html = `
        <button class="page-btn" ${currentPage === 1 ? 'disabled' : ''} onclick="changePage(${currentPage - 1})">
            <i class="fas fa-chevron-left"></i>
        </button>
    `;
    
    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
            html += `
                <button class="page-btn ${i === currentPage ? 'active' : ''}" onclick="changePage(${i})">
                    ${i}
                </button>
            `;
        } else if (i === currentPage - 2 || i === currentPage + 2) {
            html += '<span style="padding: 0 8px;">...</span>';
        }
    }
    
    html += `
        <button class="page-btn" ${currentPage === totalPages ? 'disabled' : ''} onclick="changePage(${currentPage + 1})">
            <i class="fas fa-chevron-right"></i>
        </button>
    `;
    
    pagination.innerHTML = html;
}

window.changePage = function(page) {
    currentPage = page;
    renderPosts();
    renderPagination();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// =========================
// Back to Top Button
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
// Newsletter
// =========================
function handleNewsletter() {
    const input = document.querySelector('.newsletter-input');
    const email = input?.value.trim();
    
    if (!email) {
        alert('Vui lòng nhập email của bạn');
        return;
    }
    
    if (!isValidEmail(email)) {
        alert('Email không hợp lệ');
        return;
    }
    
    // TODO: Call API to subscribe
    alert(`Cảm ơn bạn đã đăng ký! Chúng tôi sẽ gửi tin tức đến ${email}`);
    input.value = '';
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

function stripHtml(html) {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
}

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function showEmptyState() {
    const newsGrid = document.querySelector('#newsGrid');
    if (newsGrid) {
        newsGrid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 60px 20px;">
                <i class="fas fa-inbox" style="font-size: 4rem; color: #d1d5db; margin-bottom: 16px;"></i>
                <h3 style="margin-bottom: 8px;">Không tìm thấy bài viết</h3>
                <p style="color: #6b7280;">Thử tìm kiếm với từ khóa khác</p>
            </div>
        `;
    }
}

function showErrorState() {
    const newsGrid = document.querySelector('#newsGrid');
    if (newsGrid) {
        newsGrid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 60px 20px;">
                <i class="fas fa-exclamation-circle" style="font-size: 4rem; color: #ef4444; margin-bottom: 16px;"></i>
                <h3 style="margin-bottom: 8px;">Lỗi tải dữ liệu</h3>
                <p style="color: #6b7280;">Vui lòng thử lại sau</p>
            </div>
        `;
    }
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