import { mountHeader } from '../../components/Header.js';
import { mountFooter } from '../../components/Footer.js';

// API cũ: nội dung hero + gallery
const API_PAGE_CONTENT = 'http://localhost:8000/page-contents';
const BASE_URL = 'http://localhost:8000';

// API mới: danh sách 3 section About (giữ nguyên PHP như bạn đã làm)
const API_ABOUT_SECTIONS = 'http://localhost/be/api/about_sections_list.php';

document.addEventListener("DOMContentLoaded", () => {
  // Giữ nguyên header/footer
  mountHeader('.mount-header', 'about');
  mountFooter('.mount-footer');

  // Nội dung hero + gallery cũ
  loadAboutContent();

  // 3 khung About mới
  loadAboutSections();
});

/* ============== HERO + GALLERY CŨ ============== */

async function loadAboutContent() {
  try {
    const response = await fetch(API_PAGE_CONTENT);

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

      // gallery ảnh
      const galleryRow = document.getElementById('about-gallery-row');

      if (galleryRow && data.about_image) {
        let imageUrls = [];
        try {
          // about_image đang lưu dạng JSON encode -> decode & parse
          const decodedString = data.about_image.replace(/&quot;/g, '"');
          imageUrls = JSON.parse(decodedString);
        } catch (e) {
          console.error('Lỗi khi parse mảng ảnh (about_image):', e);
        }

        if (Array.isArray(imageUrls) && imageUrls.length > 0) {
          galleryRow.innerHTML = '';

          imageUrls.forEach((imageUrlPath) => {
            const fullImageUrl = BASE_URL + imageUrlPath;

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
      hero.innerHTML =
        '<h1>Error</h1><p>Could not load page content. Please try again later.</p>';
    }
  }
}

/* ============== 3 SECTION ABOUT MỚI ============== */

async function loadAboutSections() {
  const container = document.getElementById('about-sections');
  if (!container) return;

  try {
    const res = await fetch(API_ABOUT_SECTIONS);
    if (!res.ok) {
      throw new Error('HTTP status ' + res.status);
    }

    const json = await res.json();
    console.log('[About] about_sections JSON:', json);

    // PHP đang trả { status: 'success', data: [...] }
    if (json.status !== 'success' || !Array.isArray(json.data)) {
      throw new Error(json.message || 'Dữ liệu trả về không hợp lệ');
    }

    const sections = json.data.slice(0, 3);

    // Xoá skeleton
    container.innerHTML = '';

    sections.forEach((item, index) => {
      const sectionEl = createAboutSection(item, index);
      container.appendChild(sectionEl);
    });

    setupScrollReveal();
  } catch (error) {
    console.error('[About] Lỗi tải about_sections:', error);
    container.innerHTML = `
      <p class="text-center text-muted">
        Không tải được nội dung giới thiệu chi tiết. Vui lòng thử lại sau.
      </p>
    `;
  }
}

function createAboutSection(item, index) {
  const section = document.createElement('section');
  section.className = 'about-section';

  const title = item.title || item.heading || `Giới thiệu #${index + 1}`;
  const rawDesc = item.description || item.content || item.body || '';
  const desc = String(rawDesc).replace(/\n/g, '<br>');

  const imageUrl =
    item.image_url && String(item.image_url).trim()
      ? item.image_url
      : '../../1.jpg'; // đổi path nếu cần

  section.innerHTML = `
    <div class="about-section__content">
      <p class="about-section__label">Giới thiệu #${index + 1}</p>
      <h2 class="about-section__title">${escapeHtml(title)}</h2>
      <p class="about-section__text">${desc}</p>
    </div>
    <div class="about-section__image-wrapper">
      <img
        src="${imageUrl}"
        alt="${escapeHtml(title)}"
        class="about-section__image"
      />
    </div>
  `;

  return section;
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Scroll reveal + stagger
function setupScrollReveal() {
  const sections = document.querySelectorAll('.about-section');
  if (sections.length === 0) return;

  if (!('IntersectionObserver' in window)) {
    sections.forEach((section) => section.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.2 }
  );

  sections.forEach((section, index) => {
    section.style.transitionDelay = `${index * 0.15}s`; // stagger
    observer.observe(section);
  });
}
