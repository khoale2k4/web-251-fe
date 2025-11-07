export function Header({ current, userName = "Lê Khoa" }) {
  const navItems = [
    { href: '/fe/pages/home/index.html', label: 'Home', key: 'home' },
    { href: '/fe/pages/about/about.html', label: 'About', key: 'about' },
    { href: '/fe/pages/products/products.html', label: 'Products', key: 'products' },
    { href: '/fe/pages/news/news.html', label: 'News', key: 'news' },
    { href: '/fe/pages/home/contact.html', label: 'Contact', key: 'contact' },
    { href: '/fe/pages/home/login.html', label: 'Login', key: 'login' },
    // { href: '/fe/admin/dashboard.html', label: 'Admin', key: 'admin' },
    // { href: '/fe/admin/contact/admin_contact.html', label: 'Admin Contact', key: 'admin-contact' },
    // { href: '/fe/admin/faq/admin_faq.html', label: 'Admin Faq', key: 'admin-faq' },
    // { href: '/fe/admin/news/admin_news.html', label: 'Admin News', key: 'admin-news' },
    // { href: '/fe/admin/products/admin_products.html', label: 'Admin Products', key: 'admin-products' },
    // { href: '/fe/admin/products/admin_orders.html', label: 'Admin Orders', key: 'admin-orders' },
  ];

  const cartHref = '/fe/pages/products/cart.html';

  const navLinks = navItems
    .map(({ href, label, key }) => {
      const active = current === key ? ' class="active"' : '';
      return `<a href="${href}"${active}>${label}</a>`;
    })
    .join('');

  return `
    <header class="site-header">
    <nav class="navbar">
        <div class="nav-left">
            <a href="index.html" class="logo">MyStore</a>
        </div>

        <nav class="site-nav">${navLinks}</nav>

        <div class="nav-right">
            <form class="search-bar" id="search-form">
                <input type="search" id="search-input" placeholder="Tìm kiếm sản phẩm...">
                <button type="submit" class="search-button">
                    &#128269; </button>
            </form>

            <a href="${cartHref}" class="cart-icon">
                &#128722; 
                <span class="cart-counter" id="cart-counter">0</span>
            </a>
        </div>
    </nav>
</header>
  `;
}

export function mountHeader(containerSelector, current) {
  const container =
    typeof containerSelector === 'string'
      ? document.querySelector(containerSelector)
      : containerSelector;
  if (!container) return;
  container.innerHTML = Header({ current });
}