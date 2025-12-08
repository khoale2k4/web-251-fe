export function AdminSidebar({ current = '' } = {}) {
  var items = [
    { href: '../index.html', key: 'dashboard', label: 'Dashboard', icon: 'ti ti-home' },
    { href: '../users/index.html', key: 'admin-users', label: 'Quản lý Users', icon: 'ti ti-users' },
    { href: '../contact/index.html', key: 'admin-contact', label: 'Quản lý Liên hệ', icon: 'ti ti-mail' },
    { href: '../settings/index.html', key: 'settings', label: 'Cấu hình Website', icon: 'ti ti-settings' },
    { href: '../products/admin_products.html', key: 'admin-products', label: 'Quản lý Sản phẩm', icon: 'ti ti-package' },
    { href: '../products/admin_orders.html', key: 'admin-orders', label: 'Đơn hàng & Giỏ hàng', icon: 'ti ti-shopping-cart' },
    { href: '../users/index.html', key: 'admin-users', label: 'Quản lý Người dùng', icon: 'ti ti-users' },
    { href: '../news/index.html', key: 'admin-news', label: 'Quản lý Bài viết', icon: 'ti ti-news' },
    { href: '../faq/index.html', key: 'admin-faq', label: 'Quản lý FAQ', icon: 'ti ti-help' },
    { href: '../comments/index.html', key: 'comments', label: 'Quản lý Comments', icon: 'ti ti-message' },
    { href: '../about/index.html', key: 'about', label: 'Giới Thiệu', icon: 'ti ti-message' },

  ];

  if (current === 'dashboard') {
    items = items.map(item => ({
      ...item,
      href: item.href.replace(/^\.\.\//, '')
    }));
  }

  const links = items
    .map(({ href, key, label, icon }) => `
      <li class="nav-item${current === key ? ' active' : ''}">
        <a class="nav-link" href="${href}">
          <span class="nav-link-icon d-md-none d-lg-inline-block"><i class="${icon}"></i></span>
          <span class="nav-link-title">${label}</span>
        </a>
      </li>
    `)
    .join('');

  const user = JSON.parse(localStorage.getItem('user') || sessionStorage.getItem('user') || 'null');
  const adminName = user ? user.name : 'Admin';
  const adminEmail = user ? user.email : '';

  return `
    <aside class="navbar navbar-vertical navbar-expand-lg navbar-dark">
      <div class="container-fluid">
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#sidebar-menu">
          <span class="navbar-toggler-icon"></span>
        </button>
        <h1 class="navbar-brand navbar-brand-autodark">
          <a href="../index.html"><span>Admin Panel</span></a>
        </h1>
        
        <div class="px-3 py-2 mb-2" style="background: rgba(255,255,255,0.1); border-radius: 8px;">
          <div class="d-flex align-items-center">
            <div class="avatar avatar-sm me-2" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
              <i class="ti ti-user text-white"></i>
            </div>
            <div style="flex: 1; min-width: 0;">
              <div class="text-white fw-bold" style="font-size: 14px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${adminName}</div>
              <div class="text-white-50" style="font-size: 11px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${adminEmail}</div>
            </div>
          </div>
        </div>
        
        <div class="collapse navbar-collapse" id="sidebar-menu">
          <ul class="navbar-nav pt-lg-3">
            ${links}
            
            <li class="nav-item" style="margin: 10px 0;">
              <hr class="navbar-divider" style="border-color: rgba(255,255,255,0.2);">
            </li>
            
            <li class="nav-item">
              <a class="nav-link" href="../index.html" target="_blank">
                <span class="nav-link-icon d-md-none d-lg-inline-block"><i class="ti ti-external-link"></i></span>
                <span class="nav-link-title">Xem trang User</span>
              </a>
            </li>
            
            <li class="nav-item">
              <a class="nav-link text-danger" href="#" id="adminLogoutBtn" style="cursor: pointer;">
                <span class="nav-link-icon d-md-none d-lg-inline-block"><i class="ti ti-logout"></i></span>
                <span class="nav-link-title">Đăng xuất</span>
              </a>
            </li>
          </ul>
        </div>
      </div>
    </aside>
  `;
}

export function mountAdminSidebar(containerSelector, current) {
  const container = typeof containerSelector === 'string'
    ? document.querySelector(containerSelector)
    : containerSelector;
  if (!container) return;

  const html = AdminSidebar({ current });
  const temp = document.createElement('div');
  temp.innerHTML = html;
  const sidebar = temp.firstElementChild;

  container.replaceWith(sidebar);

  const logoutBtn = document.getElementById('adminLogoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      if (confirm('Bạn có chắc muốn đăng xuất?')) {
        localStorage.removeItem('user');
        sessionStorage.removeItem('user');
        localStorage.removeItem('rememberMe');

        const currentPath = window.location.pathname;
        let adminLoginPath = './admin-login.html';

        if (currentPath.includes('/fe/admin/') &&
          (currentPath.includes('/users/') || currentPath.includes('/products/') ||
            currentPath.includes('/news/') || currentPath.includes('/contact/') ||
            currentPath.includes('/settings/') || currentPath.includes('/faq/') ||
            currentPath.includes('/comments/') || currentPath.includes('/about/'))) {
          adminLoginPath = '../admin-login.html';
        }

        window.location.href = adminLoginPath;
      }
    });
  }
}