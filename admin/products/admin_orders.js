import { ready } from '../../js/main.js';
import { API_BASE } from '../../js/config.js';
import { timeAgo, timeAgoWithDate } from '../../js/timeUtils.js';

ready(async () => {
  const tableHeadSel = '#ordersTableHead';
  const tableBodySel = '#ordersTableBody';
  const paginationControls = document.getElementById('paginationControls');
  const tableTitle = document.getElementById('tableTitle');

  const state = {
    currentTab: 'cart',
    page: 1,
    totalPages: 1,
    totalItems: 0,
    keyword: '',
    status: 'all',
  };

  const STATUS_OPTIONS = {
    pending: 'Chờ xử lý',
    approved: 'Đã duyệt',
    shipped: 'Đang giao',
    delivered: 'Đã giao',
    cancelled: 'Đã hủy'
  };

  // Modals
  const cartDetailModal = new bootstrap.Modal(document.getElementById('cartDetailModal'));
  const orderDetailModal = new bootstrap.Modal(document.getElementById('orderDetailModal'));
  const cartDetailBody = document.getElementById('cartDetailBody');
  const cartDetailTitle = document.getElementById('cartDetailTitle');
  const orderDetailBody = document.getElementById('orderDetailBody');
  const orderDetailTitle = document.getElementById('orderDetailTitle');

  // Elements
  const tabCart = document.getElementById('tab-cart');
  const tabOrders = document.getElementById('tab-orders');
  const statusFilter = document.getElementById('orderStatusFilter');
  const refreshBtn = document.getElementById('btnRefresh');

  async function fetchJson(url) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return (await res.json()).data;
  }

  function formatPaymentMethod(method) {
    if (!method) return '-';
    const map = {
      'cod': 'Thanh toán khi nhận hàng (COD)',
      'bank': 'Chuyển khoản',
      'paypal': 'Thanh toán qua Paypal',
      'credit_card': 'Thanh toán qua thẻ tín dụng'
    };
    return map[method.toLowerCase()] || method;
  }

  function createStatusDropdown(currentStatus) {
    const optionsHtml = Object.entries(STATUS_OPTIONS)
      .map(([value, text]) => {
        const selected = (value === currentStatus) ? 'selected' : '';
        return `<option value="${value}" ${selected}>${text}</option>`;
      })
      .join('');
    return `<select class="form-select form-select-sm order-status-select" style="min-width: 140px;">${optionsHtml}</select>`;
  }

  function setHeadForCart() {
    document.querySelector(tableHeadSel).innerHTML = `
      <tr>
        <th>Người dùng</th>
        <th>Số sản phẩm</th>
        <th>Lần cập nhật cuối</th>
        <th class="text-end">Thao tác</th>
      </tr>
    `;
    tableTitle.textContent = 'Danh sách giỏ hàng';
  }

  function setHeadForOrders() {
    document.querySelector(tableHeadSel).innerHTML = `
      <tr>
        <th>Người dùng</th>
        <th>Tổng tiền</th>
        <th>Địa chỉ</th>
        <th>Thanh toán</th>
        <th>Trạng thái</th>
        <th>Ghi chú</th>
        <th>Ngày tạo</th>
        <th class="text-end">Thao tác</th>
      </tr>
    `;
    tableTitle.textContent = 'Danh sách đơn hàng';
  }

  function renderCartRows(carts, page = 1, totalPages = 1) {
    const tbody = document.querySelector(tableBodySel);
    if (!Array.isArray(carts) || carts.length === 0) {
      tbody.innerHTML = `<tr><td colspan="4" class="text-center py-4 text-muted">Không có dữ liệu</td></tr>`;
      renderPagination(1, 1, 0);
      return;
    }
    tbody.innerHTML = carts.map(c => `
      <tr>
        <td>${c.user_name || c.user || '-'}</td>
        <td><span class="badge bg-blue-lt">${c.total_items}</span></td>
        <td>${timeAgo(c.updated_at)}</td>
        <td class="text-end">
          <button class="btn btn-icon btn-sm btn-outline-primary btn-view-cart" data-id="${c.user_id}" title="Xem chi tiết">
            <i class="ti ti-eye"></i>
          </button>
        </td>
      </tr>
    `).join('');
    renderPagination(page, totalPages, state.totalItems);
  }

  function renderOrderRows(orders, page = 1, totalPages = 1) {
    const tbody = document.querySelector(tableBodySel);
    if (!Array.isArray(orders) || orders.length === 0) {
      tbody.innerHTML = `<tr><td colspan="8" class="text-center py-4 text-muted">Không có dữ liệu</td></tr>`;
      renderPagination(1, 1, 0);
      return;
    }
    tbody.innerHTML = orders.map(o => {
      const statusDropdownHtml = createStatusDropdown(o.status || 'pending');
      return `
        <tr>
          <td>${o.user_name || o.user || '-'}</td>
          <td class="fw-bold text-primary">${Number(o.total_price || o.total || 0).toLocaleString('vi-VN')} ₫</td>
          <td class="text-truncate" style="max-width: 150px;" title="${o.address || o.shipping_address || ''}">${o.address || o.shipping_address || '-'}</td>
          <td>${formatPaymentMethod(o.payment_method)}</td>
          <td>${statusDropdownHtml}</td>
          <td class="text-truncate" style="max-width: 100px;" title="${o.note || ''}">${o.note || '-'}</td>
          <td>${timeAgo(o.created_at)}</td>
          <td class="text-end">
            <button class="btn btn-icon btn-sm btn-outline-success btn-save me-1" data-id="${o.id}" title="Lưu trạng thái">
              <i class="ti ti-check"></i>
            </button>
            <button class="btn btn-icon btn-sm btn-outline-primary btn-view-order" data-id="${o.id}" title="Xem chi tiết">
              <i class="ti ti-eye"></i>
            </button>
          </td>
        </tr>
      `;
    }).join('');
    renderPagination(page, totalPages, state.totalItems);
  }

  function renderPagination(page, totalPages, totalItems) {
    const start = totalItems > 0 ? (page - 1) * 10 + 1 : 0;
    const end = Math.min(page * 10, totalItems);
    document.getElementById('showingRange').textContent = `${start}-${end}`;
    document.getElementById('totalItems').textContent = totalItems;

    if (totalPages <= 1) {
      paginationControls.innerHTML = '';
      return;
    }

    let html = `<li class="page-item ${page === 1 ? 'disabled' : ''}">
      <a class="page-link" href="#" data-page="${page - 1}"><i class="ti ti-chevron-left"></i></a>
    </li>`;

    for (let i = 1; i <= totalPages; i++) {
      html += `<li class="page-item ${i === page ? 'active' : ''}">
        <a class="page-link" href="#" data-page="${i}">${i}</a>
      </li>`;
    }

    html += `<li class="page-item ${page === totalPages ? 'disabled' : ''}">
      <a class="page-link" href="#" data-page="${page + 1}"><i class="ti ti-chevron-right"></i></a>
    </li>`;

    paginationControls.innerHTML = html;
  }

  async function fetchAndRenderCarts(page, kw) {
    document.querySelector(tableBodySel).innerHTML = `<tr><td colspan="4" class="text-center py-4">
      <div class="spinner-border text-primary" role="status"><span class="visually-hidden">Đang tải...</span></div>
    </td></tr>`;
    try {
      let url = `${API_BASE}/carts?page=${page}`;
      if (kw) url += `&search=${encodeURIComponent(kw)}`;
      const cartsRes = await fetchJson(url);
      const carts = cartsRes.data || cartsRes.carts || cartsRes.cart || [];
      state.page = cartsRes.pagination?.page || page;
      state.totalPages = cartsRes.pagination?.total_pages || 1;
      state.totalItems = cartsRes.pagination?.total || 0;
      state.keyword = kw;
      renderCartRows(carts, state.page, state.totalPages);
    } catch (err) {
      console.error("Lỗi khi tải giỏ hàng:", err);
      renderCartRows([], 1, 1);
    }
  }

  async function fetchAndRenderOrders(page, kw, status) {
    document.querySelector(tableBodySel).innerHTML = `<tr><td colspan="8" class="text-center py-4">
      <div class="spinner-border text-primary" role="status"><span class="visually-hidden">Đang tải...</span></div>
    </td></tr>`;
    try {
      let url = `${API_BASE}/orders?page=${page}`;
      if (kw) url += `&search=${encodeURIComponent(kw)}`;
      if (status && status !== 'all') url += `&status=${encodeURIComponent(status)}`;
      const data = await fetchJson(url);
      const orders = data.orders || [];
      state.page = data.pagination?.page || page;
      state.totalPages = data.pagination?.total_pages || 1;
      state.totalItems = data.pagination?.total || 0;
      state.keyword = kw;
      state.status = status;
      renderOrderRows(orders, state.page, state.totalPages);
    } catch (err) {
      console.error("Lỗi khi tải đơn hàng:", err);
      renderOrderRows([], 1, 1);
    }
  }

  async function loadCurrentTabData() {
    if (state.currentTab === 'cart') {
      await fetchAndRenderCarts(state.page, state.keyword);
    } else {
      await fetchAndRenderOrders(state.page, state.keyword, state.status);
    }
  }

  // Tab switching
  tabCart?.addEventListener('click', () => {
    if (state.currentTab === 'cart') return;
    state.currentTab = 'cart';
    state.page = 1;
    state.keyword = '';
    tabCart.classList.add('btn-primary');
    tabCart.classList.remove('btn-outline-primary');
    tabOrders.classList.remove('btn-primary');
    tabOrders.classList.add('btn-outline-primary');
    statusFilter.style.display = 'none';
    setHeadForCart();
    loadCurrentTabData();
  });

  tabOrders?.addEventListener('click', () => {
    if (state.currentTab === 'orders') return;
    state.currentTab = 'orders';
    state.page = 1;
    state.keyword = '';
    tabOrders.classList.add('btn-primary');
    tabOrders.classList.remove('btn-outline-primary');
    tabCart.classList.remove('btn-primary');
    tabCart.classList.add('btn-outline-primary');
    statusFilter.style.display = 'block';
    setHeadForOrders();
    loadCurrentTabData();
  });

  refreshBtn?.addEventListener('click', () => {
    state.page = 1;
    state.keyword = '';
    state.status = 'all';
    statusFilter.value = 'all';
    loadCurrentTabData();
  });

  statusFilter?.addEventListener('change', (e) => {
    state.status = e.target.value;
    state.page = 1;
    loadCurrentTabData();
  });

  // Click delegation
  document.addEventListener('click', async (e) => {
    // Pagination
    const pageLink = e.target.closest('.page-link');
    if (pageLink) {
      e.preventDefault();
      const pageItem = pageLink.closest('.page-item');
      if (!pageItem.classList.contains('disabled') && !pageItem.classList.contains('active')) {
        state.page = parseInt(pageLink.dataset.page);
        loadCurrentTabData();
      }
      return;
    }

    // Save order status
    const saveBtn = e.target.closest('.btn-save');
    if (saveBtn) {
      const id = saveBtn.dataset.id;
      const row = saveBtn.closest('tr');
      const dropdown = row?.querySelector('.order-status-select');
      if (!dropdown) return;
      const newStatus = dropdown.value;
      try {
        await fetch(`${API_BASE}/orders/${id}/status`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: newStatus })
        });
        alert('Cập nhật trạng thái thành công!');
        await loadCurrentTabData();
      } catch (err) {
        console.error("Lỗi khi lưu:", err);
        alert("Cập nhật thất bại!");
      }
      return;
    }

    // View cart detail
    const viewCartBtn = e.target.closest('.btn-view-cart');
    if (viewCartBtn) {
      const id = viewCartBtn.dataset.id;
      cartDetailTitle.textContent = 'Chi tiết giỏ hàng';
      cartDetailBody.innerHTML = `<div class="text-center py-4"><div class="spinner-border text-primary"></div></div>`;
      cartDetailModal.show();

      try {
        const cartRes = await fetchJson(`${API_BASE}/carts/${id}`);
        const cart = cartRes.cart;
        const items = cartRes.items || [];
        const total = cartRes.item_count || 0;
        const totalPrice = cartRes.total || 0;

        cartDetailTitle.textContent = `Chi tiết giỏ hàng #${cart.id}`;
        cartDetailBody.innerHTML = `
          <div class="detail-row"><span class="detail-label">ID giỏ hàng:</span><span class="detail-value">${cart.id}</span></div>
          <div class="detail-row"><span class="detail-label">ID người dùng:</span><span class="detail-value">${cart.user_id || '-'}</span></div>
          <div class="detail-row"><span class="detail-label">Ngày tạo:</span><span class="detail-value">${timeAgoWithDate(cart.created_at)}</span></div>
          <div class="detail-row"><span class="detail-label">Cập nhật gần nhất:</span><span class="detail-value">${timeAgoWithDate(cart.updated_at)}</span></div>
          <hr>
          <h4>Sản phẩm trong giỏ</h4>
          <div class="table-responsive">
            <table class="table table-sm table-striped">
              <thead><tr><th></th><th>Sản phẩm</th><th>Màu</th><th>Size</th><th>SL</th><th>Tạm tính</th></tr></thead>
              <tbody>
                ${items.map(i => `
                  <tr>
                    <td><img src="${API_BASE}/${i.image}" style="width:40px;height:40px;object-fit:cover;border-radius:4px;"></td>
                    <td>${i.name || i.product_name || '-'}</td>
                    <td><span class="color-swatch-table" style="background:${i.color}"></span></td>
                    <td>${i.size || '-'}</td>
                    <td>${i.quantity || 1}</td>
                    <td>${Number(i.subtotal || 0).toLocaleString('vi-VN')} ₫</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
          <div class="detail-row fw-bold"><span class="detail-label">Tổng sản phẩm:</span><span class="detail-value">${total}</span></div>
          <div class="detail-row fw-bold"><span class="detail-label">Tổng tiền:</span><span class="detail-value text-primary">${Number(totalPrice).toLocaleString('vi-VN')} ₫</span></div>
        `;
      } catch (err) {
        console.error(err);
        cartDetailBody.innerHTML = `<div class="alert alert-danger">Không thể tải chi tiết giỏ hàng.</div>`;
      }
      return;
    }

    // View order detail
    const viewOrderBtn = e.target.closest('.btn-view-order');
    if (viewOrderBtn) {
      const id = viewOrderBtn.dataset.id;
      orderDetailTitle.textContent = 'Chi tiết đơn hàng';
      orderDetailBody.innerHTML = `<div class="text-center py-4"><div class="spinner-border text-primary"></div></div>`;
      orderDetailModal.show();

      try {
        const orderRes = await fetchJson(`${API_BASE}/orders/${id}`);
        const order = orderRes.order || orderRes;
        const items = orderRes.items || [];

        orderDetailTitle.textContent = `Chi tiết đơn hàng #${order.id}`;
        orderDetailBody.innerHTML = `
          <div class="detail-row"><span class="detail-label">ID đơn hàng:</span><span class="detail-value">${order.id}</span></div>
          <div class="detail-row"><span class="detail-label">Khách hàng:</span><span class="detail-value">${order.user_name || order.user || '-'}</span></div>
          <div class="detail-row"><span class="detail-label">Địa chỉ giao hàng:</span><span class="detail-value">${order.address || order.shipping_address || '-'}</span></div>
          <div class="detail-row"><span class="detail-label">Thanh toán:</span><span class="detail-value">${formatPaymentMethod(order.payment_method)}</span></div>
          <div class="detail-row"><span class="detail-label">Trạng thái:</span><span class="detail-value"><span class="badge bg-blue-lt">${STATUS_OPTIONS[order.status] || order.status}</span></span></div>
          <div class="detail-row"><span class="detail-label">Ngày tạo:</span><span class="detail-value">${timeAgoWithDate(order.created_at)}</span></div>
          ${order.note ? `<div class="detail-row"><span class="detail-label">Ghi chú:</span><span class="detail-value">${order.note}</span></div>` : ''}
          <hr>
          <h4>Sản phẩm trong đơn</h4>
          <div class="table-responsive">
            <table class="table table-sm table-striped">
              <thead><tr><th></th><th>Sản phẩm</th><th>Màu</th><th>Size</th><th>SL</th><th>Giá</th></tr></thead>
              <tbody>
                ${items.map(i => `
                  <tr>
                    <td><img src="${API_BASE}/${i.product_image}" style="width:40px;height:40px;object-fit:cover;border-radius:4px;"></td>
                    <td>${i.name || i.product_name || '-'}</td>
                    <td><span class="color-swatch-table" style="background:${i.color}"></span></td>
                    <td>${i.size || '-'}</td>
                    <td>${i.quantity || 1}</td>
                    <td>${Number(i.price || 0).toLocaleString('vi-VN')} ₫</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
          <div class="detail-row fw-bold"><span class="detail-label">Tổng tiền:</span><span class="detail-value text-primary fs-4">${Number(order.total_value || order.total_price || 0).toLocaleString('vi-VN')} ₫</span></div>
        `;
      } catch (err) {
        console.error(err);
        orderDetailBody.innerHTML = `<div class="alert alert-danger">Không thể tải chi tiết đơn hàng.</div>`;
      }
      return;
    }
  });

  // Initial load
  await loadCurrentTabData();
});