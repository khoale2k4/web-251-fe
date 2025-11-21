// profile.js (Đã cập nhật)

import { ready } from '../../js/main.js';
import { mountHeader } from '../../components/Header.js';
import { mountFooter } from '../../components/Footer.js';
import { Popup } from '../../components/PopUp.js';
import { BASE_URL } from '../../js/config.js';

// --- 1. HÀM GỌI API ---

/**
 * HÀM MỚI: Chỉ để upload file
 * @param {File} file - File ảnh người dùng đã chọn
 */
async function uploadImage(file) {
    const uploadData = new FormData();
    uploadData.append('file', file); // 'file' là key mà server /upload mong đợi

    try {
        // Lưu ý: KHÔNG set 'Content-Type' thủ công khi dùng FormData,
        // trình duyệt sẽ tự động làm đúng.
        const response = await fetch(`${BASE_URL}/upload`, {
            method: 'POST',
            body: uploadData
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
            throw new Error(result.message || 'Upload ảnh thất bại');
        }

        // Trả về kết quả (VD: { success: true, url: '/storage/...' })
        return result;

    } catch (err) {
        console.error("Lỗi khi upload ảnh:", err);
        throw err;
    }
}


/**
 * HÀM ĐÃ SỬA: Thêm xác thực (Authorization)
 */
async function fetchUserProfile(userId) {
    try {
        const response = await fetch(`${BASE_URL}/users/${userId}`, {
        });

        if (!response.ok) {
            if (response.status === 401 || response.status === 403) {
                localStorage.removeItem('userId');
            }
            throw new Error(`HTTP ${response.status} - Không tìm thấy người dùng`);
        }

        const result = await response.json();
        if (result.success && result.data) {
            return { ...result.data, password: '' };
        } else {
            return result;
        }

    } catch (err) {
        console.error("Lỗi khi tải hồ sơ:", err);
        return null; // Trả về null nếu thất bại
    }
}

async function updateUserProfile(userId, data) {
    try {
        const response = await fetch(`${BASE_URL}/users/${userId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();
        if (!response.ok || !result.success) {
            throw new Error(result.message || 'Cập nhật thất bại');
        }
        return result.data; // Trả về dữ liệu đã cập nhật

    } catch (err) {
        console.error("Lỗi khi cập nhật hồ sơ:", err);
        throw err; // Ném lỗi để hàm gọi xử lý
    }
}


// --- 2. HÀM RENDER --- (Giữ nguyên)

function renderProfile(user, isOwner) {
    const container = document.querySelector('.profile-container');
    const readonlyClass = isOwner ? '' : 'is-readonly';
    const readonlyAttr = isOwner ? '' : 'readonly';
    const avatarUrl = user.avatar ? `${BASE_URL}${user.avatar}` : '../../assets/images/noAvatar.png';

    const profileHTML = `
        <form id="profileForm" class="${readonlyClass}" autocomplete="off">
            <input type="text" name="fake-username" autocomplete="username" style="display:none;">
            <input type="password" name="fake-password" autocomplete="new-password" style="display:none;">

            <div class="profile-avatar-column">
                <img src="${avatarUrl}" alt="Avatar" class="avatar-preview" id="avatarPreview">
                <label for="avatar-upload" class="avatar-upload-label">
                    Thay ảnh đại diện
                </label>
                <input type="file" id="avatar-upload" name="avatar" accept="image/*">
            </div>

            <div class="profile-info-column">
                <h2>Thông tin Hồ sơ</h2>

                <div class="form-group">
                    <label for="name">Họ và tên</label>
                    <input type="text" id="name" name="name" value="${user.name}" ${readonlyAttr} autocomplete="off">
                </div>

                <div class="form-group">
                    <label for="phone">Số điện thoại</label>
                    <input 
                        type="tel" 
                        id="phone" 
                        name="phone" 
                        value="${user.phone || ''}" 
                        ${readonlyAttr} 
                        autocomplete="off"
                    >
                </div>

                <div class="form-group">
                    <label for="password">Mật khẩu</label>
                    <input 
                        type="password" 
                        id="password" 
                        name="password" 
                        value="${user.password || ''}" 
                        autocomplete="new-password"
                    >
                </div>

                <div class="form-group">
                    <label>Email</label>
                    <span>${user.email}</span>
                </div>

                <div class="form-group">
                    <label>Vai trò</label>
                    <span>${user.role}</span>
                </div>

                <div class="form-actions">
                    <button type="submit" class="btn-save">Lưu thay đổi</button>
                </div>
            </div>

        </form>

    `;
    container.innerHTML = profileHTML;
}


// --- 3. HÀM GẮN SỰ KIỆN (ĐÃ CẬP NHẬT) ---

function attachProfileEvents(user, isOwner, popup) {
    if (!isOwner) return;

    const form = document.getElementById('profileForm');
    const avatarInput = document.getElementById('avatar-upload');
    const avatarPreview = document.getElementById('avatarPreview');

    // 3a. Sự kiện xem trước (Preview) ảnh (Giữ nguyên)
    avatarInput.addEventListener('change', () => {
        const file = avatarInput.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                avatarPreview.src = e.target.result;
            };
            reader.readAsDataURL(file);
        }
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const saveBtn = form.querySelector('.btn-save');
        saveBtn.disabled = true;
        saveBtn.textContent = 'Đang lưu...';

        try {
            // Lấy file và text từ form
            const formData = new FormData(form);
            const file = avatarInput.files[0];

            // Bắt đầu với URL ảnh hiện tại
            let newAvatarUrl = user.avatar;
            console.log(phone);

            if (phone && !/^0\d{9,10}$/.test(formData.get('phone'))) {
                popup.show({
                    title: "Lỗi",
                    content: `<p>Số điện thoại không hợp lệ. Vui lòng kiểm tra lại (phải bắt đầu bằng 0, và có 10 hoặc 11 chữ số).</p>`,
                    actions: [{ label: 'Đóng', type: 'btn-secondary', close: true }]
                });
                saveBtn.disabled = false;
                saveBtn.textContent = 'Lưu thay đổi';
                return; // Dừng hàm
            }

            // --- BƯỚC 1: UPLOAD ẢNH (NẾU CÓ) ---
            if (file && file.size > 0) {
                // Chỉ upload nếu người dùng chọn file mới
                const uploadResult = await uploadImage(file);

                if (uploadResult && uploadResult.url) {
                    newAvatarUrl = uploadResult.url; // Lấy URL mới từ server
                } else {
                    throw new Error("Lỗi khi upload ảnh, không nhận được URL.");
                }
            }

            // --- BƯỚC 2: CẬP NHẬT HỒ SƠ ---
            // Chuẩn bị dữ liệu text VÀ URL ảnh mới
            const dataToUpdate = {
                name: formData.get('name'),
                phone: formData.get('phone'),
                password: formData.get('password'),
                avatar: newAvatarUrl // Gửi URL (cũ hoặc mới) lên server
            };

            await updateUserProfile(user.id, dataToUpdate);

            popup.show({
                title: "Thành công!",
                content: "Hồ sơ của bạn đã được cập nhật.",
                actions: [{ label: 'OK', type: 'btn-primary', close: true }]
            });

            // Cập nhật lại header nếu tên thay đổi
            if (dataToUpdate.name !== user.name) {
                mountHeader('.mount-header', 'profile'); // Render lại header
            }

        } catch (err) {
            popup.show({
                title: "Lỗi",
                content: `<p>${err.message}</p>`,
                actions: [{ label: 'Đóng', type: 'btn-secondary', close: true }]
            });
        } finally {
            // Bật lại nút bấm dù thành công hay thất bại
            saveBtn.disabled = false;
            saveBtn.textContent = 'Lưu thay đổi';
        }
    });
}


// --- 4. HÀM KHỞI CHẠY CHÍNH ---
ready(async () => {
    mountHeader('.mount-header', 'profile');
    mountFooter('.mount-footer');

    const popup = new Popup();
    const container = document.querySelector('.profile-container');

    try {
        const params = new URLSearchParams(window.location.search);
        const profileId = params.get('id');
        if (!profileId) throw new Error("Không tìm thấy ID người dùng trong URL.");

        const loggedInUserId = localStorage.getItem('userId');

        // Tải hồ sơ (đã sửa hàm fetch)
        const user = await fetchUserProfile(profileId);

        if (!user) {
            throw new Error("Không tìm thấy hồ sơ người dùng.");
        }

        const isOwner = (loggedInUserId && String(loggedInUserId) === String(profileId));

        renderProfile(user, isOwner);
        attachProfileEvents(user, isOwner, popup);

    } catch (err) {
        container.innerHTML = `<p class="error-text">${err.message}</p>`;
    }
});