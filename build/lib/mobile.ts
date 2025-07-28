import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';
import { Keyboard } from '@capacitor/keyboard';
import { Device } from '@capacitor/device';
import { Network } from '@capacitor/network';
import { Preferences } from '@capacitor/preferences';

// Mobile platform detection
export const isMobile = (): boolean => {
  return Capacitor.isNativePlatform();
};

export const isAndroid = (): boolean => {
  return Capacitor.getPlatform() === 'android';
};

export const isIOS = (): boolean => {
  return Capacitor.getPlatform() === 'ios';
};

// Status bar configuration
export const configureStatusBar = async (): Promise<void> => {
  if (isMobile()) {
    try {
      await StatusBar.setStyle({ style: Style.Default });
      await StatusBar.setBackgroundColor({ color: '#ffffff' });
    } catch (error) {
      console.error('Error configuring status bar:', error);
    }
  }
};

// Splash screen management
export const hideSplashScreen = async (): Promise<void> => {
  if (isMobile()) {
    try {
      await SplashScreen.hide();
    } catch (error) {
      console.error('Error hiding splash screen:', error);
    }
  }
};

// Keyboard management
export const configureKeyboard = (): void => {
  if (isMobile()) {
    Keyboard.addListener('keyboardWillShow', () => {
      document.body.classList.add('keyboard-open');
    });

    Keyboard.addListener('keyboardWillHide', () => {
      document.body.classList.remove('keyboard-open');
    });
  }
};

// Device information
export const getDeviceInfo = async (): Promise<any> => {
  if (isMobile()) {
    try {
      return await Device.getInfo();
    } catch (error) {
      console.error('Error getting device info:', error);
      return null;
    }
  }
  return null;
};

// Network status
export const getNetworkStatus = async (): Promise<any> => {
  try {
    return await Network.getStatus();
  } catch (error) {
    console.error('Error getting network status:', error);
    return { connected: true, connectionType: 'wifi' };
  }
};

export const addNetworkListener = (callback: (status: any) => void): void => {
  Network.addListener('networkStatusChange', callback);
};

// Storage utilities using Preferences API
export const setStorageItem = async (key: string, value: string): Promise<void> => {
  try {
    if (isMobile()) {
      await Preferences.set({ key, value });
    } else {
      localStorage.setItem(key, value);
    }
  } catch (error) {
    console.error('Error setting storage item:', error);
  }
};

export const getStorageItem = async (key: string): Promise<string | null> => {
  try {
    if (isMobile()) {
      const result = await Preferences.get({ key });
      return result.value;
    } else {
      return localStorage.getItem(key);
    }
  } catch (error) {
    console.error('Error getting storage item:', error);
    return null;
  }
};

export const removeStorageItem = async (key: string): Promise<void> => {
  try {
    if (isMobile()) {
      await Preferences.remove({ key });
    } else {
      localStorage.removeItem(key);
    }
  } catch (error) {
    console.error('Error removing storage item:', error);
  }
};

export const clearStorage = async (): Promise<void> => {
  try {
    if (isMobile()) {
      await Preferences.clear();
    } else {
      localStorage.clear();
    }
  } catch (error) {
    console.error('Error clearing storage:', error);
  }
};

// App initialization for mobile
export const initializeMobileApp = async (): Promise<void> => {
  if (isMobile()) {
    await configureStatusBar();
    configureKeyboard();
    
    // Hide splash screen after app is ready
    setTimeout(async () => {
      await hideSplashScreen();
    }, 2000);
  }
};

// Vibration for mobile feedback
export const vibrate = (duration: number = 100): void => {
  if (isMobile() && navigator.vibrate) {
    navigator.vibrate(duration);
  }
};

// Back button handling for Android
export const handleBackButton = (callback: () => boolean): void => {
  if (isAndroid()) {
    document.addEventListener('backbutton', (event) => {
      const shouldExit = callback();
      if (!shouldExit) {
        event.preventDefault();
      }
    });
  }
};

export default {
  isMobile,
  isAndroid,
  isIOS,
  configureStatusBar,
  hideSplashScreen,
  configureKeyboard,
  getDeviceInfo,
  getNetworkStatus,
  addNetworkListener,
  setStorageItem,
  getStorageItem,
  removeStorageItem,
  clearStorage,
  initializeMobileApp,
  vibrate,
  handleBackButton,
};
