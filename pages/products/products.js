

import { ready } from '../../js/main.js';
import { mountHeader } from '../../components/Header.js';
import { mountFooter } from '../../components/Footer.js';
import { addToCart } from '../../js/addToCart.js';
import { updateCartCounter } from '../../js/updateCartCounter.js';
import getUserId from '../../js/getUserId.js';
import { API_BASE } from '../../js/config.js';

const grid = document.querySelector('.products-grid');
const title = document.getElementById('page-title');
const paginationContainer = document.getElementById('pagination-container');
const paginationSummary = document.getElementById('pagination-summary');
const paginationControls = document.getElementById('pagination-controls');

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
  paginationContainer.style.display = 'none';

  try {
    let url = `${API_BASE}/products?page=${page}`;
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
      grid.innerHTML = state.products.map(product => {
        const hasDiscount = parseFloat(product.discount) > 0;
        const price = parseFloat(product.price);
        const finalPrice = parseFloat(product.final_price);
        const imageUrl = `${API_BASE}${product.image}`;
        return `
            <div class="product-card">
              <a href="/fe/pages/products/detail.html?id=${product.id}" class="product-image-link">
                <img src="${imageUrl}" alt="${product.name}" class="product-image" onerror="this.src='/fe/assets/placeholder.png'">
              </a>
              <div class="product-info">
                <div class="info-top">
                  <h3><a href="/fe/pages/products/detail.html?id=${product.id}" class="product-name-link">${product.name}</a></h3>
                  <p>${product.description || ''}</p>
                  <p class="category">Danh mục: <strong>${product.category_name}</strong></p>
                </div>
                <div class="info-bottom">
                  <div class="price-wrapper">
                    <span class="price">${finalPrice.toLocaleString()} VNĐ</span>
                    ${hasDiscount ? `<span class="old-price">${price.toLocaleString()} VNĐ</span><span class="discount-badge">-${(parseFloat(product.discount) || 0).toFixed(0)}%</span>` : ''}
                  </div>
                  <div class="btn-group">
                    <button class="btn-secondary view-btn" data-id="${product.id}">Xem</button>
                    <button class="btn-primary add-btn" data-id="${product.id}">Thêm vào giỏ</button>
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
  const { currentPage, totalPages, totalItems } = state;

  if (totalPages <= 1) {
    paginationContainer.style.display = 'none';
    return;
  }
  paginationContainer.style.display = 'flex';
  paginationSummary.textContent = `Hiển thị trang ${currentPage} / ${totalPages} (Tổng cộng ${totalItems} sản phẩm)`;

  let html = '';

  html += `<li class="page-item ${currentPage === 1 ? 'disabled' : ''}"><a class="page-link" href="#" data-page="${currentPage - 1}"><i class="ti ti-chevron-left"></i></a></li>`;

  const maxPagesToShow = 5;
  let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
  let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);
  if (endPage - startPage + 1 < maxPagesToShow) {
    startPage = Math.max(1, endPage - maxPagesToShow + 1);
  }
  if (startPage > 1) {
    html += `<li class="page-item"><a class="page-link" href="#" data-page="1">1</a></li>`;
    if (startPage > 2) html += `<li class="page-item disabled"><span class="page-link">...</span></li>`;
  }
  for (let i = startPage; i <= endPage; i++) {
    html += `<li class="page-item ${i === currentPage ? 'active' : ''}"><a class="page-link" href="#" data-page="${i}">${i}</a></li>`;
  }
  if (endPage < totalPages) {
    if (endPage < totalPages - 1) html += `<li class="page-item disabled"><span class="page-link">...</span></li>`;
    html += `<li class="page-item"><a class="page-link" href="#" data-page="${totalPages}">${totalPages}</a></li>`;
  }

  html += `<li class="page-item ${currentPage === totalPages ? 'disabled' : ''}"><a class="page-link" href="#" data-page="${currentPage + 1}"><i class="ti ti-chevron-right"></i></a></li>`;

  paginationControls.innerHTML = html;
}

function attachProductEvents() {
  const userId = getUserId();

  document.querySelectorAll('.view-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      const id = e.target.dataset.id;
      window.location.href = `/fe/pages/products/detail.html?id=${id}`;
    });
  });

  document.querySelectorAll('.add-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.dataset.id;
      await updateCartCounter(userId);
      if (id) addToCart(id, userId);
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

  // Pagination
  document.getElementById('pagination-controls')?.addEventListener('click', (e) => {
    e.preventDefault();
    const pageLink = e.target.closest('.page-link');
    if (pageLink) {
      const pageItem = pageLink.closest('.page-item');
      if (pageItem.classList.contains('disabled') || pageItem.classList.contains('active')) {
        return;
      }

      const newPage = parseInt(pageLink.dataset.page);
      if (newPage) {
        updateUrl(newPage, state.keyword, state.categoryId);
        fetchAndRenderProducts(newPage, state.keyword, state.categoryId);
      }
    }
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


