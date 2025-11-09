<<<<<<< HEAD
<<<<<<< HEAD
=======
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
=======
>>>>>>> 57af7556f01f0f68333a2dd3e40f3d237a370b7c
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
<<<<<<< HEAD
=======
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
=======
>>>>>>> 57af7556f01f0f68333a2dd3e40f3d237a370b7c


>>>>>>> fd06cc4569a6982f7b46b54b50aed7ebf617085a
