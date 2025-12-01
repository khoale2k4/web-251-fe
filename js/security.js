import { Storage } from './storage.js';
import { PATHS } from './config.js';

export const Security = {
    escapeHtml(text) {
        if (!text) return text;
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },

    sanitizeUser(user) {
        if (!user) return null;
        const sanitized = { ...user };
        for (const key in sanitized) {
            if (typeof sanitized[key] === 'string') {
                sanitized[key] = this.escapeHtml(sanitized[key]);
            }
        }
        return sanitized;
    },

    requireAuth() {
        const userId = Storage.get('userId');
        if (!userId) {
            window.location.href = PATHS.LOGIN;
            return false;
        }
        return true;
    },

    async requireAdmin() {
        const userId = Storage.get('userId');
        if (!userId) {
            window.location.href = PATHS.LOGIN;
            return false;
        }

        try {
            const { API } = await import('./api.js');
            const response = await API.get(`/users/${userId}`);

            if (response && response.role === 'admin') {
                return true;
            } else {
                window.location.href = PATHS.HOME;
                return false;
            }
        } catch (e) {
            window.location.href = PATHS.HOME;
            return false;
        }
    }
};
