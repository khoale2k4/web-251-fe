import { updateCartCounter } from "../js/updateCartCounter.js";
import { API_BASE, PATHS } from "../js/config.js";
import { Storage } from "../js/storage.js";
import { API } from "../js/api.js";
import { Security } from "../js/security.js";
import getUserId from "../js/getUserId.js";

async function fetchUser(userId) {
  if (!userId) return null;
  try {
    const result = await API.get(`/users/${userId}`);
    if (result.success && result.data) {
      return Security.sanitizeUser(result.data);
    }
    if (result.id) {
      return Security.sanitizeUser(result);
    }
    return null;
  } catch (err) {
    console.error("Lỗi khi tải thông tin user:", err);
    return null;
  }
}

async function loadSiteSettings() {
  try {
    const result = await API.get('/site-settings');
    if (result.success && result.data) {
      return result.data;
    }
    return null;
  } catch (error) {
    console.error("Lỗi tải cài đặt trang:", error);
    return null;
  }
}

export async function Header({ current, userName = null, userId = null, settings = null }) {
  userName = Security.escapeHtml(userName);
  const navItems = [
    { href: PATHS.HOME, label: 'Trang chủ', key: 'home' },
    { href: PATHS.ABOUT, label: 'Giới thiệu', key: 'about' },
    { href: PATHS.FAQ, label: 'FAQ', key: 'faq' },
    { href: PATHS.PRODUCTS, label: 'Sản phẩm', key: 'products' },
    { href: PATHS.NEWS, label: 'Tin tức', key: 'news' },
    { href: PATHS.CONTACT, label: 'Liên hệ', key: 'contact' },
  ];

  const cartHref = {
    href: PATHS.CART, label: 'Cart', key: 'cart'
  }

  const navLinks = navItems
    .map(({ href, label, key }) => {
      const active = current === key ? ' class="active"' : '';
      return `<a href="${href}"${active}>${label}</a>`;
    })
    .join('');

  let userAuthBlock = '';
  if (userName != null) {
    userAuthBlock = `
      <div class="user-profile-menu">
        <a href="${PATHS.PROFILE}?id=${userId}" class="profile-link">
          Chào, ${userName}
        </a>
        <button id="logout-btn" class="btn-logout">(Đăng xuất)</button>
      </div>
    `;
  } else {
    userAuthBlock = `
      <a href="${PATHS.LOGIN}" class="nav-auth-link">Đăng nhập</a>
    `;
  }

  const siteName = settings?.site_name || "Shoe Store";
  let logoHtml = siteName;

  if (settings && settings.logo) {
    const logoUrl = `${API_BASE}${settings.logo}`;
    logoHtml = `<img src="${logoUrl}" alt="${siteName}" class="site-logo-img" style="max-height: 40px; vertical-align: middle;">`;
  }

  return `
    <header class="site-header">
      <nav class="navbar">
        <div class="nav-left">
          <a href="/fe/" class="logo">
            ${logoHtml}
          </a>
          <a href="/fe/" class="logo">${siteName}</a>
        </div>

        <nav class="site-nav">
          ${navLinks}
          
          <div class="nav-auth">
            ${userAuthBlock}
          </div>
        </nav>

        <div class="nav-right">
          <form class="search-bar" id="search-form">
            <input type="search" id="search-input" placeholder="Tìm kiếm sản phẩm...">
            <button type="submit" class="search-button">&#128269;</button>
          </form>

          <a href="${cartHref.href}" class="cart-icon" key="${cartHref.key}">
            <i class="fas fa-shopping-cart"></i>
            <span class="cart-counter" id="cart-counter">0</span>
          </a>

          <button id="mobile-nav-toggle" class="mobile-nav-toggle" aria-label="Mở menu">
            <span class="icon-bar"></span>
            <span class="icon-bar"></span>
            <span class="icon-bar"></span>
          </button>
        </div>
      </nav>
    </header>
  `;
}

export async function mountHeader(containerSelector, current) {
  const container =
    typeof containerSelector === 'string'
      ? document.querySelector(containerSelector)
      : containerSelector;
  if (!container) return;

  container.innerHTML = `
    <header class="site-header skeleton">
    </header>
  `;

  const settings = await loadSiteSettings();

  if (settings && settings.favicon) {
    const faviconUrl = `${API_BASE}${settings.favicon}`;
    let link = document.querySelector("link[rel~='icon']");
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.getElementsByTagName('head')[0].appendChild(link);
    }
    link.href = faviconUrl;
  }

  if (!document.querySelector("link[href*='font-awesome']")) {
    const faLink = document.createElement('link');
    faLink.rel = 'stylesheet';
    faLink.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css';
    document.head.appendChild(faLink);
  }

  let userName = null;
  const userId = getUserId();

  if (userId) {
    const user = await fetchUser(userId);
    if (user) {
      userName = user.name;
    }
  }

  const headerHTML = await Header({ current, userName, userId, settings });
  container.innerHTML = headerHTML;

  const headerElement = container.querySelector('.site-header');

  if (userId) {
    await updateCartCounter(userId);
  }

  const searchForm = container.querySelector('#search-form');
  if (searchForm) {
    searchForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const query = container.querySelector('#search-input').value.trim();
      if (query) {
        window.location.href = `${PATHS.PRODUCTS}?product_query=${encodeURIComponent(query)}`;
      }
    });
  }

  const logoutBtn = container.querySelector('#logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      localStorage.removeItem('user');
      window.location.href = PATHS.LOGIN;
    });
  }

  const mobileToggle = container.querySelector('#mobile-nav-toggle');
  if (mobileToggle && headerElement) {
    mobileToggle.addEventListener('click', () => {
      headerElement.classList.toggle('mobile-nav-open');
    });
  }
}