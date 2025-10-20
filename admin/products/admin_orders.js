import { ready } from '../../js/main.js';
import { mountHeader } from '../../components/Header.js';
import { mountFooter } from '../../components/Footer.js';
import { TableList } from '../../components/TableList.js';

ready(() => {
  mountHeader('.mount-header', 'admin-orders');
  mountFooter('.mount-footer');

  const carts = [
    { id: 1, user: 'khoa', created_at: '2025-10-18', items: 3 },
    { id: 2, user: 'an', created_at: '2025-10-19', items: 1 },
    { id: 3, user: 'linh', created_at: '2025-10-17', items: 5 },
    { id: 4, user: 'huy', created_at: '2025-10-16', items: 2 },
    { id: 5, user: 'thảo', created_at: '2025-10-15', items: 4 },
    { id: 6, user: 'minh', created_at: '2025-10-15', items: 7 },
    { id: 7, user: 'phúc', created_at: '2025-10-14', items: 2 },
    { id: 8, user: 'loan', created_at: '2025-10-13', items: 3 },
    { id: 9, user: 'nam', created_at: '2025-10-12', items: 6 },
    { id: 10, user: 'lan', created_at: '2025-10-11', items: 1 }
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

  const cartTable = new TableList({
    containerSelector: '.cart-table-body',
    data: carts,
    searchSelector: '.cart-search',
    columns: [
      { key: 'id', label: 'ID' },
      { key: 'user', label: 'Người dùng' },
      { key: 'created_at', label: 'Ngày tạo' },
      { key: 'items', label: 'Số lượng', render: v => `${v} sản phẩm` },
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
         <button data-action="delete" data-id="${o.id}" class="btn-delete">Xóa</button>`
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
