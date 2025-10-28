import { ready } from '../../js/main.js';
import { mountHeader } from '../../components/Header.js';
import { mountFooter } from '../../components/Footer.js';
import { Popup } from '../../components/PopUp.js';
import { TableList } from '../../components/TableList.js';

// API Base URL
const API_BASE = 'http://localhost/web-251-be-main';

ready(async () => {
  mountHeader('.mount-header', 'admin-products');
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

  async function postData(url, body = {}) {
    try {
      const res = await fetch(url, {
        method: "POST",
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

  const tableContainer = '.products-table tbody';
  const searchInput = '.product-search';

  document.querySelector(tableContainer).innerHTML = `<tr><td colspan="8" style="text-align:center;">Đang tải dữ liệu...</td></tr>`;

  const res = await fetchData(`${API_BASE}/products`);

  const products = res.products.map(p => ({
    id: p.id,
    imageLink: `${p.image || '../../assets/images/placeholder.png'}`,
    name: p.name,
    price: parseInt(p.price),
    discount: parseFloat(p.discount) / 100,
    stock: p.stock,
    size: p.size,
    color: p.color,
    category: p.category_name
  }));

  const table = new TableList({
    containerSelector: tableContainer,
    data: products,
    searchSelector: searchInput,
    columns: [
      { key: 'imageLink', render: (v) => `<img src="${v}" width="60" height="60" style="border-radius:8px;">` },
      { key: 'name', label: 'Tên sản phẩm' },
      { key: 'price', label: 'Giá', render: (v) => `${v.toLocaleString('vi-VN')} VNĐ` },
      { key: 'discount', label: 'Giảm giá', render: (v) => `${(v * 100).toFixed(0)}%` },
      { key: 'stock', label: 'Tồn kho' },
      { key: 'size', label: 'Size' },
      { key: 'color', label: 'Màu sắc' },
      { key: 'category', label: 'Danh mục' },
      {
        key: 'actions', label: 'Hành động', render: (_, p) =>
          `<div class="table-actions">
            <button data-action="edit" data-id="${p.id}" class="btn-edit">Sửa</button>
            <button data-action="delete" data-id="${p.id}" class="btn-delete">Xóa</button>
            </div>
          `
      }
    ]
  });

  async function reloadProducts() {
    document.querySelector(tableContainer).innerHTML = `
    <tr><td colspan="8" style="text-align:center;">Đang tải dữ liệu...</td></tr>
  `;

    const res = await fetchData(`${API_BASE}/products`);
    if (!res || !res.products) {
      console.error('Không thể tải lại danh sách sản phẩm');
      return;
    }

    products.length = 0;
    products.push(
      ...res.products.map(p => ({
        id: p.id,
        imageLink: `${p.image || '../../assets/images/placeholder.png'}`,
        name: p.name,
        price: parseInt(p.price),
        discount: parseFloat(p.discount) / 100,
        stock: p.stock,
        size: p.size,
        color: p.color,
        category: p.category_name
      }))
    );

    table.updateData(products);
  }

  const onEditAddPopupShow = async (product = null) => {
    const isEdit = !!product;
    const title = isEdit ? `Chỉnh sửa sản phẩm #${product.name}` : 'Thêm sản phẩm mới';

    const content = `
  <div class="popup-card">
    <form id="product-form" class="product-form">
  <div class="form-grid">
    <label>
      Tên sản phẩm
      <input type="text" name="name" value="${product?.name || ''}" required>
    </label>

    <label>
      Giá
      <input 
        type="text" 
        name="price" 
        inputmode="decimal"
        pattern="^[0-9]+([.,][0-9]+)?$"
        placeholder="VD: 123000 hoặc 123.000"
        value="${product?.price || ''}" 
        required
      >
    </label>

    <label>
      Giảm giá (%)
      <input type="number" name="discount" step="any" value="${product?.discount ? product.discount * 100 : ''}">
    </label>

    <label>
      Số lượng tồn
      <input type="number" name="stock" step="1" value="${product?.stock || ''}">
    </label>

    <label>
      Size
      <input type="text" name="size" value="${product?.size || ''}">
    </label>

    <label>
      Màu sắc
      <input type="text" name="color" value="${product?.color || ''}">
    </label>

    <label>
      Ảnh sản phẩm
      <input type="file" name="imageFile" accept="image/*" id="imageFile">
      <input type="hidden" name="imageLink" value="${product?.imageLink || ''}">
      <div class="image-preview">
        <img id="imagePreview" src="${product?.imageLink || '../../assets/images/placeholder.png'}" alt="Preview">
      </div>
    </label>

    <label>
      Danh mục
      <select name="category" id="categorySelect">
        <option value="">-- Chọn danh mục --</option>
      </select>
      <textarea name="newCategory" id="newCategory" placeholder="Hoặc nhập danh mục mới..." style="display:none;"></textarea>
    </label>
  </div>

  <div class="popup-actions">
    <button type="button" class="btn-cancel">Hủy</button>
    <button type="submit" class="btn-save">${isEdit ? 'Cập nhật' : 'Thêm mới'}</button>
  </div>
</form>
  </div>
`;

    popup.show({ title, content });

    const form = document.getElementById('product-form');
    const fileInput = document.getElementById('imageFile');
    const previewImg = document.getElementById('imagePreview');
    const hiddenInput = form.querySelector('input[name="imageLink"]');
    const categorySelect = document.getElementById('categorySelect');
    const newCategory = document.getElementById('newCategory');
    const cancelBtn = form.querySelector('.btn-cancel');

    fileInput.addEventListener('change', () => {
      const file = fileInput.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = e => {
          previewImg.src = e.target.result;
          hiddenInput.value = e.target.result;
        };
        reader.readAsDataURL(file);
      }
    });

    // const res = await fetchData(`${API_BASE}/categories`);
    // if (Array.isArray(res.categories)) {
    //   res.categories.forEach(c => {
    //     const opt = document.createElement('option');
    //     opt.value = c.name;
    //     opt.textContent = c.name;
    //     if (product?.category === c.name) opt.selected = true;
    //     categorySelect.appendChild(opt);
    //   });
    // }

    categorySelect.addEventListener('change', () => {
      if (categorySelect.value === '') {
        newCategory.style.display = 'block';
      } else {
        newCategory.style.display = 'none';
        newCategory.value = '';
      }
    });

    cancelBtn.addEventListener('click', () => popup.hide());

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const formData = new FormData(form);
      const data = Object.fromEntries(formData.entries());

      data.price = parseFloat(data.price || 0);
      data.discount = parseFloat(data.discount || 0);
      data.stock = parseInt(data.stock || 0);
      if (data.newCategory) data.category = data.newCategory;

      let imageUrl = product?.imageLink || '';
      const file = fileInput.files[0];
      if (file) {
        try {
          const uploadData = new FormData();
          uploadData.append('file', file);
          const uploadRes = await fetch(`${API_BASE}/upload`, {
            method: 'POST',
            body: uploadData
          });
          const uploadJson = await uploadRes.json();
          imageUrl = API_BASE + uploadJson.url;
        } catch (err) {
          console.error('Upload ảnh thất bại:', err);
        }
      }

      const body = {
        name: data.name,
        price: data.price,
        discount: data.discount,
        stock: data.stock,
        size: data.size,
        color: data.color,
        image: imageUrl,
        category: data.category,
      };

      try {
        if (isEdit) {
          await putData(`${API_BASE}/products/${product.id}`, body);
        } else {
          await postData(`${API_BASE}/products`, body);
        }

        console.log('Đã lưu sản phẩm:', body);
        popup.hide();
        await reloadProducts();
      } catch (err) {
        console.error('Lỗi khi lưu sản phẩm:', err);
      }
    });
  };

  document.addEventListener('click', (e) => {
    if (e.target.matches('.btn-edit')) {
      const id = Number(e.target.dataset.id);
      console.log(id);
      const product = products.find((product) => product.id === id);
      console.log(products);
      console.log(product);
      onEditAddPopupShow(product);
    } else if (e.target.matches('.btn-add')) {
      onEditAddPopupShow();
    }
  });

});
