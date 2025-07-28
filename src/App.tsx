import React, { useState, useEffect } from 'react';
import './App.css';

// Types
interface User {
  enrollmentNumber: string;
  name: string;
  course: string;
  branch: string;
  semester: number;
}

interface Subject {
  name: string;
  lecturePercentage: number;
  tutorialPercentage: number;
  practicalPercentage: number;
  totalPercentage: number;
}

interface SGPAData {
  semester: number;
  sgpa: number;
  cgpa: number;
}

interface LoginResponse {
  success: boolean;
  data: {
    token: string;
    user: User;
    attendance: Subject[];
    sgpa: SGPAData[];
  };
  message?: string;
}

// API Configuration
const API_BASE_URL = 'http://localhost:3000/api';

// Simple API function
const loginAPI = async (enrollmentNumber: string, password: string, dateOfBirth: string): Promise<LoginResponse> => {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      enrollmentNumber,
      password,
      dateOfBirth
    })
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Login failed');
  }

  return response.json();
};

// Login Component
const LoginForm = ({ onLogin, isLoading, error }: { 
  onLogin: (enrollment: string, password: string, dob: string) => void;
  isLoading: boolean;
  error: string | null;
}) => {
  const [enrollment, setEnrollment] = useState('');
  const [password, setPassword] = useState('');
  const [dob, setDob] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (enrollment && password && dob) {
      // Convert YYYY-MM-DD to DD-MM-YYYY
      const convertedDate = dob.split('-').reverse().join('-');
      onLogin(enrollment, password, convertedDate);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{
        background: 'white',
        padding: '40px',
        borderRadius: '20px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
        width: '100%',
        maxWidth: '400px'
      }}>
        <h1 style={{
          textAlign: 'center',
          color: '#333',
          marginBottom: '30px',
          fontSize: '28px'
        }}>
          JUET Attendance
        </h1>
        
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#555' }}>
              Enrollment Number
            </label>
            <input
              type="text"
              value={enrollment}
              onChange={(e) => setEnrollment(e.target.value)}
              placeholder="e.g., 221B034"
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '15px',
                border: '2px solid #ddd',
                borderRadius: '10px',
                fontSize: '16px',
                outline: 'none',
                transition: 'border-color 0.3s'
              }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#555' }}>
              Date of Birth
            </label>
            <input
              type="date"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '15px',
                border: '2px solid #ddd',
                borderRadius: '10px',
                fontSize: '16px',
                outline: 'none',
                transition: 'border-color 0.3s'
              }}
            />
          </div>

          <div style={{ marginBottom: '30px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#555' }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Your WebKiosk password"
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '15px',
                border: '2px solid #ddd',
                borderRadius: '10px',
                fontSize: '16px',
                outline: 'none',
                transition: 'border-color 0.3s'
              }}
            />
          </div>

          {error && (
            <div style={{
              background: '#fee',
              color: '#c33',
              padding: '15px',
              borderRadius: '10px',
              marginBottom: '20px',
              border: '1px solid #fcc'
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading || !enrollment || !password || !dob}
            style={{
              width: '100%',
              padding: '15px',
              background: isLoading ? '#ccc' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              fontSize: '18px',
              fontWeight: 'bold',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s'
            }}
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
};

// Dashboard Component
const Dashboard = ({ user, attendance, sgpa, onLogout }: {
  user: User;
  attendance: Subject[];
  sgpa: SGPAData[];
  onLogout: () => void;
}) => {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#f5f7fa',
      fontFamily: 'Arial, sans-serif'
    }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        padding: '20px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '24px' }}>Welcome, {user.name}</h1>
            <p style={{ margin: '5px 0 0 0', opacity: 0.9 }}>
              {user.enrollmentNumber} • {user.course} • Semester {user.semester}
            </p>
          </div>
          <button
            onClick={onLogout}
            style={{
              background: 'rgba(255,255,255,0.2)',
              color: 'white',
              border: '1px solid rgba(255,255,255,0.3)',
              padding: '10px 20px',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            Logout
          </button>
        </div>
      </div>

      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '30px 20px'
      }}>
        {/* Attendance Section */}
        <div style={{ marginBottom: '40px' }}>
          <h2 style={{ color: '#333', marginBottom: '20px' }}>Attendance</h2>
          <div style={{ display: 'grid', gap: '20px' }}>
            {attendance.map((subject, index) => (
              <div key={index} style={{
                background: 'white',
                padding: '20px',
                borderRadius: '10px',
                boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
              }}>
                <h3 style={{ margin: '0 0 15px 0', color: '#333' }}>{subject.name}</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '10px' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: subject.totalPercentage >= 75 ? '#22c55e' : '#ef4444' }}>
                      {subject.totalPercentage}%
                    </div>
                    <div style={{ fontSize: '12px', color: '#666' }}>Total</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#333' }}>{subject.lecturePercentage}%</div>
                    <div style={{ fontSize: '12px', color: '#666' }}>Lecture</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#333' }}>{subject.tutorialPercentage}%</div>
                    <div style={{ fontSize: '12px', color: '#666' }}>Tutorial</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#333' }}>{subject.practicalPercentage}%</div>
                    <div style={{ fontSize: '12px', color: '#666' }}>Practical</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SGPA Section */}
        <div>
          <h2 style={{ color: '#333', marginBottom: '20px' }}>Academic Performance</h2>
          <div style={{
            background: 'white',
            padding: '20px',
            borderRadius: '10px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
          }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '20px' }}>
              {sgpa.map((sem, index) => (
                <div key={index} style={{
                  textAlign: 'center',
                  padding: '15px',
                  border: '2px solid #f0f0f0',
                  borderRadius: '10px'
                }}>
                  <div style={{ fontSize: '14px', color: '#666', marginBottom: '5px' }}>
                    Semester {sem.semester}
                  </div>
                  <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#333', marginBottom: '5px' }}>
                    {sem.sgpa}
                  </div>
                  <div style={{ fontSize: '12px', color: '#888' }}>
                    CGPA: {sem.cgpa}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main App Component
const App = () => {
  const [user, setUser] = useState<User | null>(null);
  const [attendance, setAttendance] = useState<Subject[]>([]);
  const [sgpa, setSgpa] = useState<SGPAData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check for stored session on app start
  useEffect(() => {
    const storedUser = localStorage.getItem('juet_user');
    const storedAttendance = localStorage.getItem('juet_attendance');
    const storedSgpa = localStorage.getItem('juet_sgpa');
    
    if (storedUser && storedAttendance && storedSgpa) {
      try {
        setUser(JSON.parse(storedUser));
        setAttendance(JSON.parse(storedAttendance));
        setSgpa(JSON.parse(storedSgpa));
      } catch (e) {
        // Clear corrupted data
        localStorage.clear();
      }
    }
  }, []);

  const handleLogin = async (enrollment: string, password: string, dateOfBirth: string) => {
    setIsLoading(true);
    setError(null);
    
    console.log('Login attempt:', { enrollment, dateOfBirth });
    
    try {
      const response = await loginAPI(enrollment, password, dateOfBirth);
      
      console.log('Login response:', response);
      
      if (response.success) {
        setUser(response.data.user);
        setAttendance(response.data.attendance);
        setSgpa(response.data.sgpa);
        
        // Store in localStorage
        localStorage.setItem('juet_user', JSON.stringify(response.data.user));
        localStorage.setItem('juet_attendance', JSON.stringify(response.data.attendance));
        localStorage.setItem('juet_sgpa', JSON.stringify(response.data.sgpa));
        localStorage.setItem('juet_token', response.data.token);
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    setUser(null);
    setAttendance([]);
    setSgpa([]);
    localStorage.clear();
  };

  if (user) {
    return (
      <Dashboard
        user={user}
        attendance={attendance}
        sgpa={sgpa}
        onLogout={handleLogout}
      />
    );
  }

  return (
    <LoginForm
      onLogin={handleLogin}
      isLoading={isLoading}
      error={error}
    />
  );
};

export default App;
