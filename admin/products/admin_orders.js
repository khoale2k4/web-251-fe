import { ready } from '../../js/main.js';
import { Popup } from '../../components/PopUp.js';
import { mountHeader } from '../../components/Header.js';
import { mountFooter } from '../../components/Footer.js';
import { TableList } from '../../components/TableList.js';

ready(() => {
  mountHeader('.mount-header', 'admin-orders');
  mountFooter('.mount-footer');

  const popup = new Popup();

  const carts = [
    { id: 1, user: 'khoa', items: 3, created_at: '2025-10-18', },
    { id: 2, user: 'an', items: 1, created_at: '2025-10-19', },
    { id: 3, user: 'linh', items: 5, created_at: '2025-10-17', },
    { id: 4, user: 'huy', items: 2, created_at: '2025-10-16', },
    { id: 5, user: 'thảo', items: 4, created_at: '2025-10-15', },
    { id: 6, user: 'minh', items: 7, created_at: '2025-10-15', },
    { id: 7, user: 'phúc', items: 2, created_at: '2025-10-14', },
    { id: 8, user: 'loan', items: 3, created_at: '2025-10-13', },
    { id: 9, user: 'nam', items: 6, created_at: '2025-10-12', },
    { id: 10, user: 'lan', items: 1, created_at: '2025-10-11', }
  ];

  const orders = [
    {
      id: 1,
      user: 'khoa',
      total_price: 2000000,
      status: 'pending',
      shipping_address: '123 Nguyễn Huệ, Q.1, TP.HCM',
      payment_method: 'Bank Transfer',
      note: 'Giao hàng trong giờ hành chính',
      created_at: '2025-10-18 10:30'
    },
    {
      id: 2,
      user: 'an',
      total_price: 3200000,
      status: 'confirmed',
      shipping_address: '45 Lê Lợi, Q.3, TP.HCM',
      payment_method: 'COD',
      note: '',
      created_at: '2025-10-17 15:20'
    },
    {
      id: 3,
      user: 'linh',
      total_price: 480000,
      status: 'shipped',
      shipping_address: '12 Phan Xích Long, Q.Phú Nhuận',
      payment_method: 'Credit Card',
      note: 'Gọi trước khi giao',
      created_at: '2025-10-16 09:10'
    },
    {
      id: 4,
      user: 'huy',
      total_price: 1150000,
      status: 'completed',
      shipping_address: '21 Nguyễn Văn Cừ, Q.5',
      payment_method: 'Momo',
      note: '',
      created_at: '2025-10-15 19:45'
    },
    {
      id: 5,
      user: 'thảo',
      total_price: 2500000,
      status: 'cancelled',
      shipping_address: '89 Võ Văn Kiệt, Q.1',
      payment_method: 'COD',
      note: 'Khách đổi ý',
      created_at: '2025-10-14 11:00'
    }
  ];

  const products = [
    { id: 1, name: 'Giày Nike Air Max', price: 1500000, size: '42', color: 'Đen' },
    { id: 2, name: 'Adidas Ultraboost', price: 2200000, size: '41', color: 'Trắng' },
    { id: 3, name: 'Converse Classic', price: 900000, size: '40', color: 'Xanh navy' },
    { id: 4, name: 'Vans Old Skool', price: 1100000, size: '43', color: 'Đen trắng' },
    { id: 5, name: 'Puma RS-X', price: 1300000, size: '42', color: 'Đỏ' },
  ];

  const order_items = [
    { id: 1, order_id: 1, product_id: 1, quantity: 1, price: 1500000 },
    { id: 2, order_id: 1, product_id: 3, quantity: 1, price: 500000 },
    { id: 3, order_id: 2, product_id: 2, quantity: 1, price: 2200000 },
    { id: 4, order_id: 2, product_id: 5, quantity: 1, price: 1000000 },
    { id: 5, order_id: 3, product_id: 4, quantity: 2, price: 960000 },
    { id: 6, order_id: 4, product_id: 3, quantity: 1, price: 900000 },
    { id: 7, order_id: 4, product_id: 5, quantity: 1, price: 250000 },
    { id: 8, order_id: 5, product_id: 1, quantity: 2, price: 3000000 },
  ];

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
          `<button data-action="view" data-id="${c.id}" class="btn-view">Xem</button>`
      }
    ]
  });

  cartTable.onView = (id) => alert(`Xem chi tiết giỏ hàng #${id}`);

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
          `<button data-action="save" data-id="${o.id}" class="btn-save">Lưu</button>
         <button data-action="view" data-id="${o.id}" class="btn-view">Xem</button>`
      }
    ]
  });

  document.addEventListener('click', (e) => {
    if (e.target.matches('.btn-save')) {
      const id = e.target.dataset.id;
      const select = document.querySelector(`select[data-id="${id}"]`);
      const status = select.value;
      alert(`Cập nhật trạng thái đơn hàng #${id}: ${status}`);
    }
  });

  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.btn-view');
    if (!btn) return;

    const id = parseInt(btn.dataset.id);
    const order = orders.find(o => o.id === id);
    if (!order) return;

    const items = order_items.filter(i => i.order_id === id).map(i => {
      const product = products.find(p => p.id === i.product_id);
      return {
        ...i,
        product_name: product?.name || 'Không xác định',
        color: product?.color,
        size: product?.size
      };
    });

    console.log(items);

    const content = `
    <p><strong>ID đơn hàng:</strong> ${order.id}</p>
    <p><strong>Khách hàng:</strong> ${order.user}</p>
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
