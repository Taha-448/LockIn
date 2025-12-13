import { useState, useEffect } from 'react';
import { SplashScreen } from './components/SplashScreen';
import { LoginPage } from './components/LoginPage';
import { RegistrationPage } from './components/RegistrationPage';
import { EmployeeDashboard } from './components/EmployeeDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { SessionTimeoutWarning } from './components/SessionTimeoutWarning';
import { Toaster } from './components/ui/sonner';

type AppState = 
  | 'splash' 
  | 'login' 
  | 'register'
  | 'employee-dashboard' 
  | 'admin-dashboard';

type UserRole = 'employee' | 'admin' | null;

function App() {
  const [appState, setAppState] = useState<AppState>('splash');
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [showTimeoutWarning, setShowTimeoutWarning] = useState(false);
  const [timeoutCountdown, setTimeoutCountdown] = useState(60);
  const [lastActivity, setLastActivity] = useState(Date.now());

  // Session timeout management
  useEffect(() => {
    if (appState !== 'employee-dashboard' && appState !== 'admin-dashboard') {
      return;
    }

    const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes
    const WARNING_TIME = 60 * 1000; // 1 minute before timeout

    const checkInactivity = () => {
      const now = Date.now();
      const inactiveTime = now - lastActivity;

      if (inactiveTime >= SESSION_TIMEOUT) {
        handleLogout();
      } else if (inactiveTime >= SESSION_TIMEOUT - WARNING_TIME && !showTimeoutWarning) {
        setShowTimeoutWarning(true);
        const remaining = Math.floor((SESSION_TIMEOUT - inactiveTime) / 1000);
        setTimeoutCountdown(remaining);
      }
    };

    const updateActivity = () => {
      setLastActivity(Date.now());
      if (showTimeoutWarning) {
        setShowTimeoutWarning(false);
      }
    };

    const inactivityInterval = setInterval(checkInactivity, 1000);

    // Track user activity
    window.addEventListener('mousemove', updateActivity);
    window.addEventListener('keypress', updateActivity);
    window.addEventListener('click', updateActivity);
    window.addEventListener('scroll', updateActivity);

    return () => {
      clearInterval(inactivityInterval);
      window.removeEventListener('mousemove', updateActivity);
      window.removeEventListener('keypress', updateActivity);
      window.removeEventListener('click', updateActivity);
      window.removeEventListener('scroll', updateActivity);
    };
  }, [appState, lastActivity, showTimeoutWarning]);

  const handleSplashComplete = () => {
    setAppState('login');
  };

  const handleLogin = (role: 'employee' | 'admin') => {
    setUserRole(role);
    // After successful login (with automatic biometric and device verification)
    // go directly to the appropriate dashboard
    if (role === 'admin') {
      setAppState('admin-dashboard');
    } else {
      setAppState('employee-dashboard');
    }
  };

  const handleShowRegister = () => {
    setAppState('register');
  };

  const handleBackToLogin = () => {
    setAppState('login');
    setUserRole(null);
  };

  const handleRegistrationComplete = (role: 'employee' | 'admin') => {
    setUserRole(role);
    // After registration and automatic device/biometric setup, go directly to dashboard
    if (role === 'admin') {
      setAppState('admin-dashboard');
    } else {
      setAppState('employee-dashboard');
    }
  };

  const handleLogout = () => {
    setUserRole(null);
    setAppState('login');
    setShowTimeoutWarning(false);
  };

  const handleExtendSession = () => {
    setLastActivity(Date.now());
    setShowTimeoutWarning(false);
  };

  const handleShowTimeout = () => {
    setShowTimeoutWarning(true);
    setTimeoutCountdown(60);
  };

  return (
    <>
      {appState === 'splash' && (
        <SplashScreen onComplete={handleSplashComplete} />
      )}

      {appState === 'login' && (
        <LoginPage onLogin={handleLogin} onRegister={handleShowRegister} />
      )}

      {appState === 'register' && (
        <RegistrationPage 
          onComplete={handleRegistrationComplete}
          onBack={handleBackToLogin}
        />
      )}

      {appState === 'employee-dashboard' && (
        <EmployeeDashboard 
          onLogout={handleLogout}
          onShowTimeout={handleShowTimeout}
        />
      )}

      {appState === 'admin-dashboard' && (
        <AdminDashboard onLogout={handleLogout} />
      )}

      <SessionTimeoutWarning
        show={showTimeoutWarning}
        timeRemaining={timeoutCountdown}
        onExtend={handleExtendSession}
        onLogout={handleLogout}
      />

      <Toaster />
    </>
  );
}

export default App;