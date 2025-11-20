import { BASE_URL } from '../../js/config.js';
import { showToast } from '../utils/toast.js';

const API_BASE = BASE_URL;
const PAGE_SIZE = 10;

document.addEventListener('DOMContentLoaded', () => {
  const tableBody = document.querySelector('#newsTableBody');
  const btnAdd = document.querySelector('#btnAdd');
  const searchInput = document.querySelector('#searchPost');
  const tableCard = document.querySelector('.card');

  let paginationEl = null;
  let currentPage = 1;
  let cachedPosts = [];

  function getFeBaseUrl() {
    const { origin, pathname } = window.location;
    const marker = '/web-251-fe/';
    const index = pathname.indexOf(marker);
    if (index === -1) return origin + '/';
    return origin + pathname.substring(0, index + marker.length);
  }

  const FE_BASE = getFeBaseUrl();

  function resolveAssetUrl(relativePath) {
    if (!relativePath) return '';
    if (/^https?:\/\//i.test(relativePath) || relativePath.startsWith('data:')) return relativePath;
    return FE_BASE + relativePath.replace(/^\/+/, '');
  }

  function escapeHtml(value) {
    if (value === null || value === undefined) return '';
    return String(value)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#39;');
  }

  function ensurePagination() {
    // pager is in DOM (newsPager in index.html)
    if (!paginationEl) paginationEl = document.querySelector('#newsPager');
    const prev = paginationEl?.querySelector('.btn-prev');
    const next = paginationEl?.querySelector('.btn-next');
    if (prev) prev.onclick = () => { if (currentPage>1) { currentPage--; renderTable(); } };
    if (next) next.onclick = () => { const maxPage = Math.max(1, Math.ceil(cachedPosts.length / PAGE_SIZE)); if (currentPage<maxPage){ currentPage++; renderTable(); } };
  }

  function showLoading() {
    tableBody.innerHTML = `<tr><td colspan="5" class="text-center py-4 text-muted">Đang tải dữ liệu...</td></tr>`;
  }

  function updateSummary() {
    ensurePagination();
    const summaryEl = paginationEl?.querySelector('#postSummary');
    if (!summaryEl) return;
    if (!cachedPosts.length) {
      summaryEl.textContent = 'Không có bài viết nào';
      return;
    }
    const maxPage = Math.max(1, Math.ceil(cachedPosts.length / PAGE_SIZE));
    if (currentPage > maxPage) currentPage = maxPage;
    const start = (currentPage - 1) * PAGE_SIZE + 1;
    const end = Math.min(currentPage * PAGE_SIZE, cachedPosts.length);
    summaryEl.textContent = `Hiển thị ${start} - ${end} / ${cachedPosts.length} bài viết`;
  }

  function renderTable() {
    if (!cachedPosts.length) {
      tableBody.innerHTML = `<tr><td colspan="5" class="text-center py-4 text-muted">Không có dữ liệu</td></tr>`;
      updateSummary();
      return;
    }
    ensurePagination();
    const slice = cachedPosts.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
    tableBody.innerHTML = slice
      .map(
        (p) => `
      <tr>
        <td>${p.id}</td>
        <td>
          <div class="fw-semibold">${escapeHtml(p.title || '-')}</div>
          <div class="text-muted small">${escapeHtml(p.excerpt || '')}</div>
        </td>
        <td>${escapeHtml(p.author_name || p.author_id || '-')}</td>
        <td>${escapeHtml(p.created_at || '')}</td>
        <td class="table-actions">
          <a class="btn btn-sm btn-secondary btn-detail" href="detail.html?id=${p.id}">Xem</a>
          <a class="btn btn-sm btn-warning btn-edit" href="edit.html?id=${p.id}">Sửa</a>
          <button class="btn btn-sm btn-danger btn-delete" data-id="${p.id}">Xóa</button>
        </td>
      </tr>`
      )
      .join('');
    updateSummary();
  }

  async function loadPosts(keyword = '') {
    showLoading();
    try {
      const url = `${API_BASE}/posts?search=${encodeURIComponent(keyword)}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Không thể tải bài viết (mã ${res.status})`);
      const data = await res.json();
      // support two shapes: { success: true, data: [...] } or raw array
      cachedPosts = Array.isArray(data) ? data : (data.data || []);
  currentPage = 1;
  renderTable();
    } catch (err) {
      console.error(err);
      tableBody.innerHTML = `<tr><td colspan="5" class="text-center py-4 text-danger">${err.message}</td></tr>`;
      cachedPosts = [];
      updateSummary();
      showToast({ message: err.message || 'Lỗi khi tải bài viết', type: 'error' });
    }
  }

  btnAdd?.addEventListener('click', () => {
    window.location.href = 'edit.html';
  });

  document.addEventListener('click', async (e) => {
    const target = e.target;
    if (target.classList.contains('btn-detail')) {
      const id = target.dataset.id;
      window.location.href = `detail.html?id=${id}`;
      return;
    }

    if (target.classList.contains('btn-delete')) {
      const id = target.dataset.id;
      if (!confirm('Xác nhận xóa bài viết này?')) return;
      try {
        const res = await fetch(`${API_BASE}/posts/${id}`, { method: 'DELETE' });
        const payload = await res.json().catch(() => ({}));
        if (!res.ok || payload?.success === false) throw new Error(payload?.message || `Không thể xoá (mã ${res.status})`);
        showToast({ message: 'Đã xoá bài viết', type: 'success' });
        loadPosts(searchInput?.value.trim());
      } catch (err) {
        console.error(err);
        showToast({ message: err.message || 'Lỗi khi xoá bài viết', type: 'error' });
      }
      return;
    }

    if (target.classList.contains('btn-edit')) {
      const id = target.dataset.id;
      window.location.href = `edit.html?id=${id}`;
      return;
    }
  });

  searchInput?.addEventListener('input', (e) => {
    loadPosts(e.target.value.trim());
  });

  ensurePagination();
  loadPosts();
});
