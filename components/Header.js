const API_BASE = 'http://localhost:8000';

export async function Header({ current, userName = "Lê Khoa" }) {
  const navItems = [
    { href: '/fe/pages/home/index.html', label: 'Home', key: 'home' },
    { href: '/fe/pages/about/about.html', label: 'About', key: 'about' },
    { href: '/fe/pages/products/products.html', label: 'Products', key: 'products' },
    { href: '/fe/pages/news/news.html', label: 'News', key: 'news' },
    { href: '/fe/pages/home/contact.html', label: 'Contact', key: 'contact' },
    { href: '/fe/pages/home/login.html', label: 'Login', key: 'login' },
  ];

  const cartHref = {
    href: '/fe/pages/products/cart.html', label: 'Cart', key: 'cart' 
  }

  const navLinks = navItems
    .map(({ href, label, key }) => {
      const active = current === key ? ' class="active"' : '';
      return `<a href="${href}"${active}>${label}</a>`;
    })
    .join('');

  const site_name = await loadSiteSettings();

  return `
    <header class="site-header">
      <nav class="navbar">
        <div class="nav-left">
          <a href="/fe/" class="logo">${site_name}</a>
        </div>

        <nav class="site-nav">${navLinks}</nav>

        <div class="nav-right">
          <form class="search-bar" id="search-form">
            <input type="search" id="search-input" placeholder="Tìm kiếm sản phẩm...">
            <button type="submit" class="search-button">&#128269;</button>
          </form>

          <a href=${cartHref.href} className="cart-icon" key=${cartHref.key}>
            &#128722;
            <span className="cart-counter" id="cart-counter">0</span>
          </a>
        </div>
      </nav>
    </header>
  `;
}

async function loadSiteSettings() {
  try {
    const response = await fetch(`${API_BASE}/site-settings`);
    const result = await response.json();

    if (result.success && result.data) {
      return result.data.site_name;
    }
    return "Shoe Store";
  } catch (error) {
    return "Shoe Store";
  }
}

export async function mountHeader(containerSelector, current) {
  const container =
    typeof containerSelector === 'string'
      ? document.querySelector(containerSelector)
      : containerSelector;
  if (!container) return;

  container.innerHTML = `
    <header class="site-header skeleton">
      <nav class="navbar">
        <div class="nav-left"><div class="skeleton-logo"></div></div>
        <div class="nav-middle"><div class="skeleton-nav"></div></div>
        <div class="nav-right">
          <div class="skeleton-search"></div>
          <div class="skeleton-cart"></div>
        </div>
      </nav>
    </header>
  `;

  const headerHTML = await Header({ current });
  container.innerHTML = headerHTML;

  const searchForm = container.querySelector('#search-form');
  if (searchForm) {
    searchForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const query = container.querySelector('#search-input').value.trim();
      if (query) {
        window.location.href = `/fe/pages/products/products.html?product_query=${encodeURIComponent(query)}`;
      }
    });
  }
}