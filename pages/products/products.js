import { ready } from '../../js/main.js';
import { mountHeader } from '../../components/Header.js';
import { mountFooter } from '../../components/Footer.js';

ready(() => {
  mountHeader('.mount-header', 'products');
  mountFooter('.mount-footer');
  
  // Add product interaction handlers
  const productButtons = document.querySelectorAll('.btn-primary');
  productButtons.forEach(button => {
    button.addEventListener('click', (e) => {
      e.preventDefault();
      const productCard = e.target.closest('.product-card');
      const productName = productCard.querySelector('h3').textContent;
      alert(`Đã thêm "${productName}" vào giỏ hàng!`);
    });
  });
});
