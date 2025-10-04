import { ready } from '../../js/main.js';
import { mountHeader } from '../../components/Header.js';
import { mountFooter } from '../../components/Footer.js';

ready(() => {
  mountHeader('.mount-header', 'admin-products');
  mountFooter('.mount-footer');
  
  // Add admin products handlers
  const addButton = document.querySelector('.btn-add');
  const editButtons = document.querySelectorAll('.btn-edit');
  const deleteButtons = document.querySelectorAll('.btn-delete');
  
  if (addButton) {
    addButton.addEventListener('click', () => {
      alert('Tính năng thêm sản phẩm mới đang được phát triển!');
    });
  }
  
  editButtons.forEach(button => {
    button.addEventListener('click', () => {
      alert('Tính năng sửa sản phẩm đang được phát triển!');
    });
  });
  
  deleteButtons.forEach(button => {
    button.addEventListener('click', () => {
      if (confirm('Bạn có chắc muốn xóa sản phẩm này?')) {
        button.closest('tr').remove();
      }
    });
  });
});
