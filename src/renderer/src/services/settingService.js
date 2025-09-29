// settingsService.js
import api from './api';

const settingService = {
    // Change password
    changePassword: async (currentPassword, newPassword) => {
        const response = await api.put('/auth/change-password', {
            currentPassword,
            newPassword
        });
        return response.data;
    },

    // Update user profile
    updateProfile: async (profileData) => {
        const response = await api.put('/auth/profile', profileData);
        return response.data;
    },

    // Get user activity logs
    getUserLogs: async (limit = 50, offset = 0) => {
        const response = await api.get(`/auth/logs?limit=${limit}&offset=${offset}`);
        return response.data;
    },

    // Login type preference (client-side only since your backend uses email)
    setLoginType: (type) => {
        localStorage.setItem('loginType', type);
    },

    getLoginType: () => {
        return localStorage.getItem('loginType') || 'email';
    },

    // Get theme
    getTheme: async () => {
        try {
            const response = await api.get('/auth/users/me/theme');
            return response.data;
        } catch (error) {
            console.error('Error fetching theme:', error);
            throw error;
        }
    },

    // Set theme
    setTheme: async (theme) => {
        try {
            const response = await api.put('/auth/theme', { theme });
            return response.data;
        } catch (error) {
            console.error('Error setting theme:', error);
            throw error;
        }
    }
};

export default settingService;