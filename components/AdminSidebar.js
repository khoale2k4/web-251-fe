export function AdminSidebar({ current = '' } = {}) {
  var items = [
    { href: '../index.html', key: 'dashboard', label: 'Dashboard', icon: 'ti ti-home' },
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

  return `
    <aside class="navbar navbar-vertical navbar-expand-lg navbar-dark fixed-sidebar">
      <div class="container-fluid">
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#sidebar-menu">
          <span class="navbar-toggler-icon"></span>
        </button>
        <h1 class="navbar-brand navbar-brand-autodark">
          <a href="../index.html"><span class="text-white">Admin Panel</span></a>
        </h1>
        <div class="collapse navbar-collapse" id="sidebar-menu">
          <ul class="navbar-nav pt-lg-3">
            ${links}
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
  container.innerHTML = AdminSidebar({ current });
}



