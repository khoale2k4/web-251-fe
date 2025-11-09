<<<<<<< HEAD
<<<<<<< HEAD
=======
export function Header({ current, userName = "Lê Khoa" }) {
  const navItems = [
    { href: '/fe/pages/home/index.html', label: 'Home', key: 'home' },
    { href: '/fe/pages/about/about.html', label: 'About', key: 'about' },
    { href: '/fe/pages/products/products.html', label: 'Products', key: 'products' },
    { href: '/fe/pages/news/news.html', label: 'News', key: 'news' },
    { href: '/fe/pages/home/contact.html', label: 'Contact', key: 'contact' },
    { href: '/fe/pages/home/login.html', label: 'Login', key: 'login' },
    { href: '/fe/admin/dashboard.html', label: 'Admin', key: 'admin' },
    { href: '/fe/admin/contact/admin_contact.html', label: 'Admin Contact', key: 'admin-contact' },
    { href: '/fe/admin/faq/admin_faq.html', label: 'Admin Faq', key: 'admin-faq' },
    { href: '/fe/admin/news/admin_news.html', label: 'Admin News', key: 'admin-news' },
    { href: '/fe/admin/products/admin_products.html', label: 'Admin Products', key: 'admin-products' },
    { href: '/fe/admin/products/admin_orders.html', label: 'Admin Orders', key: 'admin-orders' },
  ];

  const navLinks = navItems
    .map(({ href, label, key }) => {
      const active = current === key ? ' class="active"' : '';
      return `<a href="${href}"${active}>${label}</a>`;
    })
    .join('');

  return `
    <header class="site-header">
      <div class="container">
        <h1 class="site-title">Website - ${userName}</h1>
        <nav class="site-nav">${navLinks}</nav>
      </div>
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



=======
>>>>>>> 57af7556f01f0f68333a2dd3e40f3d237a370b7c
export function Header({ current, userName = "Lê Khoa" }) {
  const navItems = [
<<<<<<< HEAD
    { href: '/web-251-fe-main/pages/home/index.html', label: 'Home', key: 'home' },
    { href: '/web-251-fe-main/pages/about/about.html', label: 'About', key: 'about' },
    { href: '/web-251-fe-main/pages/products/products.html', label: 'Products', key: 'products' },
    { href: '/web-251-fe-main/pages/news/news.html', label: 'News', key: 'news' },
    { href: '/web-251-fe-main/pages/home/contact.html', label: 'Contact', key: 'contact' },
    { href: '/web-251-fe-main/pages/home/login.html', label: 'Login', key: 'login' },
    { href: '/web-251-fe-main/admin/', label: 'Admin', key: 'admin' },
    { href: '/web-251-fe-main/admin/contact/', label: 'Admin Contact', key: 'admin-contact' },
    { href: '/web-251-fe-main/admin/faq/', label: 'Admin Faq', key: 'admin-faq' },
    { href: '/web-251-fe-main/admin/news/', label: 'Admin News', key: 'admin-news' },
    { href: '/web-251-fe-main/admin/products/admin_products.html', label: 'Admin Products', key: 'admin-products' },
    { href: '/web-251-fe-main/admin/products/admin_orders.html', label: 'Admin Orders', key: 'admin-orders' },
=======
    { href: '/fe/pages/home/index.html', label: 'Home', key: 'home' },
    { href: '/fe/pages/about/about.html', label: 'About', key: 'about' },
    { href: '/fe/pages/products/products.html', label: 'Products', key: 'products' },
    { href: '/fe/pages/news/news.html', label: 'News', key: 'news' },
    { href: '/fe/pages/home/contact.html', label: 'Contact', key: 'contact' },
    { href: '/fe/pages/home/login.html', label: 'Login', key: 'login' },
    { href: '/fe/admin/dashboard.html', label: 'Admin', key: 'admin' },
    { href: '/fe/admin/contact/admin_contact.html', label: 'Admin Contact', key: 'admin-contact' },
    { href: '/fe/admin/faq/admin_faq.html', label: 'Admin Faq', key: 'admin-faq' },
    { href: '/fe/admin/news/admin_news.html', label: 'Admin News', key: 'admin-news' },
    { href: '/fe/admin/products/admin_products.html', label: 'Admin Products', key: 'admin-products' },
    { href: '/fe/admin/products/admin_orders.html', label: 'Admin Orders', key: 'admin-orders' },
>>>>>>> 1b5a4c94e303c46936a6a5432ca30265c2dac39e
  ];

  const navLinks = navItems
    .map(({ href, label, key }) => {
      const active = current === key ? ' class="active"' : '';
      return `<a href="${href}"${active}>${label}</a>`;
    })
    .join('');

  return `
    <header class="site-header">
      <div class="container">
        <h1 class="site-title">Website - ${userName}</h1>
        <nav class="site-nav">${navLinks}</nav>
      </div>
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



<<<<<<< HEAD
=======
export function Header({ current, userName = "Lê Khoa" }) {
  const navItems = [
<<<<<<< HEAD
    { href: '/web-251-fe-main/pages/home/index.html', label: 'Home', key: 'home' },
    { href: '/web-251-fe-main/pages/about/about.html', label: 'About', key: 'about' },
    { href: '/web-251-fe-main/pages/products/products.html', label: 'Products', key: 'products' },
    { href: '/web-251-fe-main/pages/news/news.html', label: 'News', key: 'news' },
    { href: '/web-251-fe-main/pages/home/contact.html', label: 'Contact', key: 'contact' },
    { href: '/web-251-fe-main/pages/home/login.html', label: 'Login', key: 'login' },
    { href: '/web-251-fe-main/admin/', label: 'Admin', key: 'admin' },
    { href: '/web-251-fe-main/admin/contact/', label: 'Admin Contact', key: 'admin-contact' },
    { href: '/web-251-fe-main/admin/faq/', label: 'Admin Faq', key: 'admin-faq' },
    { href: '/web-251-fe-main/admin/news/', label: 'Admin News', key: 'admin-news' },
    { href: '/web-251-fe-main/admin/products/admin_products.html', label: 'Admin Products', key: 'admin-products' },
    { href: '/web-251-fe-main/admin/products/admin_orders.html', label: 'Admin Orders', key: 'admin-orders' },
=======
    { href: '/fe/pages/home/index.html', label: 'Home', key: 'home' },
    { href: '/fe/pages/about/about.html', label: 'About', key: 'about' },
    { href: '/fe/pages/products/products.html', label: 'Products', key: 'products' },
    { href: '/fe/pages/news/news.html', label: 'News', key: 'news' },
    { href: '/fe/pages/home/contact.html', label: 'Contact', key: 'contact' },
    { href: '/fe/pages/home/login.html', label: 'Login', key: 'login' },
    { href: '/fe/admin/dashboard.html', label: 'Admin', key: 'admin' },
    { href: '/fe/admin/contact/admin_contact.html', label: 'Admin Contact', key: 'admin-contact' },
    { href: '/fe/admin/faq/admin_faq.html', label: 'Admin Faq', key: 'admin-faq' },
    { href: '/fe/admin/news/admin_news.html', label: 'Admin News', key: 'admin-news' },
    { href: '/fe/admin/products/admin_products.html', label: 'Admin Products', key: 'admin-products' },
    { href: '/fe/admin/products/admin_orders.html', label: 'Admin Orders', key: 'admin-orders' },
>>>>>>> 1b5a4c94e303c46936a6a5432ca30265c2dac39e
  ];

  const navLinks = navItems
    .map(({ href, label, key }) => {
      const active = current === key ? ' class="active"' : '';
      return `<a href="${href}"${active}>${label}</a>`;
    })
    .join('');

  return `
    <header class="site-header">
      <div class="container">
        <h1 class="site-title">Website - ${userName}</h1>
        <nav class="site-nav">${navLinks}</nav>
      </div>
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



=======
>>>>>>> 57af7556f01f0f68333a2dd3e40f3d237a370b7c
>>>>>>> fd06cc4569a6982f7b46b54b50aed7ebf617085a
