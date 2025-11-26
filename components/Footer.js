import { SITE_DEFAULTS } from "../js/config.js";

export function Footer({ userName = SITE_DEFAULTS.NAME } = {}) {
  const year = new Date().getFullYear();
  return `
    <footer class="site-footer">
      <div class="container">
        <div class="footer-content">
          <div class="footer-column">
            <h3 class="footer-title">Về Chúng Tôi</h3>
            <p class="footer-text">
              Chúng tôi cung cấp những mẫu giày chất lượng cao, 
              mang lại sự thoải mái và phong cách cho mọi bước đi của bạn.
            </p>
            <div class="social-links">
              <a href="#" class="social-link"><i class="fab fa-facebook"></i></a>
              <a href="#" class="social-link"><i class="fab fa-instagram"></i></a>
              <a href="#" class="social-link"><i class="fab fa-twitter"></i></a>
            </div>
          </div>

          <div class="footer-column">
            <h3 class="footer-title">Liên Kết Nhanh</h3>
            <ul class="footer-links">
              <li><a href="/fe/pages/home/index.html">Trang Chủ</a></li>
              <li><a href="/fe/pages/products/products.html">Sản Phẩm</a></li>
              <li><a href="/fe/pages/about/index.html">Về Chúng Tôi</a></li>
              <li><a href="/fe/pages/news/news.html">Tin Tức</a></li>
            </ul>
          </div>

          <div class="footer-column">
            <h3 class="footer-title">Hỗ Trợ</h3>
            <ul class="footer-links">
              <li><a href="#">Chính Sách Đổi Trả</a></li>
              <li><a href="#">Hướng Dẫn Chọn Size</a></li>
              <li><a href="#">Câu Hỏi Thường Gặp</a></li>
              <li><a href="#">Liên Hệ</a></li>
            </ul>
          </div>

          <div class="footer-column">
            <h3 class="footer-title">Đăng Ký Nhận Tin</h3>
            <p class="footer-text">Nhận thông tin về sản phẩm mới và khuyến mãi.</p>
            <form class="newsletter-form" onsubmit="event.preventDefault(); alert('Cảm ơn bạn đã đăng ký!');">
              <input type="email" placeholder="Email của bạn" required>
              <button type="submit">Gửi</button>
            </form>
          </div>
        </div>
        
        <div class="footer-bottom">
          <p>&copy; ${year} ${userName}. All rights reserved.</p>
        </div>
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