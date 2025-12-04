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


async function fetchAndRenderProductDetail(id) {
    const container = document.querySelector('.product-detail-container');
    if (!container) return;

    renderLoading(container);

    try {
        const response = await fetch(`${API_BASE}/products/${id}`);
        const result = await response.json();

        if (!result.success || !result.data) {
            renderError(container, `Không tìm thấy sản phẩm với ID = ${id}`, () => window.location.reload());
            return;
        }

        const product = result.data;
        const hasDiscount = parseFloat(product.discount) > 0;
        const price = parseFloat(product.price);
        const finalPrice = parseFloat(product.final_price);
        const imageUrl = `${API_BASE}${product.image}`;

        container.innerHTML = `
            <button class="btn-back" onclick="window.location.href='/fe/pages/products/products.html'">
                &larr; Quay lại sản phẩm
            </button>
            <div class="product-detail">
                <div class="product-gallery">
                    <div class="main-image">
                        <img src="${imageUrl}" alt="${product.name}" onerror="this.src='../../assets/images/placeholder.png'">
                    </div>
                </div>
                <div class="product-info">
                    <span class="product-category">${product.category_name}</span>
                    <h1 class="product-title">${product.name}</h1>
                    <div class="price-section">
                        <span class="price">${finalPrice.toFixed(0).toLocaleString()} VNĐ</span>
                        ${hasDiscount ? `<span class="old-price">${price.toLocaleString()} VNĐ</span><span class="discount-badge">-${(parseFloat(product.discount) || 0).toFixed(0)}%</span>` : ''}
                    </div>
                    
                    <p class="product-description">${product.description}</p>
                    
                    <div class="features-container" style="margin: 24px 0; background: #f8fafc; padding: 20px; border-radius: 16px;">
                        <h3 style="font-size: 1.1rem; margin-bottom: 12px; font-weight: 700;">Thông tin chi tiết</h3>
                        <ul class="features" style="list-style: none; padding: 0; display: grid; gap: 12px;">
                          <li style="display: flex; align-items: center; gap: 10px;">
                              <i class="fas fa-ruler-combined" style="color: var(--primary); width: 20px;"></i> 
                              <span>Kích thước: <strong>${product.size}</strong></span>
                              <button class="btn-size-guide" id="btnSizeGuide" style="margin-left: 10px; border: none; background: none; color: var(--primary); cursor: pointer; font-size: 0.9rem; text-decoration: underline;">
                                  <i class="fas fa-ruler"></i> Bảng kích thước
                              </button>
                          </li>
                          <li style="display: flex; align-items: center; gap: 10px;">
                              <i class="fas fa-palette" style="color: var(--primary); width: 20px;"></i> 
                              <span>Màu sắc: </span>
                              <span class="color-swatch" style="background-color: ${product.color}; width: 24px; height: 24px; border-radius: 50%; border: 1px solid #e5e7eb; display: inline-block; margin-left: 8px;" title="${product.color}"></span>
                          </li>
                          <li style="display: flex; align-items: center; gap: 10px;"><i class="fas fa-box-open" style="color: var(--primary); width: 20px;"></i> <span>Còn lại: <strong>${product.stock}</strong> sản phẩm</span></li>
                        </ul>
                    </div>

                    <div class="action-buttons">
                        <button class="btn-primary add-btn" data-id="${product.id}" style="width: 100%; justify-content: center; padding: 18px; font-size: 1.2rem;">
                            <i class="fas fa-shopping-cart"></i> Thêm vào giỏ hàng
                        </button>
                    </div>
                </div>
            </div>
            </div>
        `;

        attachProductEvents();

        // Size Guide Popup Logic
        const btnSizeGuide = document.getElementById('btnSizeGuide');
        if (btnSizeGuide) {
            btnSizeGuide.addEventListener('click', () => {
                // Create popup if not exists
                let popup = document.getElementById('sizeGuidePopup');
                if (!popup) {
                    popup = document.createElement('div');
                    popup.id = 'sizeGuidePopup';
                    popup.className = 'popup-overlay';
                    popup.innerHTML = `
                        <div class="popup-content">
                            <button class="popup-close">&times;</button>
                            <h3>Bảng kích thước</h3>
                            <img src="../../assets/images/size-chart.jpg" alt="Size Chart" style="max-width: 100%; height: auto; border-radius: 8px;">
                        </div>
                    `;
                    document.body.appendChild(popup);

                    // Close events
                    popup.querySelector('.popup-close').addEventListener('click', () => popup.remove());
                    popup.addEventListener('click', (e) => {
                        if (e.target === popup) popup.remove();
                    });
                }
            });
        }

        fetchAndRenderRelatedProducts(product.category_id, product.id);

    } catch (err) {
        renderError(container, `Lỗi khi tải chi tiết sản phẩm: ${err.message}`, () => window.location.reload());
    }
}

function attachProductEvents() {
    document.querySelectorAll('.add-btn').forEach(btn => {
        btn.addEventListener('click', e => {
            const id = btn.dataset.id;
            if (id) addToCart(id);
        });
    });
}

async function fetchAndRenderComments(productId) {
    const container = document.querySelector('.comment-section-container');
    if (!container) return;

    const API_URL = `${API_BASE}/comments/product-comments?id=${productId}`;

    try {
        const response = await (await fetch(API_URL)).json();

        const comments = response ? response.data : [];

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
                                    <img src="${API_BASE}${comment.user_avatar || '../../assets/images/noAvatar.png'}" alt="${comment.user_name}">
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
        renderError(container, "Không thể tải bình luận.", () => fetchAndRenderComments(productId));
    }
}

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

async function fetchAndRenderRelatedProducts(categoryId, currentProductId) {
    const container = document.getElementById('recommended-grid');
    if (!container) return;

    renderLoading(container);

    try {
        const response = await fetch(`${API_BASE}/products?category_id=${categoryId}&limit=5`);
        const result = await response.json();

        if (!result.success || !result.data?.products) {
            container.innerHTML = '<p>Không có sản phẩm đề xuất nào.</p>';
            return;
        }

        const relatedProducts = result.data.products
            .filter(p => p.id != currentProductId)
            .slice(0, 4);

        if (relatedProducts.length === 0) {
            container.innerHTML = '<p>Không có sản phẩm đề xuất nào.</p>';
            return;
        }

        container.innerHTML = relatedProducts.map((product, index) => {
            const hasDiscount = parseFloat(product.discount) > 0;
            const price = parseFloat(product.price);
            const finalPrice = parseFloat(product.final_price);
            const imageUrl = `${API_BASE}${product.image}`;

            return `
            <div class="product-card" style="animation-delay: ${index * 0.1}s">
              <span class="category-badge">${product.category_name}</span>
              <a href="/fe/pages/products/detail.html?id=${product.id}" class="product-image-link">
                <img src="${imageUrl}" alt="${product.name}" class="product-image" onerror="this.src='../../assets/images/placeholder.png'">
              </a>
              <div class="product-info">
                <div class="info-top">
                  <h3><a href="/fe/pages/products/detail.html?id=${product.id}" class="product-name-link">${product.name}</a></h3>
                  <p>${product.description || ''}</p>
                </div>
                <div class="info-bottom">
                  <div class="price-wrapper">
                    <span class="price">${finalPrice.toFixed(0).toLocaleString()} VNĐ</span>
                    ${hasDiscount ? `<span class="old-price">${price.toFixed(0).toLocaleString()} VNĐ</span><span class="discount-badge">-${(parseFloat(product.discount) || 0).toFixed(0)}%</span>` : ''}
                  </div>
                  <div class="btn-group">
                    <button class="btn-add-cart add-btn" data-id="${product.id}">
                      <i class="fas fa-shopping-bag"></i> Thêm vào giỏ
                    </button>
                    <button class="btn-view-details view-btn" data-id="${product.id}">Xem chi tiết</button>
                  </div>
                </div>
              </div>
            </div>
          `;
        }).join('');

        attachProductEvents();

        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.addEventListener('click', e => {
                const id = btn.dataset.id;
                window.location.href = `/fe/pages/products/detail.html?id=${id}`;
            });
        });

    } catch (err) {
        console.error('Error loading related products:', err);
        renderError(container, "Lỗi tải sản phẩm đề xuất.", () => fetchAndRenderRelatedProducts(categoryId, currentProductId));
    }
}

function renderLoading(container) {
    if (!container) return;
    container.innerHTML = `
        <div class="loading-container">
            <div class="loading-spinner"></div>
            <p class="loading-text">Đang tải dữ liệu...</p>
        </div>
    `;
}

function renderError(container, message, retryCallback) {
    if (!container) return;
    container.innerHTML = `
        <div class="error-container">
            <i class="fas fa-exclamation-circle error-icon"></i>
            <h3 class="error-title">Đã xảy ra lỗi</h3>
            <p class="error-message">${message}</p>
            ${retryCallback ? `<button class="btn-retry">Thử lại</button>` : ''}
        </div>
    `;

    if (retryCallback) {
        const btn = container.querySelector('.btn-retry');
        if (btn) btn.onclick = retryCallback;
    }
}