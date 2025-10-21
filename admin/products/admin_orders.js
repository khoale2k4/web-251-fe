import { ready } from '../../js/main.js';
import { Popup } from '../../components/PopUp.js';
import { mountHeader } from '../../components/Header.js';
import { mountFooter } from '../../components/Footer.js';
import { TableList } from '../../components/TableList.js';

ready(async () => {
  mountHeader('.mount-header', 'admin-orders');
  mountFooter('.mount-footer');

  const popup = new Popup();

  async function fetchData(url) {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      return json.data;
    } catch (err) {
      console.error(`Lỗi khi tải dữ liệu từ ${url}:`, err);
      return null;
    }
  }

  async function putData(url, body = {}) {
    try {
      const res = await fetch(url, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const json = await res.json();
      return json.data;
    } catch (err) {
      console.error(`Lỗi khi gửi PUT tới ${url}:`, err);
      return null;
    }
  }

  const cartRes = await fetchData('http://localhost:8000/carts');
  const orderRes = await fetchData('http://localhost:8000/orders');

  const carts = (cartRes?.cart || []).map(c => ({
    id: c.cart_id,
    user: c.user_name,
    user_id: c.user_id,
    user_email: c.user_email,
    items: c.total_items,
    value: parseFloat(c.total_value),
    created_at: c.created_at
  }));

  const orders = (orderRes?.orders || []).map(o => ({
    id: o.id,
    user: o.user_name,
    email: o.user_email,
    total_price: parseFloat(o.total_price),
    shipping_address: o.shipping_address,
    payment_method: o.payment_method,
    note: o.note,
    status: o.status,
    created_at: o.created_at
  }));

  const cartTable = new TableList({
    containerSelector: '.cart-table-body',
    data: carts,
    searchSelector: '.cart-search',
    columns: [
      { key: 'id', label: 'ID' },
      { key: 'user', label: 'Người dùng' },
      { key: 'items', label: 'Số lượng', render: v => `${v} sản phẩm` },
      { key: 'created_at', label: 'Ngày tạo' },
      {
        key: 'actions',
        render: (_, c) =>

          `<div class="table-actions"><button data-action="view-cart" data-id="${c.user_id}" class="btn-view">Xem</button></div>`
      }
    ]
  });

  const orderTable = new TableList({
    containerSelector: '.order-table-body',
    data: orders,
    searchSelector: '.order-search',
    columns: [
      { key: 'id', label: 'ID' },
      { key: 'user', label: 'Người dùng' },
      {
        key: 'total_price',
        label: 'Tổng tiền',
        render: v => `${v.toLocaleString('vi-VN')} VNĐ`
      },
      {
        key: 'shipping_address',
        label: 'Địa chỉ giao hàng'
      },
      {
        key: 'payment_method',
        label: 'Thanh toán'
      },
      {
        key: 'status',
        label: 'Trạng thái',
        render: (v, o) => `
        <select data-id="${o.id}" data-action="status" class="order-status">
          ${['pending', 'confirmed', 'shipped', 'completed', 'cancelled']
            .map(s => `<option value="${s}" ${s === v ? 'selected' : ''}>${s}</option>`)
            .join('')}
        </select>`
      },
      { key: 'note', label: 'Ghi chú' },
      { key: 'created_at', label: 'Ngày tạo' },
      {
        key: 'actions',
        label: 'Hành động',
        render: (_, o) =>
          `<div class="table-actions">
        <button data-action="save" data-id="${o.id}" class="btn-save">Lưu</button>
         <button data-action="view-order" data-id="${o.id}" class="btn-view">Xem</button>
         </div>
         `
      }
    ]
  });

  const showOrderPopup = async (id) => {
    const res = await fetchData(`http://localhost:8000/orders/${id}`);

    const order = res.order;
    if (!order) return;
    const items = res.items;


    const content = `
    <p><strong>ID đơn hàng:</strong> ${order.id}</p>
    <p><strong>Khách hàng:</strong> ${order.user_name}</p>
    <p><strong>Địa chỉ giao hàng:</strong> ${order.shipping_address}</p>
    <p><strong>Phương thức thanh toán:</strong> ${order.payment_method}</p>
    <p><strong>Trạng thái:</strong> ${order.status}</p>
    <p><strong>Ngày tạo:</strong> ${order.created_at}</p>
    <hr>
    <h4>Chi tiết sản phẩm</h4>

            <div class="table-wrapper">
                <div class="product-detail-table">
                    <table class="table-list">
                        <thead>
                            <tr>
          <th></th>
          <th>Sản phẩm</th>
          <th>Màu</th>
          <th>Size</th>
          <th>Số lượng</th>
          <th>Giá</th>
                            </tr>
                        </thead>
                        <tbody class="product-detail-body"></tbody>
                    </table>
                </div>
            </div>
    <hr>
    <p><strong>Tổng tiền:</strong> ${order.total_price.toLocaleString('vi-VN')} VNĐ</p>
  `;

    popup.show({ title: `Đơn hàng #${id}`, content });
    const productTable = new TableList({
      containerSelector: '.product-detail-body',
      data: items,
      columns: [
        {
          key: 'product_image',
          label: 'Hình ảnh',
          render: v => `<img src="${v}" alt="product" style="width:60px; height:60px; object-fit:cover; border-radius:6px;">`
        },
        { key: 'product_name', label: 'Sản phẩm' },
        { key: 'color', label: 'Màu' },
        { key: 'size', label: 'Kích thước' },
        { key: 'quantity', label: 'Số lượng' },
        {
          key: 'price',
          label: 'Giá',
          render: v => `${v.toLocaleString('vi-VN')} VNĐ`
        }
      ]
    });
  }

  const showCartPopup = async (id) => {
    try {
      const res = await fetchData(`http://localhost:8000/carts/${id}`);

      const cart = res.cart;
      const items = res.items || [];
      const total = Number(res.total) || 0;
      const itemCount = res.item_count || 0;

      let content = `
      <p><strong>ID giỏ hàng:</strong> ${cart.id}</p>
      <p><strong>ID người dùng:</strong> ${cart.user_id}</p>
      <p><strong>Ngày tạo:</strong> ${cart.created_at}</p>
      <p><strong>Cập nhật gần nhất:</strong> ${cart.updated_at}</p>
      <hr>
      <h4>Chi tiết sản phẩm</h4>
    `;

      if (items.length === 0) {
        content += `
        <p style="text-align:center; padding:20px;">Giỏ hàng trống.</p>
      `;
      } else {
        content += `
        <div class="table-wrapper">
          <div class="product-detail-table">
            <table class="table-list">
              <thead>
                <tr>
                  <th></th>
                  <th>Sản phẩm</th>
                  <th>Màu</th>
                  <th>Size</th>
                  <th>Số lượng</th>
                  <th>Giá</th>
                  <th>Tạm tính</th>
                </tr>
              </thead>
              <tbody class="product-detail-body"></tbody>
            </table>
          </div>
        </div>
        <hr>
        <p><strong>Tổng sản phẩm:</strong> ${itemCount}</p>
        <p><strong>Tổng tiền:</strong> ${total.toLocaleString('vi-VN')} VNĐ</p>
      `;
      }

      popup.show({ title: `Giỏ hàng #${id}`, content });

      if (items.length > 0) {
        new TableList({
          containerSelector: '.product-detail-body',
          data: items,
          columns: [
            {
              key: 'image',
              label: 'Hình ảnh',
              render: v => `<img src="${v}" alt="product" style="width:60px; height:60px; object-fit:cover; border-radius:6px;">`
            },
            { key: 'product_name', label: 'Sản phẩm' },
            { key: 'color', label: 'Màu' },
            { key: 'size', label: 'Size' },
            { key: 'quantity', label: 'Số lượng' },
            {
              key: 'price',
              label: 'Giá',
              render: v => `${Number(v).toLocaleString('vi-VN')} VNĐ`
            },
            {
              key: 'subtotal',
              label: 'Tạm tính',
              render: v => `${Number(v).toLocaleString('vi-VN')} VNĐ`
            }
          ]
        });
      }
    } catch (error) {
      console.error("Lỗi khi tải giỏ hàng:", error);
      alert("Đã xảy ra lỗi khi tải giỏ hàng.");
    }
  };

  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.btn-view');
    if (!btn) return;

    const action = btn.dataset.action;
    const id = btn.dataset.id;

    if (action === 'view-order') {
      showOrderPopup(parseInt(id));
    } else if (action === 'view-cart') {
      showCartPopup(parseInt(id));
    }

  });

  const saveOrderStatus = async (orderId, status) => {
    try {
      const body = { status }; // { "status": "confirmed" }

      const data = await putData(`http://localhost:8000/orders/${orderId}/status`, body);

      if (data) {
        alert(`Cập nhật trạng thái đơn hàng #${orderId} thành công!`);
      } else {
        alert(`Không thể cập nhật đơn hàng #${orderId}`);
      }
    } catch (err) {
      console.error(`Lỗi khi cập nhật trạng thái đơn hàng #${orderId}:`, err);
      alert(`⚠️ Có lỗi xảy ra khi cập nhật đơn hàng #${orderId}`);
    }
  };

  document.addEventListener('click', (e) => {
    if (e.target.matches('.btn-save')) {
      const id = e.target.dataset.id;
      const select = document.querySelector(`select[data-id="${id}"]`);
      const status = select.value;
      saveOrderStatus(id, status);
    }
  });

  const tabCart = document.querySelector('#tab-cart');
  const tabOrders = document.querySelector('#tab-orders');
  const cartSection = document.querySelector('#cart-section');
  const ordersSection = document.querySelector('#orders-section');

  tabCart.addEventListener('click', () => {
    tabCart.classList.add('active');
    tabOrders.classList.remove('active');
    cartSection.classList.add('active');
    ordersSection.classList.remove('active');
  });

  tabOrders.addEventListener('click', () => {
    tabOrders.classList.add('active');
    tabCart.classList.remove('active');
    ordersSection.classList.add('active');
    cartSection.classList.remove('active');
  });
});
