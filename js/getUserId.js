export default function getUserId() {
    let userStr = localStorage.getItem('user');
    
    if (!userStr) {
        userStr = sessionStorage.getItem('user');
    }

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