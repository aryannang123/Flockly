import axios from 'axios';

const API_URL = 'http://localhost:5000';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

export const authService = {
  // Initiate Google OAuth login
  loginWithGoogle: (userType) => {
    window.location.href = `${API_URL}/auth/google?userType=${userType}`;
  },

  // Get current user
  getCurrentUser: async () => {
    try {
      const response = await api.get('/auth/user');
      return response.data;
    } catch (error) {
      console.error('Error fetching user:', error);
      return { success: false };
    }
  },

  // Logout
  logout: async () => {
    try {
      const response = await api.get('/auth/logout');
      return response.data;
    } catch (error) {
      console.error('Error logging out:', error);
      return { success: false };
    }
  }
};

export default api;
