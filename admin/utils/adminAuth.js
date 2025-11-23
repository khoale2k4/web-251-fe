/**
 * Middleware kiểm tra quyền admin
 * Đặt trong các trang admin để bảo vệ
 */
export function requireAdmin() {
  const user = JSON.parse(
    localStorage.getItem('user') || 
    sessionStorage.getItem('user') || 
    'null'
  );

  // Chưa đăng nhập hoặc không phải admin
  if (!user || user.role !== 'admin') {
    alert('⛔ Bạn không có quyền truy cập trang này. Vui lòng đăng nhập với tài khoản admin.');
    // Tính toán đường dẫn đến admin-login.html
    const adminLoginPath = getAdminLoginPath();
    window.location.href = adminLoginPath;
    return false;
  }

  // Bắt buộc đổi mật khẩu
  if (user.must_change_password) {
    alert('⚠️ Bạn cần đổi mật khẩu trước khi truy cập admin panel');
    window.location.href = '/fe/pages/home/change-password.html';
    return false;
  }

  return true;
}

/**
 * Tính toán đường dẫn đến admin-login.html dựa trên URL hiện tại
 */
function getAdminLoginPath() {
  const currentPath = window.location.pathname;
  
  // Nếu đang ở /fe/admin/index.html hoặc /fe/admin/xxx.html
  if (currentPath.includes('/fe/admin/') && !currentPath.includes('/fe/admin/users/') && 
      !currentPath.includes('/fe/admin/products/') && !currentPath.includes('/fe/admin/news/') &&
      !currentPath.includes('/fe/admin/contact/') && !currentPath.includes('/fe/admin/settings/') &&
      !currentPath.includes('/fe/admin/faq/') && !currentPath.includes('/fe/admin/comments/') &&
      !currentPath.includes('/fe/admin/about/')) {
    return './admin-login.html';
  }
  
  // Nếu đang ở trong subfolder của admin
  return '../admin-login.html';
}

/**
 * Lấy thông tin admin hiện tại
 */
export function getCurrentAdmin() {
  const user = JSON.parse(
    localStorage.getItem('user') || 
    sessionStorage.getItem('user') || 
    'null'
  );

  if (user && user.role === 'admin') {
    return user;
  }

  return null;
}

/**
 * Đăng xuất admin
 */
export function logoutAdmin() {
  if (confirm('Bạn có chắc muốn đăng xuất?')) {
    localStorage.removeItem('user');
    sessionStorage.removeItem('user');
    localStorage.removeItem('rememberMe');
    const adminLoginPath = getAdminLoginPath();
    window.location.href = adminLoginPath;
  }
}
