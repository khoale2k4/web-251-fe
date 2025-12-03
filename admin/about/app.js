// fe/admin/about/index.js
const API_BASE = 'http://localhost:8000'; // chỉnh cho đúng gốc PHP của bạn
const API_LIST   = 'http://localhost/be/api/about_sections_list.php';
const API_CREATE = 'http://localhost/be/api/about_sections_create.php';
const API_UPDATE = 'http://localhost/be/api/about_sections_update.php';
const API_DELETE = 'http://localhost/be/api/about_sections_delete.php';


let sectionsCache = [];
let deleteId = null;

document.addEventListener('DOMContentLoaded', () => {
  loadSections();

  const btnAdd = document.getElementById('btn-add-section');
  btnAdd?.addEventListener('click', () => openFormModal('create'));

  const form = document.getElementById('about-form');
  form?.addEventListener('submit', onSubmitForm);

  const btnConfirmDelete = document.getElementById('btn-confirm-delete');
  btnConfirmDelete?.addEventListener('click', onConfirmDelete);
});

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
    console.log('[Admin About] list json:', json);

    if (json.status !== 'success' || !Array.isArray(json.data)) {
      throw new Error(json.message || 'Dữ liệu trả về không hợp lệ');
    }

    sectionsCache = json.data;
    renderTable();
  } catch (err) {
    console.error(err);
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
  if (!tbody) return;

  if (!sectionsCache.length) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" class="text-center text-muted py-4">
          Chưa có section nào. Hãy nhấn "Thêm section" để tạo mới.
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = '';

  sectionsCache
    .slice()
    .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0) || a.id - b.id)
    .forEach((item, index) => {
      const tr = document.createElement('tr');

      const desc =
        (item.description || item.content || '').replace(/\s+/g, ' ').trim();

      const imgUrl = item.image_url || '';

      tr.innerHTML = `
        <td>${index + 1}</td>
        <td>${escapeHtml(item.title || '')}</td>
        <td>
          <div class="excerpt-preview">${escapeHtml(desc || '—')}</div>
        </td>
        <td>
          ${
            imgUrl
              ? `<img src="${imgUrl}" alt="" class="thumb-img">`
              : '<span class="text-muted">Không có</span>'
          }
        </td>
        <td>${item.sort_order ?? ''}</td>
        <td>
          ${
            item.is_active == 1
              ? '<span class="badge bg-green-lt">Hiển thị</span>'
              : '<span class="badge bg-secondary-lt">Ẩn</span>'
          }
        </td>
        <td class="text-nowrap">
          <button class="btn btn-icon btn-sm btn-outline-primary me-1" data-action="edit" data-id="${
            item.id
          }" title="Sửa">
            <i class="ti ti-edit"></i>
          </button>
          <button class="btn btn-icon btn-sm btn-outline-danger" data-action="delete" data-id="${
            item.id
          }" title="Xoá">
            <i class="ti ti-trash"></i>
          </button>
        </td>
      `;

      tbody.appendChild(tr);
    });

  // Gắn sự kiện cho nút sửa / xoá
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

function openFormModal(mode, id = null) {
  const modalEl = document.getElementById('modal-about-form');
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

    titleEl.textContent = 'Chỉnh sửa section';
    idInput.value = item.id;
    titleInput.value = item.title || '';
    descInput.value = item.description || item.content || '';
    imgInput.value = item.image_url || '';
    sortInput.value = item.sort_order ?? 0;
    activeInput.checked = item.is_active == 1;
  } else {
    titleEl.textContent = 'Thêm section';
    idInput.value = '';
    titleInput.value = '';
    descInput.value = '';
    imgInput.value = '';
    sortInput.value = sectionsCache.length + 1;
    activeInput.checked = true;
  }

  modal.show();
}

async function onSubmitForm(e) {
  e.preventDefault();

  const id = Number(document.getElementById('about-id').value || 0);
  const title = document.getElementById('about-title-input').value.trim();
  const description = document
    .getElementById('about-description-input')
    .value.trim();
  const image_url = document.getElementById('about-image-input').value.trim();
  const sort_order = Number(
    document.getElementById('about-sort-input').value || 0
  );
  const is_active = document.getElementById('about-active-input').checked
    ? 1
    : 0;

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

    const json = await res.json();
    if (json.status !== 'success') {
      throw new Error(json.message || 'Thao tác thất bại');
    }

    // Đóng modal
    const modalEl = document.getElementById('modal-about-form');
    const modal = bootstrap.Modal.getInstance(modalEl);
    modal?.hide();

    // Reload list cho chắc
    await loadSections();
  } catch (err) {
    console.error(err);
    alert(err.message || 'Có lỗi xảy ra, vui lòng thử lại');
  }
}

function openDeleteModal(id) {
  deleteId = id;
  const modalEl = document.getElementById('modal-about-delete');
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

    const json = await res.json();
    if (json.status !== 'success') {
      throw new Error(json.message || 'Xoá thất bại');
    }

    // đóng modal
    const modalEl = document.getElementById('modal-about-delete');
    const modal = bootstrap.Modal.getInstance(modalEl);
    modal?.hide();

    deleteId = null;
    await loadSections();
  } catch (err) {
    console.error(err);
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
