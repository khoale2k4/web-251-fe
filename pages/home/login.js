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

  try {
    const response = await fetch(`${API_BASE}/users/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: data.email,
        password: data.password
      }),
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.error || 'Tên đăng nhập hoặc mật khẩu không đúng');
    }

    // Lưu thông tin user
    const storage = data.remember ? localStorage : sessionStorage;
    storage.setItem('user', JSON.stringify(result.user));
    
    // Lưu userId để Header có thể đọc
    localStorage.setItem('userId', JSON.stringify(result.user.id));
    
    // Nếu Remember Me, lưu flag
    if (data.remember) {
      localStorage.setItem('rememberMe', 'true');
    }

    // Kiểm tra xem user có bắt buộc đổi mật khẩu không
    if (result.user.must_change_password) {
      popup.show({
        title: "⚠️ Bắt buộc đổi mật khẩu",
        content: `
          <p>Mật khẩu của bạn đã được reset về mặc định.</p>
          <p>Vui lòng đổi sang mật khẩu mới để bảo vệ tài khoản.</p>
        `,
        actions: [
          { 
            label: 'Đổi mật khẩu ngay', 
            type: 'btn-primary', 
            onClick: () => {
              window.location.href = 'change-password.html';
            },
            close: true 
          }
        ]
      });
      return;
    }

    popup.show({
      title: "Thành công!",
      content: "Đăng nhập thành công. Đang chuyển hướng về trang chủ...",
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
        name: data.username,
        email: data.email,
        phone: data.phone || null,
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
      content: "<p>Đăng ký tài khoản thành công! Đang chuyển về trang chủ...</p>",
    });

    // Tự động đăng nhập và chuyển về trang chủ
    setTimeout(async () => {
      try {
        // Đăng nhập tự động
        const loginResponse = await fetch(`${API_BASE}/users/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: data.username,
            password: data.password
          }),
        });
        
        const loginResult = await loginResponse.json();
        
        if (loginResult.success) {
          localStorage.setItem('user', JSON.stringify(loginResult.user));
          localStorage.setItem('userId', JSON.stringify(loginResult.user.id));
        }
        
        window.location.href = '/fe/index.html';
      } catch (err) {
        window.location.href = '/fe/index.html';
      }
    }, 1500)

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