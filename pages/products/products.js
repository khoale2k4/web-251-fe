import { ready } from '../../js/main.js';
import { mountHeader } from '../../components/Header.js';
import { mountFooter } from '../../components/Footer.js';

const API_BASE = 'http://localhost:8000';

ready(async () => {
  mountHeader('.mount-header', 'products');
  mountFooter('.mount-footer');

  const params = new URLSearchParams(window.location.search);
  const productId = params.get('id');
  const query = params.get('product_query');

  if (productId) {
    await fetchAndRenderProductDetail(productId);
  }
  await fetchAndRenderProducts(query);
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
    const imageUrl = `http://localhost:8000${product.image}`;

    main.innerHTML = `
      <h1>Chi tiết sản phẩm</h1>
      <div class="product-detail">
        <div class="product-image">
          <img src="${imageUrl}" alt="${product.name}" onerror="this.src='/fe/assets/placeholder.png'">
        </div>
        <div class="product-info">
          <h2>${product.name}</h2>

          <div class="price-section">
            <p class="price">${finalPrice.toLocaleString()} VNĐ</p>
            ${hasDiscount ? `<p class="old-price">${price.toLocaleString()} VNĐ</p>` : ''}
            ${hasDiscount ? `<span class="discount-badge">-${product.discount}%</span>` : ''}
          </div>

          <p class="description">${product.description}</p>

          <ul class="features">
            <li>Kích thước: ${product.size}</li>
            <li>Màu sắc: ${product.color}</li>
            <li>Danh mục: ${product.category_name}</li>
            <li>Còn lại: ${product.stock} sản phẩm</li>
          </ul>

          <button class="btn-primary add-btn" data-id="${product.id}">Thêm vào giỏ hàng</button>
        </div>
      </div>
    `;

  } catch (err) {
    main.innerHTML = `<p class="error">Lỗi khi tải chi tiết sản phẩm: ${err.message}</p>`;
  }
}

async function fetchAndRenderProducts(query) {
  const grid = document.querySelector('.products-grid');
  if (query) grid.innerHTML = `<p>Đang tải sản phẩm cho từ khóa: <strong>${query}</strong>...</p>`;

  try {
    const response = await fetch(`${API_BASE}/products${query ? `?search=${encodeURIComponent(query)}` : ''}`);
    const result = await response.json();

    if (!result.success || !result.data?.products?.length) {
      grid.innerHTML = `<p>Không tìm thấy sản phẩm nào phù hợp với từ khóa "<strong>${query}</strong>".</p>`;
      return;
    }

    grid.innerHTML = result.data.products
      .map(product => {
        const hasDiscount = parseFloat(product.discount) > 0;
        const price = parseFloat(product.price);
        const finalPrice = parseFloat(product.final_price);
        const imageUrl = `${API_BASE}/${product.image}`;
        return `
          <div class="product-card">
            <img src="${imageUrl}" alt="${product.name}" class="product-image" onerror="this.src='/fe/assets/placeholder.png'">
            <div class="product-info">
              <h3>${product.name}</h3>
              <p>${product.description}</p>
              <p class="category">Danh mục: <strong>${product.category_name}</strong></p>
              <div class="price-wrapper">
                <span class="price">${finalPrice.toLocaleString()} VNĐ</span>
                ${hasDiscount ? `<span class="old-price">${price.toLocaleString()} VNĐ</span>
                  <span class="discount-badge">-${(parseFloat(product.discount) || 0).toFixed(0)}%</span>` : ''}
              </div>
              <div class="btn-group">
                <button class="btn-secondary view-btn" data-id="${product.id}">Xem chi tiết</button>
                <button class="btn-primary add-btn" data-id="${product.id}">Thêm vào giỏ</button>
              </div>
            </div>
          </div>
        `;
      })
      .join('');

    attachProductEvents();
  } catch (err) {
    grid.innerHTML = `<p class="error">Lỗi khi tải sản phẩm: ${err.message}</p>`;
  }
}

function attachProductEvents() {
  document.querySelectorAll('.view-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      const id = e.target.dataset.id;
      window.location.href = `/fe/pages/products/detail.html?id=${id}`;
    });
  });

  document.querySelectorAll('.add-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      const card = e.target.closest('.product-card');
      const name = card.querySelector('h3').textContent;
      alert(`Đã thêm "${name}" vào giỏ hàng!`);
    });
  });
}

export function addToCart(product) {
  let cart = JSON.parse(localStorage.getItem('cart')) || [];

  const existing = cart.find(item => item.id === product.id);
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ ...product, quantity: 1 });
  }

  localStorage.setItem('cart', JSON.stringify(cart));
  updateCartCounter();
}

document.addEventListener('click', (e) => {
  if (e.target.classList.contains('add-btn')) {
    const id = e.target.dataset.id;
    const product = products.find(p => p.id == id);
    addToCart(product);
    alert("Đã thêm vào giỏ hàng!");
  }
});

export function updateCartCounter() {
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  const total = cart.reduce((sum, item) => sum + item.quantity, 0);
  const counter = document.getElementById('cart-counter');
  if (counter) counter.textContent = total;
}

document.addEventListener('DOMContentLoaded', updateCartCounter);
