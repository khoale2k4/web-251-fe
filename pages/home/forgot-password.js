import { ready } from '../../js/main.js';
import { mountHeader } from '../../components/Header.js';
import { mountFooter } from '../../components/Footer.js';
import { Popup } from '../../components/PopUp.js';

const API_BASE = 'http://localhost:8000';

/**
 * Xử lý form quên mật khẩu
 */
async function handleForgotPassword(e, popup) {
  e.preventDefault();
  const form = e.target;
  const formData = new FormData(form);
  const data = Object.fromEntries(formData.entries());

  // Hiển thị loading
  const submitBtn = form.querySelector('button[type="submit"]');
  const originalText = submitBtn.textContent;
  submitBtn.disabled = true;
  submitBtn.textContent = 'Đang gửi yêu cầu...';

  try {
    // Gọi API gửi yêu cầu reset password
    const response = await fetch(`${API_BASE}/password-reset/request`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: data.email,
        reason: data.reason || null
      }),
    });

    const result = await response.json();

    if (response.ok && result.success) {
      popup.show({
        title: "✅ Yêu cầu đã được gửi!",
        content: `
          <div style="text-align: left;">
            <p><strong>Yêu cầu đặt lại mật khẩu của bạn đã được gửi đến quản trị viên.</strong></p>
            <div style="background-color: #f0f9ff; border-left: 4px solid #2563eb; padding: 15px; margin: 15px 0;">
              <strong>📋 Quy trình xử lý:</strong>
              <ol style="margin: 10px 0 0 0; padding-left: 20px;">
                <li>Admin sẽ xem xét yêu cầu của bạn</li>
                <li>Nếu được duyệt, mật khẩu sẽ được reset về: <strong>12345678</strong></li>
                <li>Bạn đăng nhập với mật khẩu mặc định</li>
                <li>Hệ thống sẽ yêu cầu bạn đổi mật khẩu mới</li>
              </ol>
            </div>
            <p style="color: #666; font-size: 14px;"><em>Thời gian xử lý: 1-2 ngày làm việc</em></p>
          </div>
        `,
        actions: [
          { 
            label: 'Quay lại đăng nhập', 
            type: 'btn-primary', 
            onClick: () => {
              window.location.href = 'login.html';
            },
            close: true 
          }
        ]
      });
      
      // Reset form
      form.reset();
    } else {
      throw new Error(result.error || 'Không thể gửi yêu cầu');
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
  } finally {
    // Restore button
    submitBtn.disabled = false;
    submitBtn.textContent = originalText;
  }
}

// Khởi chạy
ready(() => {
  mountHeader('.mount-header', 'login');
  mountFooter('.mount-footer');

  const popup = new Popup();
  const form = document.getElementById('forgotPasswordForm');

  if (form) {
    form.addEventListener('submit', (e) => handleForgotPassword(e, popup));
  }
});
