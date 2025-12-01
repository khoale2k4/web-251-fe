import { ready } from '../../js/main.js';
import { mountHeader } from '../../components/Header.js';
import { mountFooter } from '../../components/Footer.js';
import { Popup } from '../../components/PopUp.js';
import { API_BASE } from '../../js/config.js';

const BASE_URL = API_BASE;
const filePath = 'storage';
const avatarPath = '/' + filePath;

async function uploadImage(file) {
    const uploadData = new FormData();
    uploadData.append('file', file);
    uploadData.append("folder", filePath);
    uploadData.append("target", "");

    try {
        const response = await fetch(`${BASE_URL}/upload`, {
            method: 'POST',
            body: uploadData
        });

        const result = await response.json();

        if (!result.success) {
            throw new Error(result.message || 'Upload ảnh thất bại');
        }

        return result;
    } catch (err) {
        console.error("Lỗi khi upload ảnh:", err);
        throw err;
    }
}


async function fetchUserProfile(userId) {
    try {
        const response = await fetch(`${BASE_URL}/users/${userId}`);

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
        return null;
    }
}

async function updateUserProfile(userId, data) {
    try {
        const response = await fetch(`${BASE_URL}/users/${userId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data),
        });

        const result = await response.json();
        if (!response.ok || !result.success) {
            throw new Error(result.message || 'Cập nhật thất bại');
        }
        return result.data;

    } catch (err) {
        console.error("Lỗi khi cập nhật hồ sơ:", err);
        throw err;
    }
}

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

                ${user.role === 'admin' ? `
                <div class="mt-3">
                    <a href="/fe/admin" class="btn btn-primary w-100">
                        <svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-settings me-2" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
                           <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                           <path d="M10.325 4.317c.426 -1.756 2.924 -1.756 3.35 0a1.724 1.724 0 0 0 2.573 1.066c1.543 -.94 3.31 .826 2.37 2.37a1.724 1.724 0 0 0 1.065 2.572c1.756 .426 1.756 2.924 0 3.35a1.724 1.724 0 0 0 -1.066 2.573c.94 1.543 -.826 3.31 -2.37 2.37a1.724 1.724 0 0 0 -2.572 1.065c-.426 1.756 -2.924 1.756 -3.35 0a1.724 1.724 0 0 0 -2.573 -1.066c-1.543 .94 -3.31 -.826 -2.37 -2.37a1.724 1.724 0 0 0 -1.065 -2.572c-1.756 -.426 -1.756 -2.924 0 -3.35a1.724 1.724 0 0 0 1.066 -2.573c-.94 -1.543 .826 -3.31 2.37 -2.37c1 .608 2.296 .07 2.572 -1.065z"></path>
                           <path d="M9 12a3 3 0 1 0 6 0a3 3 0 0 0 -6 0"></path>
                        </svg>
                        Truy cập trang Admin
                    </a>
                </div>
                ` : ''}

                <div class="form-actions">
                    <button type="submit" class="btn-save">Lưu thay đổi</button>
                </div>
            </div>

        </form>

    `;
    container.innerHTML = profileHTML;
}

function attachProfileEvents(user, isOwner, popup) {
    if (!isOwner) return;

    const form = document.getElementById('profileForm');
    const avatarInput = document.getElementById('avatar-upload');
    const avatarPreview = document.getElementById('avatarPreview');


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
            const formData = new FormData(form);
            const file = avatarInput.files[0];


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
                return;
            }


            if (file && file.size > 0) {

                const uploadResult = await uploadImage(file);

                if (uploadResult && uploadResult.relativePath) {
                    newAvatarUrl = avatarPath + "/" + uploadResult.relativePath;
                } else {
                    throw new Error("Lỗi khi upload ảnh, không nhận được URL.");
                }
            }

            const dataToUpdate = {
                name: formData.get('name'),
                phone: formData.get('phone'),
                password: formData.get('password'),
                avatar: newAvatarUrl
            };

            await updateUserProfile(user.id, dataToUpdate);

            popup.show({
                title: "Thành công!",
                content: "Hồ sơ của bạn đã được cập nhật.",
                actions: [{ label: 'OK', type: 'btn-primary', close: true }]
            });


            if (dataToUpdate.name !== user.name) {
                mountHeader('.mount-header', 'profile');
            }

        } catch (err) {
            popup.show({
                title: "Lỗi",
                content: `<p>${err.message}</p>`,
                actions: [{ label: 'Đóng', type: 'btn-secondary', close: true }]
            });
        } finally {

            saveBtn.disabled = false;
            saveBtn.textContent = 'Lưu thay đổi';
        }
    });
}



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