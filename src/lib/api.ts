import { User, Subject, ExamMark, SGPACGPAData } from '../types';
import { getStoredToken, setStoredToken, removeStoredToken } from './auth';

// API configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://juet-attendance-buddy.onrender.com/api';

// API response types
interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// API client class
class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    const token = await getStoredToken();

    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

// Create API client instance
const apiClient = new ApiClient(API_BASE_URL);

// Authentication API
export const authApi = {
  login: async (credentials: {
    enrollmentNumber: string;
    password: string;
    dateOfBirth: string;
  }): Promise<ApiResponse<{ user: User; token: string }>> => {
    const response = await apiClient.post<{ user: User; token: string }>('/auth/login', credentials);
    
    if (response.success && response.data?.token) {
      await setStoredToken(response.data.token);
    }
    
    return response;
  },

  logout: async (): Promise<void> => {
    await removeStoredToken();
  },

  getProfile: async (): Promise<ApiResponse<User>> => {
    return apiClient.get<User>('/auth/profile');
  },

  changePassword: async (passwords: {
    currentPassword: string;
    newPassword: string;
  }): Promise<ApiResponse<void>> => {
    return apiClient.post<void>('/auth/change-password', passwords);
  },
};

// Student data API
export const studentApi = {
  getAttendance: async (): Promise<ApiResponse<Subject[]>> => {
    return apiClient.get<Subject[]>('/student/attendance');
  },

  getExamMarks: async (): Promise<ApiResponse<ExamMark[]>> => {
    return apiClient.get<ExamMark[]>('/student/exam-marks');
  },

  getSGPACGPA: async (): Promise<ApiResponse<SGPACGPAData[]>> => {
    return apiClient.get<SGPACGPAData[]>('/student/sgpa-cgpa');
  },

  getOverallAttendance: async (): Promise<ApiResponse<{ percentage: number }>> => {
    return apiClient.get<{ percentage: number }>('/student/overall-attendance');
  },
};

// Sync API
export const syncApi = {
  triggerManualSync: async (): Promise<ApiResponse<{ message: string }>> => {
    return apiClient.post<{ message: string }>('/sync/manual');
  },

  getLastSyncTime: async (): Promise<ApiResponse<{ lastSync: string }>> => {
    return apiClient.get<{ lastSync: string }>('/sync/last');
  },

  getSyncStatus: async (): Promise<ApiResponse<{ isRunning: boolean; progress?: number }>> => {
    return apiClient.get<{ isRunning: boolean; progress?: number }>('/sync/status');
  },
};

export default apiClient;
