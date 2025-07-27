import React, { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';
import { StudentData, Subject, ExamMark, SGPACGPAData, SyncStatus } from '../types';
import { authApi, studentApi, syncApi } from '../lib/api';
import { isAuthenticated, getStoredToken } from '../lib/auth';

// Helper function to calculate overall attendance
const calculateOverallAttendance = (subjects: Subject[]): number => {
  if (!subjects.length) return 0;
  
  const totalClasses = subjects.reduce((sum, subject) => {
    return sum + 
      subject.attendance.lectures.total + 
      subject.attendance.tutorials.total + 
      subject.attendance.practicals.total;
  }, 0);
  
  const totalAttended = subjects.reduce((sum, subject) => {
    return sum + 
      subject.attendance.lectures.attended + 
      subject.attendance.tutorials.attended + 
      subject.attendance.practicals.attended;
  }, 0);
  
  return totalClasses > 0 ? Math.round((totalAttended / totalClasses) * 100) : 0;
};

// Mock data function for fallback during development
const getMockStudentData = (): Omit<StudentData, 'user'> => ({
  subjects: [
    {
      id: '1',
      name: 'Computer Organisation and Architecture',
      code: '18B11CI414',
      attendance: {
        lectures: { attended: 18, total: 20 },
        tutorials: { attended: 8, total: 10 },
        practicals: { attended: 15, total: 15 }
      },
      percentage: 90,
      faculty: 'Dr. Smith'
    },
    {
      id: '2',
      name: 'Software Engineering',
      code: '18B11CI612',
      attendance: {
        lectures: { attended: 14, total: 20 },
        tutorials: { attended: 6, total: 10 },
        practicals: { attended: 10, total: 15 }
      },
      percentage: 67,
      faculty: 'Prof. Johnson'
    },
    {
      id: '3',
      name: 'Advanced Programming Lab',
      code: '18B17CI673',
      attendance: {
        lectures: { attended: 8, total: 15 },
        tutorials: { attended: 5, total: 8 },
        practicals: { attended: 12, total: 20 }
      },
      percentage: 62,
      faculty: 'Dr. Williams'
    }
  ],
  examMarks: [],
  sgpaCgpa: [
    { semester: 1, sgpa: 8.0, cgpa: 8.0, credits: 20, gradePoints: 160 },
    { semester: 2, sgpa: 7.5, cgpa: 7.75, credits: 22, gradePoints: 165 },
    { semester: 3, sgpa: 8.2, cgpa: 7.9, credits: 24, gradePoints: 189.6 },
    { semester: 4, sgpa: 7.8, cgpa: 7.87, credits: 26, gradePoints: 202.8 },
    { semester: 5, sgpa: 8.5, cgpa: 8.0, credits: 24, gradePoints: 204 },
    { semester: 6, sgpa: 7.9, cgpa: 7.98, credits: 22, gradePoints: 175.58 },
  ],
  overallAttendance: 0,
});

interface StudentState {
  studentData: StudentData | null;
  syncStatus: SyncStatus;
  isAuthenticated: boolean;
}

type StudentAction =
  | { type: 'SET_STUDENT_DATA'; payload: StudentData }
  | { type: 'UPDATE_ATTENDANCE'; payload: Subject[] }
  | { type: 'UPDATE_EXAM_MARKS'; payload: ExamMark[] }
  | { type: 'UPDATE_SGPA_CGPA'; payload: SGPACGPAData[] }
  | { type: 'SET_SYNC_STATUS'; payload: SyncStatus }
  | { type: 'SET_AUTH_STATUS'; payload: boolean }
  | { type: 'LOGOUT' };

const initialState: StudentState = {
  studentData: null,
  syncStatus: { isLoading: false },
  isAuthenticated: isAuthenticated(),
};

const studentReducer = (state: StudentState, action: StudentAction): StudentState => {
  switch (action.type) {
    case 'SET_STUDENT_DATA':
      return {
        ...state,
        studentData: action.payload,
        isAuthenticated: true,
      };
    case 'UPDATE_ATTENDANCE':
      if (!state.studentData) return state;
      return {
        ...state,
        studentData: {
          ...state.studentData,
          subjects: action.payload,
          overallAttendance: calculateOverallAttendance(action.payload),
        },
      };
    case 'UPDATE_EXAM_MARKS':
      if (!state.studentData) return state;
      return {
        ...state,
        studentData: {
          ...state.studentData,
          examMarks: action.payload,
        },
      };
    case 'UPDATE_SGPA_CGPA':
      if (!state.studentData) return state;
      return {
        ...state,
        studentData: {
          ...state.studentData,
          sgpaCgpa: action.payload,
        },
      };
    case 'SET_SYNC_STATUS':
      return {
        ...state,
        syncStatus: action.payload,
      };
    case 'SET_AUTH_STATUS':
      return {
        ...state,
        isAuthenticated: action.payload,
      };
    case 'LOGOUT':
      return initialState;
    default:
      return state;
  }
};

interface StudentContextType {
  state: StudentState;
  dispatch: React.Dispatch<StudentAction>;
  login: (enrollmentNumber: string, password: string) => Promise<void>;
  logout: () => void;
  syncData: () => Promise<void>;
}

const StudentContext = createContext<StudentContextType | undefined>(undefined);

interface StudentProviderProps {
  children: ReactNode;
}

export const StudentProvider: React.FC<StudentProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(studentReducer, initialState);

  // Check for existing authentication on mount
  useEffect(() => {
    const initializeAuth = async () => {
      const token = await getStoredToken();
      if (token) {
        try {
          const response = await authApi.getProfile();
          if (response.success && response.data) {
            dispatch({ 
              type: 'SET_STUDENT_DATA', 
              payload: {
                user: response.data,
                subjects: [],
                examMarks: [],
                sgpaCgpa: [],
                overallAttendance: 0,
              }
            });
            // Auto-sync data after successful authentication
            await syncData();
          }
        } catch (error) {
          console.error('Failed to initialize auth:', error);
          await authApi.logout();
          dispatch({ type: 'SET_AUTH_STATUS', payload: false });
        }
      }
    };

    initializeAuth();
  }, []);

  const login = async (enrollmentNumber: string, password: string, dateOfBirth?: string): Promise<void> => {
    dispatch({ type: 'SET_SYNC_STATUS', payload: { isLoading: true } });
    
    try {
      const response = await authApi.login({
        enrollmentNumber,
        password,
        dateOfBirth: dateOfBirth || '',
      });

      if (!response.success) {
        throw new Error(response.message || 'Login failed');
      }

      // Set user data
      dispatch({ 
        type: 'SET_STUDENT_DATA', 
        payload: {
          user: response.data.user,
          subjects: [],
          examMarks: [],
          sgpaCgpa: [],
          overallAttendance: 0,
        }
      });

      // Trigger initial data sync
      await syncData();
      
      dispatch({ type: 'SET_SYNC_STATUS', payload: { isLoading: false, lastSync: new Date() } });
    } catch (error) {
      dispatch({ 
        type: 'SET_SYNC_STATUS', 
        payload: { 
          isLoading: false, 
          error: error instanceof Error ? error.message : 'Login failed' 
        } 
      });
      throw error;
    }
  };

  const logout = async () => {
    await authApi.logout();
    dispatch({ type: 'LOGOUT' });
  };

  const syncData = async (): Promise<void> => {
    if (!(await isAuthenticated())) {
      console.warn('Cannot sync data: User not authenticated');
      return;
    }
    
    dispatch({ type: 'SET_SYNC_STATUS', payload: { isLoading: true } });
    
    try {
      // Trigger manual sync on backend
      const syncResponse = await syncApi.triggerManualSync();
      
      if (!syncResponse.success) {
        throw new Error(syncResponse.message || 'Sync failed');
      }

      // In a real implementation, you would fetch the updated data here
      // For now, we'll use mock data until the backend sync is fully implemented
      const mockData = getMockStudentData();
      
      dispatch({ 
        type: 'UPDATE_ATTENDANCE', 
        payload: mockData.subjects
      });
      
      dispatch({ 
        type: 'UPDATE_EXAM_MARKS', 
        payload: mockData.examMarks
      });
      
      dispatch({ 
        type: 'UPDATE_SGPA_CGPA', 
        payload: mockData.sgpaCgpa
      });
      
      dispatch({ 
        type: 'SET_SYNC_STATUS', 
        payload: { isLoading: false, lastSync: new Date() } 
      });
    } catch (error) {
      dispatch({ 
        type: 'SET_SYNC_STATUS', 
        payload: { 
          isLoading: false, 
          error: error instanceof Error ? error.message : 'Sync failed' 
        } 
      });
    }
  };

  return (
    <StudentContext.Provider value={{ state, dispatch, login, logout, syncData }}>
      {children}
    </StudentContext.Provider>
  );
};

// Hook to use the Student Context
export const useStudent = (): StudentContextType => {
  const context = useContext(StudentContext);
  if (!context) {
    throw new Error('useStudent must be used within a StudentProvider');
  }
  return context;
};