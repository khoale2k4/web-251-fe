import { ready } from '../../js/main.js';
import { mountHeader } from '../../components/Header.js';
import { mountFooter } from '../../components/Footer.js';

ready(() => {
  // Determine current page based on URL
  const currentPage = window.location.pathname.includes('contact') ? 'contact' : 'home';
  
  mountHeader('.mount-header', currentPage);
  mountFooter('.mount-footer');
  
  // Handle contact form if it exists
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const formData = new FormData(contactForm);
      const name = formData.get('name');
      const email = formData.get('email');
      const message = formData.get('message');
      
      if (!name || !email || !message) {
        alert('Vui lòng điền đầy đủ thông tin');
        return;
      }
      
      alert(`Cảm ơn ${name}! Tin nhắn của bạn đã được gửi thành công.`);
      contactForm.reset();
    });
  }
});



