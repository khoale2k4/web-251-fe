import { ready } from '../../js/main.js';
import { mountHeader } from '../../components/Header.js';
import { mountFooter } from '../../components/Footer.js';
import { addToCart } from '../../js/addToCart.js';
import { updateCartCounter } from '../../js/updateCartCounter.js';

const API_BASE = 'http://localhost:8000';
let products = [];

ready(async () => {
    mountHeader('.mount-header', 'products');
    mountFooter('.mount-footer');
    await updateCartCounter(2);

    const params = new URLSearchParams(window.location.search);
    const productId = params.get('id');

    if (productId) {
        await fetchAndRenderProductDetail(productId);
    }
});

async function fetchAndRenderProductDetail(id) {
    const main = document.querySelector('main');
    main.innerHTML = `<p>Đang tải chi tiết sản phẩm...</p>`;

    try {
        const response = await fetch(`${API_BASE}/products/${id}`);
        const result = await response.json();

        if (!result.success || !result.data) {
            main.innerHTML = `<p>Không tìm thấy sản phẩm với ID = ${id}</p>`;
            return;
        }

        const product = result.data;
        const hasDiscount = parseFloat(product.discount) > 0;
        const price = parseFloat(product.price);
        const finalPrice = parseFloat(product.final_price);
        const imageUrl = `${API_BASE}${product.image}`;

        main.innerHTML = `

            <button class="btn-back" onclick="window.location.href='/fe/pages/products/prodyc'">
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
                    <p class="product-description">
                        ${product.description}
                    </p>

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
        main.innerHTML = `<p class="error">Lỗi khi tải chi tiết sản phẩm: ${err.message}</p>`;
    }
}

function attachProductEvents() {
    document.querySelectorAll('.add-btn').forEach(btn => {
        btn.addEventListener('click', e => {
            const id = btn.dataset.id;
            if (id) addToCart(id, 2);
        });
    });
}