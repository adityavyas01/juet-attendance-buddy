import { Request } from 'express';

// User related types
export interface IUser {
  _id?: string;
  enrollmentNumber: string;
  name: string;
  course: string;
  branch: string;
  semester: number;
  passwordHash: string;
  dateOfBirth: string;
  isActive: boolean;
  lastLogin?: Date;
  lastSync?: Date;
  preferences: {
    notifications: boolean;
    backgroundSync: boolean;
    theme: 'light' | 'dark' | 'auto';
  };
  createdAt?: Date;
  updatedAt?: Date;
}

// Attendance related types
export interface IAttendanceData {
  lectures: {
    attended: number;
    total: number;
  };
  tutorials: {
    attended: number;
    total: number;
  };
  practicals: {
    attended: number;
    total: number;
  };
}

export interface ISubject {
  subjectId: string;
  name: string;
  code: string;
  faculty: string;
  attendance: IAttendanceData;
  percentage: number;
  semester: number;
  credits: number;
}

export interface IAttendanceRecord {
  _id?: string;
  userId: string;
  subjects: ISubject[];
  overallAttendance: number;
  semester: number;
  academicYear: string;
  lastUpdated: Date;
  syncedAt: Date;
}

// Exam related types
export interface IExamMark {
  _id?: string;
  userId: string;
  subjectId: string;
  subjectName: string;
  subjectCode: string;
  semester: number;
  examType: 'T1' | 'T2' | 'T3' | 'FINAL' | 'ASSIGNMENT';
  marksObtained: number;
  maxMarks: number;
  percentage: number;
  grade?: string;
  examDate: Date;
  publishedDate: Date;
}

// SGPA/CGPA related types
export interface ISGPACGPAData {
  _id?: string;
  userId: string;
  semester: number;
  sgpa: number;
  cgpa: number;
  credits: number;
  gradePoints: number;
  subjects: Array<{
    subjectCode: string;
    subjectName: string;
    credits: number;
    grade: string;
    gradePoints: number;
  }>;
  academicYear: string;
  publishedDate: Date;
}

// WebKiosk related types
export interface IWebKioskCredentials {
  enrollmentNumber: string;
  dateOfBirth: string;
  password: string;
}

export interface IWebKioskSession {
  sessionId: string;
  cookies: string;
  lastUsed: Date;
  isValid: boolean;
}

// API related types
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  timestamp: Date;
}

export interface PaginatedResponse<T> extends ApiResponse<T> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Authentication related types
export interface AuthRequest extends Request {
  user?: {
    id: string;
    enrollmentNumber: string;
    isAdmin: boolean;
  };
}

export interface JWTPayload {
  id: string;
  enrollmentNumber: string;
  isAdmin: boolean;
  iat?: number;
  exp?: number;
}

// Admin related types
export interface IAdmin {
  _id?: string;
  username: string;
  email: string;
  passwordHash: string;
  role: 'super_admin' | 'admin' | 'moderator';
  permissions: string[];
  isActive: boolean;
  lastLogin?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ISystemLog {
  _id?: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  metadata?: any;
  userId?: string;
  action?: string;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
}

// Sync related types
export interface ISyncJob {
  _id?: string;
  userId: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  type: 'attendance' | 'marks' | 'sgpa' | 'full';
  startedAt: Date;
  completedAt?: Date;
  error?: string;
  metadata?: {
    recordsUpdated: number;
    duration: number;
    webkioskResponse: any;
  };
}

// Cache related types
export interface ICacheEntry {
  key: string;
  value: any;
  ttl: number;
  createdAt: Date;
}

// Notification related types
export interface INotification {
  _id?: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  category: 'attendance' | 'marks' | 'system' | 'general';
  isRead: boolean;
  priority: 'low' | 'medium' | 'high';
  data?: any;
  createdAt: Date;
  expiresAt?: Date;
}
