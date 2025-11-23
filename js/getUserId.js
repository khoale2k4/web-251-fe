export default function getUserId() {
    // Kiểm tra localStorage trước (Remember Me)
    let userStr = localStorage.getItem('user');
    
    // Nếu không có, kiểm tra sessionStorage
    if (!userStr) {
        userStr = sessionStorage.getItem('user');
    }

    // Nếu không có user, trả về null (cho phép guest mode)
    if (!userStr) {
        return null;
    }

    try {
        const user = JSON.parse(userStr);
        return user.id || null;
    } catch (e) {
        console.error('Error parsing user data:', e);
        return null;
    }
}