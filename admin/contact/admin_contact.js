import { ready } from '../../js/main.js';
import { mountHeader } from '../../components/Header.js';
import { mountFooter } from '../../components/Footer.js';

ready(() => {
  mountHeader('.mount-header', 'admin-contact');
  mountFooter('.mount-footer');
  
  // Add admin contact handlers
  const replyButtons = document.querySelectorAll('.btn-reply');
  const deleteButtons = document.querySelectorAll('.btn-delete');
  
  replyButtons.forEach(button => {
    button.addEventListener('click', () => {
      alert('Tính năng trả lời tin nhắn đang được phát triển!');
    });
  });
  
  deleteButtons.forEach(button => {
    button.addEventListener('click', () => {
      if (confirm('Bạn có chắc muốn xóa tin nhắn này?')) {
        button.closest('.message-item').remove();
      }
    });
  });
});


