// Home Page - Load site settings

const API_BASE = 'http://localhost:8000';

// Load site settings
async function loadSiteSettings() {
    try {
        const response = await fetch(`${API_BASE}/site-settings`);
        const result = await response.json();

        if (result.success && result.data) {
            const settings = result.data;
            updatePageContent(settings);
        }
    } catch (error) {
        console.error('Error loading site settings:', error);
        // Keep default values if error
        // Remove skeleton loading
        const aboutText = document.getElementById('aboutText');
        if (aboutText) {
            aboutText.innerHTML = '<p>Shoe Store là cửa hàng chuyên cung cấp các loại giày chất lượng cao từ các thương hiệu nổi tiếng. Chúng tôi cam kết mang đến cho khách hàng những sản phẩm chính hãng, đa dạng mẫu mã với giá cả hợp lý.</p>';
        }
    }
}

// Update page content with settings
function updatePageContent(settings) {
    // Update page meta
    if (settings.site_title) {
        document.getElementById('pageTitle').textContent = settings.site_title;
        document.title = settings.site_title;
    }

    if (settings.site_description) {
        document.getElementById('pageDescription').content = settings.site_description;
    }

    if (settings.site_keywords) {
        document.getElementById('pageKeywords').content = settings.site_keywords;
    }

    if (settings.favicon) {
        document.getElementById('pageFavicon').href = settings.favicon;
    }

    // Update hero section
    if (settings.site_name) {
        document.getElementById('heroTitle').textContent = `Chào mừng đến với ${settings.site_name}`;
    }

    if (settings.site_description) {
        document.getElementById('heroSubtitle').textContent = settings.site_description;
    }

    // Update about section
    if (settings.about_us) {
        document.getElementById('aboutText').innerHTML = `<p>${escapeHtml(settings.about_us)}</p>`;
    } else {
        document.getElementById('aboutText').innerHTML = '<p>Shoe Store là cửa hàng chuyên cung cấp các loại giày chất lượng cao từ các thương hiệu nổi tiếng. Chúng tôi cam kết mang đến cho khách hàng những sản phẩm chính hãng, đa dạng mẫu mã với giá cả hợp lý.</p>';
    }

    // Update contact info
    if (settings.email) {
        document.getElementById('contactEmail').textContent = settings.email;
    }

    if (settings.phone) {
        document.getElementById('contactPhone').textContent = settings.phone;
    }

    if (settings.address) {
        document.getElementById('contactAddress').textContent = settings.address;
    }

    if (settings.working_hours) {
        document.getElementById('contactHours').textContent = settings.working_hours;
    }

    // Update social links
    const socialLinks = document.getElementById('socialLinks');
    let hasSocialLinks = false;

    if (settings.facebook) {
        document.getElementById('socialFacebook').href = settings.facebook;
        hasSocialLinks = true;
    }

    if (settings.instagram) {
        document.getElementById('socialInstagram').href = settings.instagram;
        hasSocialLinks = true;
    }

    if (settings.youtube) {
        document.getElementById('socialYoutube').href = settings.youtube;
        hasSocialLinks = true;
    }

    // Show social links if at least one exists
    if (hasSocialLinks) {
        socialLinks.style.display = 'block';
    }
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    loadSiteSettings();
});

