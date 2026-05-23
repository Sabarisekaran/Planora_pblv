/**
 * Dynamic Base URL Detection
 * 
 * Ensures QR codes work on mobile devices by using accessible URLs
 * instead of localhost (which fails on mobile with ERR_CONNECTION_REFUSED)
 */

/**
 * Get the accessible base URL for QR code generation
 * 
 * CRITICAL FOR MOBILE: Must use public internet URL (NOT localhost)
 * 
 * Priority:
 * 1. Environment variable VITE_PUBLIC_URL (for ngrok, custom domains) ✅
 * 2. Environment variable VITE_APP_URL (legacy fallback)
 * 3. Current window origin (production only)
 * 
 * @returns {string} Accessible base URL without trailing slash
 */
export const getBaseURL = (): string => {
  // Priority 1: Check for VITE_PUBLIC_URL (ngrok or custom domain)
  if (import.meta.env.VITE_PUBLIC_URL) {
    const url = import.meta.env.VITE_PUBLIC_URL as string;
    const normalized = url.endsWith('/') ? url.slice(0, -1) : url;
    
    // Validate it's NOT localhost (critical for mobile)
    if (!normalized.includes('localhost') && !normalized.includes('127.0.0.1')) {
      console.log('✅ Using VITE_PUBLIC_URL:', normalized);
      return normalized;
    } else {
      console.error('❌ VITE_PUBLIC_URL contains localhost! This WILL NOT work on mobile!');
      console.error('   Set to ngrok URL like: https://abcd1234.ngrok-free.app');
    }
  }

  // Priority 2: Legacy fallback to VITE_APP_URL
  if (import.meta.env.VITE_APP_URL) {
    const url = import.meta.env.VITE_APP_URL as string;
    const normalized = url.endsWith('/') ? url.slice(0, -1) : url;
    if (!normalized.includes('localhost')) {
      console.warn('⚠️  Using VITE_APP_URL (consider renaming to VITE_PUBLIC_URL)');
      return normalized;
    }
  }

  // Priority 3: Use current window origin ONLY if not localhost
  const origin = window.location.origin;
  if (!origin.includes('localhost') && !origin.includes('127.0.0.1')) {
    console.log('✅ Using window.location.origin:', origin);
    return origin;
  }

  // CRITICAL: Localhost detected - QR will NOT work on mobile!
  console.error('🚨 CRITICAL: No public URL found and localhost detected!');
  console.error('   QR codes will NOT be accessible from mobile devices');
  console.error('   REQUIRED FIX:');
  console.error('   1. Start ngrok: ngrok http 5173');
  console.error('   2. Add to frontend/.env: VITE_PUBLIC_URL=https://YOUR_NGROK_URL');
  console.error('   3. Restart frontend server');
  
  // Return localhost (will work locally but NOT on mobile)
  return origin;
};

/**
 * Get API base URL (for backend calls)
 * 
 * Priority:
 * 1. Localhost dev proxy (`/api`) when running locally
 * 2. VITE_API_URL environment variable
 * 3. Backend URL derived from VITE_PUBLIC_URL
 * 
 * @returns {string} API base URL
 */
export const getApiURL = (): string => {
  // Priority 1: During local development, always use the Vite proxy.
  // This avoids browser CORS issues and keeps all frontend requests same-origin.
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return '/api';
    }
  }

  if (import.meta.env.VITE_API_URL) {
    const url = import.meta.env.VITE_API_URL as string;
    return url.endsWith('/') ? url.slice(0, -1) : url;
  }
  
  // Fallback: construct from base URL (same server running both)
  const baseURL = getBaseURL();
  return `${baseURL}/api`;
};

/**
 * Generate a QR-safe URL for a given path
 * 
 * Ensures the URL is accessible from mobile devices
 * 
 * @param {string} path - The path (e.g., '/register/program123')
 * @returns {string} Full accessible URL
 */
export const getQRURL = (path: string): string => {
  const baseURL = getBaseURL();
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseURL}${cleanPath}`;
};

/**
 * Log the current configuration (useful for debugging)
 */
export const logURLConfig = (): void => {
  console.log('=== QR Code URL Configuration ===');
  console.log('Base URL:', getBaseURL());
  console.log('API URL:', getApiURL());
  console.log('\nEnvironment Variables:');
  console.log('  VITE_PUBLIC_URL:', import.meta.env.VITE_PUBLIC_URL || '⚠️  NOT SET - QR will use localhost!');
  console.log('  VITE_APP_URL:', import.meta.env.VITE_APP_URL || 'not set');
  console.log('  VITE_API_URL:', import.meta.env.VITE_API_URL || 'not set');
  console.log('\nBrowser Location:');
  console.log('  origin:', window.location.origin);
  console.log('  hostname:', window.location.hostname);
  console.log('  protocol:', window.location.protocol);
  console.log('==================================\n');
};

// Log configuration on load (in development)
if (import.meta.env.DEV) {
  console.log('📍 QR URL System Initialized');
  logURLConfig();
}
