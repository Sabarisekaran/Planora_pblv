import axios, { AxiosInstance, AxiosError } from 'axios';
import { getAuthToken, logout } from '@/lib/auth';

/**
 * Enhanced Axios instance with automatic JWT token handling and error management
 * 
 * Features:
 * - Automatically adds Authorization header with Bearer token
 * - Handles 401 Unauthorized responses (expired token)
 * - Smart API URL selection (local dev vs internet access)
 * - Logs token status for debugging 403 errors
 */

// Smart API URL detection - prioritize environment variables for production/internet access
const getAPIBaseURL = (): string => {
  // ✅ PRIORITY 1: Use the Vite dev proxy during localhost development
  // This avoids browser CORS issues entirely, even when the proxy target is ngrok.
  if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
    console.log('✅ Using Vite dev proxy at /api');
    return '/api';
  }

  // ✅ PRIORITY 1: Environment variable (for ngrok, public URLs, production)
  // This MUST be used when accessing from mobile, remote, or ngrok URLs
  if (import.meta.env.VITE_API_URL) {
    const url = import.meta.env.VITE_API_URL.trim();
    if (url && !url.includes('YOUR_NGROK')) {  // Only if actually set (not placeholder)
      console.log('✅ Using VITE_API_URL (public backend):', url);
      return url;
    }
  }
  
  // ✅ PRIORITY 2: Current origin + /api
  // Works for same-origin calls
  if (typeof window !== 'undefined' && window.location.origin) {
    console.log('✅ Using current origin:', `${window.location.origin}/api`);
    return `${window.location.origin}/api`;
  }
  
  // FALLBACK: relative /api (should rarely reach here)
  console.warn('⚠️  Fallback to relative /api');
  return '/api';
};

const API_BASE_URL = getAPIBaseURL();
const isNgrokUrl = (url?: string): boolean => {
  const target = url || API_BASE_URL;
  return target.includes('ngrok-free.dev') || target.includes('ngrok-free.app') || target.includes('.ngrok.');
};

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // withCredentials: false is correct for JWT-based auth (not cookie-based)
  // We send JWT in Authorization header, not in cookies
});

/**
 * Request Interceptor - Adds JWT token to all requests
 * 
 * This runs BEFORE every request is sent to the backend.
 * It automatically includes the token in the Authorization header.
 */
apiClient.interceptors.request.use(
  (config) => {
    const token = getAuthToken();

    if (isNgrokUrl(config.baseURL || config.url)) {
      config.headers['ngrok-skip-browser-warning'] = 'true';
    }

    if (token) {
      // Add token with Bearer prefix (required format)
      config.headers.Authorization = `Bearer ${token}`;

      // Debug logging (only in development)
      if (import.meta.env.DEV) {
        console.log(
          `📤 [API Request] ${config.method?.toUpperCase()} ${config.url}`,
          {
            hasToken: !!token,
            tokenLength: token.length,
            authHeader: `Bearer ${token.substring(0, 20)}...`,
          }
        );
      }
    } else {
      // Warning: No token found
      console.warn(
        `⚠️ [API Request] No authentication token found. Request may fail with 401/403`,
        {
          url: config.url,
          method: config.method,
        }
      );
    }

    return config;
  },
  (error) => {
    console.error('❌ [Request Interceptor] Error preparing request:', error);
    return Promise.reject(error);
  }
);

/**
 * Response Interceptor - Handles errors and token expiration
 * 
 * This runs AFTER every response is received from the backend.
 * It handles 401 (unauthorized) and 403 (forbidden) errors specifically.
 */
apiClient.interceptors.response.use(
  (response) => {
    // Success response
    if (import.meta.env.DEV) {
      console.log(
        `📥 [API Response] ${response.status} ${response.config.url}`,
        { dataKeys: Object.keys(response.data || {}) }
      );
    }
    return response;
  },
  (error: AxiosError) => {
    const { response, config } = error;
    const status = response?.status;

    if (status === 401) {
      // Token expired or invalid - clear storage and redirect to login
      console.error('❌ [API Error 401] Token expired or invalid');
      logout();
      window.location.href = '/login';
      return Promise.reject(error);
    }

    if (status === 403) {
      // Access denied - likely missing or invalid token
      const token = getAuthToken();
      console.error('❌ [API Error 403] Access Forbidden', {
        url: config?.url,
        method: config?.method,
        tokenPresent: !!token,
        tokenLength: token?.length || 0,
        tokenPrefix: token?.substring(0, 20) || 'NONE',
        authHeader: config?.headers?.Authorization?.substring(0, 30) || 'NONE',
        responseData: (response?.data as any)?.message,
      });

      // Check if token is missing
      if (!token) {
        console.warn('⚠️ Token is missing. Redirecting to login...');
        logout();
        window.location.href = '/login';
      }

      return Promise.reject(error);
    }

    if (status === 500) {
      console.error('❌ [API Error 500] Server Error', {
        url: config?.url,
        message: (response?.data as any)?.message,
      });
    }

    // Log all other errors
    console.error(`❌ [API Error ${status}] ${config?.url}`, {
      message: (response?.data as any)?.message || error.message,
      status,
      baseURL: config?.baseURL,
      ngrokBypassHeader: config?.headers?.['ngrok-skip-browser-warning'],
    });

    return Promise.reject(error);
  }
);

/**
 * Debugging utility: Check if token is properly stored
 * 
 * Call this in the browser console to verify token status:
 * window.debugAuth()
 */
export const debugAuth = () => {
  const token = getAuthToken();
  console.group('🔍 Authentication Debug Info');
  console.log('Token Present:', !!token);
  console.log('Token Length:', token?.length || 0);
  console.log('Token Type:', typeof token);
  console.log('Token First 30 chars:', token?.substring(0, 30) || 'NONE');
  console.log('Storage Keys:', Object.keys(localStorage).filter(k => k.includes('token') || k.includes('Token')));
  console.log('Auth Status:', {
    authToken: !!localStorage.getItem('authToken'),
    coordinatorToken: !!localStorage.getItem('coordinatorToken'),
  });
  console.groupEnd();
};

// Make debug utility available globally in development
if (import.meta.env.DEV) {
  (window as any).debugAuth = debugAuth;
  console.log('💡 Tip: Use window.debugAuth() in console to check authentication status');
}

/**
 * Debugging utility: Test API connection with token
 * 
 * Call this to verify the API endpoint is reachable:
 * window.testAPI('/api/programs')
 */
export const testAPI = async (endpoint: string) => {
  console.group(`🧪 Testing API: ${endpoint}`);
  try {
    const response = await apiClient.get(endpoint);
    console.log('✅ Request Successful', response.status);
    console.log('Response:', response.data);
  } catch (error: any) {
    console.error('❌ Request Failed');
    console.error('Status:', error.response?.status);
    console.error('Message:', error.response?.data?.message || error.message);
    console.error('Headers Sent:', error.config?.headers);
  }
  console.groupEnd();
};

if (import.meta.env.DEV) {
  (window as any).testAPI = testAPI;
}

export default apiClient;
