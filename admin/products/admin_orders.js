import { ready } from '../../js/main.js';
import { BASE_URL } from '../../js/config.js';

ready(async () => {
  const API_BASE = BASE_URL;

  const tableHeadSel = '#ordersTableHead';
  const tableBodySel = '#ordersTableBody';

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
      return;
    }
    tbody.innerHTML = carts.map(c => `
      <tr>
        <td>${c.user_name || c.user || '-'}</td>
        <td>${c.items?.length ?? c.num_items ?? 0}</td>
        <td>${c.updated_at || '-'}</td>
        <td class="text-end"><button class="btn btn-secondary btn-view" data-id="${c.id}">Xem</button></td>
      </tr>
    `).join('');
  }

  function renderOrderRows(orders) {
    const tbody = document.querySelector(tableBodySel);
    if (!Array.isArray(orders) || orders.length === 0) {
      tbody.innerHTML = `<tr><td colspan="8" class="text-center py-4 text-muted">Không có dữ liệu</td></tr>`;
      return;
    }
    tbody.innerHTML = orders.map(o => `
      <tr>
        <td>${o.user_name || o.user || '-'}</td>
        <td>${Number(o.total || 0).toLocaleString('vi-VN')} VNĐ</td>
        <td>${o.address || '-'}</td>
        <td>${o.payment_method || '-'}</td>
        <td><span class="${o.status === 'approved' ? 'status-approved' : 'status-pending'}">${o.status || 'pending'}</span></td>
        <td>${o.note || ''}</td>
        <td>${o.created_at || '-'}</td>
        <td class="text-end">
          <button class="btn btn-success btn-approve" data-id="${o.id}">Duyệt</button>
          <button class="btn btn-danger btn-reject" data-id="${o.id}">Hủy</button>
        </td>
      </tr>
    `).join('');
  }

  // Default: load cart tab
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

  tabOrders?.addEventListener('click', async (e) => {
    e.preventDefault();
    if (currentTab === 'orders') return;
    currentTab = 'orders';
    tabOrders.classList.add('active');
    tabCart.classList.remove('active');
    setHeadForOrders();
    document.querySelector(tableBodySel).innerHTML = `<tr><td colspan="8" class="text-center py-4 text-muted">Đang tải dữ liệu...</td></tr>`;
    try {
      const ordersRes = await fetchJson(`${API_BASE}/orders`);
      renderOrderRows(ordersRes.data || ordersRes.orders || []);
    } catch {}
  });

  // Search in current tab
  searchInput?.addEventListener('input', async (e) => {
    const kw = e.target.value.trim();
    if (currentTab === 'cart') {
      try {
        const cartsRes = await fetchJson(`${API_BASE}/carts?search=${encodeURIComponent(kw)}`);
        renderCartRows(cartsRes.data || cartsRes.carts || cartsRes.cart || []);
      } catch {}
    } else {
      try {
        const ordersRes = await fetchJson(`${API_BASE}/orders?search=${encodeURIComponent(kw)}`);
        renderOrderRows(ordersRes.data || ordersRes.orders || []);
      } catch {}
    }
  });
});

// import { ready } from '../../js/main.js';
// import { Popup } from '../../components/PopUp.js';
// import { mountHeader } from '../../components/Header.js';
// import { mountFooter } from '../../components/Footer.js';
// import { TableList } from '../../components/TableList.js';

// ready(async () => {
//   mountHeader('.mount-header', 'admin-orders');
//   mountFooter('.mount-footer');

//   const popup = new Popup();

//   async function fetchData(url) {
//     try {
//       const res = await fetch(url);
//       if (!res.ok) throw new Error(`HTTP ${res.status}`);
//       const json = await res.json();
//       return json.data;
//     } catch (err) {
//       console.error(`Lỗi khi tải dữ liệu từ ${url}:`, err);
//       return null;
//     }
//   }

//   async function putData(url, body = {}) {
//     try {
//       const res = await fetch(url, {
//         method: "PUT",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify(body),
//       });

//       if (!res.ok) throw new Error(`HTTP ${res.status}`);

//       const json = await res.json();
//       return json.data;
//     } catch (err) {
//       console.error(`Lỗi khi gửi PUT tới ${url}:`, err);
//       return null;
//     }
//   }

//   const cartRes = await fetchData('http://localhost:8000/carts');
//   const orderRes = await fetchData('http://localhost:8000/orders');

//   const carts = (cartRes?.cart || []).map(c => ({
//     id: c.cart_id,
//     user: c.user_name,
//     user_id: c.user_id,
//     user_email: c.user_email,
//     items: c.total_items,
//     value: parseFloat(c.total_value),
//     created_at: c.created_at
//   }));

//   const orders = (orderRes?.orders || []).map(o => ({
//     id: o.id,
//     user: o.user_name,
//     email: o.user_email,
//     total_price: parseFloat(o.total_price),
//     shipping_address: o.shipping_address,
//     payment_method: o.payment_method,
//     note: o.note,
//     status: o.status,
//     created_at: o.created_at
//   }));

//   const cartTable = new TableList({
//     containerSelector: '.cart-table-body',
//     data: carts,
//     searchSelector: '.cart-search',
//     columns: [
//       { key: 'user', label: 'Người dùng' },
//       { key: 'items', label: 'Số lượng', render: v => `${v} sản phẩm` },
//       { key: 'created_at', label: 'Ngày tạo' },
//       {
//         key: 'actions',
//         render: (_, c) =>

//           `<div class="table-actions"><button data-action="view-cart" data-id="${c.user_id}" class="btn-view">Xem</button></div>`
//       }
//     ]
//   });

//   const orderTable = new TableList({
//     containerSelector: '.order-table-body',
//     data: orders,
//     searchSelector: '.order-search',
//     columns: [
//       { key: 'user', label: 'Người dùng' },
//       {
//         key: 'total_price',
//         label: 'Tổng tiền',
//         render: v => `${v.toLocaleString('vi-VN')} VNĐ`
//       },
//       {
//         key: 'shipping_address',
//         label: 'Địa chỉ giao hàng'
//       },
//       {
//         key: 'payment_method',
//         label: 'Thanh toán'
//       },
//       {
//         key: 'status',
//         label: 'Trạng thái',
//         render: (v, o) => `
//         <select data-id="${o.id}" data-action="status" class="order-status">
//           ${['pending', 'confirmed', 'shipped', 'completed', 'cancelled']
//             .map(s => `<option value="${s}" ${s === v ? 'selected' : ''}>${s}</option>`)
//             .join('')}
//         </select>`
//       },
//       { key: 'note', label: 'Ghi chú' },
//       { key: 'created_at', label: 'Ngày tạo' },
//       {
//         key: 'actions',
//         label: 'Hành động',
//         render: (_, o) =>
//           `<div class="table-actions">
//         <button data-action="save" data-id="${o.id}" class="btn-save">Lưu</button>
//          <button data-action="view-order" data-id="${o.id}" class="btn-view">Xem</button>
//          </div>
//          `
//       }
//     ]
//   });

//   const showOrderPopup = async (id) => {
//     const res = await fetchData(`http://localhost:8000/orders/${id}`);

//     const order = res.order;
//     if (!order) return;
//     const items = res.items;


//     const content = `
//     <p><strong>ID đơn hàng:</strong> ${order.id}</p>
//     <p><strong>Khách hàng:</strong> ${order.user_name}</p>
//     <p><strong>Địa chỉ giao hàng:</strong> ${order.shipping_address}</p>
//     <p><strong>Phương thức thanh toán:</strong> ${order.payment_method}</p>
//     <p><strong>Trạng thái:</strong> ${order.status}</p>
//     <p><strong>Ngày tạo:</strong> ${order.created_at}</p>
//     <hr>
//     <h4>Chi tiết sản phẩm</h4>

//             <div class="table-wrapper">
//                 <div class="product-detail-table">
//                     <table class="table-list">
//                         <thead>
//                             <tr>
//           <th></th>
//           <th>Sản phẩm</th>
//           <th>Màu</th>
//           <th>Size</th>
//           <th>Số lượng</th>
//           <th>Giá</th>
//                             </tr>
//                         </thead>
//                         <tbody class="product-detail-body"></tbody>
//                     </table>
//                 </div>
//             </div>
//     <hr>
//     <p><strong>Tổng tiền:</strong> ${order.total_price.toLocaleString('vi-VN')} VNĐ</p>
//   `;

//     popup.show({ title: `Đơn hàng #${id}`, content });
//     const productTable = new TableList({
//       containerSelector: '.product-detail-body',
//       data: items,
//       columns: [
//         {
//           key: 'product_image',
//           label: 'Hình ảnh',
//           render: v => `<img src="${v}" alt="product" style="width:60px; height:60px; object-fit:cover; border-radius:6px;">`
//         },
//         { key: 'product_name', label: 'Sản phẩm' },
//         { key: 'color', label: 'Màu' },
//         { key: 'size', label: 'Kích thước' },
//         { key: 'quantity', label: 'Số lượng' },
//         {
//           key: 'price',
//           label: 'Giá',
//           render: v => `${v.toLocaleString('vi-VN')} VNĐ`
//         }
//       ]
//     });
//   }

//   const showCartPopup = async (id) => {
//     try {
//       const res = await fetchData(`http://localhost:8000/carts/${id}`);

//       const cart = res.cart;
//       const items = res.items || [];
//       const total = Number(res.total) || 0;
//       const itemCount = res.item_count || 0;

//       let content = `
//       <p><strong>ID giỏ hàng:</strong> ${cart.id}</p>
//       <p><strong>ID người dùng:</strong> ${cart.user_id}</p>
//       <p><strong>Ngày tạo:</strong> ${cart.created_at}</p>
//       <p><strong>Cập nhật gần nhất:</strong> ${cart.updated_at}</p>
//       <hr>
//       <h4>Chi tiết sản phẩm</h4>
//     `;

//       if (items.length === 0) {
//         content += `
//         <p style="text-align:center; padding:20px;">Giỏ hàng trống.</p>
//       `;
//       } else {
//         content += `
//         <div class="table-wrapper">
//           <div class="product-detail-table">
//             <table class="table-list">
//               <thead>
//                 <tr>
//                   <th></th>
//                   <th>Sản phẩm</th>
//                   <th>Màu</th>
//                   <th>Size</th>
//                   <th>Số lượng</th>
//                   <th>Giá</th>
//                   <th>Tạm tính</th>
//                 </tr>
//               </thead>
//               <tbody class="product-detail-body"></tbody>
//             </table>
//           </div>
//         </div>
//         <hr>
//         <p><strong>Tổng sản phẩm:</strong> ${itemCount}</p>
//         <p><strong>Tổng tiền:</strong> ${total.toLocaleString('vi-VN')} VNĐ</p>
//       `;
//       }

//       popup.show({ title: `Giỏ hàng #${id}`, content });

//       if (items.length > 0) {
//         new TableList({
//           containerSelector: '.product-detail-body',
//           data: items,
//           columns: [
//             {
//               key: 'image',
//               label: 'Hình ảnh',
//               render: v => `<img src="${v}" alt="product" style="width:60px; height:60px; object-fit:cover; border-radius:6px;">`
//             },
//             { key: 'product_name', label: 'Sản phẩm' },
//             { key: 'color', label: 'Màu' },
//             { key: 'size', label: 'Size' },
//             { key: 'quantity', label: 'Số lượng' },
//             {
//               key: 'price',
//               label: 'Giá',
//               render: v => `${Number(v).toLocaleString('vi-VN')} VNĐ`
//             },
//             {
//               key: 'subtotal',
//               label: 'Tạm tính',
//               render: v => `${Number(v).toLocaleString('vi-VN')} VNĐ`
//             }
//           ]
//         });
//       }
//     } catch (error) {
//       console.error("Lỗi khi tải giỏ hàng:", error);
//     }
//   };

//   document.addEventListener('click', (e) => {
//     const btn = e.target.closest('.btn-view');
//     if (!btn) return;

//     const action = btn.dataset.action;
//     const id = btn.dataset.id;

//     if (action === 'view-order') {
//       showOrderPopup(parseInt(id));
//     } else if (action === 'view-cart') {
//       showCartPopup(parseInt(id));
//     }

//   });

//   const saveOrderStatus = async (orderId, status) => {
//     try {
//       const body = { status }; // { "status": "confirmed" }

//       const data = await putData(`http://localhost:8000/orders/${orderId}/status`, body);
//     } catch (err) {
//       console.error(`Lỗi khi cập nhật trạng thái đơn hàng #${orderId}:`, err);
//     }
//   };

//   document.addEventListener('click', (e) => {
//     if (e.target.matches('.btn-save')) {
//       const id = e.target.dataset.id;
//       const select = document.querySelector(`select[data-id="${id}"]`);
//       const status = select.value;
//       saveOrderStatus(id, status);
//     }
//   });

//   const tabCart = document.querySelector('#tab-cart');
//   const tabOrders = document.querySelector('#tab-orders');
//   const cartSection = document.querySelector('#cart-section');
//   const ordersSection = document.querySelector('#orders-section');

//   tabCart.addEventListener('click', () => {
//     tabCart.classList.add('active');
//     tabOrders.classList.remove('active');
//     cartSection.classList.add('active');
//     ordersSection.classList.remove('active');
//   });

//   tabOrders.addEventListener('click', () => {
//     tabOrders.classList.add('active');
//     tabCart.classList.remove('active');
//     ordersSection.classList.add('active');
//     cartSection.classList.remove('active');
//   });
// });
