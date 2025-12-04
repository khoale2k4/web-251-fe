import { ready } from '../../js/main.js';
import { mountHeader } from '../../components/Header.js';
import { mountFooter } from '../../components/Footer.js';
import { Popup } from '../../components/PopUp.js';
import getUserId from '../../js/getUserId.js';

const API_BASE = 'http://localhost:8000';

/**
 * Xử lý form đổi mật khẩu
 */
async function handleChangePassword(e, popup, userId) {
  e.preventDefault();
  const form = e.target;
  const formData = new FormData(form);
  const data = Object.fromEntries(formData.entries());

  // Validate confirm password
  if (data.new_password !== data.confirm_password) {
    popup.show({
      title: "❌ Lỗi",
      content: "<p>Mật khẩu xác nhận không khớp. Vui lòng thử lại.</p>",
      actions: [{ label: 'Đóng', type: 'btn-secondary', close: true }]
    });
    return;
  }

  // Hiển thị loading
  const submitBtn = form.querySelector('button[type="submit"]');
  const originalText = submitBtn.textContent;
  submitBtn.disabled = true;
  submitBtn.textContent = 'Đang xử lý...';

  try {
    const response = await fetch(`${API_BASE}/password-reset/change-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: userId,
        current_password: data.current_password,
        new_password: data.new_password
      }),
    });

    const result = await response.json();

    if (response.ok && result.success) {
      // Thành công - logout và redirect về login
      popup.show({
        title: "✅ Thành công!",
        content: `
          <p>Mật khẩu của bạn đã được thay đổi thành công.</p>
          <p>Vui lòng đăng nhập lại với mật khẩu mới.</p>
        `,
        actions: [
          { 
            label: 'Đăng nhập ngay', 
            type: 'btn-primary', 
            onClick: () => {
              // Clear user data
              localStorage.removeItem('user');
              sessionStorage.removeItem('user');
              window.location.href = 'login.html';
            },
            close: true 
          }
        ]
      });
    } else {
      throw new Error(result.error || 'Không thể đổi mật khẩu');
    }

  } catch (err) {
    popup.show({
      title: "❌ Lỗi",
      content: `<p>${err.message}</p>`,
      actions: [
        { 
          label: 'Thử lại', 
          type: 'btn-primary', 
          close: true 
        }
      ]
    });

    // Restore button
    submitBtn.disabled = false;
    submitBtn.textContent = originalText;
  }
}

// Khởi chạy
ready(() => {
  mountHeader('.mount-header', 'login');
  mountFooter('.mount-footer');

  // Lấy user ID
  const userId = getUserId();

  if (!userId) {
    window.location.href = 'login.html';
    return;
  }

  // Gắn sự kiện submit form
  const popup = new Popup();
  const form = document.getElementById('changePasswordForm');
  
  if (form) {
    form.addEventListener('submit', (e) => handleChangePassword(e, popup, userId));
  }
});
