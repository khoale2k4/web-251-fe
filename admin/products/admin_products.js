import { ready } from '../../js/main.js';
import { mountHeader } from '../../components/Header.js';
import { mountFooter } from '../../components/Footer.js';
import { TableList } from '../../components/TableList.js';

ready(() => {
  mountHeader('.mount-header', 'admin-products');
  mountFooter('.mount-footer');

  const products = [
    {
      id: 1,
      imageLink: '../../assets/images/placeholder.png',
      name: "Giày Thể Thao Nike Air Max Plus Og Men's - Voltage Purple",
      price: 2000000,
      discount: 0.5,
      stock: 123,
      size: 42,
      color: "Trắng",
      category: "Nike"
    },
    {
      id: 2,
      imageLink: '../../assets/images/placeholder.png',
      name: "Giày Adidas Ultraboost 22 Core Black",
      price: 3500000,
      discount: 0.3,
      stock: 85,
      size: 43,
      color: "Đen",
      category: "Adidas"
    },
    {
      id: 3,
      imageLink: '../../assets/images/placeholder.png',
      name: "Giày Converse Chuck Taylor All Star High Top",
      price: 1500000,
      discount: 0.1,
      stock: 240,
      size: 41,
      color: "Trắng",
      category: "Converse"
    },
    {
      id: 4,
      imageLink: '../../assets/images/placeholder.png',
      name: "Giày Vans Old Skool Classic Black",
      price: 1200000,
      discount: 0.15,
      stock: 170,
      size: 42,
      color: "Đen Trắng",
      category: "Vans"
    },
    {
      id: 5,
      imageLink: '../../assets/images/placeholder.png',
      name: "Giày Puma RS-X3 Puzzle White Red",
      price: 2200000,
      discount: 0.25,
      stock: 90,
      size: 43,
      color: "Trắng Đỏ",
      category: "Puma"
    },
    {
      id: 6,
      imageLink: '../../assets/images/placeholder.png',
      name: "Giày New Balance 327 Grey",
      price: 2800000,
      discount: 0.2,
      stock: 110,
      size: 41,
      color: "Xám",
      category: "New Balance"
    },
    {
      id: 7,
      imageLink: '../../assets/images/placeholder.png',
      name: "Giày Nike Air Force 1 '07 Low Triple White",
      price: 2500000,
      discount: 0.1,
      stock: 200,
      size: 42,
      color: "Trắng",
      category: "Nike"
    },
    {
      id: 8,
      imageLink: '../../assets/images/placeholder.png',
      name: "Giày Adidas Stan Smith Green",
      price: 1900000,
      discount: 0.2,
      stock: 150,
      size: 40,
      color: "Trắng Xanh",
      category: "Adidas"
    },
    {
      id: 9,
      imageLink: '../../assets/images/placeholder.png',
      name: "Giày Jordan 1 Retro High University Blue",
      price: 4500000,
      discount: 0.35,
      stock: 60,
      size: 44,
      color: "Xanh Trắng",
      category: "Jordan"
    },
    {
      id: 10,
      imageLink: '../../assets/images/placeholder.png',
      name: "Giày Balenciaga Triple S Clear Sole Beige",
      price: 9500000,
      discount: 0.4,
      stock: 25,
      size: 43,
      color: "Be",
      category: "Balenciaga"
    }
  ];

  const table = new TableList({
    containerSelector: '.products-table tbody',
    data: products,
    searchSelector: '.product-search',
    columns: [
      { key: 'imageLink', render: (v, p) => `<img src="${v}" width="60" height="60" style="border-radius:8px;">` },
      { key: 'name' },
      { key: 'price', render: (v) => `${v.toLocaleString('vi-VN')} VNĐ` },
      { key: 'discount', render: (v) => `${(v * 100).toFixed(0)}%` },
      { key: 'stock' },
      { key: 'size' },
      { key: 'color' },
      { key: 'category' },
      {
        key: 'actions', render: (_, p) => `
          <button data-action="edit" data-id="${p.id}" class="btn-edit">Sửa</button>
          <button data-action="delete" data-id="${p.id}" class="btn-delete">Xóa</button>
        ` }
    ],
    searchSelector: '.product-search'
  });

  table.onEdit = (id) => alert(`Sửa sản phẩm ID: ${id}`);
  table.onDelete = (id) => {
    if (confirm('Xóa sản phẩm này?')) table.remove(id);
  };
});
