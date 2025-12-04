// fe/admin/faq/admin_faq.js

(function () {
  // Backend dùng PHP built-in server port 8000, giống các file admin khác
  const API_BASE = 'http://localhost:8000';

  // Trạng thái hiện tại
  let currentFilters = {
    status: 'all',
    search: '',
  };

  // Lưu list hiện tại để khi edit lấy data không cần gọi API riêng
  let faqList = [];
  let currentEditingId = null;
  let faqModalInstance = null;
  // Phân trang
  let currentPage = 1;
  const pageSize = 10;

  /**
   * Render danh sách FAQ vào bảng
   */
    function renderFaqTable(faqs) {
    const tbody = document.getElementById('faqTableBody');
    const summaryEl = document.getElementById('faqSummary');
    const paginationEl = document.getElementById('faqPagination');

    if (!tbody) return;

    const total = Array.isArray(faqs) ? faqs.length : 0;

    // Không có dữ liệu
    if (!faqs || total === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="6" class="text-center text-muted py-4">
            Chưa có câu hỏi nào.
          </td>
        </tr>
      `;

      if (summaryEl) summaryEl.textContent = 'Chưa có câu hỏi nào';
      if (paginationEl) paginationEl.innerHTML = '';
      return;
    }

    // Tính lại currentPage cho hợp lý
    const totalPages = Math.ceil(total / pageSize);
    if (currentPage > totalPages) currentPage = totalPages;
    if (currentPage < 1) currentPage = 1;

    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = Math.min(startIndex + pageSize, total);

    const pageFaqs = faqs.slice(startIndex, endIndex);

    let html = '';

    pageFaqs.forEach((faq) => {
      const answerText =
        faq.answer && faq.answer.trim()
          ? faq.answer
          : '<em>Chưa có câu trả lời.</em>';

      const statusLabel =
        faq.status === 'answered'
          ? '<span class="badge bg-success">Đã trả lời</span>'
          : '<span class="badge bg-warning text-dark">Chờ trả lời</span>';

      const createdAt = faq.created_at
        ? new Date(faq.created_at).toLocaleString('vi-VN')
        : '';

      html += `
        <tr>
          <td>${faq.id}</td>
          <td>${faq.question}</td>
          <td>
            <div class="answer-preview">
              ${answerText}
            </div>
          </td>
          <td>${statusLabel}</td>
          <td>${createdAt}</td>
          <td class="text-end">
            <button class="btn btn-sm btn-outline-primary btn-faq-edit" data-id="${faq.id}">
              <i class="ti ti-edit"></i>
            </button>
            <button class="btn btn-sm btn-outline-danger ms-1 btn-faq-delete" data-id="${faq.id}">
              <i class="ti ti-trash"></i>
            </button>
          </td>
        </tr>
      `;
    });

    tbody.innerHTML = html;

    // Cập nhật text "Hiển thị X–Y / Z câu hỏi"
    if (summaryEl) {
      summaryEl.textContent = `Hiển thị ${startIndex + 1}-${endIndex} trong tổng số ${total} câu hỏi`;
    }

    // Vẽ lại phân trang
    renderFaqPagination(totalPages);
  }


    function renderFaqPagination(totalPages) {
    const paginationEl = document.getElementById('faqPagination');
    if (!paginationEl) return;

    if (totalPages <= 1) {
      paginationEl.innerHTML = '';
      return;
    }

    let html = '';

    // Nút Trước
    html += `
      <li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
        <a class="page-link" href="#" onclick="window.changeFaqPage(${currentPage - 1}); return false;">
          <i class="ti ti-chevron-left"></i> Trước
        </a>
      </li>
    `;

    // Các nút số trang (giống news: hiện 2 bên + ...)
    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= currentPage - 2 && i <= currentPage + 2)) {
        html += `
          <li class="page-item ${i === currentPage ? 'active' : ''}">
            <a class="page-link" href="#" onclick="window.changeFaqPage(${i}); return false;">${i}</a>
          </li>
        `;
      } else if (i === currentPage - 3 || i === currentPage + 3) {
        html += `<li class="page-item disabled"><span class="page-link">...</span></li>`;
      }
    }

    // Nút Sau
    html += `
      <li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
        <a class="page-link" href="#" onclick="window.changeFaqPage(${currentPage + 1}); return false;">
          Sau <i class="ti ti-chevron-right"></i>
        </a>
      </li>
    `;

    paginationEl.innerHTML = html;
  }

  // Hàm đổi trang, cần đưa ra window để onclick gọi được
  window.changeFaqPage = function (page) {
    const total = Array.isArray(faqList) ? faqList.length : 0;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));

    if (page < 1 || page > totalPages) return;

    currentPage = page;
    renderFaqTable(faqList);
  };


  /**
   * Gọi API /faqs/admin để lấy dữ liệu (dùng cho list)
   */
  async function loadAdminFaqs() {
    const tbody = document.getElementById('faqTableBody');
    if (!tbody) return;

    // Spinner
    tbody.innerHTML = `
      <tr>
        <td colspan="6" class="text-center py-4">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Đang tải...</span>
          </div>
        </td>
      </tr>
    `;

    try {
      const params = new URLSearchParams();

      if (currentFilters.status && currentFilters.status !== 'all') {
        params.set('status', currentFilters.status);
      }

      if (currentFilters.search) {
        params.set('search', currentFilters.search);
      }

      const query = params.toString();
      const url = `${API_BASE}/faqs/admin${query ? `?${query}` : ''}`;

      const res = await fetch(url);
      const data = await res.json();

      console.log('Admin FAQs data:', data);

      if (!data.success || !Array.isArray(data.data)) {
        tbody.innerHTML = `
          <tr>
            <td colspan="6" class="text-center text-danger py-4">
              Có lỗi khi tải FAQ.
            </td>
          </tr>
        `;
        return;
      }

      faqList = data.data;
      renderFaqTable(faqList);
    } catch (error) {
      console.error('Error loading admin FAQs:', error);
      tbody.innerHTML = `
        <tr>
          <td colspan="6" class="text-center text-danger py-4">
            Có lỗi khi tải FAQ. Vui lòng thử lại sau.
          </td>
        </tr>
      `;
    }
  }

  /**
   * Reset form modal
   */
  function resetFaqForm() {
    const idInput = document.getElementById('faqId');
    const questionInput = document.getElementById('faqQuestion');
    const answerInput = document.getElementById('faqAnswer');
    const statusSelect = document.getElementById('faqStatus');

    if (idInput) idInput.value = '';
    if (questionInput) questionInput.value = '';
    if (answerInput) answerInput.value = '';
    if (statusSelect) statusSelect.value = 'pending';

    currentEditingId = null;
  }

  /**
   * Mở modal ở mode "Thêm mới"
   */
  function openCreateModal() {
    resetFaqForm();

    const titleEl = document.getElementById('faqModalTitle');
    const saveBtn = document.getElementById('faqSaveBtn');
    if (titleEl) titleEl.textContent = 'Thêm câu hỏi';
    if (saveBtn) saveBtn.textContent = 'Thêm';

    const modalEl = document.getElementById('faqModal');
    if (!modalEl) return;

    faqModalInstance = new bootstrap.Modal(modalEl);
    faqModalInstance.show();
  }

  /**
   * Mở modal ở mode "Chỉnh sửa"
   */
  function openEditModal(id) {
    const faq = faqList.find((item) => String(item.id) === String(id));
    if (!faq) {
      alert('Không tìm thấy câu hỏi để chỉnh sửa.');
      return;
    }

    const idInput = document.getElementById('faqId');
    const questionInput = document.getElementById('faqQuestion');
    const answerInput = document.getElementById('faqAnswer');
    const statusSelect = document.getElementById('faqStatus');
    const titleEl = document.getElementById('faqModalTitle');
    const saveBtn = document.getElementById('faqSaveBtn');

    if (idInput) idInput.value = faq.id;
    if (questionInput) questionInput.value = faq.question || '';
    if (answerInput) answerInput.value = faq.answer || '';
    if (statusSelect) statusSelect.value = faq.status || 'pending';
    if (titleEl) titleEl.textContent = 'Chỉnh sửa câu hỏi';
    if (saveBtn) saveBtn.textContent = 'Cập nhật';

    currentEditingId = faq.id;

    const modalEl = document.getElementById('faqModal');
    if (!modalEl) return;
    faqModalInstance = new bootstrap.Modal(modalEl);
    faqModalInstance.show();
  }

  /**
   * Gửi form (create / update)
   */
  async function submitFaqForm(event) {
    event.preventDefault();

    const questionInput = document.getElementById('faqQuestion');
    const answerInput = document.getElementById('faqAnswer');
    const statusSelect = document.getElementById('faqStatus');

    const question = questionInput ? questionInput.value.trim() : '';
    const answer = answerInput ? answerInput.value.trim() : '';
    const status = statusSelect ? statusSelect.value : 'pending';

    if (!question) {
      alert('Vui lòng nhập câu hỏi.');
      if (questionInput) questionInput.focus();
      return;
    }

    const payload = {
      question,
      answer: answer || null,
      status,
    };

    let url = `${API_BASE}/faqs`;
    let method = 'POST';

    if (currentEditingId) {
      url = `${API_BASE}/faqs/${currentEditingId}`;
      method = 'PUT';
    }

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!data.success) {
        alert(data.message || 'Có lỗi xảy ra khi lưu FAQ.');
        return;
      }

      alert(currentEditingId ? 'Cập nhật FAQ thành công.' : 'Thêm FAQ thành công.');

      if (faqModalInstance) {
        faqModalInstance.hide();
      }

      // reload list
      await loadAdminFaqs();
    } catch (error) {
      console.error('Error saving FAQ:', error);
      alert('Có lỗi khi lưu FAQ. Vui lòng thử lại sau.');
    }
  }

  /**
   * Xoá FAQ
   */
  async function deleteFaq(id) {
    if (!confirm('Bạn có chắc chắn muốn xoá câu hỏi này?')) return;

    try {
      const res = await fetch(`${API_BASE}/faqs/${id}`, {
        method: 'DELETE',
      });

      const data = await res.json();

      if (!data.success) {
        alert(data.message || 'Không thể xoá FAQ.');
        return;
      }

      alert('Đã xoá FAQ thành công.');
      await loadAdminFaqs();
    } catch (error) {
      console.error('Error deleting FAQ:', error);
      alert('Có lỗi khi xoá FAQ. Vui lòng thử lại sau.');
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    const btnAdd = document.getElementById('btnAdd');
    const filterKeyword = document.getElementById('filterKeyword');
    const filterStatus = document.getElementById('filterStatus');
    const btnFilter = document.getElementById('btnFilter');
    const faqForm = document.getElementById('faqForm');
    const tbody = document.getElementById('faqTableBody');

    // Nút thêm mới
    if (btnAdd) {
      btnAdd.addEventListener('click', (e) => {
        e.preventDefault();
        openCreateModal();
      });
    }

    // Nút lọc
    if (btnFilter) {
      btnFilter.addEventListener('click', (e) => {
        e.preventDefault();
        currentFilters.search = filterKeyword ? filterKeyword.value.trim() : '';
        currentFilters.status = filterStatus ? filterStatus.value : 'all';
        loadAdminFaqs();
      });
    }

    // Enter trong ô từ khóa = click Lọc
    if (filterKeyword) {
      filterKeyword.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          if (btnFilter) btnFilter.click();
        }
      });
    }

    // Submit form modal
    if (faqForm) {
      faqForm.addEventListener('submit', submitFaqForm);
    }

    // Event delegation cho nút Sửa / Xoá trong bảng
    if (tbody) {
      tbody.addEventListener('click', (e) => {
        const editBtn = e.target.closest('.btn-faq-edit');
        const deleteBtn = e.target.closest('.btn-faq-delete');

        if (editBtn) {
          const id = editBtn.getAttribute('data-id');
          openEditModal(id);
        } else if (deleteBtn) {
          const id = deleteBtn.getAttribute('data-id');
          deleteFaq(id);
        }
      });
    }

    // Load lần đầu
    loadAdminFaqs();
  });
})();
