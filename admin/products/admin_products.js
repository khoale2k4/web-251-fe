import { ready } from '../../js/main.js';
import { API_BASE } from '../../js/config.js';

const BASE_URL = API_BASE;
const filePath = 'storage';

ready(async () => {
  const http = {
    async request(url, options = {}) {
      try {
        const res = await fetch(url, options);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        return typeof json.data !== 'undefined' ? json.data : json;
      } catch (err) {
        console.error(`Lỗi API từ ${url}:`, err);
        return null;
      }
    },
    get(url) { return this.request(url); },
    post(url, body) {
      return this.request(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
    },
    put(url, body) {
      return this.request(url, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
    },
    delete(url) { return this.request(url, { method: "DELETE" }); },
  };

  // State
  const state = {
    products: [],
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    keyword: '',
    deleteProductId: null
  };

  // Elements
  const elements = {
    tableBody: document.getElementById('productsTableBody'),
    pagination: document.getElementById('paginationControls'),
    searchEl: document.querySelector('.product-search'),
    refreshBtn: document.getElementById('btnRefresh'),
    addBtn: document.getElementById('btnAdd'),
    showingRange: document.getElementById('showingRange'),
    totalItems: document.getElementById('totalItems'),
  };

  // Modals
  const productModalEl = document.getElementById('productModal');
  const deleteModalEl = document.getElementById('deleteModal');
  const productModal = new bootstrap.Modal(productModalEl);
  const deleteModal = new bootstrap.Modal(deleteModalEl);

  // Form elements
  const productForm = document.getElementById('productForm');
  const modalTitle = document.getElementById('productModalTitle');
  const categorySelect = document.getElementById('categorySelect');
  const imageFileInput = document.getElementById('imageFileInput');
  const imagePreview = document.getElementById('imagePreview');
  const btnConfirmDelete = document.getElementById('btnConfirmDelete');
  const deleteProductName = document.getElementById('deleteProductName');

  // Render table rows
  function renderRows(products) {
    if (!products.length) {
      elements.tableBody.innerHTML = `<tr><td colspan="9" class="text-center py-4 text-muted">Không có sản phẩm nào.</td></tr>`;
      return;
    }

    elements.tableBody.innerHTML = products.map(p => {
      const finalPrice = p.price * (1 - (p.discount || 0));
      const imgSrc = p.imageLink ? `${BASE_URL}${p.imageLink}` : '../../assets/images/placeholder.png';

      return `
        <tr>
          <td><div class="fw-semibold">${p.name || ''}</div></td>
          <td class="product-img-cell">
            <img src="${imgSrc}" alt="${p.name}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 6px;">
          </td>
          <td>${Number(p.price).toLocaleString('vi-VN')} ₫</td>
          <td>${p.discount ? `<span class="badge bg-red-lt">${(p.discount * 100).toFixed(0)}%</span>` : '—'}</td>
          <td>${p.stock ?? 0}</td>
          <td>${p.size || '—'}</td>
          <td><span class="color-swatch-table" style="background-color: ${p.color || '#ccc'}"></span></td>
          <td><span class="badge bg-blue-lt">${p.category || '—'}</span></td>
          <td class="text-end">
            <button class="btn btn-icon btn-sm btn-outline-primary me-1 btn-edit" data-id="${p.id}" title="Sửa">
              <i class="ti ti-edit"></i>
            </button>
            <button class="btn btn-icon btn-sm btn-outline-danger btn-delete" data-id="${p.id}" title="Xóa">
              <i class="ti ti-trash"></i>
            </button>
          </td>
        </tr>
      `;
    }).join('');
  }
  function renderPagination() {
    const { currentPage, totalPages, totalItems } = state;
    const perPage = 10;
    const start = (currentPage - 1) * perPage + 1;
    const end = Math.min(currentPage * perPage, totalItems);

    elements.showingRange.textContent = totalItems > 0 ? `${start}-${end}` : '0-0';
    elements.totalItems.textContent = totalItems;

    let pagesHtml = '';
    pagesHtml += `<li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
      <a class="page-link" href="#" data-page="${currentPage - 1}"><i class="ti ti-chevron-left"></i></a>
    </li>`;

    for (let i = 1; i <= totalPages; i++) {
      pagesHtml += `<li class="page-item ${i === currentPage ? 'active' : ''}">
        <a class="page-link" href="#" data-page="${i}">${i}</a>
      </li>`;
    }

    pagesHtml += `<li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
      <a class="page-link" href="#" data-page="${currentPage + 1}"><i class="ti ti-chevron-right"></i></a>
    </li>`;

    elements.pagination.innerHTML = pagesHtml;
  }

  async function fetchAndRenderProducts(page = 1, keyword = '') {
    state.currentPage = page;
    state.keyword = keyword;

    try {
      elements.tableBody.innerHTML = `<tr><td colspan="9" class="text-center py-4">
        <div class="spinner-border text-primary" role="status"><span class="visually-hidden">Đang tải...</span></div>
      </td></tr>`;

      const url = `${BASE_URL}/products?page=${page}&limit=10${keyword ? `&search=${encodeURIComponent(keyword)}` : ''}`;
      const res = await http.get(url);

      if (!res || !res.products) {
        elements.tableBody.innerHTML = `<tr><td colspan="9" class="text-center py-4 text-danger">Không thể tải dữ liệu.</td></tr>`;
        return;
      }

      state.products = res.products.map(p => ({
        id: p.id,
        name: p.name,
        price: p.price,
        discount: p.discount,
        imageLink: p.image,
        stock: p.stock,
        size: p.size,
        color: p.color,
        description: p.description,
        category: p.category_name,
        category_id: p.category_id
      }));
      state.totalPages = res.pagination?.total_pages || 1;
      state.totalItems = res.pagination?.total || 0;

      renderRows(state.products);
      renderPagination();
    } catch (err) {
      console.error('Lỗi khi tải sản phẩm:', err);
      elements.tableBody.innerHTML = `<tr><td colspan="9" class="text-center py-4 text-danger">Không thể tải dữ liệu.</td></tr>`;
    }
  }

  // Load categories into select
  async function loadCategories(selectedCategoryName = '') {
    const res = await http.get(`${BASE_URL}/categories`);
    if (res && Array.isArray(res.categories)) {
      categorySelect.innerHTML = '<option value="">-- Chọn danh mục --</option>';
      res.categories.forEach(c => {
        const opt = document.createElement('option');
        opt.value = c.id;
        opt.textContent = c.name;
        if (c.name === selectedCategoryName) opt.selected = true;
        categorySelect.appendChild(opt);
      });
    }
  }

  // Show Add Modal
  function showAddModal() {
    modalTitle.textContent = 'Thêm sản phẩm mới';
    productForm.reset();
    productForm.querySelector('[name="productId"]').value = '';
    productForm.querySelector('[name="imageLink"]').value = '';
    imagePreview.style.display = 'none';
    loadCategories();
    productModal.show();
  }

  // Show Edit Modal
  function showEditModal(product) {
    modalTitle.textContent = `Chỉnh sửa: ${product.name}`;
    productForm.querySelector('[name="productId"]').value = product.id;
    productForm.querySelector('[name="name"]').value = product.name || '';
    productForm.querySelector('[name="description"]').value = product.description || '';
    productForm.querySelector('[name="price"]').value = product.price || 0;
    productForm.querySelector('[name="discount"]').value = product.discount ? product.discount * 100 : '';
    productForm.querySelector('[name="stock"]').value = product.stock || 0;
    productForm.querySelector('[name="size"]').value = product.size || '';
    productForm.querySelector('[name="color"]').value = product.color || '#000000';
    productForm.querySelector('[name="color_text"]').value = product.color || '';
    productForm.querySelector('[name="imageLink"]').value = product.imageLink || '';

    if (product.imageLink) {
      imagePreview.src = `${BASE_URL}${product.imageLink}`;
      imagePreview.style.display = 'block';
    } else {
      imagePreview.style.display = 'none';
    }

    loadCategories(product.category);
    productModal.show();
  }

  // Show Delete Modal
  function showDeleteModal(product) {
    state.deleteProductId = product.id;
    deleteProductName.textContent = `Bạn có chắc muốn xóa sản phẩm "${product.name}"?`;
    deleteModal.show();
  }

  // Handle form submit
  productForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(productForm);
    const productId = formData.get('productId');
    const isEdit = !!productId;

    try {
      let imageUrl = formData.get('imageLink') || '';
      const file = formData.get('imageFile');
      if (file && file.size > 0) {
        const uploadData = new FormData();
        uploadData.append('file', file);
        uploadData.append('folder', filePath);
        uploadData.append('target', '');

        const uploadRes = await http.request(`${BASE_URL}/upload`, { method: 'POST', body: uploadData });
        if (uploadRes && uploadRes.relativePath) {
          imageUrl = uploadRes.relativePath;
        }
      }

      const body = {
        name: formData.get('name'),
        description: formData.get('description'),
        price: parseFloat(formData.get('price')) || 0,
        discount: (parseFloat(formData.get('discount')) || 0) / 100,
        stock: parseInt(formData.get('stock')) || 0,
        size: formData.get('size'),
        color: formData.get('color_text') || formData.get('color'),
        image: imageUrl,
        category_id: formData.get('category')
      };

      if (isEdit) {
        await http.put(`${BASE_URL}/products/${productId}`, body);
      } else {
        await http.post(`${BASE_URL}/products`, body);
      }

      productModal.hide();
      await fetchAndRenderProducts(state.currentPage, state.keyword);
    } catch (err) {
      console.error('Lỗi khi lưu sản phẩm:', err);
      alert('Không thể lưu sản phẩm. Vui lòng thử lại.');
    }
  });

  // Handle delete confirm
  btnConfirmDelete.addEventListener('click', async () => {
    if (!state.deleteProductId) return;
    try {
      await http.delete(`${BASE_URL}/products/${state.deleteProductId}`);
      deleteModal.hide();
      state.deleteProductId = null;
      await fetchAndRenderProducts(state.currentPage, state.keyword);
    } catch (err) {
      console.error('Lỗi khi xóa sản phẩm:', err);
      alert('Không thể xóa sản phẩm. Vui lòng thử lại.');
    }
  });

  // Image preview
  imageFileInput.addEventListener('change', () => {
    const file = imageFileInput.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = e => {
        imagePreview.src = e.target.result;
        imagePreview.style.display = 'block';
      };
      reader.readAsDataURL(file);
    }
  });

  // Color sync
  const colorPicker = productForm.querySelector('[name="color"]');
  const colorText = productForm.querySelector('[name="color_text"]');
  colorPicker.addEventListener('input', () => colorText.value = colorPicker.value);
  colorText.addEventListener('input', () => {
    if (/^#[0-9A-Fa-f]{6}$/.test(colorText.value)) {
      colorPicker.value = colorText.value;
    }
  });

  // Debounce search
  let debounceTimer;
  elements.searchEl?.addEventListener('input', (e) => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      fetchAndRenderProducts(1, e.target.value.trim());
    }, 300);
  });

  // Refresh button
  elements.refreshBtn?.addEventListener('click', () => {
    if (elements.searchEl) elements.searchEl.value = '';
    fetchAndRenderProducts(1, '');
  });

  // Add button
  elements.addBtn?.addEventListener('click', showAddModal);

  // Table click delegation
  document.addEventListener('click', (e) => {
    // Pagination
    const pageLink = e.target.closest('.page-link');
    if (pageLink) {
      e.preventDefault();
      const pageItem = pageLink.closest('.page-item');
      if (!pageItem.classList.contains('disabled') && !pageItem.classList.contains('active')) {
        const newPage = parseInt(pageLink.dataset.page);
        if (newPage) fetchAndRenderProducts(newPage, state.keyword);
      }
      return;
    }

    // Edit button
    const editBtn = e.target.closest('.btn-edit');
    if (editBtn) {
      const id = Number(editBtn.dataset.id);
      const product = state.products.find(p => p.id === id);
      if (product) showEditModal(product);
      return;
    }

    // Delete button
    const deleteBtn = e.target.closest('.btn-delete');
    if (deleteBtn) {
      const id = Number(deleteBtn.dataset.id);
      const product = state.products.find(p => p.id === id);
      if (product) showDeleteModal(product);
      return;
    }
  });

  // Initial load
  await fetchAndRenderProducts(1, '');
});