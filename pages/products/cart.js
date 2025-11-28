import { ready } from '../../js/main.js';
import { mountHeader } from '../../components/Header.js';
import { mountFooter } from '../../components/Footer.js';
import { updateCartCounter } from '../../js/updateCartCounter.js';
import { Popup } from '../../components/PopUp.js';
import getUserId from '../../js/getUserId.js';

const API_BASE = 'http://localhost:8000';
const userId = getUserId();

ready(async () => {
    mountHeader('.mount-header', 'products');
    mountFooter('.mount-footer');
    await fetchAndRenderCart(userId);
});

async function fetchAndRenderCart(userId) {
    const main = document.querySelector('main');
    main.innerHTML = `<p>Đang tải giỏ hàng...</p>`;

    try {
        const response = await fetch(`${API_BASE}/carts/${userId}`);
        const result = await response.json();

        if (!result.success || !result.data) {
            main.innerHTML = `<p>Không thể tải giỏ hàng!</p>`;
            return;
        }

        const { items, total, item_count } = result.data;

        if (item_count === 0) {
            main.innerHTML = `
                <h1>Giỏ hàng của bạn</h1>
                <div class="cart-empty">
                    <p>Giỏ hàng của bạn đang trống.</p>
                    <a href="/fe/pages/products/products.html" class="btn-primary">Tiếp tục mua sắm</a>
                </div>
            `;
            return;
        }

        main.innerHTML = `
      <h1>Giỏ hàng của bạn</h1>
      
      <div class="cart-layout">
      
        <div class="cart-items">
          ${items.map(item => `
            <div class="cart-item" data-id="${item.id}" data-product_id="${item.product_id}">
              <a href="/fe/pages/products/detail.html?id=${item.product_id}" class="product-image-link">
                <img src="${API_BASE}${item.image}" alt="${item.product_name}" class="cart-image" onerror="this.src='/fe/assets/placeholder.png'">
              </a>
              <div class="cart-info">
                <h3><a href="/fe/pages/products/detail.html?id=${item.product_id}" class="product-name-link">${item.product_name}</a></h3>
                <p>${parseFloat(item.final_price).toLocaleString()} VNĐ</p>
                <div class="quantity-control">
                  <button class="btn-decrease" data-product_id="${item.product_id}">−</button>
                  <span class="quantity">${item.quantity}</span>
                  <button class="btn-increase" data-product_id="${item.product_id}">+</button>
                </div>
                <p><strong>Tạm tính:</strong> ${parseFloat(item.subtotal).toLocaleString()} VNĐ</p>
              </div>
              <button class="btn-remove" data-id="${item.id}">&times;</button>
            </div>
          `).join('')}
        </div> <div class="cart-summary">
          <p><strong>Tổng sản phẩm:</strong> <span>${item_count}</span></p>
          <p><strong>Tổng cộng:</strong> <span>${parseFloat(total).toLocaleString()} VNĐ</span></p>
          <button id="checkout-btn" class="btn-primary">Đặt hàng</button>
        </div> </div> <form id="order-form" class="order-form hidden">
        <h2>Thông tin giao hàng</h2>
        <label>Địa chỉ giao hàng</label>
        <input type="text" id="shipping_address" placeholder="VD: 123 Đường ABC, Quận 1" required />

        <label>Phương thức thanh toán</label>
        <select id="payment_method">
          <option value="cod">Thanh toán khi nhận hàng (COD)</option>
          <option value="bank">Chuyển khoản</option>
          <option value="paypal">Thanh toán qua Paypal</option>
          <option value="credit_card">Thanh toán qua thẻ tín dụng</option>
        </select>

        <label>Ghi chú</label>
        <textarea id="note" placeholder="Ghi chú thêm..."></textarea>

        <div class="form-actions">
          <button type="button" id="cancel-form" class="btn-secondary">Hủy</button>
          <button type="submit" class="btn-primary">Xác nhận đặt hàng</button>
        </div>
      </form>
    `;

        // Gắn sự kiện (Event Listeners)
        attachCartEvents(userId);

    } catch (err) {
        main.innerHTML = `<p class="error">Lỗi khi tải giỏ hàng: ${err.message}</p>`;
    }
}

function attachCartEvents(userId) {
    document.querySelectorAll('.btn-remove').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const itemId = e.target.dataset.id;
            removeItem(userId, itemId);
        });
    });

    document.querySelectorAll('.btn-increase').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const productId = e.target.dataset.product_id;
            updateQuantity(userId, productId, 1);
        });
    });

    document.querySelectorAll('.btn-decrease').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const productId = e.target.dataset.product_id;
            updateQuantity(userId, productId, -1);
        });
    });

    document.getElementById('checkout-btn')?.addEventListener('click', () => {
        document.getElementById('order-form').classList.remove('hidden');
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    });

    document.getElementById('cancel-form')?.addEventListener('click', () => {
        document.getElementById('order-form').classList.add('hidden');
    });

    document.getElementById('order-form')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        await createOrderFromCart(userId);
    });
}

/**
 * CẬP NHẬT 1: Sửa lỗi alert()
 */
async function updateQuantity(userId, productId, delta) {
    try {
        const response = await fetch(`${API_BASE}/carts/items`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: userId, quantity: delta, product_id: productId })
        });
        const result = await response.json();
        if (response.ok && result.success) {
            await fetchAndRenderCart(userId);
            await updateCartCounter(userId);
        } else {
            // Thay thế alert() bằng Popup
            const popup = new Popup();
            popup.show({
                title: "Lỗi cập nhật",
                content: `<p>${result.message || 'Không thể cập nhật số lượng'}</p>`,
                actions: [{ label: "Đóng", type: "btn-secondary", close: true }]
            });
        }
    } catch (error) {
        console.error('Lỗi cập nhật số lượng:', error);
    }
}

/**
 * CẬP NHẬT 2: Sửa confirm() (Yêu cầu chính)
 */
async function removeItem(userId, itemId) {
    // 1. Khởi tạo Popup
    const popup = new Popup();

    // 2. Hiển thị popup với 2 lựa chọn
    popup.show({
        title: "Xác nhận xóa",
        content: "<p>Bạn có chắc muốn xoá sản phẩm này khỏi giỏ hàng?</p>",
        actions: [
            {
                label: "Hủy",
                type: "btn-secondary", // Lớp CSS cho nút
                close: true           // Tự động đóng khi bấm
            },
            {
                label: "Xác nhận Xóa",
                type: "btn-danger",
                close: false, // Không tự đóng, chờ logic
                onClick: async () => {
                    // 3. Đưa logic xóa vào bên trong onClick
                    try {
                        const response = await fetch(`${API_BASE}/carts/items/${itemId}?user_id=${userId}`, {
                            method: 'DELETE'
                        });
                        const result = await response.json();
                        if (response.ok && result.success) {
                            await fetchAndRenderCart(userId);
                            await updateCartCounter(userId);
                            popup.hide(); 
                        } else {
                            popup.show({
                                title: "Lỗi",
                                content: `<p>${result.message || 'Không thể xoá sản phẩm'}</p>`,
                                actions: [{ label: "Đóng", type: "btn-secondary", close: true }]
                            });
                        }
                    } catch (error) {
                        console.error('Lỗi khi xoá sản phẩm:', error);
                        popup.show({
                            title: "Lỗi nghiêm trọng",
                            content: `<p>${error.message}</p>`,
                            actions: [{ label: "Đóng", type: "btn-secondary", close: true }]
                        });
                    }
                }
            }
        ]
    });
}

async function createOrderFromCart(userId) {
    const shipping_address = document.getElementById('shipping_address').value.trim();
    const payment_method = document.getElementById('payment_method').value;
    const note = document.getElementById('note').value.trim();

    if (!shipping_address) {
        alert('Vui lòng nhập địa chỉ giao hàng!'); 
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/orders/from-cart`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                user_id: userId,
                shipping_address,
                payment_method,
                note
            }),
        });

        const result = await response.json();

        if (response.ok && result.success) {
            const popup = new Popup();

            popup.show({
                title: "Đặt hàng thành công!",
                content: "<p>Cảm ơn bạn đã đặt hàng. Chúng tôi sẽ liên hệ với bạn sớm nhất.</p>",
                actions: [
                    {
                        label: "OK",
                        type: "btn-primary",
                        close: true,
                        onClick: async () => {
                            await fetchAndRenderCart(userId);
                            await updateCartCounter(userId);
                        }
                    }
                ]
            });

            document.getElementById('order-form').classList.add('hidden');

        } else {
            throw new Error(result.message || 'Không thể tạo đơn hàng');
        }

    } catch (error) {
        console.error('Lỗi khi đặt hàng:', error);
        const popup = new Popup();
        popup.show({
            title: "Đặt hàng thất bại",
            content: `<p>${error.message}</p>`,
            actions: [{ label: "Đóng", type: "btn-secondary", close: true }]
        });
    }
}

document.addEventListener('DOMContentLoaded', () => updateCartCounter(userId));