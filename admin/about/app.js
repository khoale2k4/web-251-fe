import { API_BASE } from '../../js/config.js';

// API cho page_contents (Node /port 8000)
const PAGE_CONTENT_API = `${API_BASE}/page-contents`;
const UPLOAD_API = `${API_BASE}/upload`;
const STORAGE_FOLDER = 'storage';
const AVATAR_PATH = '/' + STORAGE_FOLDER;

// API PHP cho about_sections
// const PHP_API_BASE = 'http://localhost'; // chỉnh lại nếu dự án nằm trong thư mục con
// const API_LIST   = `${PHP_API_BASE}/be/api/about_sections_list.php`;
// const API_CREATE = `${PHP_API_BASE}/be/api/about_sections_create.php`;
// const API_UPDATE = `${PHP_API_BASE}/be/api/about_sections_update.php`;
// const API_DELETE = `${PHP_API_BASE}/be/api/about_sections_delete.php`;

// API PHP cho about_sections (qua index.php + routes MVC)
const PHP_API_BASE = API_BASE + "/"; // nếu project nằm trong thư mục con thì chỉnh lại

// List cho admin
const API_LIST   = `${PHP_API_BASE}?route=admin/about-sections/list`;
// Tạo mới
const API_CREATE = `${PHP_API_BASE}?route=admin/about-sections/create`;
// Cập nhật
const API_UPDATE = `${PHP_API_BASE}?route=admin/about-sections/update`;
// Xoá
const API_DELETE = `${PHP_API_BASE}?route=admin/about-sections/delete`;



let currentContents = null;      // dữ liệu page_contents hiện tại
let aboutImageUrls = [];         // mảng URL ảnh cho about_image
let sectionsCache = [];          // cache danh sách about_sections
let deleteId = null;             // id đang chờ xoá
// Phân trang cho bảng about_sections
let currentPage = 1;
const pageSize = 5; // hoặc 10 cho giống FAQ

document.addEventListener('DOMContentLoaded', () => {
  // Page contents (about_title, about_content, about_image)
  loadPageContents();

  const pageForm = document.getElementById('pageContentForm');
  if (pageForm) {
    pageForm.addEventListener('submit', savePageContents);
  }

  const uploadInput = document.getElementById('aboutImageUpload');
  if (uploadInput) {
    uploadInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files.length > 0) {
        handleImageUpload(e.target.files);
        // reset value để có thể chọn lại cùng file sau này
        e.target.value = '';
      }
    });
  }

  // About sections (PHP)
  loadSections();

  const btnAdd = document.getElementById('btn-add-section');
  if (btnAdd) {
    btnAdd.addEventListener('click', () => openFormModal('create'));
  }

  const aboutForm = document.getElementById('about-form');
  if (aboutForm) {
    aboutForm.addEventListener('submit', onSubmitForm);
  }

  const btnConfirmDelete = document.getElementById('btn-confirm-delete');
  if (btnConfirmDelete) {
    btnConfirmDelete.addEventListener('click', onConfirmDelete);
  }
});

async function loadPageContents() {
  try {
    const res = await fetch(PAGE_CONTENT_API);
    if (!res.ok) {
      throw new Error('HTTP ' + res.status);
    }

    const result = await res.json();
    console.log('[Admin About] page-contents:', result);

    if (!result.success || !result.data) {
      throw new Error(result.error || result.message || 'Không lấy được dữ liệu page_contents');
    }

    const data = result.data;
    currentContents = data;

    const titleInput = document.getElementById('aboutTitle');
    const contentInput = document.getElementById('aboutContent');
    const hiddenImage = document.getElementById('aboutImage');

    if (titleInput) {
      titleInput.value = data.about_title || '';
    }
    if (contentInput) {
      contentInput.value = data.about_content || '';
    }
    if (hiddenImage) {
      hiddenImage.value = data.about_image || '[]';
    }

    aboutImageUrls = [];
    if (data.about_image) {
      try {
        const decoded = data.about_image.replace(/&quot;/g, '"');
        const parsed = JSON.parse(decoded);
        if (Array.isArray(parsed)) {
          aboutImageUrls = parsed;
        } else {
          aboutImageUrls = [];
        }
      } catch (e) {
        console.warn('[Admin About] Không parse được about_image, có thể dữ liệu cũ:', e);
        if (typeof data.about_image === 'string' && !data.about_image.startsWith('[')) {
          aboutImageUrls = [data.about_image];
        }
      }
    }

    renderImagePreviews();
    updateHiddenImageInput();

    if (data.updated_at) {
      const lastUpdateEl = document.getElementById('lastUpdate');
      if (lastUpdateEl) {
        lastUpdateEl.textContent = new Date(data.updated_at).toLocaleString('vi-VN');
      }
    }
  } catch (err) {
    console.error('[Admin About] loadPageContents error:', err);
    alert('Không tải được nội dung trang. Vui lòng thử lại.');
  }
}

async function handleImageUpload(files) {
  const previewContainer = document.getElementById('aboutImagePreview');
  if (!previewContainer) return;

  previewContainer.insertAdjacentHTML(
    'beforeend',
    '<div id="upload-loading" class="spinner-border spinner-border-sm" role="status"></div>'
  );

  for (const file of files) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', STORAGE_FOLDER);
    formData.append('target', '');

    try {
      const response = await fetch(UPLOAD_API, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('HTTP ' + response.status);
      }

      const result = await response.json();
      console.log('[Admin About] upload result:', result);

      if (result && result.relativePath) {
        aboutImageUrls.push(result.relativePath);
      } else {
        console.warn('Upload thành công nhưng không nhận được relativePath:', result);
      }
    } catch (err) {
      console.error('[Admin About] upload error:', err);
      alert('Tải ảnh thất bại: ' + (err.message || 'Lỗi không xác định'));
    }
  }

  const loading = document.getElementById('upload-loading');
  if (loading) loading.remove();

  renderImagePreviews();
  updateHiddenImageInput();
}

function renderImagePreviews() {
  const previewContainer = document.getElementById('aboutImagePreview');
  if (!previewContainer) return;

  previewContainer.innerHTML = '';

  aboutImageUrls.forEach((url, index) => {
    const wrapper = document.createElement('div');
    wrapper.className = 'avatar avatar-xl m-1';
    wrapper.style.position = 'relative';

    const img = document.createElement('img');
    img.className = 'avatar-img rounded';
    img.src = url.startsWith('http') ? url : `${API_BASE}${url}`;

    const removeBtn = document.createElement('a');
    removeBtn.href = '#';
    removeBtn.className = 'avatar-badge bg-danger text-white';
    removeBtn.innerHTML = '&times;';
    removeBtn.style.cursor = 'pointer';
    removeBtn.style.textDecoration = 'none';
    removeBtn.onclick = (e) => {
      e.preventDefault();
      removeImage(index);
    };

    wrapper.appendChild(img);
    wrapper.appendChild(removeBtn);
    previewContainer.appendChild(wrapper);
  });
}

function removeImage(index) {
  if (!confirm('Bạn có chắc muốn xoá ảnh này?')) return;
  aboutImageUrls.splice(index, 1);
  renderImagePreviews();
  updateHiddenImageInput();
}

function updateHiddenImageInput() {
  const hiddenInput = document.getElementById('aboutImage');
  if (!hiddenInput) return;
  hiddenInput.value = JSON.stringify(aboutImageUrls);
}

async function savePageContents(e) {
  e.preventDefault();

  const btnSave = document.getElementById('btnSave');
  const originalHtml = btnSave ? btnSave.innerHTML : '';
  if (btnSave) {
    btnSave.disabled = true;
    btnSave.innerHTML =
      '<span class="spinner-border spinner-border-sm me-2"></span>Đang lưu...';
  }

  try {
    const title = document.getElementById('aboutTitle')?.value.trim() || '';
    const content = document.getElementById('aboutContent')?.value.trim() || '';
    const aboutImage = document.getElementById('aboutImage')?.value.trim() || '[]';

    const payload = {
      ...(currentContents || {}),
      about_title: title,
      about_content: content,
      about_image: aboutImage,
    };

    const res = await fetch(PAGE_CONTENT_API, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      throw new Error('HTTP ' + res.status);
    }

    const result = await res.json();
    console.log('[Admin About] save page-contents result:', result);

    if (!result.success) {
      throw new Error(result.error || result.message || 'Lưu thất bại');
    }

    alert('Đã lưu nội dung trang About.');
    await loadPageContents();
  } catch (err) {
    console.error('[Admin About] savePageContents error:', err);
    alert(err.message || 'Có lỗi xảy ra khi lưu nội dung.');
  } finally {
    if (btnSave) {
      btnSave.disabled = false;
      btnSave.innerHTML = originalHtml;
    }
  }
}

/* =========================
 * 2. Quản lý about_sections (PHP)
 * ========================= */

async function loadSections() {
  const tbody = document.getElementById('about-table-body');
  if (!tbody) return;

  tbody.innerHTML = `
    <tr>
      <td colspan="7" class="text-center text-muted py-4">
        Đang tải dữ liệu...
      </td>
    </tr>
  `;

  try {
    const res = await fetch(API_LIST);
    if (!res.ok) throw new Error('HTTP ' + res.status);

    const json = await res.json();
    console.log('[Admin About] about_sections list:', json);

    if (json.status !== 'success' || !Array.isArray(json.data)) {
      throw new Error(json.message || 'Dữ liệu trả về không hợp lệ');
    }

    sectionsCache = json.data;
    renderTable();
  } catch (err) {
    console.error('[Admin About] loadSections error:', err);
    tbody.innerHTML = `
      <tr>
        <td colspan="7" class="text-center text-danger py-4">
          Không tải được dữ liệu. Vui lòng thử lại sau.
        </td>
      </tr>
    `;
  }
}

function renderTable() {
  const tbody = document.getElementById('about-table-body');
  const summaryEl = document.getElementById('aboutSummary');
  const paginationEl = document.getElementById('aboutPagination');

  if (!tbody) return;

  const total = Array.isArray(sectionsCache) ? sectionsCache.length : 0;

  // Không có dữ liệu
  if (!sectionsCache || total === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" class="text-center text-muted py-4">
          Chưa có section nào. Hãy nhấn "Thêm section" để tạo mới.
        </td>
      </tr>
    `;
    if (summaryEl) summaryEl.textContent = 'Chưa có section nào';
    if (paginationEl) paginationEl.innerHTML = '';
    return;
  }

  // Sắp xếp theo sort_order / display_order rồi tới id
  const sorted = sectionsCache
    .slice()
    .sort(
      (a, b) =>
        (a.sort_order || a.display_order || 0) -
          (b.sort_order || b.display_order || 0) || a.id - b.id
    );

  const totalPages = Math.ceil(total / pageSize);
  if (currentPage > totalPages) currentPage = totalPages;
  if (currentPage < 1) currentPage = 1;

  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, total);

  const pageSections = sorted.slice(startIndex, endIndex);

  let html = '';

  pageSections.forEach((item, idx) => {
    const rowIndex = startIndex + idx + 1; // STT toàn cục

    const desc = (item.description || item.content || '')
      .replace(/\s+/g, ' ')
      .trim();

    const imgUrl = item.image_url || '';

    html += `
      <tr>
        <td>${rowIndex}</td>
        <td>${escapeHtml(item.title || '')}</td>
        <td>
          <div class="excerpt-preview">${escapeHtml(desc || '—')}</div>
        </td>
        <td>
          ${
            API_BASE + imgUrl
              ? `<img src="${API_BASE + imgUrl}" alt="" class="thumb-img">`
              : '<span class="text-muted">Không có</span>'
          }
        </td>
        <td>${item.sort_order ?? item.display_order ?? ''}</td>
        <td>
          ${
            item.is_active == 1
              ? '<span class="badge bg-green-lt">Hiển thị</span>'
              : '<span class="badge bg-secondary-lt">Ẩn</span>'
          }
        </td>
        <td class="text-nowrap">
          <button class="btn btn-icon btn-sm btn-outline-primary me-1"
                  data-action="edit" data-id="${item.id}" title="Sửa">
            <i class="ti ti-edit"></i>
          </button>
          <button class="btn btn-icon btn-sm btn-outline-danger"
                  data-action="delete" data-id="${item.id}" title="Xoá">
            <i class="ti ti-trash"></i>
          </button>
        </td>
      </tr>
    `;
  });

  tbody.innerHTML = html;

  // Text "Hiển thị X–Y trong tổng số Z section"
  if (summaryEl) {
    summaryEl.textContent = `Hiển thị ${startIndex + 1}-${endIndex} trong tổng số ${total} section`;
  }

  // Vẽ lại phân trang
  renderAboutPagination(totalPages);

  // Gắn sự kiện cho nút sửa/xoá sau khi render
  tbody.querySelectorAll('button[data-action="edit"]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = Number(btn.getAttribute('data-id'));
      openFormModal('edit', id);
    });
  });

  tbody.querySelectorAll('button[data-action="delete"]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = Number(btn.getAttribute('data-id'));
      openDeleteModal(id);
    });
  });
}

function renderAboutPagination(totalPages) {
  const paginationEl = document.getElementById('aboutPagination');
  if (!paginationEl) return;

  if (totalPages <= 1) {
    paginationEl.innerHTML = '';
    return;
  }

  let html = '';

  // Nút Trước
  html += `
    <li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
      <a class="page-link" href="#"
         onclick="window.changeAboutPage(${currentPage - 1}); return false;">
        <i class="ti ti-chevron-left"></i> Trước
      </a>
    </li>
  `;

  // Các nút số trang (giống FAQ/news: hiện 2 bên + ... )
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= currentPage - 2 && i <= currentPage + 2)) {
      html += `
        <li class="page-item ${i === currentPage ? 'active' : ''}">
          <a class="page-link" href="#"
             onclick="window.changeAboutPage(${i}); return false;">${i}</a>
        </li>
      `;
    } else if (i === currentPage - 3 || i === currentPage + 3) {
      html += `<li class="page-item disabled"><span class="page-link">...</span></li>`;
    }
  }

  // Nút Sau
  html += `
    <li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
      <a class="page-link" href="#"
         onclick="window.changeAboutPage(${currentPage + 1}); return false;">
        Sau <i class="ti ti-chevron-right"></i>
      </a>
    </li>
  `;

  paginationEl.innerHTML = html;
}

// Hàm đổi trang, phải gắn vào window để onclick trong HTML gọi được
window.changeAboutPage = function (page) {
  const total = Array.isArray(sectionsCache) ? sectionsCache.length : 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  if (page < 1 || page > totalPages) return;

  currentPage = page;
  renderTable();
};



function openFormModal(mode, id = null) {
  const modalEl = document.getElementById('modal-about-form');
  if (!modalEl) return;
  const modal = bootstrap.Modal.getOrCreateInstance(modalEl);

  const titleEl = document.getElementById('about-form-title');
  const idInput = document.getElementById('about-id');
  const titleInput = document.getElementById('about-title-input');
  const descInput = document.getElementById('about-description-input');
  const imgInput = document.getElementById('about-image-input');
  const sortInput = document.getElementById('about-sort-input');
  const activeInput = document.getElementById('about-active-input');

  if (mode === 'edit' && id != null) {
    const item = sectionsCache.find((s) => Number(s.id) === Number(id));
    if (!item) return;

    if (titleEl) titleEl.textContent = 'Chỉnh sửa section';
    if (idInput) idInput.value = item.id;
    if (titleInput) titleInput.value = item.title || '';
    if (descInput) descInput.value = item.description || item.content || '';
    if (imgInput) imgInput.value = item.image_url || '';
    if (sortInput) sortInput.value = item.sort_order ?? item.display_order ?? 0;
    if (activeInput) activeInput.checked = item.is_active == 1;
  } else {
    if (titleEl) titleEl.textContent = 'Thêm section';
    if (idInput) idInput.value = '';
    if (titleInput) titleInput.value = '';
    if (descInput) descInput.value = '';
    if (imgInput) imgInput.value = '';
    if (sortInput) sortInput.value = sectionsCache.length + 1;
    if (activeInput) activeInput.checked = true;
  }

  modal.show();
}

async function onSubmitForm(e) {
  e.preventDefault();

  const id = Number(document.getElementById('about-id').value || 0);
  const title = document.getElementById('about-title-input').value.trim();
  const description = document.getElementById('about-description-input').value.trim();
  const image_url = document.getElementById('about-image-input').value.trim();
  const sort_order = Number(document.getElementById('about-sort-input').value || 0);
  const is_active = document.getElementById('about-active-input').checked ? 1 : 0;

  if (!title) {
    alert('Tiêu đề không được để trống');
    return;
  }

  const payload = {
    title,
    description,
    image_url,
    sort_order,
    is_active,
  };

  const isEdit = id > 0;
  if (isEdit) payload.id = id;

  try {
    const res = await fetch(isEdit ? API_UPDATE : API_CREATE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const text = await res.text();
    console.log('[Admin About] raw response (create/update):', text);

    let json;
    try {
      json = JSON.parse(text);
    } catch (e) {
      throw new Error('Server không trả về JSON hợp lệ');
    }

    if (json.status !== 'success') {
      throw new Error(json.message || 'Thao tác thất bại');
    }

    const modalEl = document.getElementById('modal-about-form');
    const modal = bootstrap.Modal.getInstance(modalEl);
    modal?.hide();

    await loadSections();
  } catch (err) {
    console.error('[Admin About] onSubmitForm error:', err);
    alert(err.message || 'Có lỗi xảy ra, vui lòng thử lại');
  }
}

function openDeleteModal(id) {
  deleteId = id;
  const modalEl = document.getElementById('modal-about-delete');
  if (!modalEl) return;
  const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
  modal.show();
}

async function onConfirmDelete() {
  if (!deleteId) return;

  try {
    const res = await fetch(API_DELETE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: deleteId }),
    });

    const text = await res.text();
    console.log('[Admin About] raw response (delete):', text);

    let json;
    try {
      json = JSON.parse(text);
    } catch (e) {
      throw new Error('Server không trả về JSON hợp lệ');
    }

    if (json.status !== 'success') {
      throw new Error(json.message || 'Xoá thất bại');
    }

    const modalEl = document.getElementById('modal-about-delete');
    const modal = bootstrap.Modal.getInstance(modalEl);
    modal?.hide();

    deleteId = null;
    await loadSections();
  } catch (err) {
    console.error('[Admin About] onConfirmDelete error:', err);
    alert(err.message || 'Có lỗi xảy ra khi xoá');
  }
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
