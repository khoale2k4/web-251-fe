

import { ready } from '../../js/main.js';
import { mountHeader } from '../../components/Header.js';
import { mountFooter } from '../../components/Footer.js';
import { addToCart } from '../../js/addToCart.js';
import { updateCartCounter } from '../../js/updateCartCounter.js';
import getUserId from '../../js/getUserId.js';
import { API_BASE } from '../../js/config.js';

const grid = document.querySelector('.products-grid');
const title = document.getElementById('page-title');

const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const categorySelect = document.getElementById('categorySelect');

const state = {
  products: [],
  currentPage: 1,
  totalPages: 1,
  totalItems: 0,
  keyword: '',
  categoryId: ''
};


ready(async () => {
  mountHeader('.mount-header', 'products');
  mountFooter('.mount-footer');

  await fetchCategories();

  const params = new URLSearchParams(window.location.search);
  const keyword = params.get('product_query') || '';
  const categoryId = params.get('category') || '';
  const page = parseInt(params.get('page')) || 1;

  state.keyword = keyword;
  state.categoryId = categoryId;
  state.currentPage = page;

  if (searchInput) searchInput.value = keyword;
  if (categorySelect) categorySelect.value = categoryId;

  await fetchAndRenderProducts(page, keyword, categoryId);

  attachPageEventListeners();
});

async function fetchCategories() {
  if (!categorySelect) return;
  try {
    const res = await fetch(`${API_BASE}/categories`);
    const data = (await res.json()).data;

    console.log(data);

    if (data.categories && Array.isArray(data.categories)) {
      const options = data.categories.map(cat =>
        `<option value="${cat.id}">${cat.name}</option>`
      ).join('');
      categorySelect.innerHTML = `<option value="">Tất cả danh mục</option>${options}`;
    }
  } catch (err) {
    console.error('Error loading categories:', err);
  }
}

async function fetchAndRenderProducts(page = 1, query = '', categoryId = '') {
  if (!grid) return;

  grid.innerHTML = `<p>Đang tải danh sách sản phẩm...</p>`;
  // paginationContainer.style.display = 'none'; // REMOVED

  try {
    let url = `${API_BASE}/products?page=${page}&limit=12`;
    if (query) url += `&search=${encodeURIComponent(query)}`;
    if (categoryId) url += `&category_id=${categoryId}`;

    const response = await fetch(url);
    const result = await response.json();

    if (!result.success || !result.data?.products) {
      grid.innerHTML = `<p>Không tìm thấy sản phẩm nào.</p>`;
      return;
    }

    state.products = result.data.products;
    state.totalPages = result.data.pagination?.total_pages || 1;
    state.totalItems = result.data.pagination?.total || 0;
    state.currentPage = result.data.pagination?.page || 1;

    if (state.products.length === 0) {
      grid.innerHTML = `<p>Không tìm thấy sản phẩm nào phù hợp.</p>`;
    } else {
      grid.innerHTML = state.products.map((product, index) => {
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
    }

    renderPagination();
    attachProductEvents();

  } catch (err) {
    grid.innerHTML = `<p class="error">Lỗi khi tải sản phẩm: ${err.message}</p>`;
  }
}

function renderPagination() {
  const pagination = document.getElementById('pagination');
  if (!pagination) return;

  const { currentPage, totalPages } = state;

  if (totalPages <= 1) {
    pagination.innerHTML = '';
    return;
  }

  let html = `
      <button class="page-btn" ${currentPage === 1 ? 'disabled' : ''} onclick="window.changePage(${currentPage - 1})">
          <i class="fas fa-chevron-left"></i>
      </button>
  `;

  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
      html += `
              <button class="page-btn ${i === currentPage ? 'active' : ''}" onclick="window.changePage(${i})">
                  ${i}
              </button>
          `;
    } else if (i === currentPage - 2 || i === currentPage + 2) {
      html += '<span style="padding: 0 8px; display: flex; align-items: center;">...</span>';
    }
  }

  html += `
      <button class="page-btn" ${currentPage === totalPages ? 'disabled' : ''} onclick="window.changePage(${currentPage + 1})">
          <i class="fas fa-chevron-right"></i>
      </button>
  `;

  pagination.innerHTML = html;
}

// Expose changePage to global scope for inline onclick handlers
window.changePage = function (page) {
  if (page < 1 || page > state.totalPages || page === state.currentPage) return;

  state.currentPage = page;
  updateUrl(page, state.keyword, state.categoryId);
  fetchAndRenderProducts(page, state.keyword, state.categoryId);
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

function attachProductEvents() {
  document.querySelectorAll('.view-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      const id = e.target.dataset.id;
      window.location.href = `/fe/pages/products/detail.html?id=${id}`;
    });
  });

  document.querySelectorAll('.add-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.dataset.id;
      if (id) addToCart(id);
    });
  });
}

function attachPageEventListeners() {
  // Search Button
  searchBtn?.addEventListener('click', () => {
    handleSearch();
  });

  // Enter key in search input
  searchInput?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  });

  // Category Change
  categorySelect?.addEventListener('change', () => {
    handleSearch();
  });
}

function handleSearch() {
  const keyword = searchInput.value.trim();
  const categoryId = categorySelect.value;

  state.keyword = keyword;
  state.categoryId = categoryId;
  state.currentPage = 1;

  updateUrl(1, keyword, categoryId);
  fetchAndRenderProducts(1, keyword, categoryId);
}

function updateUrl(page, keyword, categoryId) {
  const params = new URLSearchParams(window.location.search);
  if (page > 1) params.set('page', page); else params.delete('page');
  if (keyword) params.set('product_query', keyword); else params.delete('product_query');
  if (categoryId) params.set('category', categoryId); else params.delete('category');

  const newUrl = `${window.location.pathname}?${params.toString()}`;
  window.history.pushState({}, '', newUrl);
}


