export function Header({ current }) {
  const navItems = [
    { href: 'index.html', label: 'Home', key: 'home' },
    { href: 'login.html', label: 'Login', key: 'login' },
    { href: 'admin.html', label: 'Admin', key: 'admin' },
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
        <h1 class="site-title">Website</h1>
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


