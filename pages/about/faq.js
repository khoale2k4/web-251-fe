import { ready } from '../../js/main.js';
import { mountHeader } from '../../components/Header.js';
import { mountFooter } from '../../components/Footer.js';
import { API_BASE } from '../../js/config.js';

/**
 * Tạo 1 card FAQ (1 cột question + answer)
 */
function createFaqCard(faq, position = 'left') {
  const article = document.createElement('article');
  article.className = `faq-card faq-card-${position}`;

  const answerText = faq.answer && faq.answer.trim()
    ? faq.answer
    : 'Câu trả lời đang được cập nhật.';

  article.innerHTML = `
    <h3>${faq.question}</h3>
    <p>${answerText}</p>
  `;

  return article;
}

/**
 * Render FAQs theo layout timeline: mỗi hàng 2 câu hỏi (trái/phải)
 */
function renderFaqTimeline(container, faqs) {
  container.innerHTML = '';

  for (let i = 0; i < faqs.length; i += 2) {
    const row = document.createElement('div');
    row.className = 'faq-timeline-row';

    // LEFT CARD
    const leftCard = createFaqCard(faqs[i], 'left');
    row.appendChild(leftCard);

    // CENTER MARKER
    const marker = document.createElement('div');
    marker.className = 'faq-timeline-marker';
    marker.innerHTML = '<span class="faq-marker-icon"></span>';
    row.appendChild(marker);

    // RIGHT CARD (nếu còn phần tử)
    if (faqs[i + 1]) {
      const rightCard = createFaqCard(faqs[i + 1], 'right');
      row.appendChild(rightCard);
    } else {
      // Nếu lẻ, thêm 1 card rỗng để layout vẫn đủ 3 cột
      const empty = document.createElement('div');
      empty.className = 'faq-card faq-card-right';
      empty.style.visibility = 'hidden';
      row.appendChild(empty);
    }

    container.appendChild(row);
  }
}

/**
 * Gọi API /faqs lấy dữ liệu từ DB
 */
async function loadFaqs() {
  const container = document.querySelector('.faq-timeline');
  if (!container) return;

  container.innerHTML = '<p>Đang tải danh sách câu hỏi...</p>';

  try {
    const res = await fetch(`${API_BASE}/faqs?status=answered`);
    const data = await res.json();

    if (!data.success || !Array.isArray(data.data) || data.data.length === 0) {
      container.innerHTML = '<p>Chưa có câu hỏi nào.</p>';
      return;
    }

    renderFaqTimeline(container, data.data);
  } catch (error) {
    console.error('Error loading FAQs:', error);
    container.innerHTML = '<p>Có lỗi xảy ra khi tải FAQ. Vui lòng thử lại sau.</p>';
  }
}

ready(async () => {
  mountHeader('.mount-header', 'faq');
  mountFooter('.mount-footer');
  await loadFaqs();
});
