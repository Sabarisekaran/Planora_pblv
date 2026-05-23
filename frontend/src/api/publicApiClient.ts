import axios, { AxiosInstance, AxiosError } from 'axios';

/**
 * Public API Client - No Authentication
 * 
 * Used for publicly accessible endpoints that don't require authentication:
 * - Registration forms
 * - Attendance marking
 * - Public program data
 * - QR code access
 * 
 * This client:
 * ✅ Does NOT add auth tokens
 * ✅ Does NOT redirect on 401/403 errors
 * ✅ Allows access from any source (QR codes, direct links, etc.)
 */

const getAPIBaseURL = (): string => {
  // ✅ PRIORITY 1: Use the Vite dev proxy during localhost development
  if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
    console.log('✅ [Public API] Using Vite dev proxy at /api');
    return '/api';
  }

  // ✅ PRIORITY 2: Environment variable (for ngrok, public URLs, production)
  if (import.meta.env.VITE_API_URL) {
    const url = import.meta.env.VITE_API_URL.trim();
    if (url && !url.includes('YOUR_NGROK')) {
      console.log('✅ [Public API] Using VITE_API_URL:', url);
      return url;
    }
  }
  
  // ✅ PRIORITY 3: Current origin + /api
  if (typeof window !== 'undefined' && window.location.origin) {
    console.log('✅ [Public API] Using current origin:', `${window.location.origin}/api`);
    return `${window.location.origin}/api`;
  }
  
  // FALLBACK: relative /api
  console.warn('⚠️ [Public API] Fallback to relative /api');
  return '/api';
};

const API_BASE_URL = getAPIBaseURL();

const isNgrokUrl = (url?: string): boolean => {
  const target = url || API_BASE_URL;
  return target.includes('ngrok-free.dev') || target.includes('ngrok-free.app') || target.includes('.ngrok.');
};

/**
 * Public API Client - No token injection, no auth redirects
 * Safe for QR code access and public forms
 */
export const publicApiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false,
});

/**
 * Request Interceptor - Add ngrok bypass header if needed
 * 
 * Does NOT add auth tokens (public endpoints don't need them)
 */
publicApiClient.interceptors.request.use(
  (config) => {
    // Add ngrok bypass header for ngrok URLs
    if (isNgrokUrl(config.baseURL || config.url)) {
      config.headers['ngrok-skip-browser-warning'] = 'true';
    }

    // Debug logging
    if (import.meta.env.DEV) {
      console.log(
        `📤 [Public API Request] ${config.method?.toUpperCase()} ${config.url}`,
        {
          baseURL: config.baseURL,
          isNgrok: isNgrokUrl(config.baseURL || config.url),
        }
      );
    }

    return config;
  },
  (error) => {
    console.error('❌ [Public Request Interceptor] Error preparing request:', error);
    return Promise.reject(error);
  }
);

/**
 * Response Interceptor - Basic error handling without redirects
 * 
 * Does NOT redirect to login on auth errors
 * Public endpoints should work without authentication
 */
publicApiClient.interceptors.response.use(
  (response) => {
    if (import.meta.env.DEV) {
      console.log(
        `📥 [Public API Response] ${response.status} ${response.config.url}`,
        { success: response.data?.success }
      );
    }
    return response;
  },
  (error: AxiosError) => {
    const { response, config } = error;
    const status = response?.status;

    // Log error but don't redirect - public endpoints should handle errors gracefully
    console.warn(`⚠️ [Public API Error ${status}] ${config?.url}`, {
      message: (response?.data as any)?.message || error.message,
      status,
    });

    // Even on 401/403, reject the error but don't redirect
    // The component will handle the error appropriately
    return Promise.reject(error);
  }
);

export default publicApiClient;
