// Environment configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

// HTTP client configuration
class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    this.token = localStorage.getItem('auth_token');
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    const config: RequestInit = {
      ...options,
      headers,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Network error' }));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API Request failed:', error);
      throw error;
    }
  }

  // Authentication methods
  setToken(token: string) {
    this.token = token;
    localStorage.setItem('auth_token', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('auth_token');
  }

  // HTTP methods
  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

// Create API client instance
export const apiClient = new ApiClient(API_BASE_URL);

// API response types
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  timestamp: string;
}

// Login response type matching backend
export interface LoginResponseData {
  token: string;
  user: {
    enrollmentNumber: string;
    name: string;
    course: string;
    branch: string;
    semester: number;
    dateOfBirth: string;
  };
  attendance: any[]; // WebKiosk attendance data
  sgpa: any[]; // WebKiosk SGPA data
}

// Auth API
export const authApi = {
  async login(credentials: { enrollmentNumber: string; password: string; dateOfBirth: string }): Promise<ApiResponse<LoginResponseData>> {
    const response = await apiClient.post<ApiResponse<LoginResponseData>>('/auth/login', credentials);
    if (response.success && response.data?.token) {
      apiClient.setToken(response.data.token);
    }
    return response;
  },

  async register(userData: {
    enrollmentNumber: string;
    name: string;
    course: string;
    branch: string;
    semester: number;
    password: string;
    dateOfBirth: string;
  }): Promise<ApiResponse> {
    const response = await apiClient.post<ApiResponse>('/auth/register', userData);
    if (response.success && response.data?.token) {
      apiClient.setToken(response.data.token);
    }
    return response;
  },

  async getProfile(): Promise<ApiResponse> {
    return apiClient.get<ApiResponse>('/auth/me');
  },

  async updateProfile(data: any): Promise<ApiResponse> {
    return apiClient.put<ApiResponse>('/auth/profile', data);
  },

  async changePassword(data: { currentPassword: string; newPassword: string }): Promise<ApiResponse> {
    return apiClient.put<ApiResponse>('/auth/password', data);
  },

  logout() {
    apiClient.clearToken();
  },
};

// Student API
export const studentApi = {
  async getDashboard(): Promise<ApiResponse> {
    return apiClient.get<ApiResponse>('/student/dashboard');
  },

  async getAttendance(): Promise<ApiResponse> {
    return apiClient.get<ApiResponse>('/student/attendance');
  },

  async getExamMarks(): Promise<ApiResponse> {
    return apiClient.get<ApiResponse>('/student/exam-marks');
  },

  async getSGPACGPA(): Promise<ApiResponse> {
    return apiClient.get<ApiResponse>('/student/sgpa-cgpa');
  },
};

// Sync API
export const syncApi = {
  async triggerManualSync(): Promise<ApiResponse> {
    return apiClient.post<ApiResponse>('/sync/manual');
  },

  async getSyncStatus(): Promise<ApiResponse> {
    return apiClient.get<ApiResponse>('/sync/status');
  },
};

// Admin API (for future use)
export const adminApi = {
  async getDashboard(): Promise<ApiResponse> {
    return apiClient.get<ApiResponse>('/admin/dashboard');
  },

  async getUsers(): Promise<ApiResponse> {
    return apiClient.get<ApiResponse>('/admin/users');
  },

  async getLogs(): Promise<ApiResponse> {
    return apiClient.get<ApiResponse>('/admin/logs');
  },
};

// Helper function to check if user is authenticated
export const isAuthenticated = (): boolean => {
  return !!localStorage.getItem('auth_token');
};

// Helper function to get stored token
export const getStoredToken = (): string | null => {
  return localStorage.getItem('auth_token');
};

export default apiClient;
