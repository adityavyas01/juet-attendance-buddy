// Types for JUET Attendance App

export interface User {
  id: string;
  enrollmentNumber: string;
  name: string;
  course: string;
  branch: string;
  semester: number;
  lastSync?: Date;
}

export interface AttendanceData {
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

export interface Subject {
  id: string;
  name: string;
  code: string;
  attendance: AttendanceData;
  percentage: number;
  faculty?: string;
}

export interface ExamMark {
  subject: Subject;
  test1?: number;
  test2?: number;
  test3?: number;
  total?: number;
  maxMarks: number;
}

export interface SGPACGPAData {
  semester: number;
  sgpa: number;
  cgpa: number;
  credits: number;
  gradePoints: number;
}

export interface StudentData {
  user: User;
  subjects: Subject[];
  examMarks: ExamMark[];
  sgpaCgpa: SGPACGPAData[];
  overallAttendance: number;
}

export type AttendanceStatus = 'excellent' | 'good' | 'poor';

export interface LoginCredentials {
  enrollmentNumber: string;
  dateOfBirth: string;
  password: string;
}

export interface SyncStatus {
  isLoading: boolean;
  lastSync?: Date;
  error?: string;
}