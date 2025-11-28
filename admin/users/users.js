import { ready } from '../../js/main.js';
import { API_BASE } from '../../js/config.js';
import { showToast } from '../utils/toast.js';

const state = {
  list: [],
  stats: {
    total: 0,
    active: 0,
    banned: 0,
  },
  pagination: {
    page: 1,
    totalPages: 1,
    limit: 10,
    total: 0,
  },
  filters: {
    search: '',
    status: 'all',
  },
  selectedUserId: null,
};

const elements = {};

const STATUS_LABELS = {
  active: { text: 'Đang hoạt động', className: 'badge bg-success' },
  banned: { text: 'Đang khóa', className: 'badge bg-danger' },
};

const ROLE_LABELS = {
  admin: { text: 'Quản trị', className: 'badge bg-primary' },
  member: { text: 'Thành viên', className: 'badge bg-gray' },
};

function qs(selector) {
  return document.querySelector(selector);
}

function formatDate(value) {
  if (!value) return '--';
  try {
    const date = new Date(value);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  } catch (err) {
    return value;
  }
}

function escapeHtml(text) {
  if (typeof text !== 'string') return text;
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function getInitial(name) {
  if (!name) return '?';
  return name.trim().charAt(0).toUpperCase();
}

function updateStats() {
  if (!elements.statTotal) return;
  elements.statTotal.textContent = state.stats.total ?? '--';
  elements.statActive.textContent = state.stats.active ?? '--';
  elements.statBanned.textContent = state.stats.banned ?? '--';
}

function renderUsers() {
  if (!elements.tableBody) return;
  if (!Array.isArray(state.list) || state.list.length === 0) {
    elements.tableBody.innerHTML = `
      <tr>
        <td colspan="6" class="text-center text-muted py-4">
          Không tìm thấy người dùng nào phù hợp.
        </td>
      </tr>
    `;
    return;
  }

  elements.tableBody.innerHTML = state.list
    .map((user) => {
      const statusInfo = STATUS_LABELS[user.status] || STATUS_LABELS.active;
      const roleInfo = ROLE_LABELS[user.role] || ROLE_LABELS.member;
      const avatar = user.avatar
        ? `${API_BASE}${user.avatar}`
        : null;

      return `
        <tr data-user-id="${user.id}">
          <td>
            <div class="d-flex align-items-center">
              ${avatar
          ? `<img src="${avatar}" class="table-avatar me-2" alt="${escapeHtml(user.name)}">`
          : `<span class="table-avatar me-2">${getInitial(user.name)}</span>`
        }
              <div>
                <div class="fw-bold">${escapeHtml(user.name || 'Chưa cập nhật')}</div>
                <div class="text-muted">${escapeHtml(user.email)}</div>
              </div>
            </div>
          </td>
          <td>
            <span class="${roleInfo.className} badge-soft">${roleInfo.text}</span>
          </td>
          <td>
            <div class="text-muted">${user.phone || '--'}</div>
          </td>
          <td>
            <div class="d-flex align-items-center gap-2">
            <select class="form-select form-select-sm user-status-select" data-user-id="${user.id}">
            <option value="active" ${user.status === 'active' ? 'selected' : ''}>Hoạt động</option>
            <option value="banned" ${user.status === 'banned' ? 'selected' : ''}>Khóa</option>
            </select>
            </div>
          </td>
          <td>${formatDate(user.created_at)}</td>
          <td class="text-end">
            <button class="btn btn-outline-primary btn-sm btn-view-user" data-user-id="${user.id}">
              Xem chi tiết
            </button>
          </td>
        </tr>
      `;
    })
    .join('');
  // <span class="${statusInfo.className} badge-soft">${statusInfo.text}</span>
}

function renderPagination() {
  if (!elements.paginationControls) return;
  const { page, totalPages, total, limit } = state.pagination;

  if (totalPages <= 1) {
    elements.paginationControls.innerHTML = '';
    return;
  }

  const firstItem = (page - 1) * limit + 1;
  const lastItem = Math.min(page * limit, total);

  if (document.getElementById('showingRange')) {
    document.getElementById('showingRange').textContent = `${firstItem}-${lastItem}`;
  }
  if (document.getElementById('totalItems')) {
    document.getElementById('totalItems').textContent = total;
  }

  let html = '';

  // Previous button
  html += `
    <li class="page-item ${page === 1 ? 'disabled' : ''}">
      <a class="page-link" href="#" data-page="${page - 1}">
        <i class="ti ti-chevron-left"></i> Trước
      </a>
    </li>
  `;

  const maxPagesToShow = 5;
  let startPage = Math.max(1, page - Math.floor(maxPagesToShow / 2));
  let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);
  if (endPage - startPage + 1 < maxPagesToShow) {
    startPage = Math.max(1, endPage - maxPagesToShow + 1);
  }

  if (startPage > 1) {
    html += `<li class="page-item"><a class="page-link" href="#" data-page="1">1</a></li>`;
    if (startPage > 2) {
      html += `<li class="page-item disabled"><span class="page-link">...</span></li>`;
    }
  }

  for (let i = startPage; i <= endPage; i += 1) {
    html += `<li class="page-item ${i === page ? 'active' : ''}"><a class="page-link" href="#" data-page="${i}">${i}</a></li>`;
  }

  if (endPage < totalPages) {
    if (endPage < totalPages - 1) {
      html += `<li class="page-item disabled"><span class="page-link">...</span></li>`;
    }
    html += `<li class="page-item"><a class="page-link" href="#" data-page="${totalPages}">${totalPages}</a></li>`;
  }

  // Next button
  html += `
    <li class="page-item ${page === totalPages ? 'disabled' : ''}">
      <a class="page-link" href="#" data-page="${page + 1}">
        Sau <i class="ti ti-chevron-right"></i>
      </a>
    </li>
  `;

  elements.paginationControls.innerHTML = html;
}

function renderUserDetail(user) {
  if (!elements.detailPanel) return;
  if (!user) {
    elements.detailPanel.innerHTML = `
      <div class="empty-detail-state">
        <i class="ti ti-user fs-1 mb-2"></i>
        <p>Chọn một người dùng để xem chi tiết tại đây.</p>
      </div>
    `;
    elements.detailFooter.style.display = 'none';
    return;
  }

  const avatar = user.avatar ? `${API_BASE}${user.avatar}` : null;
  const statusInfo = STATUS_LABELS[user.status] || STATUS_LABELS.active;
  const roleInfo = ROLE_LABELS[user.role] || ROLE_LABELS.member;

  elements.detailPanel.innerHTML = `
    <div class="text-center mb-3">
      ${avatar
      ? `<img src="${avatar}" class="avatar-xl mb-2" alt="${escapeHtml(user.name)}" />`
      : `<div class="avatar-xl mb-2 d-inline-flex align-items-center justify-content-center text-bg-primary" style="border-radius:50%;">${getInitial(user.name)}</div>`
    }
      <h3 class="mb-0">${escapeHtml(user.name || 'Chưa cập nhật')}</h3>
      <div class="text-muted">${escapeHtml(user.email)}</div>
    </div>
    <div class="mb-3">
      <div class="text-muted small">Trạng thái</div>
      <div class="fw-semibold">${statusInfo.text}</div>
    </div>
    <div class="mb-3">
      <div class="text-muted small">Vai trò</div>
      <div class="fw-semibold">${roleInfo.text}</div>
    </div>
    <div class="mb-3">
      <div class="text-muted small">Số điện thoại</div>
      <div class="fw-semibold">${user.phone || 'Chưa cập nhật'}</div>
    </div>
    <div class="mb-3">
      <div class="text-muted small">Ngày tạo</div>
      <div class="fw-semibold">${formatDate(user.created_at)}</div>
    </div>
    <div>
      <div class="text-muted small">Cập nhật gần nhất</div>
      <div class="fw-semibold">${formatDate(user.updated_at)}</div>
    </div>
  `;

  elements.detailFooter.style.display = 'block';
  elements.viewProfileBtn.href = `/fe/pages/profile/profile.html?id=${user.id}`;
}

async function fetchUsers(page = 1) {
  try {
    elements.tableBody.innerHTML = `
      <tr>
        <td colspan="6" class="text-center text-muted py-4">Đang tải dữ liệu...</td>
      </tr>
    `;

    const params = new URLSearchParams({
      page,
      limit: state.pagination.limit,
    });

    if (state.filters.search) {
      params.set('search', state.filters.search);
    }
    if (state.filters.status && state.filters.status !== 'all') {
      params.set('status', state.filters.status);
    }

    const response = await fetch(`${API_BASE}/users?${params.toString()}`);
    const payload = await response.json();

    if (!response.ok || !payload.success) {
      throw new Error(payload.error || payload.message || 'Không thể tải danh sách người dùng');
    }

    const users = Array.isArray(payload.data) ? payload.data : [];
    state.list = users;
    state.pagination.page = payload.pagination?.page || page;
    state.pagination.total = payload.pagination?.total || users.length;
    state.pagination.totalPages = payload.pagination?.total_pages || 1;

    const stats = payload.stats || {};
    state.stats.total = payload.pagination?.total || users.length;
    state.stats.active = typeof stats.active === 'number' ? stats.active : users.filter((item) => item.status === 'active').length;
    state.stats.banned = typeof stats.banned === 'number' ? stats.banned : users.filter((item) => item.status === 'banned').length;

    renderUsers();
    renderPagination();
    updateStats();

    // Update selected user detail if still available
    if (state.selectedUserId) {
      const found = state.list.find((user) => user.id === state.selectedUserId);
      renderUserDetail(found || null);
    }
  } catch (err) {
    console.error('[Users] fetch error:', err);
    showToast({ message: err.message || 'Không thể tải dữ liệu', type: 'error' });
    elements.tableBody.innerHTML = `
      <tr>
        <td colspan="6" class="text-center text-danger py-4">Không thể tải dữ liệu người dùng.</td>
      </tr>
    `;
  }
}

async function handleStatusChange(userId, newStatus, selectEl) {
  if (!['active', 'banned'].includes(newStatus)) {
    showToast({ message: 'Trạng thái không hợp lệ', type: 'warning' });
    renderUsers();
    return;
  }

  const user = state.list.find((item) => item.id === userId);
  if (!user) return;

  const previousStatus = user.status;
  selectEl.disabled = true;

  try {
    const response = await fetch(`${API_BASE}/users/${userId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    });
    const payload = await response.json();

    if (!response.ok || !payload.success) {
      throw new Error(payload.error || payload.message || 'Không thể cập nhật trạng thái');
    }

    user.status = newStatus;
    showToast({ message: 'Cập nhật trạng thái thành công', type: 'success' });
    renderUsers();
    if (state.selectedUserId === userId) {
      renderUserDetail(user);
    }
  } catch (err) {
    showToast({ message: err.message || 'Lỗi cập nhật trạng thái', type: 'error' });
    selectEl.value = previousStatus;
  } finally {
    selectEl.disabled = false;
  }
}

function handleSearch() {
  const value = elements.searchInput.value.trim();
  state.filters.search = value;
  fetchUsers(1);
}

function initEventListeners() {
  if (elements.searchBtn) {
    elements.searchBtn.addEventListener('click', (e) => {
      e.preventDefault();
      handleSearch();
    });
  }

  if (elements.refreshBtn) {
    elements.refreshBtn.addEventListener('click', (e) => {
      e.preventDefault();
      elements.searchInput.value = '';
      elements.statusSelect.value = 'all';
      state.filters.search = '';
      state.filters.status = 'all';
      fetchUsers(1);
    });
  }

  if (elements.statusSelect) {
    elements.statusSelect.addEventListener('change', (e) => {
      state.filters.status = e.target.value;
      fetchUsers(1);
    });
  }

  if (elements.searchInput) {
    let debounceTimer;
    elements.searchInput.addEventListener('input', () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        handleSearch();
      }, 400);
    });
  }

  if (elements.paginationControls) {
    elements.paginationControls.addEventListener('click', (e) => {
      const link = e.target.closest('.page-link');
      if (!link) return;
      e.preventDefault();
      const targetPage = parseInt(link.dataset.page, 10);
      if (!targetPage || targetPage === state.pagination.page || targetPage < 1 || targetPage > state.pagination.totalPages) {
        return;
      }
      fetchUsers(targetPage);
    });
  }

  if (elements.tableBody) {
    elements.tableBody.addEventListener('click', (e) => {
      const viewBtn = e.target.closest('.btn-view-user');
      if (viewBtn) {
        const userId = Number(viewBtn.dataset.userId);
        state.selectedUserId = userId;
        const user = state.list.find((item) => item.id === userId);
        renderUserDetail(user || null);
      }
    });

    elements.tableBody.addEventListener('change', (e) => {
      if (e.target.matches('.user-status-select')) {
        const userId = Number(e.target.dataset.userId);
        const newStatus = e.target.value;
        handleStatusChange(userId, newStatus, e.target);
      }
    });
  }
}

ready(() => {
  elements.tableBody = qs('#users-table-body');
  elements.searchInput = qs('#input-search');
  elements.searchBtn = qs('#btn-search');
  elements.statusSelect = qs('#select-status');
  elements.refreshBtn = qs('#btn-refresh');
  elements.statTotal = qs('#stat-total-users');
  elements.statActive = qs('#stat-active-users');
  elements.statBanned = qs('#stat-banned-users');
  elements.paginationControls = qs('#paginationControls');
  elements.detailPanel = qs('#user-detail-panel');
  elements.detailFooter = qs('#user-detail-footer');
  elements.viewProfileBtn = qs('#btn-view-profile');

  initEventListeners();
  fetchUsers(1);
});

