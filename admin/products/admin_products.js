import { ready } from '../../js/main.js';
import { mountHeader } from '../../components/Header.js';
import { mountFooter } from '../../components/Footer.js';
import { TableList } from '../../components/TableList.js';

ready(async () => {
  mountHeader('.mount-header', 'admin-products');
  mountFooter('.mount-footer');

  const tableContainer = '.products-table tbody';
  const searchInput = '.product-search';

  document.querySelector(tableContainer).innerHTML = `<tr><td colspan="8" style="text-align:center;">Đang tải dữ liệu...</td></tr>`;

  try {
    const res = await fetch('http://localhost:8000/products');
    const json = await res.json();

    if (!json.success) throw new Error('API trả về lỗi.');

    const products = json.data.products.map(p => ({
      id: p.id,
      imageLink: `${p.image || '../../assets/images/placeholder.png'}`,
      name: p.name,
      price: parseFloat(p.final_price),
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

    const onEditAddPopupShow = (product = null) => {
      const isEdit = !!product;
      const title = isEdit ? `Chỉnh sửa sản phẩm #${product.id}` : 'Thêm sản phẩm mới';

      const content = `
      <form id="product-form" class="product-form">
        <label>
          Tên sản phẩm:
          <input type="text" name="name" value="${product?.name || ''}" required>
        </label>
        <label>
          Giá:
          <input type="number" name="price" value="${product?.price || ''}" required>
        </label>
        <label>
          Giảm giá (%):
          <input type="number" name="discount" value="${product?.discount ? product.discount * 100 : ''}">
        </label>
        <label>
          Số lượng tồn:
          <input type="number" name="stock" value="${product?.stock || ''}">
        </label>
        <label>
          Size:
          <input type="text" name="size" value="${product?.size || ''}">
        </label>
        <label>
          Màu sắc:
          <input type="text" name="color" value="${product?.color || ''}">
        </label>
        <label>
          Ảnh sản phẩm:
          <input type="text" name="imageLink" value="${product?.imageLink || ''}" placeholder="URL hình ảnh">
        </label>
        <label>
          Danh mục:
          <input type="text" name="category" value="${product?.category || ''}">
        </label>

        <div class="popup-actions">
          <button type="submit" class="btn-save">${isEdit ? 'Cập nhật' : 'Thêm mới'}</button>
          <button type="button" class="btn-cancel">Hủy</button>
        </div>
      </form>
    `;

      this.popup.show({ title, content });

      const form = document.getElementById('product-form');
      const cancelBtn = form.querySelector('.btn-cancel');

      cancelBtn.addEventListener('click', () => this.popup.hide());

      form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        data.discount = parseFloat(data.discount || 0) / 100;
        data.price = parseFloat(data.price);
        data.stock = parseInt(data.stock);

        await this.onSave(data, product?.id);
        this.popup.hide();
      });
    }

    table.onEdit = (id) => onEditAddPopupShow(products.find((product) => product.id === id));
    table.onDelete = (id) => {
      if (confirm('Xóa sản phẩm này?')) table.remove(id);
    };

  } catch (error) {
    console.error('Lỗi khi fetch products:', error);
    document.querySelector(tableContainer).innerHTML = `
      <tr><td colspan="8" style="text-align:center; color:red;">Không thể tải sản phẩm</td></tr>
    `;
  }
});
