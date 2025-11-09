import { ready } from '../../js/main.js';
import { BASE_URL } from '../../js/config.js';
import { Popup } from '../../components/PopUp.js';

ready(async () => {
  const API_BASE = BASE_URL;
  const popup = new Popup();
  const tableHeadSel = '#ordersTableHead';
  const tableBodySel = '#ordersTableBody';
  const paginationSel = '#ordersPagination';

  async function fetchJson(url) {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return (await res.json()).data;
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

  function renderCartRows(carts) {
    const tbody = document.querySelector(tableBodySel);
    if (!Array.isArray(carts) || carts.length === 0) {
      tbody.innerHTML = `<tr><td colspan="4" class="text-center py-4 text-muted">Không có dữ liệu</td></tr>`;
      document.querySelector(paginationSel).innerHTML = '';
      return;
    }
    tbody.innerHTML = carts.map(c => `
      <tr>
        <td>${c.user_name || c.user || '-'}</td>
        <td>${c.total_items}</td>
        <td>${c.updated_at || '-'}</td>
        <td class="text-end"><button class="btn btn-secondary btn-view-cart" data-id="${c.user_id}">Xem</button></td>
      </tr>
    `).join('');
    document.querySelector(paginationSel).innerHTML = '';
  }

  function renderOrderRows(orders, page = 1, totalPages = 1) {
    const tbody = document.querySelector(tableBodySel);
    if (!Array.isArray(orders) || orders.length === 0) {
      tbody.innerHTML = `<tr><td colspan="8" class="text-center py-4 text-muted">Không có dữ liệu</td></tr>`;
      renderPagination(1,1);
      return;
    }
    tbody.innerHTML = orders.map(o => `
      <tr>
        <td>${o.user_name || o.user || '-'}</td>
        <td>${Number(o.total_price || o.total || 0).toLocaleString('vi-VN')} VNĐ</td>
        <td>${o.address || o.shipping_address || '-'}</td>
        <td>${o.payment_method || '-'}</td>
        <td><span class="${o.status === 'approved' ? 'status-approved' : 'status-pending'}">${o.status || 'pending'}</span></td>
        <td>${o.note || ''}</td>
        <td>${o.created_at || '-'}</td>
        <td class="text-end">
          <button class="btn btn-success btn-save" data-id="${o.id}">Lưu</button>
          <button class="btn btn-danger btn-delete" data-id="${o.id}">Xoá</button>
          <button class="btn btn-secondary btn-view-order" data-id="${o.id}">Xem</button>
        </td>
      </tr>
    `).join('');
    renderPagination(page, totalPages);
  }

  function renderPagination(page, totalPages) {
    const pagDiv = document.querySelector(paginationSel);
    if (!pagDiv) return;
    if (totalPages <= 1) {
      pagDiv.innerHTML = '';
      return;
    }
    let h = '';
    if (page > 1) h += `<button class='btn btn-sm btn-outline-primary m-1' data-page='${page-1}'>‹</button>`;
    for (let i = 1; i <= totalPages; ++i) {
      h += `<button class='btn btn-sm m-1 ${i===page?'btn-primary':'btn-outline-primary'}' data-page='${i}'>${i}</button>`;
    }
    if (page < totalPages) h += `<button class='btn btn-sm btn-outline-primary m-1' data-page='${page+1}'>›</button>`;
    pagDiv.innerHTML = h;
  }

  // ----- Logic Tab/Load -----
  setHeadForCart();
  document.querySelector(tableBodySel).innerHTML = `<tr><td colspan="4" class="text-center py-4 text-muted">Đang tải dữ liệu...</td></tr>`;
  try {
    const cartsRes = await fetchJson(`${API_BASE}/carts`);
    renderCartRows(cartsRes.data || cartsRes.carts || cartsRes.cart || []);
  } catch (err) {
    console.error('Lỗi tải giỏ hàng:', err);
  }

  const tabCart = document.getElementById('tab-cart');
  const tabOrders = document.getElementById('tab-orders');
  const searchInput = document.getElementById('ordersSearch');
  let currentTab = 'cart';
  let ordersPage = 1;
  let ordersTotalPages = 1;
  let ordersLastKw = '';

  tabCart?.addEventListener('click', async (e) => {
    e.preventDefault();
    if (currentTab === 'cart') return;
    currentTab = 'cart';
    tabCart.classList.add('active');
    tabOrders.classList.remove('active');
    setHeadForCart();
    document.querySelector(tableBodySel).innerHTML = `<tr><td colspan="4" class="text-center py-4 text-muted">Đang tải dữ liệu...</td></tr>`;
    try {
      const cartsRes = await fetchJson(`${API_BASE}/carts`);
      renderCartRows(cartsRes.data || cartsRes.carts || cartsRes.cart || []);
    } catch {}
  });

  async function fetchAndRenderOrders(page=1, kw='') {
    document.querySelector(tableBodySel).innerHTML = `<tr><td colspan="8" class="text-center py-4 text-muted">Đang tải dữ liệu...</td></tr>`;
    try {
      let url = `${API_BASE}/orders`;
      if (kw) url += `&search=${encodeURIComponent(kw)}`;
      const data = await fetchJson(url); // data: {orders, total_pages}
      const orders = data.orders || [];
      ordersTotalPages = data.total_pages || 1;
      ordersPage = page;
      ordersLastKw = kw;
      renderOrderRows(orders, ordersPage, ordersTotalPages);
    } catch {
      renderOrderRows([], 1, 1);
    }
  }

  tabOrders?.addEventListener('click', (e) => {
    e.preventDefault();
    if (currentTab === 'orders') return;
    currentTab = 'orders';
    tabOrders.classList.add('active');
    tabCart.classList.remove('active');
    setHeadForOrders();
    fetchAndRenderOrders(1, '');
  });

  searchInput?.addEventListener('input', async (e) => {
    const kw = e.target.value.trim();
    if (currentTab === 'cart') {
      try {
        const cartsRes = await fetchJson(`${API_BASE}/carts`);
        renderCartRows(cartsRes.data || cartsRes.carts || cartsRes.cart || []);
      } catch {}
    } else {
      fetchAndRenderOrders(1, kw);
    }
  });

  document.addEventListener('click', async (e) => {
    // --- Pagination event for orders ---
    if (
      currentTab === 'orders' &&
      e.target.closest('#ordersPagination button[data-page]')
    ) {
      const btn = e.target.closest('button[data-page]');
      const page = parseInt(btn.dataset.page);
      fetchAndRenderOrders(page, ordersLastKw);
      return;
    }
    // Nút save và delete chỉ xuất hiện ở bảng Đơn hàng
    if (e.target.classList.contains('btn-save')) {
      const id = e.target.dataset.id;
      try {
        await fetch(`${API_BASE}/orders/${id}/status`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'confirmed' }) });
        fetchAndRenderOrders(ordersPage, ordersLastKw);
      } catch {}
      return;
    }
    if (e.target.classList.contains('btn-delete')) {
      const id = e.target.dataset.id;
      if (!confirm('Bạn có chắc muốn xoá đơn hàng này?')) return;
      try {
        await fetch(`${API_BASE}/orders/${id}`, { method: 'DELETE' });
        fetchAndRenderOrders(ordersPage, ordersLastKw);
      } catch {}
      return;
    }
    // Popup chi tiết
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
        <div><strong>Phương thức thanh toán:</strong> ${order.payment_method || '-'}</div>
        <div><strong>Trạng thái:</strong> ${order.status}</div>
        <div><strong>Ngày tạo:</strong> ${order.created_at}</div>
        <hr/>
        <div><strong>Chi tiết sản phẩm:</strong></div>
        <div class="table-responsive">
          <table class="table table-striped">
                        <thead>
              <tr><th></th><th>Sản phẩm</th><th>Màu</th><th>Size</th><th>Số lượng</th><th>Giá</th></tr>
            </thead>
            <tbody>
              ${(items||[]).map(i => `
                <tr>
                  <td><img src="${BASE_URL + '/' + i.product_image}" alt="sp" style="width:48px;height:48px;object-fit:cover;border-radius:5px;"></td>
                  <td>${i.name || i.product_name || '-'}</td>
                  <td>${i.color || '-'}</td>
                  <td>${i.size || '-'}</td>
                  <td>${i.quantity || 1}</td>
                  <td>${Number(i.price || 0).toLocaleString('vi-VN')} VNĐ</td>
                            </tr>
              `).join('')}
            </tbody>
                    </table>
                </div>
        <div><strong>Tổng tiền:</strong> ${Number(order.total || order.total_price || 0).toLocaleString('vi-VN')} VNĐ</div>
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
        const cart = cartRes.cart || cartRes;
        const items = cartRes.items || [];
      let content = `
        <div><strong>ID giỏ hàng:</strong> ${cart.id}</div>
        <div><strong>ID người dùng:</strong> ${cart.user_id || '-'}</div>
        <div><strong>Ngày tạo:</strong> ${cart.created_at || '-'}</div>
        <div><strong>Cập nhật gần nhất:</strong> ${cart.updated_at || '-'}</div>
        <hr/>
        <div><strong>Chi tiết sản phẩm:</strong></div>
        <div class="table-responsive">
          <table class="table table-striped">
              <thead>
              <tr><th></th><th>Sản phẩm</th><th>Màu</th><th>Size</th><th>Số lượng</th><th>Giá</th><th>Tạm tính</th></tr>
            </thead>
            <tbody>
              ${(items||[]).map(i => `
                <tr>
                  <td><img src="${BASE_URL + '/' + i.image}" alt="sp" style="width:48px;height:48px;object-fit:cover;border-radius:5px;"></td>
                  <td>${i.name || i.product_name || '-'}</td>
                  <td>${i.color || '-'}</td>
                  <td>${i.size || '-'}</td>
                  <td>${i.quantity || 1}</td>
                  <td>${Number(i.price || 0).toLocaleString('vi-VN')} VNĐ</td>
                  <td>${Number(i.subtotal || i.price * (i.quantity||1) || 0).toLocaleString('vi-VN')} VNĐ</td>
                </tr>
              `).join('')}
            </tbody>
            </table>
        </div>
        <div><strong>Tổng sản phẩm:</strong> ${items.length}</div>
        <div><strong>Tổng tiền:</strong> ${Number(cart.total || cart.total_value || 0).toLocaleString('vi-VN')} VNĐ</div>
        `;
        popup.show({ title: `Chi tiết giỏ hàng #${cart.id}`, content });
      } catch (err) {
        popup.show({ title: 'Lỗi', content: 'Không thể tải chi tiết giỏ hàng.' });
      }
    }
  });
});
