import { useEffect, useState } from "react";
import "./App.css";

// Import components
import LoginScreen from "./components/LoginScreen";
import Dashboard from "./components/NewDashboard";

// Import services and utilities
import { authApi, studentApi, syncApi } from "./lib/api";
import { isMobile } from "./lib/mobile";
import { Subject, SGPACGPAData } from "./types";

// Simple state management for auth
// Types
interface User {
  id: string;
  enrollmentNumber: string;
  name: string;
  course: string;
  branch: string;
  semester: number;
  lastSync?: Date;
}

interface AppState {
  user: User | null;
  attendance: Subject[];
  sgpaData: SGPACGPAData[];
  isLoading: boolean;
  lastSync: string | null;
  error: string | null;
}

const App = () => {
  console.log('=== JUET APP DEBUG: Rendering App component ===');
  
  const [state, setState] = useState<AppState>({
    user: null,
    attendance: [],
    sgpaData: [],
    isLoading: false,
    lastSync: null,
    error: null
  });

  // Check for stored data on app start
  useEffect(() => {
    const loadStoredData = () => {
      try {
        const storedUser = localStorage.getItem('juet_user');
        const storedAttendance = localStorage.getItem('juet_attendance');
        const storedSGPA = localStorage.getItem('juet_sgpa');
        const storedLastSync = localStorage.getItem('juet_last_sync');

        if (storedUser) {
          const user = JSON.parse(storedUser);
          const attendance = storedAttendance ? JSON.parse(storedAttendance) : [];
          const sgpaData = storedSGPA ? JSON.parse(storedSGPA) : [];
          
          setState(prev => ({
            ...prev,
            user,
            attendance,
            sgpaData,
            lastSync: storedLastSync
          }));

          console.log('=== JUET APP DEBUG: Restored user session ===', { user, attendanceCount: attendance.length });
        }
      } catch (error) {
        console.error('Error loading stored data:', error);
        // Clear corrupted data
        localStorage.removeItem('juet_user');
        localStorage.removeItem('juet_attendance');
        localStorage.removeItem('juet_sgpa');
        localStorage.removeItem('juet_last_sync');
      }
    };

    loadStoredData();

    // Mobile detection
    if (isMobile()) {
      console.log('=== JUET APP DEBUG: Mobile device detected ===');
      document.body.classList.add('mobile-app');
    }
  }, []);

  const handleLogin = async (enrollmentNumber: string, dateOfBirth: string, password: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    console.log('=== JUET APP DEBUG: Login attempt ===', { enrollmentNumber, dateOfBirth });
    
    // Convert date from YYYY-MM-DD to DD-MM-YYYY format
    const convertedDate = dateOfBirth.split('-').reverse().join('-');
    console.log('=== JUET APP DEBUG: Date conversion ===', { original: dateOfBirth, converted: convertedDate });
    
    try {
      // Real API call to authenticate and fetch ALL data in one call
      const loginResponse = await authApi.login({
        enrollmentNumber,
        password,
        dateOfBirth: convertedDate
      });
      
      if (loginResponse.success) {
        // Extract user data from login response
        const user: User = {
          id: enrollmentNumber,
          enrollmentNumber,
          name: loginResponse.data?.user?.name || `Student ${enrollmentNumber}`,
          course: loginResponse.data?.user?.course || 'B.Tech',
          branch: loginResponse.data?.user?.branch || 'CSE',
          semester: loginResponse.data?.user?.semester || 6
        };

        // All data comes from login response now!
        const attendance = loginResponse.data?.attendance || [];
        const sgpaData = loginResponse.data?.sgpa || [];
        const currentTime = new Date().toISOString();

        // Store data
        localStorage.setItem('juet_user', JSON.stringify(user));
        localStorage.setItem('juet_attendance', JSON.stringify(attendance));
        localStorage.setItem('juet_sgpa', JSON.stringify(sgpaData));
        localStorage.setItem('juet_last_sync', currentTime);

        setState(prev => ({
          ...prev,
          user,
          attendance,
          sgpaData,
          lastSync: currentTime,
          isLoading: false,
          error: null
        }));

        console.log('=== JUET APP DEBUG: Login successful ===', { 
          user, 
          attendanceCount: attendance.length,
          sgpaCount: sgpaData.length 
        });
      } else {
        throw new Error(loginResponse.message || 'Login failed');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: error.message || 'Login failed. Please check your credentials and try again.' 
      }));
    }
  };

  const handleLogout = () => {
    setState({
      user: null,
      attendance: [],
      sgpaData: [],
      isLoading: false,
      lastSync: null,
      error: null
    });
    
    // Clear stored data
    localStorage.removeItem('juet_user');
    localStorage.removeItem('juet_attendance');
    localStorage.removeItem('juet_sgpa');
    localStorage.removeItem('juet_last_sync');
    
    console.log('=== JUET APP DEBUG: User logged out ===');
  };

  const handleSyncData = async () => {
    if (!state.user) return;

    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      console.log('=== JUET APP DEBUG: Syncing data ===');
      
      // Fetch fresh attendance data
      const attendanceResponse = await studentApi.getAttendance();
      
      // Fetch fresh SGPA data
      const sgpaResponse = await studentApi.getSGPACGPA();

      const attendance = attendanceResponse.success ? attendanceResponse.data : state.attendance;
      const sgpaData = sgpaResponse.success ? sgpaResponse.data : state.sgpaData;
      const currentTime = new Date().toISOString();

      // Update stored data
      localStorage.setItem('juet_attendance', JSON.stringify(attendance));
      localStorage.setItem('juet_sgpa', JSON.stringify(sgpaData));
      localStorage.setItem('juet_last_sync', currentTime);

      setState(prev => ({
        ...prev,
        attendance,
        sgpaData,
        lastSync: currentTime,
        isLoading: false,
        error: null
      }));

      console.log('=== JUET APP DEBUG: Data sync successful ===', { 
        attendanceCount: attendance.length,
        sgpaCount: sgpaData.length 
      });

    } catch (error: any) {
      console.error('Sync error:', error);
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: error.message || 'Failed to sync data' 
      }));
    }
  };

  // Show login screen if no user
  if (!state.user) {
    return (
      <LoginScreen 
        onLogin={handleLogin} 
        isLoading={state.isLoading} 
        error={state.error}
      />
    );
  }

  // Show dashboard if user is logged in
  return (
    <Dashboard 
      user={state.user} 
      attendance={state.attendance}
      sgpaData={state.sgpaData}
      lastSyncTime={state.lastSync}
      onLogout={handleLogout}
      onSync={handleSyncData}
      isSyncing={state.isLoading}
    />
  );
};

export default App;
