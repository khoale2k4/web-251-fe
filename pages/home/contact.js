// Contact Form - User Side

const API_BASE = 'http://localhost/web-251-be-main';

// Load site settings to display contact info
async function loadContactInfo() {
    try {
        const response = await fetch(`${API_BASE}/site-settings`);
        const result = await response.json();

        if (result.success && result.data) {
            const settings = result.data;
            
            if (settings.email) {
                document.getElementById('infoEmail').textContent = settings.email;
            }
            if (settings.phone) {
                document.getElementById('infoPhone').textContent = settings.phone;
            }
            if (settings.address) {
                document.getElementById('infoAddress').textContent = settings.address;
            }
            if (settings.working_hours) {
                document.getElementById('infoWorkingHours').textContent = settings.working_hours;
            }
        }
    } catch (error) {
        console.error('Error loading contact info:', error);
        // Keep default values if error
    }
}

// Validate form fields
function validateField(fieldId, errorId, validator) {
    const field = document.getElementById(fieldId);
    const error = document.getElementById(errorId);
    const value = field.value.trim();

    if (validator(value)) {
        field.classList.remove('error');
        error.classList.remove('show');
        return true;
    } else {
        field.classList.add('error');
        error.classList.add('show');
        return false;
    }
}

// Validators
const validators = {
    name: (value) => value.length >= 2,
    email: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
    phone: (value) => !value || /^[0-9]{10,11}$/.test(value.replace(/[\s\-]/g, '')),
    message: (value) => value.length >= 10
};

// Submit form
async function submitContactForm(e) {
    e.preventDefault();

    // Validate all fields
    const isNameValid = validateField('name', 'nameError', validators.name);
    const isEmailValid = validateField('email', 'emailError', validators.email);
    const isPhoneValid = validateField('phone', 'phoneError', validators.phone);
    const isMessageValid = validateField('message', 'messageError', validators.message);

    if (!isNameValid || !isEmailValid || !isPhoneValid || !isMessageValid) {
        return;
    }

    // Prepare data
    const formData = {
        name: document.getElementById('name').value.trim(),
        email: document.getElementById('email').value.trim(),
        phone: document.getElementById('phone').value.trim(),
        subject: document.getElementById('subject').value.trim(),
        message: document.getElementById('message').value.trim()
    };

    // Disable submit button
    const btnSubmit = document.getElementById('btnSubmit');
    btnSubmit.disabled = true;
    btnSubmit.textContent = 'Đang gửi...';

    try {
        const response = await fetch(`${API_BASE}/contacts`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
            throw new Error(result.error || 'Gửi tin nhắn thất bại');
        }

        // Show success message
        document.getElementById('successMessage').classList.add('show');
        document.getElementById('contactForm').reset();

        // Remove all error states
        document.querySelectorAll('.form-control').forEach(el => el.classList.remove('error'));
        document.querySelectorAll('.error-message').forEach(el => el.classList.remove('show'));

        // Hide success message after 5 seconds
        setTimeout(() => {
            document.getElementById('successMessage').classList.remove('show');
        }, 5000);

    } catch (error) {
        console.error('Error submitting contact form:', error);
        alert('Không thể gửi tin nhắn. Vui lòng thử lại sau.\n\nLỗi: ' + error.message);
    } finally {
        btnSubmit.disabled = false;
        btnSubmit.textContent = 'Gửi tin nhắn';
    }
}

// Real-time validation
function setupRealtimeValidation() {
    document.getElementById('name').addEventListener('blur', () => {
        validateField('name', 'nameError', validators.name);
    });

    document.getElementById('email').addEventListener('blur', () => {
        validateField('email', 'emailError', validators.email);
    });

    document.getElementById('phone').addEventListener('blur', () => {
        validateField('phone', 'phoneError', validators.phone);
    });

    document.getElementById('message').addEventListener('blur', () => {
        validateField('message', 'messageError', validators.message);
    });
}

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    loadContactInfo();
    setupRealtimeValidation();

    document.getElementById('contactForm').addEventListener('submit', submitContactForm);
});

