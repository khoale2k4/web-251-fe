import { ready } from '../../js/main.js';
import { mountHeader } from '../../components/Header.js';
import { mountFooter } from '../../components/Footer.js';
import { addToCart } from '../../js/addToCart.js';
import { updateCartCounter } from '../../js/updateCartCounter.js';
import getUserId from '../../js/getUserId.js';
import { Popup } from '../../components/PopUp.js';

const API_BASE = 'http://localhost:8000';

ready(async () => {
    mountHeader('.mount-header', 'products');
    mountFooter('.mount-footer');

    const params = new URLSearchParams(window.location.search);
    const productId = params.get('id');

    if (productId) {
        await Promise.all([
            fetchAndRenderProductDetail(productId),
            fetchAndRenderComments(productId)
        ]);

        renderCommentForm(productId);

    } else {
        document.querySelector('main').innerHTML =
            `<p class="error-text">Không tìm thấy ID sản phẩm.</p>`;
    }
});


// --- PHẦN 1: LOGIC CHI TIẾT SẢN PHẨM ---

async function fetchAndRenderProductDetail(id) {
    // SỬA LỖI: Chỉ render vào container sản phẩm
    const container = document.querySelector('.product-detail-container');
    if (!container) return;

    container.innerHTML = `<p class="loading-text">Đang tải chi tiết sản phẩm...</p>`;

    try {
        const response = await fetch(`${API_BASE}/products/${id}`);
        const result = await response.json();

        if (!result.success || !result.data) {
            container.innerHTML = `<p>Không tìm thấy sản phẩm với ID = ${id}</p>`;
            return;
        }

        const product = result.data;
        const hasDiscount = parseFloat(product.discount) > 0;
        const price = parseFloat(product.price);
        const finalPrice = parseFloat(product.final_price);
        const imageUrl = `${API_BASE}${product.image}`;

        // (HTML của bạn, không thay đổi)
        container.innerHTML = `
            <button class="btn-back" onclick="window.location.href='/fe/pages/products/products.html'">
                &larr; Quay lại sản phẩm
            </button>
            <div class="product-detail">
                <div class="product-gallery">
                    <div class="main-image">
                        <img src="${imageUrl}" alt="${product.name}" onerror="this.src='/fe/assets/placeholder.png'">
                    </div>
                </div>
                <div class="product-info">
                    <span class="product-category">${product.category_name}</span>
                    <h1 class="product-title">${product.name}</h1>
                    <p class="product-description">${product.description}</p>
                    <div class="price-section">
                        <span class="price">${finalPrice.toLocaleString()}</span>
                        <span class="old-price">${price.toLocaleString()}</span>
                        <span class="discount-badge">-${product.discount}%</span>
                    </div>
                    <ul class="features">
                      <li>Kích thước: ${product.size}</li>
                      <li>Màu sắc: ${product.color}</li>
                      <li>Danh mục: ${product.category_name}</li>
                      <li>Còn lại: ${product.stock} sản phẩm</li>
                    </ul>
                    <div class="action-buttons">
                        <button class="btn-primary add-btn" data-id="${product.id}">Thêm vào giỏ hàng</button>
                    </div>
                </div>
            </div>
        `;

        attachProductEvents();

    } catch (err) {
        container.innerHTML = `<p class="error">Lỗi khi tải chi tiết sản phẩm: ${err.message}</p>`;
    }
}

function attachProductEvents() {
    const userId = getUserId();
    document.querySelectorAll('.add-btn').forEach(btn => {
        btn.addEventListener('click', e => {
            const id = btn.dataset.id;
            if (id) addToCart(id, userId);
        });
    });
}


// --- PHẦN 2: LOGIC BÌNH LUẬN (MỚI) ---

/**
 * Tải và render danh sách bình luận
 */
async function fetchAndRenderComments(productId) {
    const container = document.querySelector('.comment-section-container');
    if (!container) return;

    const API_URL = `${API_BASE}/comments/product-comments?id=${productId}`;

    try {
        const response = await (await fetch(API_URL)).json();

        const comments = response ? response : [];

        let commentListHtml = '';
        if (comments.length === 0) {
            commentListHtml = '<p>Chưa có bình luận nào. Hãy là người đầu tiên!</p>';
        } else {
            commentListHtml = `
                <ul class="comment-list">
                    ${comments.map(comment => `
                        <li class="comment-item">
                            <div class="comment-avatar">
                                <a href="/fe/pages/profile/profile.html?id=${comment.user_id}">
                                    <img src="${API_BASE}${comment.user_avatar || '../../assets/images/placeholder-avatar.png'}" alt="${comment.user_name}">
                                </a>
                            </div>
                            <div class="comment-body">
                                <div class="comment-header">
                                    <a href="/fe/pages/profile/profile.html?id=${comment.user_id}" class="comment-user-link">
                                        ${comment.user_name}
                                    </a>
                                    <div class="comment-rating">
                                        ${renderStars(comment.rating)}
                                    </div>
                                </div>
                                <div class="comment-content">
                                    <p>${comment.content}</p>
                                </div>
                                <div class="comment-date">
                                    ${new Date(comment.created_at).toLocaleString('vi-VN')}
                                </div>
                            </div>
                        </li>
                    `).join('')}
                </ul>
            `;
        }

        container.innerHTML = `
            <div class="comment-section">
                <h2>Bình luận & Đánh giá</h2>
                
                <div id="comment-form-container"></div>
                
                <div id="comment-list-container">
                    ${commentListHtml}
                </div>
            </div>
        `;

    } catch (err) {
        console.error("Lỗi tải bình luận:", err);
        container.innerHTML = `<p class="error">Không thể tải bình luận.</p>`;
    }
}

/**
 * Render form đăng bình luận (nếu đã đăng nhập)
 */
function renderCommentForm(productId) {
    const container = document.getElementById('comment-form-container');
    if (!container) return;

    const userId = getUserId(); 

    if (userId) {
        container.innerHTML = `
            <form class="comment-form" id="newCommentForm">
                <textarea 
                    name="content" 
                    placeholder="Viết bình luận của bạn..." 
                    required 
                    minlength="1"></textarea>
                <div class="comment-form-row">
                    <div class="form-group-rating">
                        <label for="rating">Đánh giá:</label>
                        <select name="rating" id="rating" required>
                            <option value="5">5 sao (Tuyệt vời)</option>
                            <option value="4">4 sao (Tốt)</option>
                            <option value="3">3 sao (Bình thường)</option>
                            <option value="2">2 sao (Tệ)</option>
                            <option value="1">1 sao (Rất tệ)</option>
                        </select>
                    </div>
                    <button type="submit" class="btn-primary btn-submit-comment">Gửi bình luận</button>
                </div>
            </form>
        `;
        attachCommentFormEvents(productId, userId);
    } else {
        container.innerHTML = `
            <div class="comment-login-prompt">
                Vui lòng <a href="/fe/pages/home/login.html">đăng nhập</a> để gửi bình luận.
            </div>
        `;
    }
}

/**
 * Gắn sự kiện cho form bình luận
 */
function attachCommentFormEvents(productId, userId) {
    const form = document.getElementById('newCommentForm');
    if (!form) return;

    const popup = new Popup();

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const button = form.querySelector('button[type="submit"]');
        button.disabled = true;
        button.textContent = 'Đang gửi...';

        try {
            const formData = new FormData(form);
            const content = formData.get('content');
            const rating = parseInt(formData.get('rating'), 10);

            const userId = getUserId();

            const response = await fetch(`${API_BASE}/comments/product-comments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    user_id: userId,
                    content: content,
                    rating: rating,
                    product_id: productId
                })
            });

            const result = await response.json();
            if (!response) {
                throw new Error(result.message || "Không thể gửi bình luận.");
            }

            popup.show({ title: "Thành công", content: "Bình luận của bạn đã được gửi!" });
            // form.reset();
            await fetchAndRenderComments(productId);
        } catch (err) {
            popup.show({ title: "Lỗi", content: `<p>${err.message}</p>` });
        } finally {
            button.disabled = false;
            button.textContent = 'Gửi bình luận';
        }
    });
}

function renderStars(rating) {
    let starsHtml = '';
    const filledStars = Math.round(rating) || 0; 
    for (let i = 1; i <= 5; i++) {
        if (i <= filledStars) {
            starsHtml += '<span class="star filled">★</span>';
        } else {
            starsHtml += '<span class="star">☆</span>';
        }
    }
    return starsHtml;
}