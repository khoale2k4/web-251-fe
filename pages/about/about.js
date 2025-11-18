import { mountHeader } from '../../components/Header.js';
import { mountFooter } from '../../components/Footer.js';

document.addEventListener("DOMContentLoaded", () => {
  mountHeader('.mount-header', 'about');
  mountFooter('.mount-footer');
  const apiUrl = 'http://localhost:8000/page-contents';
  const baseUrl = 'http://localhost:8000';

  async function loadAboutContent() {
    try {
      const response = await fetch(apiUrl);

      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      
      const result = await response.json();

      
      if (result.success && result.data) {
        const data = result.data;

        
        const titleElement = document.getElementById('about-title');
        const contentElement = document.getElementById('about-content');
        const imageElement = document.getElementById('about-image');

        
        if (titleElement) {
          titleElement.textContent = data.about_title;
        }
        if (contentElement) {
          contentElement.textContent = data.about_content;
        }
        
        
        if (imageElement && data.about_image) {
          
          const imageUrl = baseUrl + data.about_image;
          imageElement.src = imageUrl;
          imageElement.alt = data.about_title; 
        }

      } else {
        console.error('Failed to get data:', result.message);
      }

    } catch (error) {
      console.error('Error fetching about content:', error);
      
      const hero = document.querySelector('.hero .container');
      if (hero) {
        hero.innerHTML = '<h1>Error</h1><p>Could not load page content. Please try again later.</p>';
      }
    }
  }

  
  loadAboutContent();
});