import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { StudentData, Subject, ExamMark, SGPACGPAData, SyncStatus } from '@/types';

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
  isAuthenticated: false,
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

const calculateOverallAttendance = (subjects: Subject[]): number => {
  if (subjects.length === 0) return 0;
  
  let totalAttended = 0;
  let totalClasses = 0;
  
  subjects.forEach(subject => {
    const { lectures, tutorials, practicals } = subject.attendance;
    totalAttended += lectures.attended + tutorials.attended + practicals.attended;
    totalClasses += lectures.total + tutorials.total + practicals.total;
  });
  
  return totalClasses > 0 ? Math.round((totalAttended / totalClasses) * 100) : 0;
};

interface StudentContextType {
  state: StudentState;
  dispatch: React.Dispatch<StudentAction>;
  login: (enrollmentNumber: string, password: string) => Promise<void>;
  logout: () => void;
  syncData: () => Promise<void>;
}

const StudentContext = createContext<StudentContextType | undefined>(undefined);

export const useStudent = () => {
  const context = useContext(StudentContext);
  if (context === undefined) {
    throw new Error('useStudent must be used within a StudentProvider');
  }
  return context;
};

interface StudentProviderProps {
  children: ReactNode;
}

export const StudentProvider: React.FC<StudentProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(studentReducer, initialState);

  const login = async (enrollmentNumber: string, password: string): Promise<void> => {
    dispatch({ type: 'SET_SYNC_STATUS', payload: { isLoading: true } });
    
    try {
      // Simulate API call - replace with actual WebKiosk scraping
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock student data
      const mockStudentData: StudentData = {
        user: {
          id: '1',
          enrollmentNumber,
          name: 'Aditya Vyas',
          course: 'B.T.(CSE)',
          branch: 'Computer Science & Engineering',
          semester: 7,
          lastSync: new Date(),
        },
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
      };

      mockStudentData.overallAttendance = calculateOverallAttendance(mockStudentData.subjects);
      
      dispatch({ type: 'SET_STUDENT_DATA', payload: mockStudentData });
      dispatch({ type: 'SET_SYNC_STATUS', payload: { isLoading: false, lastSync: new Date() } });
    } catch (error) {
      dispatch({ 
        type: 'SET_SYNC_STATUS', 
        payload: { 
          isLoading: false, 
          error: error instanceof Error ? error.message : 'Login failed' 
        } 
      });
    }
  };

  const logout = () => {
    dispatch({ type: 'LOGOUT' });
  };

  const syncData = async (): Promise<void> => {
    if (!state.studentData) return;
    
    dispatch({ type: 'SET_SYNC_STATUS', payload: { isLoading: true } });
    
    try {
      // Simulate sync - replace with actual WebKiosk scraping
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Update last sync time
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