import { API_BASE } from '../../js/config.js';

let currentSettings = null;

// Helper: Normalize path to ensure single /storage/ prefix
function normalizeStoragePath(path) {
    if (!path) return '';
    // Remove API_BASE if present
    let normalized = path.replace(API_BASE, '');
    // Remove duplicate /storage/ prefixes
    while (normalized.includes('/storage//storage/')) {
        normalized = normalized.replace('/storage//storage/', '/storage/');
    }
    // Ensure path starts with /storage/
    if (!normalized.startsWith('/storage/')) {
        normalized = '/storage/' + normalized.replace(/^\/+/, '');
    }
    return normalized;
}

// Helper: Get full URL for display
function getFullImageUrl(path) {
    if (!path) return '';
    return API_BASE + normalizeStoragePath(path);
}

async function loadSettings() {
    try {
        const response = await fetch(`${API_BASE}/site-settings`);
        const result = await response.json();

        if (!result.success) {
            throw new Error(result.error);
        }

        currentSettings = result.data;
        populateForm(currentSettings);

    } catch (error) {
        console.error('Error loading settings:', error);
        alert('Không thể tải cấu hình. Vui lòng thử lại.');
    }
}

function populateForm(settings) {
    document.getElementById('siteName').value = settings.site_name || '';
    document.getElementById('siteTitle').value = settings.site_title || '';
    document.getElementById('siteDescription').value = settings.site_description || '';
    document.getElementById('siteKeywords').value = settings.site_keywords || '';

    document.getElementById('email').value = settings.email || '';
    document.getElementById('phone').value = settings.phone || '';
    document.getElementById('address').value = settings.address || '';
    document.getElementById('workingHours').value = settings.working_hours || '';

    document.getElementById('facebook').value = settings.facebook || '';
    document.getElementById('instagram').value = settings.instagram || '';
    document.getElementById('youtube').value = settings.youtube || '';

    document.getElementById('aboutUs').value = settings.about_us || '';
    document.getElementById('copyright').value = settings.copyright || '';

    // Display logo - API returns path with /storage/ prefix
    if (settings.logo) {
        document.getElementById('logoPreview').src = getFullImageUrl(settings.logo);
        document.getElementById('logoPreview').style.display = 'block';
        document.getElementById('noLogo').style.display = 'none';
    } else {
        document.getElementById('logoPreview').style.display = 'none';
        document.getElementById('noLogo').style.display = 'block';
    }

    // Display favicon
    if (settings.favicon) {
        document.getElementById('faviconPreview').src = getFullImageUrl(settings.favicon);
        document.getElementById('faviconPreview').style.display = 'block';
        document.getElementById('noFavicon').style.display = 'none';
    } else {
        document.getElementById('faviconPreview').style.display = 'none';
        document.getElementById('noFavicon').style.display = 'block';
    }

    // Last update
    if (settings.updated_at) {
        document.getElementById('lastUpdate').textContent = new Date(settings.updated_at).toLocaleString('vi-VN');
    }
}

async function saveSettings(e) {
    e.preventDefault();

    const btnSave = document.getElementById('btnSave');
    const originalText = btnSave.innerHTML;
    btnSave.disabled = true;
    btnSave.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Đang lưu...';

    try {
        const formData = {
            site_name: document.getElementById('siteName').value,
            site_title: document.getElementById('siteTitle').value,
            site_description: document.getElementById('siteDescription').value,
            site_keywords: document.getElementById('siteKeywords').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            address: document.getElementById('address').value,
            working_hours: document.getElementById('workingHours').value,
            facebook: document.getElementById('facebook').value,
            instagram: document.getElementById('instagram').value,
            youtube: document.getElementById('youtube').value,
            about_us: document.getElementById('aboutUs').value,
            copyright: document.getElementById('copyright').value
        };

        // Add logo and favicon with normalized /storage/ prefix
        if (currentSettings.logo) {
            formData.logo = normalizeStoragePath(currentSettings.logo);
        }
        if (currentSettings.favicon) {
            formData.favicon = normalizeStoragePath(currentSettings.favicon);
        }

        const response = await fetch(`${API_BASE}/site-settings`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        const result = await response.json();

        if (!result.success) {
            throw new Error(result.error || 'Failed to save settings');
        }

        alert('Đã lưu cấu hình thành công!');
        loadSettings();

    } catch (error) {
        console.error('Error saving settings:', error);
        alert('Không thể lưu cấu hình. Vui lòng thử lại.');
    } finally {
        btnSave.disabled = false;
        btnSave.innerHTML = originalText;
    }
}

async function uploadImage(file, type) {
    try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', type);
        formData.append("folder", "storage");
        formData.append("target", "");

        const response = await fetch(`${API_BASE}/upload`, {
            method: 'POST',
            body: formData
        });

        const result = await response.json();

        if (!result.success) {
            throw new Error(result.error || 'Upload failed');
        }

        // API returns filename in relativePath, normalize to /storage/filename
        const storagePath = normalizeStoragePath(result.relativePath);
        const fullUrl = getFullImageUrl(storagePath);
        console.log('Uploaded:', storagePath, '-> Display:', fullUrl);

        // Update current settings and preview
        if (type === 'logo') {
            currentSettings.logo = storagePath;
            document.getElementById('logoPreview').src = fullUrl;
            document.getElementById('logoPreview').style.display = 'block';
            document.getElementById('noLogo').style.display = 'none';
        } else if (type === 'favicon') {
            currentSettings.favicon = storagePath;
            document.getElementById('faviconPreview').src = fullUrl;
            document.getElementById('faviconPreview').style.display = 'block';
            document.getElementById('noFavicon').style.display = 'none';
        }

        alert('Upload thành công!');

    } catch (error) {
        console.error('Error uploading image:', error);
        alert('Không thể upload file. Vui lòng thử lại.');
    }
}

function handleFileSelect(e, type) {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
        alert('Vui lòng chọn file hình ảnh!');
        return;
    }

    if (file.size > 5 * 1024 * 1024) {
        alert('File quá lớn! Vui lòng chọn file nhỏ hơn 5MB.');
        return;
    }

    uploadImage(file, type);
}

function setupDragAndDrop(uploadAreaId, inputId, type) {
    const uploadArea = document.getElementById(uploadAreaId);
    const input = document.getElementById(inputId);

    uploadArea.addEventListener('click', () => {
        input.click();
    });

    input.addEventListener('change', (e) => {
        handleFileSelect(e, type);
    });

    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    });

    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('dragover');
    });

    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');

        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            uploadImage(file, type);
        } else {
            alert('Vui lòng chọn file hình ảnh!');
        }
    });
}

document.addEventListener('DOMContentLoaded', function () {
    loadSettings();

    document.getElementById('settingsForm').addEventListener('submit', saveSettings);

    setupDragAndDrop('logoUploadArea', 'logoInput', 'logo');
    setupDragAndDrop('faviconUploadArea', 'faviconInput', 'favicon');
});
