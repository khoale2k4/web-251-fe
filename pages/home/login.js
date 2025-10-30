import { ready } from '../../js/main.js';
import { mountHeader } from '../../components/Header.js';
import { mountFooter } from '../../components/Footer.js';

ready(() => {
  mountHeader('.mount-header', 'login');
  mountFooter('.mount-footer');

  const form = document.getElementById('loginForm');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const formData = new FormData(form);
      const username = formData.get('username');
      const password = formData.get('password');
      // Demo only: basic validation
      if (!username || !password) {
        alert('Vui lòng nhập đủ thông tin');
        return;
      }
      alert(`Đăng nhập thành công: ${username}`);
      window.location.href = 'index.html';
    });
  }
});



