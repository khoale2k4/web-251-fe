import { ready } from '../../js/main.js';
import { mountHeader } from '../../components/Header.js';
import { mountFooter } from '../../components/Footer.js';

ready(() => {
  mountHeader('.mount-header', 'admin-news');
  mountFooter('.mount-footer');
  
  // Add admin news handlers
  const addButton = document.querySelector('.btn-add');
  const editButtons = document.querySelectorAll('.btn-edit');
  const deleteButtons = document.querySelectorAll('.btn-delete');
  
  if (addButton) {
    addButton.addEventListener('click', () => {
      alert('Tính năng thêm tin tức mới đang được phát triển!');
    });
  }
  
  editButtons.forEach(button => {
    button.addEventListener('click', () => {
      alert('Tính năng sửa tin tức đang được phát triển!');
    });
  });
  
  deleteButtons.forEach(button => {
    button.addEventListener('click', () => {
      if (confirm('Bạn có chắc muốn xóa tin tức này?')) {
        button.closest('.news-item').remove();
      }
    });
  });
});
