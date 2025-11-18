
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

        if (titleElement) {
          titleElement.textContent = data.about_title;
        }
        if (contentElement) {
          contentElement.textContent = data.about_content;
        }
        
        
        
        
        const galleryRow = document.getElementById('about-gallery-row');
        
        if (galleryRow && data.about_image) {
          let imageUrls = [];
          try {
            
            const decodedString = data.about_image.replace(/&quot;/g, '"');
            imageUrls = JSON.parse(decodedString);
          } catch (e) {
            console.error('Lỗi khi parse mảng ảnh (about_image):', e);
          }

          
          if (Array.isArray(imageUrls) && imageUrls.length > 0) {
            
            
            galleryRow.innerHTML = ''; 
            
            
            imageUrls.forEach(imageUrlPath => {
              const fullImageUrl = baseUrl + imageUrlPath;
              
              
              const colHtml = `
                <div class="col mb-3">
                  <div class="bg-cover rounded bg-body-tertiary" style="height: 15rem">
                    <img src="${fullImageUrl}" 
                         alt="${data.about_title}" 
                         class="bg-cover rounded" 
                         style="height: 15rem; width: 100%; object-fit: cover;">
                  </div>
                </div>
              `;
              
              
              galleryRow.innerHTML += colHtml;
            });

          } else {
            console.warn('Mảng about_image rỗng hoặc không hợp lệ.');
          }
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