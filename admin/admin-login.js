const API_BASE = 'http://localhost:8000';

/**
 * Xử lý đăng nhập admin
 */
async function handleAdminLogin(e) {
  e.preventDefault();
  const form = e.target;
  const formData = new FormData(form);
  const data = Object.fromEntries(formData.entries());

  const submitBtn = form.querySelector('button[type="submit"]');
  const errorMessage = document.getElementById('errorMessage');
  
  // Hide previous errors
  errorMessage.classList.add('d-none');
  
  // Loading state
  const originalText = submitBtn.innerHTML;
  submitBtn.disabled = true;
  submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Đang xử lý...';

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
      throw new Error(result.error || 'Đăng nhập thất bại');
    }

    // Kiểm tra role PHẢI là admin
    if (result.user.role !== 'admin') {
      throw new Error('⛔ Tài khoản này không có quyền truy cập Admin Panel. Vui lòng sử dụng tài khoản admin.');
    }

    // Kiểm tra must_change_password
    if (result.user.must_change_password) {
      alert('Bạn cần đổi mật khẩu trước khi truy cập admin panel');
      window.location.href = '../pages/home/change-password.html';
      return;
    }

    // Lưu thông tin admin
    const storage = data.remember ? localStorage : sessionStorage;
    storage.setItem('user', JSON.stringify(result.user));
    
    // Lưu userId để Header có thể đọc
    localStorage.setItem('userId', JSON.stringify(result.user.id));
    
    if (data.remember) {
      localStorage.setItem('rememberMe', 'true');
    }

    // Redirect về admin dashboard
    window.location.href = './index.html';

  } catch (err) {
    errorMessage.textContent = err.message;
    errorMessage.classList.remove('d-none');
    
    // Restore button
    submitBtn.disabled = false;
    submitBtn.innerHTML = originalText;
  }
}

// Kiểm tra xem đã đăng nhập chưa
function checkExistingLogin() {
  const user = JSON.parse(localStorage.getItem('user') || sessionStorage.getItem('user') || 'null');
  
  if (user && user.role === 'admin' && !user.must_change_password) {
    // Đã đăng nhập admin rồi, redirect về dashboard
    window.location.href = './index.html';
  }
}

// Khởi chạy
document.addEventListener('DOMContentLoaded', () => {
  checkExistingLogin();
  
  const form = document.getElementById('adminLoginForm');
  if (form) {
    form.addEventListener('submit', handleAdminLogin);
  }
});
