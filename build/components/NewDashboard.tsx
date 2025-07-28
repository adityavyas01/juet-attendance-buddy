import React from 'react';
import { User, Subject, SGPACGPAData } from '../types';

interface DashboardProps {
  user: User;
  attendance: Subject[];
  sgpaData: SGPACGPAData[];
  lastSyncTime: string | null;
  onSync: () => void;
  onLogout: () => void;
  isSyncing: boolean;
}

const Dashboard: React.FC<DashboardProps> = ({ 
  user, 
  attendance, 
  sgpaData, 
  lastSyncTime, 
  onSync, 
  onLogout, 
  isSyncing 
}) => {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px',
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif'
    }}>
      {/* Header */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.15)',
        backdropFilter: 'blur(20px)',
        borderRadius: '20px',
        padding: '25px',
        marginBottom: '25px',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '15px'
        }}>
          <div>
            <h1 style={{
              color: 'white',
              margin: '0 0 5px 0',
              fontSize: '28px',
              fontWeight: '700',
              textShadow: '0 2px 10px rgba(0, 0, 0, 0.3)'
            }}>
              Welcome, {user.name}
            </h1>
            <p style={{
              color: 'rgba(255, 255, 255, 0.8)',
              margin: 0,
              fontSize: '16px',
              fontWeight: '500'
            }}>
              {user.enrollmentNumber} • {user.course} • {user.branch} • Sem {user.semester}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={onSync}
              disabled={isSyncing}
              style={{
                background: isSyncing 
                  ? 'rgba(255, 255, 255, 0.1)' 
                  : 'rgba(255, 255, 255, 0.2)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '12px',
                padding: '12px 20px',
                color: 'white',
                fontWeight: '600',
                cursor: isSyncing ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s ease',
                opacity: isSyncing ? 0.7 : 1
              }}
            >
              {isSyncing ? '🔄 Syncing...' : '🔄 Sync Data'}
            </button>
            <button
              onClick={onLogout}
              style={{
                background: 'rgba(255, 0, 0, 0.2)',
                border: '1px solid rgba(255, 0, 0, 0.3)',
                borderRadius: '12px',
                padding: '12px 20px',
                color: 'white',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
            >
              🚪 Logout
            </button>
          </div>
        </div>
        
        {lastSyncTime && (
          <p style={{
            color: 'rgba(255, 255, 255, 0.7)',
            margin: '15px 0 0 0',
            fontSize: '14px'
          }}>
            Last synced: {new Date(lastSyncTime).toLocaleString()}
          </p>
        )}
      </div>

      {/* Attendance Overview */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.15)',
        backdropFilter: 'blur(20px)',
        borderRadius: '20px',
        padding: '25px',
        marginBottom: '25px',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
      }}>
        <h2 style={{
          color: 'white',
          margin: '0 0 20px 0',
          fontSize: '24px',
          fontWeight: '700',
          textShadow: '0 2px 10px rgba(0, 0, 0, 0.3)'
        }}>
          📊 Attendance Overview
        </h2>
        
        {attendance.length === 0 ? (
          <p style={{
            color: 'rgba(255, 255, 255, 0.8)',
            textAlign: 'center',
            fontSize: '18px',
            margin: '40px 0'
          }}>
            No attendance data available. Click "Sync Data" to refresh.
          </p>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '20px'
          }}>
            {attendance.map((subject, index) => (
              <div key={index} style={{
                background: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '15px',
                padding: '20px',
                border: '1px solid rgba(255, 255, 255, 0.2)'
              }}>
                <h3 style={{
                  color: 'white',
                  margin: '0 0 15px 0',
                  fontSize: '18px',
                  fontWeight: '600'
                }}>
                  {subject.name}
                </h3>
                
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '10px'
                }}>
                  <span style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                    {subject.attendance.lectures.attended + subject.attendance.tutorials.attended + subject.attendance.practicals.attended}/
                    {subject.attendance.lectures.total + subject.attendance.tutorials.total + subject.attendance.practicals.total} classes
                  </span>
                  <span style={{
                    color: subject.percentage >= 75 ? '#4ade80' : 
                           subject.percentage >= 65 ? '#fbbf24' : '#ef4444',
                    fontWeight: '700'
                  }}>
                    {subject.percentage.toFixed(1)}%
                  </span>
                </div>
                
                <div style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '10px',
                  height: '8px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    background: subject.percentage >= 75 ? '#4ade80' : 
                               subject.percentage >= 65 ? '#fbbf24' : '#ef4444',
                    height: '100%',
                    width: `${Math.min(subject.percentage, 100)}%`,
                    transition: 'all 0.3s ease'
                  }} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SGPA/CGPA Data */}
      {sgpaData.length > 0 && (
        <div style={{
          background: 'rgba(255, 255, 255, 0.15)',
          backdropFilter: 'blur(20px)',
          borderRadius: '20px',
          padding: '25px',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
        }}>
          <h2 style={{
            color: 'white',
            margin: '0 0 20px 0',
            fontSize: '24px',
            fontWeight: '700',
            textShadow: '0 2px 10px rgba(0, 0, 0, 0.3)'
          }}>
            🎓 Academic Performance
          </h2>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '15px'
          }}>
            {sgpaData.map((data, index) => (
              <div key={index} style={{
                background: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '15px',
                padding: '20px',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                textAlign: 'center'
              }}>
                <h4 style={{
                  color: 'white',
                  margin: '0 0 10px 0',
                  fontSize: '16px',
                  fontWeight: '600'
                }}>
                  Semester {data.semester}
                </h4>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-around'
                }}>
                  <div>
                    <p style={{
                      color: 'rgba(255, 255, 255, 0.8)',
                      margin: '0 0 5px 0',
                      fontSize: '14px'
                    }}>
                      SGPA
                    </p>
                    <p style={{
                      color: '#4ade80',
                      margin: 0,
                      fontSize: '20px',
                      fontWeight: '700'
                    }}>
                      {data.sgpa.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p style={{
                      color: 'rgba(255, 255, 255, 0.8)',
                      margin: '0 0 5px 0',
                      fontSize: '14px'
                    }}>
                      CGPA
                    </p>
                    <p style={{
                      color: '#60a5fa',
                      margin: 0,
                      fontSize: '20px',
                      fontWeight: '700'
                    }}>
                      {data.cgpa.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
