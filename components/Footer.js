import { SITE_DEFAULTS } from "../js/config.js";

export function Footer({ userName = SITE_DEFAULTS.NAME } = {}) {
  const year = new Date().getFullYear();
  return `
    <footer class="site-footer">
      <div class="container">
        <p>© ${year} ${userName}. All rights reserved.</p>
      </div>
    </footer>
  `;
}

export function mountFooter(containerSelector) {
  const container =
    typeof containerSelector === 'string'
      ? document.querySelector(containerSelector)
      : containerSelector;
  if (!container) return;
  container.innerHTML = Footer();
}