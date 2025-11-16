// Admin Page Contents Management
import { BASE_URL } from '../../js/config.js';

const API_BASE = BASE_URL; // ví dụ: http://localhost/web-251-be
let currentContents = null;

// Load data từ BE
async function loadPageContents() {
    try {
        // GỌI API MỚI (không .php nữa)
        const response = await fetch(`${API_BASE}/page-contents`);
        const result = await response.json();

        if (!result.success) {
            throw new Error(result.error || 'Load failed');
        }
        currentContents = result.data || {};
        fillForm(currentContents);
    } catch (err) {
        console.error(err);
        alert('Không tải được nội dung trang. Vui lòng thử lại.');
    }
}

function fillForm(data) {
    // Trang chủ - hero
    document.getElementById('homeHeroTitle').value =
        data.home_hero_title || '';
    document.getElementById('homeHeroSubtitle').value =
        data.home_hero_subtitle || '';
    document.getElementById('homeHeroButtonText').value =
        data.home_hero_button_text || '';
    document.getElementById('homeHeroButtonLink').value =
        data.home_hero_button_link || '';
    document.getElementById('homeHeroImage').value =
        data.home_hero_image || '';

    // Trang chủ - intro
    document.getElementById('homeIntroTitle').value =
        data.home_intro_title || '';
    document.getElementById('homeIntroText').value =
        data.home_intro_text || '';

    // Trang giới thiệu
    document.getElementById('aboutTitle').value =
        data.about_title || '';
    document.getElementById('aboutContent').value =
        data.about_content || '';
    document.getElementById('aboutImage').value =
        data.about_image || '';

    if (data.updated_at) {
        document.getElementById('lastUpdate').textContent =
            new Date(data.updated_at).toLocaleString('vi-VN');
    }
}

// Save data xuống BE
async function savePageContents(e) {
    e.preventDefault();

    const btnSave = document.getElementById('btnSave');
    const originalText = btnSave.innerHTML;
    btnSave.disabled = true;
    btnSave.innerHTML =
        '<span class="spinner-border spinner-border-sm me-2"></span>Đang lưu...';

    try {
        const payload = {
            home_hero_title: document.getElementById('homeHeroTitle').value.trim(),
            home_hero_subtitle: document.getElementById('homeHeroSubtitle').value.trim(),
            home_hero_button_text: document.getElementById('homeHeroButtonText').value.trim(),
            home_hero_button_link: document.getElementById('homeHeroButtonLink').value.trim(),
            home_hero_image: document.getElementById('homeHeroImage').value.trim(),
            home_intro_title: document.getElementById('homeIntroTitle').value.trim(),
            home_intro_text: document.getElementById('homeIntroText').value.trim(),
            about_title: document.getElementById('aboutTitle').value.trim(),
            about_content: document.getElementById('aboutContent').value.trim(),
            about_image: document.getElementById('aboutImage').value.trim(),
        };

        // GỌI API MỚI (PUT /page-contents)
        const response = await fetch(`${API_BASE}/page-contents`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        const result = await response.json();

        if (!result.success) {
            throw new Error(result.error || 'Save failed');
        }

        currentContents = result.data;
        alert('Đã lưu nội dung trang thành công!');

        if (currentContents.updated_at) {
            document.getElementById('lastUpdate').textContent =
                new Date(currentContents.updated_at).toLocaleString('vi-VN');
        }
    } catch (err) {
        console.error(err);
        alert('Không thể lưu nội dung. Vui lòng thử lại.');
    } finally {
        btnSave.disabled = false;
        btnSave.innerHTML = originalText;
    }
}

// Init
document.addEventListener('DOMContentLoaded', () => {
    loadPageContents();
    document
        .getElementById('pageContentForm')
        .addEventListener('submit', savePageContents);
});
