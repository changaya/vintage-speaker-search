import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

// Environment check for detailed error logging
const isDevelopment =
  process.env.NODE_ENV === 'development' ||
  process.env.NEXT_PUBLIC_DEBUG === 'true';

// Create axios instance with default config
export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds
});

// Request interceptor - add auth token if available
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('auth_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Extract user-friendly error message
    let errorMessage = 'An unexpected error occurred';

    if (error.response?.data) {
      const { data } = error.response;

      // Standardized format: { success: false, error: { message, code, details } }
      if (data.error?.message) {
        errorMessage = data.error.message;

        // Append validation details if present in development mode
        if (isDevelopment && data.error.details && Array.isArray(data.error.details)) {
          const detailMessages = data.error.details
            .map((d: any) => `${d.path?.join('.')}: ${d.message}`)
            .join('; ');
          errorMessage += ` (${detailMessages})`;
        }
      }
      // Legacy format: { error: string, details: array }
      else if (typeof data.error === 'string') {
        errorMessage = data.error;
      }
      // Fallback to message field
      else if (data.message) {
        errorMessage = data.message;
      }
    } else if (error.message) {
      errorMessage = error.message;
    }

    // Log detailed error info in development
    if (isDevelopment) {
      console.group('🚨 API Error');
      console.error('Request:', {
        method: error.config?.method?.toUpperCase(),
        url: error.config?.url,
        baseURL: error.config?.baseURL,
        data: error.config?.data,
      });
      console.error('Response:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
      });
      console.error('Extracted Message:', errorMessage);
      console.groupEnd();
    } else {
      console.error('API Error:', {
        status: error.response?.status,
        message: errorMessage,
      });
    }

    // Show toast notification (except for 401 which redirects)
    if (error.response?.status !== 401) {
      toast.error(errorMessage, {
        duration: 5000,
        position: 'top-right',
      });
    }

    // Handle 401 Unauthorized - clear token and redirect to login
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token');
        window.location.href = '/admin/login';
      }
    }

    return Promise.reject(error);
  }
);

export default api;
