import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: inject token from localStorage or sessionStorage
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('arch_token') || sessionStorage.getItem('arch_token');
    if (token && token !== 'null' && token !== 'undefined') {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor: handle token expiration & 401 Unauthorized
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.warn('[API] Token expired or unauthorized. Clearing session...');
      localStorage.removeItem('arch_token');
      localStorage.removeItem('arch_user');
      sessionStorage.removeItem('arch_token');
      sessionStorage.removeItem('arch_user');
      
      // Dispatch custom event so AuthContext handles logout cleanly without hard page reloads
      window.dispatchEvent(new CustomEvent('auth:unauthorized'));
    }
    return Promise.reject(error);
  }
);

export default api;
