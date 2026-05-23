import axios from 'axios';
import { getApiURL } from '@/utils/baseUrl';

const API_BASE_URL = getApiURL();

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false,  // ✅ JWT uses Authorization header, not cookies
});

// Add request interceptor
apiClient.interceptors.request.use(
  (config) => {
    const requestUrl = config.baseURL || config.url || '';
    if (requestUrl.includes('ngrok-free.dev') || requestUrl.includes('ngrok-free.app') || requestUrl.includes('.ngrok.')) {
      config.headers['ngrok-skip-browser-warning'] = 'true';
    }

    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;
