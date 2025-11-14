import { ready } from '../../js/main.js';
import { mountHeader } from '../../components/Header.js';
import { mountFooter } from '../../components/Footer.js';
// Import Popup để hiển thị thông báo
import { Popup } from '../../components/PopUp.js';

const API_BASE = 'http://localhost:8000';

async function handleLogin(e, popup) {
  e.preventDefault();
  const form = e.target;
  const formData = new FormData(form);
  const data = Object.fromEntries(formData.entries());
  console.log(data);

  try {
    const response = await fetch(`${API_BASE}/users/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.message || 'Tên đăng nhập hoặc mật khẩu không đúng');
    }

    localStorage.setItem('userId', JSON.stringify(result.user.id));

    popup.show({
      title: "Thành công!",
      content: "Đăng nhập thành công. Đang chuyển hướng bạn...",
    });

    setTimeout(() => {
      window.location.href = '/fe/index.html';
    }, 1000);

  } catch (err) {
    popup.show({
      title: "Đăng nhập thất bại",
      content: `<p>${err.message}</p>`,
      actions: [{ label: 'Đóng', type: 'btn-secondary', close: true }]
    });
  }
}

/**
 * Xử lý logic đăng ký
 */
async function handleRegister(e, popup) {
  e.preventDefault();
  const form = e.target;
  const formData = new FormData(form);
  const data = Object.fromEntries(formData.entries());

  // 1. Kiểm tra mật khẩu xác nhận
  if (data.password !== data.confirm_password) {
    popup.show({
      title: "Lỗi đăng ký",
      content: "<p>Mật khẩu xác nhận không khớp. Vui lòng thử lại.</p>",
      actions: [{ label: 'Đóng', type: 'btn-secondary', close: true }]
    });
    return;
  }

  try {
    const response = await fetch(`${API_BASE}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: data.username,
        password: data.password
      }),
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.message || 'Tên đăng nhập đã tồn tại hoặc lỗi');
    }

    // 3. Đăng ký thành công
    popup.show({
      title: "Thành công!",
      content: "<p>Đăng ký tài khoản thành công. Vui lòng chuyển qua tab đăng nhập.</p>",
      actions: [{ label: 'OK', type: 'btn-primary', close: true }]
    });

    form.reset(); // Xóa các trường trong form
    document.getElementById('loginTab').click(); // Tự động chuyển về tab đăng nhập

  } catch (err) {
    popup.show({
      title: "Đăng ký thất bại",
      content: `<p>${err.message}</p>`,
      actions: [{ label: 'Đóng', type: 'btn-secondary', close: true }]
    });
  }
}


// --- Hàm Khởi chạy chính ---
ready(() => {
  mountHeader('.mount-header', 'login');
  mountFooter('.mount-footer');

  // Khởi tạo popup
  const popup = new Popup();

  // Lấy các element
  const loginTab = document.getElementById('loginTab');
  const registerTab = document.getElementById('registerTab');
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');

  // 1. Gắn sự kiện chuyển tab
  loginTab.addEventListener('click', () => {
    loginTab.classList.add('active');
    registerTab.classList.remove('active');
    loginForm.classList.remove('hidden');
    registerForm.classList.add('hidden');
  });

  registerTab.addEventListener('click', () => {
    registerTab.classList.add('active');
    loginTab.classList.remove('active');
    registerForm.classList.remove('hidden');
    loginForm.classList.add('hidden');
  });

  // 2. Gắn sự kiện submit cho cả 2 form
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => handleLogin(e, popup));
  }
  if (registerForm) {
    registerForm.addEventListener('submit', (e) => handleRegister(e, popup));
  }
});