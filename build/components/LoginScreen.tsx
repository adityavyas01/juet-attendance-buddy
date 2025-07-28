import { useState } from "react";

interface LoginScreenProps {
  onLogin: (enrollmentNumber: string, dateOfBirth: string, password: string) => Promise<void>;
  isLoading: boolean;
  error?: string | null;
}

const LoginScreen = ({ onLogin, isLoading, error }: LoginScreenProps) => {
  const [enrollmentNumber, setEnrollmentNumber] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!enrollmentNumber || !dateOfBirth || !password) {
      alert("Please fill in all fields");
      return;
    }
    await onLogin(enrollmentNumber, dateOfBirth, password);
  };

  console.log('=== JUET APP DEBUG: LoginScreen rendering ===');
  
  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      background: 'linear-gradient(45deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #f5576c 75%, #4facfe 100%)',
      backgroundSize: '300% 300%',
      animation: 'gradientShift 8s ease infinite',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      position: 'fixed',
      top: 0,
      left: 0,
      overflow: 'hidden'
    }}>
      {/* Animated background particles */}
      <div style={{
        position: 'absolute',
        width: '100%',
        height: '100%',
        background: `
          radial-gradient(circle at 25% 25%, rgba(255,255,255,0.2) 2px, transparent 2px),
          radial-gradient(circle at 75% 75%, rgba(255,255,255,0.15) 1px, transparent 1px),
          radial-gradient(circle at 50% 50%, rgba(255,255,255,0.1) 3px, transparent 3px)
        `,
        backgroundSize: '50px 50px, 30px 30px, 70px 70px',
        animation: 'float 20s linear infinite'
      }}></div>
      
      {/* Main login container */}
      <form onSubmit={handleSubmit} style={{
        width: '90%',
        maxWidth: '400px',
        padding: '60px 40px',
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(30px)',
        borderRadius: '30px',
        border: '2px solid rgba(255, 255, 255, 0.2)',
        boxShadow: '0 40px 80px rgba(0, 0, 0, 0.2), inset 0 2px 10px rgba(255, 255, 255, 0.3)',
        zIndex: 1
      }}>
        {/* Header */}
        <div style={{
          textAlign: 'center',
          marginBottom: '50px'
        }}>
          <div style={{
            width: '100px',
            height: '100px',
            background: 'linear-gradient(135deg, #667eea, #764ba2)',
            borderRadius: '25px',
            margin: '0 auto 25px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 20px 40px rgba(102, 126, 234, 0.4)',
            transform: 'rotate(-5deg)'
          }}>
            <span style={{
              fontSize: '50px',
              transform: 'rotate(5deg)'
            }}>🎓</span>
          </div>
          <h1 style={{
            margin: 0,
            color: 'white',
            fontSize: '32px',
            fontWeight: '800',
            textShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
            marginBottom: '10px'
          }}>
            JUET Portal
          </h1>
          <p style={{
            margin: 0,
            color: 'rgba(255, 255, 255, 0.8)',
            fontSize: '18px',
            fontWeight: '300'
          }}>
            Welcome back, student!
          </p>
        </div>
        
        {/* Form fields */}
        <div style={{ marginBottom: '30px' }}>
          <input 
            type="text" 
            placeholder="Enrollment Number"
            value={enrollmentNumber}
            onChange={(e) => setEnrollmentNumber(e.target.value)}
            disabled={isLoading}
            style={{
              width: '100%',
              padding: '20px 25px',
              border: 'none',
              borderRadius: '20px',
              fontSize: '18px',
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              color: 'white',
              backdropFilter: 'blur(10px)',
              boxSizing: 'border-box',
              outline: 'none',
              transition: 'all 0.3s ease',
              opacity: isLoading ? 0.7 : 1
            }}
            onFocus={(e) => {
              if (!isLoading) {
                const target = e.target as HTMLInputElement;
                target.style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
                target.style.boxShadow = '0 0 30px rgba(255, 255, 255, 0.3)';
                target.style.transform = 'scale(1.02)';
              }
            }}
            onBlur={(e) => {
              const target = e.target as HTMLInputElement;
              target.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
              target.style.boxShadow = 'none';
              target.style.transform = 'scale(1)';
            }}
          />
        </div>

        <div style={{ marginBottom: '30px' }}>
          <input 
            type="date"
            value={dateOfBirth}
            onChange={(e) => setDateOfBirth(e.target.value)}
            disabled={isLoading}
            style={{
              width: '100%',
              padding: '20px 25px',
              border: 'none',
              borderRadius: '20px',
              fontSize: '18px',
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              color: 'white',
              backdropFilter: 'blur(10px)',
              boxSizing: 'border-box',
              outline: 'none',
              transition: 'all 0.3s ease',
              opacity: isLoading ? 0.7 : 1
            }}
            onFocus={(e) => {
              if (!isLoading) {
                const target = e.target as HTMLInputElement;
                target.style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
                target.style.boxShadow = '0 0 30px rgba(255, 255, 255, 0.3)';
                target.style.transform = 'scale(1.02)';
              }
            }}
            onBlur={(e) => {
              const target = e.target as HTMLInputElement;
              target.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
              target.style.boxShadow = 'none';
              target.style.transform = 'scale(1)';
            }}
          />
        </div>

        <div style={{ marginBottom: '40px' }}>
          <input 
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
            style={{
              width: '100%',
              padding: '20px 25px',
              border: 'none',
              borderRadius: '20px',
              fontSize: '18px',
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              color: 'white',
              backdropFilter: 'blur(10px)',
              boxSizing: 'border-box',
              outline: 'none',
              transition: 'all 0.3s ease',
              opacity: isLoading ? 0.7 : 1
            }}
            onFocus={(e) => {
              if (!isLoading) {
                const target = e.target as HTMLInputElement;
                target.style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
                target.style.boxShadow = '0 0 30px rgba(255, 255, 255, 0.3)';
                target.style.transform = 'scale(1.02)';
              }
            }}
            onBlur={(e) => {
              const target = e.target as HTMLInputElement;
              target.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
              target.style.boxShadow = 'none';
              target.style.transform = 'scale(1)';
            }}
          />
        </div>

        {/* Login button */}
        <button 
          type="submit"
          disabled={isLoading}
          style={{
            width: '100%',
            padding: '22px',
            background: isLoading 
              ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.1))'
              : 'linear-gradient(135deg, rgba(255, 255, 255, 0.3), rgba(255, 255, 255, 0.1))',
            backdropFilter: 'blur(20px)',
            color: 'white',
            border: '2px solid rgba(255, 255, 255, 0.3)',
            borderRadius: '20px',
            fontSize: '20px',
            fontWeight: '700',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            transition: 'all 0.3s ease',
            textShadow: '0 2px 10px rgba(0, 0, 0, 0.3)',
            marginBottom: error ? '20px' : '30px',
            opacity: isLoading ? 0.7 : 1
          }}
          onMouseDown={(e) => {
            if (!isLoading) {
              const target = e.target as HTMLButtonElement;
              target.style.transform = 'scale(0.98)';
              target.style.background = 'linear-gradient(135deg, rgba(255, 255, 255, 0.4), rgba(255, 255, 255, 0.2))';
            }
          }}
          onMouseUp={(e) => {
            if (!isLoading) {
              const target = e.target as HTMLButtonElement;
              target.style.transform = 'scale(1)';
              target.style.background = 'linear-gradient(135deg, rgba(255, 255, 255, 0.3), rgba(255, 255, 255, 0.1))';
            }
          }}
          onMouseLeave={(e) => {
            if (!isLoading) {
              const target = e.target as HTMLButtonElement;
              target.style.transform = 'scale(1)';
              target.style.background = 'linear-gradient(135deg, rgba(255, 255, 255, 0.3), rgba(255, 255, 255, 0.1))';
            }
          }}
        >
          {isLoading ? '⏳ SIGNING IN...' : '🚀 SIGN IN'}
        </button>

        {/* Error message */}
        {error && (
          <div style={{
            background: 'rgba(255, 0, 0, 0.1)',
            border: '1px solid rgba(255, 0, 0, 0.3)',
            borderRadius: '12px',
            padding: '15px',
            marginBottom: '20px',
            textAlign: 'center'
          }}>
            <p style={{
              color: '#ff6b6b',
              margin: 0,
              fontSize: '16px',
              fontWeight: '600'
            }}>
              ⚠️ {error}
            </p>
          </div>
        )}

        {/* Footer */}
        <div style={{
          textAlign: 'center',
          color: 'rgba(255, 255, 255, 0.7)',
          fontSize: '16px'
        }}>
          <p style={{ margin: 0 }}>
            ✨ Jaypee University ✨
          </p>
        </div>
      </form>
      
      {/* CSS Animations - injected as style tag */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes gradientShift {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
          @keyframes float {
            0% { transform: translateY(0px) rotate(0deg); }
            33% { transform: translateY(-10px) rotate(120deg); }
            66% { transform: translateY(5px) rotate(240deg); }
            100% { transform: translateY(0px) rotate(360deg); }
          }
          input::placeholder {
            color: rgba(255, 255, 255, 0.7) !important;
          }
        `
      }} />
    </div>
  );
};

export default LoginScreen;
