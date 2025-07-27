// Authentication utility functions
import { setStorageItem, getStorageItem, removeStorageItem } from './mobile';

const TOKEN_KEY = 'juet_auth_token';
const USER_KEY = 'juet_user_data';

// Token management
export const setStoredToken = async (token: string): Promise<void> => {
  try {
    await setStorageItem(TOKEN_KEY, token);
  } catch (error) {
    console.error('Failed to store token:', error);
  }
};

export const getStoredToken = async (): Promise<string | null> => {
  try {
    return await getStorageItem(TOKEN_KEY);
  } catch (error) {
    console.error('Failed to retrieve token:', error);
    return null;
  }
};

export const removeStoredToken = async (): Promise<void> => {
  try {
    await removeStorageItem(TOKEN_KEY);
    await removeStorageItem(USER_KEY);
  } catch (error) {
    console.error('Failed to remove token:', error);
  }
};

// Authentication status check
export const isAuthenticated = async (): Promise<boolean> => {
  const token = await getStoredToken();
  if (!token) return false;

  try {
    // Basic JWT validation (check if token exists and is not expired)
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Date.now() / 1000;
    
    // Check if token is expired
    if (payload.exp && payload.exp < currentTime) {
      await removeStoredToken();
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Invalid token format:', error);
    await removeStoredToken();
    return false;
  }
};

// Synchronous version for backwards compatibility
export const isAuthenticatedSync = (): boolean => {
  try {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return false;

    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Date.now() / 1000;
    
    if (payload.exp && payload.exp < currentTime) {
      return false;
    }
    
    return true;
  } catch (error) {
    return false;
  }
};

// User data management
export const setStoredUser = async (user: any): Promise<void> => {
  try {
    await setStorageItem(USER_KEY, JSON.stringify(user));
  } catch (error) {
    console.error('Failed to store user data:', error);
  }
};

export const getStoredUser = async (): Promise<any> => {
  try {
    const userData = await getStorageItem(USER_KEY);
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error('Failed to retrieve user data:', error);
    return null;
  }
};

// Token validation utilities
export const getTokenPayload = async (): Promise<any> => {
  const token = await getStoredToken();
  if (!token) return null;

  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch (error) {
    console.error('Failed to parse token payload:', error);
    return null;
  }
};

export const getTokenExpiration = async (): Promise<Date | null> => {
  const payload = await getTokenPayload();
  if (!payload || !payload.exp) return null;

  return new Date(payload.exp * 1000);
};

export const isTokenExpired = async (): Promise<boolean> => {
  const expiration = await getTokenExpiration();
  if (!expiration) return true;

  return expiration.getTime() < Date.now();
};

// Session management
export const refreshTokenIfNeeded = async (): Promise<boolean> => {
  if (await isTokenExpired()) {
    await removeStoredToken();
    return false;
  }
  
  // Token is still valid
  return true;
};

export const logout = async (): Promise<void> => {
  await removeStoredToken();
  // Redirect to login page could be handled here
  // window.location.href = '/login';
};
