/**
 * Auth Helper - Quản lý authentication và authorization
 */

/**
 * Lấy thông tin user hiện tại từ localStorage hoặc sessionStorage
 * @returns {Object|null} User object hoặc null nếu chưa đăng nhập
 */
export function getCurrentUser() {
  // Kiểm tra localStorage trước (Remember Me)
  let userStr = localStorage.getItem('user');
  
  // Nếu không có, kiểm tra sessionStorage
  if (!userStr) {
    userStr = sessionStorage.getItem('user');
  }
  
  if (!userStr) return null;
  
  try {
    return JSON.parse(userStr);
  } catch (e) {
    console.error('Error parsing user data:', e);
    return null;
  }
}

/**
 * Kiểm tra user đã đăng nhập chưa
 * @returns {boolean} true nếu đã đăng nhập
 */
export function isLoggedIn() {
  return getCurrentUser() !== null;
}

/**
 * Kiểm tra user có phải admin không
 * @returns {boolean} true nếu là admin
 */
export function isAdmin() {
  const user = getCurrentUser();
  return user && user.role === 'admin';
}

/**
 * Đăng xuất - xóa thông tin user khỏi localStorage và sessionStorage
 */
export function logout() {
  localStorage.removeItem('user');
  localStorage.removeItem('rememberMe');
  sessionStorage.removeItem('user');
  window.location.href = '/fe/index.html';
}

/**
 * Yêu cầu đăng nhập - redirect đến trang login nếu chưa đăng nhập
 * @param {string} message - Thông báo tùy chỉnh
 * @returns {boolean} true nếu đã đăng nhập, false và redirect nếu chưa
 */
export function requireLogin(message = 'Vui lòng đăng nhập để tiếp tục') {
  if (!isLoggedIn()) {
    alert(message);
    window.location.href = '/fe/pages/home/login.html';
    return false;
  }
  return true;
}

/**
 * Yêu cầu quyền admin - redirect về trang chủ nếu không phải admin
 * @returns {boolean} true nếu là admin, false và redirect nếu không
 */
export function requireAdmin() {
  if (!isAdmin()) {
    alert('Bạn không có quyền truy cập trang này');
    window.location.href = '/fe/index.html';
    return false;
  }
  return true;
}

/**
 * Lấy tên hiển thị của user
 * @returns {string} Tên user hoặc 'Guest'
 */
export function getUserDisplayName() {
  const user = getCurrentUser();
  return user ? user.name : 'Guest';
}

/**
 * Lấy user ID
 * @returns {number|null} ID của user hoặc null
 */
export function getUserId() {
  const user = getCurrentUser();
  return user ? user.id : null;
}
