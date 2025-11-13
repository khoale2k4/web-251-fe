import { updateCartCounter } from "../js/updateCartCounter.js";

const API_BASE = 'http://localhost:8000';

/**
 * --- HÀM 1: fetchUser (HÀM MỚI) ---
 * Hàm này sẽ được gọi khi mount để lấy chi tiết user
 */
async function fetchUser(userId) {
  if (!userId) return null;

  try {
    const response = await fetch(`${API_BASE}/users/${userId}`);

    if (!response) {
      return null;
    }

    const result = await response.json();
    if (result) {
      return result;
    }
    return null;

  } catch (err) {
    console.error("Lỗi khi tải thông tin user:", err);
    return null;
  }
}

/**
 * --- HÀM 2: Header (Giữ nguyên) ---
 * Hàm này chỉ render, không thay đổi
 */
export async function Header({ current, userName = null, userId = null }) {
  const navItems = [
    { href: '/fe/pages/home/index.html', label: 'Home', key: 'home' },
    { href: '/fe/pages/about/about.html', label: 'About', key: 'about' },
    { href: '/fe/pages/products/products.html', label: 'Products', key: 'products' },
    { href: '/fe/pages/news/news.html', label: 'News', key: 'news' },
    { href: '/fe/pages/home/contact.html', label: 'Contact', key: 'contact' },
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

  let userAuthBlock = '';
  if (userName) {
    userAuthBlock = `
      <div class="user-profile-menu">
        <a href="/fe/pages/profile/profile.html?id=${userId}" class="profile-link">
          Chào, ${userName}
        </a>
        <button id="logout-btn" class="btn-logout">(Đăng xuất)</button>
      </div>
    `;
  } else {
    userAuthBlock = `
      <a href="/fe/pages/home/login.html" class="nav-auth-link">Đăng nhập</a>
    `;
  }

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

          <a href="${cartHref.href}" class="cart-icon" key="${cartHref.key}">
            &#128722;
            <span class="cart-counter" id="cart-counter">0</span>
          </a>

          <div class="nav-auth">
            ${userAuthBlock}
          </div>
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

  // 1. Render skeleton (giữ nguyên)
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

  // 2. Lấy thông tin user (giữ nguyên)
  let userName = null;
  const userId = localStorage.getItem('userId');

  if (userId) {
    const user = await fetchUser(userId);
    // KHÔNG gọi updateCartCounter ở đây
    if (user) {
      userName = user.name;
    }
  }

  // 3. Render HTML header thật (giữ nguyên)
  const headerHTML = await Header({ current, userName, userId });
  container.innerHTML = headerHTML; // <-- Thẻ #cart-counter bây giờ mới tồn tại

  // 4. --- SỬA LỖI ---
  // Gọi updateCartCounter SAU KHI header đã được render
  if (userId) {
    await updateCartCounter(userId); // <-- VỊ TRÍ ĐÚNG
  }

  // 5. Gắn các sự kiện (giữ nguyên)
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

  const logoutBtn = container.querySelector('#logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      localStorage.removeItem('userId');
      // Tùy chọn: Xóa cả token nếu bạn có
      // localStorage.removeItem('authToken'); 

      alert('Bạn đã đăng xuất.');
      window.location.href = '/fe/pages/home/login.html';
    });
  }
}