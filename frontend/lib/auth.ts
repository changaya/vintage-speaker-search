import { api } from './api';

export interface Admin {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'moderator';
}

export interface LoginResponse {
  success: boolean;
  token: string;
  user: Admin;
}

/**
 * Login with username and password
 */
export const login = async (username: string, password: string): Promise<LoginResponse> => {
  const response = await api.post<LoginResponse>('/auth/login', {
    username,
    password,
  });
  return response.data;
};

/**
 * Logout current user
 */
export const logout = async (): Promise<void> => {
  try {
    await api.post('/auth/logout');
  } finally {
    // Clear token from localStorage regardless of API response
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('admin_user');
    }
  }
};

/**
 * Get current authenticated user
 */
export const getCurrentUser = async (): Promise<Admin> => {
  const response = await api.get<Admin>('/auth/me');
  return response.data;
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = (): boolean => {
  if (typeof window === 'undefined') return false;
  return !!localStorage.getItem('auth_token');
};

/**
 * Get stored auth token
 */
export const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('auth_token');
};

/**
 * Store auth token
 */
export const setAuthToken = (token: string): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('auth_token', token);
  }
};

/**
 * Get stored admin user
 */
export const getStoredAdmin = (): Admin | null => {
  if (typeof window === 'undefined') return null;
  const userStr = localStorage.getItem('admin_user');
  return userStr ? JSON.parse(userStr) : null;
};

/**
 * Store admin user
 */
export const setStoredAdmin = (user: Admin): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('admin_user', JSON.stringify(user));
  }
};

/**
 * Clear stored auth data
 */
export const clearAuthData = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('admin_user');
  }
};
