export function Footer() {
  const year = new Date().getFullYear();
  return `
    <footer class="site-footer">
      <div class="container">
        <p>© ${year} Website. All rights reserved.</p>
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


