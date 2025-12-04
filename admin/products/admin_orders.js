import { ready } from '../../js/main.js';
import { API_BASE } from '../../js/config.js';
import { Popup } from '../../components/PopUp.js';
import { timeAgo, timeAgoWithDate } from '../../js/timeUtils.js';

ready(async () => {
  const popup = new Popup();

  const tableHeadSel = '#ordersTableHead';
  const tableBodySel = '#ordersTableBody';

  const paginationControls = document.getElementById('paginationControls');

  const state = {
    currentTab: 'cart',
    page: 1,
    totalPages: 1,
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


  async function fetchJson(url) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return (await res.json()).data;
  }


  async function loadCurrentTabData() {
    const { currentTab, page, keyword, status } = state;
    if (currentTab === 'cart') {
      await fetchAndRenderCarts(page, keyword);
    } else {
      await fetchAndRenderOrders(page, keyword, status);
    }
  }

  function createStatusDropdown(currentStatus) {
    const optionsHtml = Object.entries(STATUS_OPTIONS)
      .map(([value, text]) => {
        const selected = (value === currentStatus) ? 'selected' : '';
        return `<option value="${value}" ${selected}>${text}</option>`;
      })
      .join('');
    return `
      <select class="form-select form-select-sm order-status-select" 
              style="min-width: 140px;">
        ${optionsHtml}
      </select>
    `;
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
  }
  function setHeadForOrders() {
    document.querySelector(tableHeadSel).innerHTML = `
      <tr>
        <th>Người dùng</th>
        <th>Tổng tiền</th>
        <th>Địa chỉ</th>
        <th>Phương thức thanh toán</th>
        <th>Trạng thái</th>
        <th>Note</th>
        <th>Ngày tạo đơn</th>
        <th class="text-end">Thao tác</th>
      </tr>
    `;
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
        <td>${c.total_items}</td>
        <td>${timeAgo(c.updated_at)}</td>
        <td class="text-end">
          <button class="btn btn-outline-primary btn-sm btn-view-cart me-1" data-id="${c.user_id}">Xem</button>
        </td>
      </tr>
    `).join('');

    renderPagination(page, totalPages, state.totalItems);
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
          <td>${Number(o.total_price || o.total || 0).toLocaleString('vi-VN')} VNĐ</td>
          <td>${o.address || o.shipping_address || '-'}</td>
          <td>${formatPaymentMethod(o.payment_method)}</td>
          <td>${statusDropdownHtml}</td> 
          <td>${o.note || ''}</td>
          <td>${timeAgo(o.created_at)}</td>
          <td class="text-end td-actions">
            <button class="btn btn-outline-success btn-sm btn-save me-1" data-id="${o.id}">Lưu</button>
            <button class="btn btn-outline-primary btn-sm btn-view-order me-1" data-id="${o.id}">Xem</button>
            </td>
            </tr>
            `;

    }).join('');
    renderPagination(page, totalPages, state.totalItems);
  }

  function renderPagination(page, totalPages, totalItems) {
    if (totalPages <= 1) {
      paginationControls.innerHTML = '';
      return;
    }

    const start = (page - 1) * 10 + 1;
    const end = Math.min(page * 10, totalItems);
    document.getElementById('showingRange').textContent = `${start}-${end}`;
    document.getElementById('totalItems').textContent = totalItems;

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
      if (startPage > 2) html += `<li class="page-item disabled"><span class="page-link">...</span></li>`;
    }
    for (let i = startPage; i <= endPage; i++) {
      html += `<li class="page-item ${i === page ? 'active' : ''}"><a class="page-link" href="#" data-page="${i}">${i}</a></li>`;
    }
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) html += `<li class="page-item disabled"><span class="page-link">...</span></li>`;
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

    paginationControls.innerHTML = html;
  }



  async function fetchAndRenderOrders(page, kw, status) {
    document.querySelector(tableBodySel).innerHTML = `<tr><td colspan="8" class="text-center py-4 text-muted">Đang tải dữ liệu...</td></tr>`;
    try {
      let url = `${API_BASE}/orders?page=${page}`;
      if (kw) url += `&search=${encodeURIComponent(kw)}`;
      if (status && status !== 'all') {
        url += `&status=${encodeURIComponent(status)}`;
      }
      const data = await fetchJson(url);
      const orders = data.orders || [];


      state.page = data.pagination?.page || data.page || page;
      state.totalPages = data.pagination?.total_pages || data.total_pages || 1;
      state.totalItems = data.pagination?.total || data.total || 0;
      state.keyword = kw;
      state.status = status;

      renderOrderRows(orders, state.page, state.totalPages);
    } catch (err) {
      console.error("Lỗi khi tải đơn hàng:", err);
      renderOrderRows([], 1, 1);
    }
  }

  async function fetchAndRenderCarts(page, kw) {
    document.querySelector(tableBodySel).innerHTML = `<tr><td colspan="4" class="text-center py-4 text-muted">Đang tải dữ liệu...</td></tr>`;
    try {
      let url = `${API_BASE}/carts?page=${page}`;
      if (kw) url += `&search=${encodeURIComponent(kw)}`;

      const cartsRes = await fetchJson(url);
      const carts = cartsRes.data || cartsRes.carts || cartsRes.cart || [];


      state.page = cartsRes.pagination?.page || cartsRes.page || page;
      state.totalPages = cartsRes.pagination?.total_pages || cartsRes.total_pages || 1;
      state.totalItems = cartsRes.pagination?.total || cartsRes.total || 0;
      state.keyword = kw;

      renderCartRows(carts, state.page, state.totalPages);
    } catch (err) {
      console.error("Lỗi khi tải giỏ hàng:", err);
      renderCartRows([], 1, 1);
    }
  }



  const tabCart = document.getElementById('tab-cart');
  const tabOrders = document.getElementById('tab-orders');
  const searchEl = document.getElementById('ordersSearch');
  const refreshBtn = document.getElementById('btnRefresh');

  const statusFilter = document.createElement('select');
  statusFilter.id = 'orderStatusFilter';
  statusFilter.className = 'form-select me-2';
  statusFilter.style.width = '170px';
  statusFilter.innerHTML = `
    <option value="all">Tất cả trạng thái</option>
    ${Object.entries(STATUS_OPTIONS).map(([value, text]) =>
    `<option value="${value}">${text}</option>`
  ).join('')}
  `;
  refreshBtn.before(statusFilter);
  statusFilter.style.display = 'none';

  tabCart?.addEventListener('click', (e) => {
    e.preventDefault();
    if (state.currentTab === 'cart') return;
    state.currentTab = 'cart';
    state.page = 1;
    state.keyword = '';
    tabCart.classList.add('active');
    tabOrders.classList.remove('active');
    statusFilter.style.display = 'none';
    setHeadForCart();
    loadCurrentTabData();
  });

  tabOrders?.addEventListener('click', (e) => {
    e.preventDefault();
    if (state.currentTab === 'orders') return;
    state.currentTab = 'orders';
    state.page = 1;
    state.keyword = '';
    tabOrders.classList.add('active');
    tabCart.classList.remove('active');
    statusFilter.style.display = 'inline-block';
    setHeadForOrders();
    loadCurrentTabData();
  });

  refreshBtn?.addEventListener('click', (e) => {
    e.preventDefault();
    state.page = 1;
    state.keyword = '';
    state.status = 'all';
    if (searchEl) searchEl.value = '';
    statusFilter.value = 'all';
    loadCurrentTabData();
  });

  searchEl?.addEventListener('input', (e) => {
    state.keyword = e.target.value.trim();
    state.page = 1;
    loadCurrentTabData();
  });

  statusFilter.addEventListener('change', (e) => {
    state.status = e.target.value;
    state.page = 1;
    loadCurrentTabData();
  });

  document.addEventListener('click', async (e) => {

    const pageLink = e.target.closest('.page-link');
    if (pageLink) {
      e.preventDefault();
      const pageItem = pageLink.closest('.page-item');
      if (pageItem.classList.contains('disabled') || pageItem.classList.contains('active')) {
        return;
      }
      state.page = parseInt(pageLink.dataset.page);
      loadCurrentTabData();
      return;
    }


    if (e.target.classList.contains('btn-save')) {
      const saveButton = e.target;
      const id = saveButton.dataset.id;
      const row = saveButton.closest('tr');
      if (!row) return;
      const dropdown = row.querySelector('.order-status-select');
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
        console.error("Lỗi khi lưu đơn hàng:", err);
        alert("Cập nhật trạng thái thất bại!");
      }
      return;
    }


    if (e.target.classList.contains('btn-delete')) {
      const id = e.target.dataset.id;
      if (!confirm('Bạn có chắc muốn xoá đơn hàng này?')) return;
      try {
        await fetch(`${API_BASE}/orders/${id}`, { method: 'DELETE' });
        loadCurrentTabData();
      } catch (err) {
        console.error("Lỗi khi xóa đơn hàng:", err);
      }
      return;
    }

    if (e.target.classList.contains('btn-view-order')) {
      const id = e.target.getAttribute('data-id');
      try {
        const orderRes = await fetchJson(`${API_BASE}/orders/${id}`);
        const order = orderRes.order || orderRes;
        const items = orderRes.items || [];
        let content = `
        <div><strong>ID đơn hàng:</strong> ${order.id}</div>
        <div><strong>Khách hàng:</strong> ${order.user_name || order.user || '-'}</div>
        <div><strong>Địa chỉ giao hàng:</strong> ${order.address || order.shipping_address || '-'}</div>
        <div><strong>Phương thức thanh toán:</strong> ${formatPaymentMethod(order.payment_method)}</div>
        <div><strong>Trạng thái:</strong> ${order.status}</div>
        <div><strong>Ngày tạo:</strong> ${timeAgoWithDate(order.created_at)}</div>
        <hr/>
        <div><strong>Chi tiết sản phẩm:</strong></div>
        <div class="table-responsive">
          <table class="table table-striped">
                        <thead>
              <tr><th></th><th>Sản phẩm</th><th>Màu</th><th>Size</th><th>Số lượng</th><th>Giá</th></tr>
            </thead>
            <tbody>
              ${(items || []).map(i => `
                <tr>
                  <td><img src="${API_BASE + '/' + i.product_image}" alt="sp" style="width:48px;height:48px;object-fit:cover;border-radius:5px;"></td>
                  <td class="text-truncate" style="max-width: 150px;">${i.name || i.product_name || '-'}</td>
                  <td>
                    <div class="d-flex align-items-center gap-2" title="${i.color}">
                      <span class="color-swatch-table" style="background-color: ${i.color}"></span>
                      <span class="text-muted small">${i.color}</span>
                    </div>
                  </td>
                  <td>${i.size || '-'}</td>
                  <td>${i.quantity || 1}</td>
                  <td>${Number(i.price || 0).toLocaleString('vi-VN')} VNĐ</td>
                </tr>
              `).join('')}
            </tbody>
                    </table>
                </div>
        <div><strong>Tổng tiền:</strong> ${Number(order.total_value || order.total_price || 0).toLocaleString('vi-VN')} VNĐ</div>
        `;
        popup.show({ title: `Chi tiết đơn #${order.id}`, content });
      } catch (err) {
        popup.show({ title: 'Lỗi', content: 'Không thể tải chi tiết đơn hàng.' });
      }
    }
    if (e.target.classList.contains('btn-view-cart')) {
      const id = e.target.getAttribute('data-id');
      try {
        const cartRes = await fetchJson(`${API_BASE}/carts/${id}`);
        console.log(cartRes);
        const cart = cartRes.cart;
        const items = cartRes.items || [];
        const total = cartRes.item_count || 0;
        const totalPrice = cartRes.total || 0;
        let content = `
        <div><strong>ID giỏ hàng:</strong> ${cart.id}</div>
        <div><strong>ID người dùng:</strong> ${cart.user_id || '-'}</div>
        <div><strong>Ngày tạo:</strong> ${timeAgoWithDate(cart.created_at)}</div>
        <div><strong>Cập nhật gần nhất:</strong> ${timeAgoWithDate(cart.updated_at)}</div>
        <hr/>
        <div><strong>Chi tiết sản phẩm:</strong></div>
        <div class="table-responsive">
          <table class="table table-striped">
              <thead>
              <tr><th></th><th>Sản phẩm</th><th>Màu</th><th>Size</th><th>Số lượng</th><th>Tạm tính</th></tr>
            </thead>
            <tbody>
              ${(items || []).map(i => `
                <tr>
                  <td><img src="${API_BASE + '/' + i.image}" alt="sp" style="width:48px;height:48px;object-fit:cover;border-radius:5px;"></td>
                  <td class="text-truncate" style="max-width: 150px;">${i.name || i.product_name || '-'}</td>
                  <td>
                    <div class="d-flex align-items-center gap-2" title="${i.color}">
                      <span class="color-swatch-table" style="background-color: ${i.color}"></span>
                      <span class="text-muted small">${i.color}</span>
                    </div>
                  </td>
                  <td>${i.size || '-'}</td>
                  <td>${i.quantity || 1}</td>
                  <td>${Number(i.subtotal || i.price * (i.quantity || 1) || 0).toLocaleString('vi-VN')} VNĐ</td>
                  </tr>
                  `).join('')}
            </tbody>
          </table>
          </div>
          <div><strong>Tổng sản phẩm:</strong> ${total}</div>
          <div><strong>Tổng tiền:</strong> ${Number(totalPrice).toLocaleString('vi-VN')} VNĐ</div>
        `;
        popup.show({ title: `Chi tiết giỏ hàng #${cart.id}`, content });
        // <th>Giá</th>
        // <td>${Number(i.price || 0).toLocaleString('vi-VN')} VNĐ</td>
      } catch (err) {
        console.error(err);
        popup.show({ title: 'Lỗi', content: 'Không thể tải chi tiết giỏ hàng.' });
      }
    }
  });



  await loadCurrentTabData();
});