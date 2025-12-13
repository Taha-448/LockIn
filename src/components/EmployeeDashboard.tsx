import { useState, useEffect, useRef } from 'react';
import { LogIn, LogOut, Activity, Clock, Shield, TrendingUp, AlertCircle } from 'lucide-react';
import { Button } from './ui/button';
// --- FIX IS HERE: Added CardDescription to imports ---
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { AttendanceHistory } from './AttendanceHistory';
import { ProductivityAnalytics } from './ProductivityAnalytics';
import { DeviceManagement } from './DeviceManagement';
import { BiometricSettings } from './BiometricSettings';
import { api } from '../services/api';

interface EmployeeDashboardProps {
  onLogout: () => void;
  onShowTimeout: () => void;
}

type AttendanceStatus = 'active' | 'inactive' | 'logged-out';

export function EmployeeDashboard({ onLogout, onShowTimeout }: EmployeeDashboardProps) {
  const [status, setStatus] = useState<AttendanceStatus>('logged-out');
  const [clockInTime, setClockInTime] = useState<Date | null>(null);
  const [activeTime, setActiveTime] = useState(0);
  const [inactiveWarning, setInactiveWarning] = useState(false);
  const [refreshHistoryTrigger, setRefreshHistoryTrigger] = useState(0);

  // Safe parsing of LocalStorage
  const [userId] = useState<number>(() => {
    const stored = localStorage.getItem('user_id');
    return stored ? parseInt(stored) : 0;
  });
  
  const [userName] = useState(localStorage.getItem('user_name') || 'Employee');

  // Use 'any' type for the timer to avoid TypeScript conflicts
  const inactivityTimerRef = useRef<any>(null);
  const lastActivityRef = useRef<number>(Date.now());

  // --- 1. ACTIVE TIME COUNTER ---
  useEffect(() => {
    let interval: any;
    if (status === 'active') {
      interval = setInterval(() => {
        setActiveTime((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [status]);

  // --- 2. INACTIVITY WATCHDOG ---
  useEffect(() => {
    if (status === 'logged-out') {
      if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
      return;
    }

    const startTimer = () => {
      if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
      
      // 30 seconds inactivity timer
      inactivityTimerRef.current = setTimeout(() => {
        setStatus('inactive');
        setInactiveWarning(true);
        // Log to Backend
        if (userId) api.logInactivity(userId, 30).catch(console.error);
      }, 30000); 
    };

    const handleUserActivity = () => {
      // Throttle: Only process activity once per second to prevent lag
      const now = Date.now();
      if (now - lastActivityRef.current < 1000) return;
      lastActivityRef.current = now;

      // If we were inactive, wake up!
      setStatus((prevStatus) => {
        if (prevStatus === 'inactive') {
          setInactiveWarning(false);
          return 'active';
        }
        return prevStatus;
      });

      // Reset the countdown
      startTimer();
    };

    // Attach listeners
    window.addEventListener('mousemove', handleUserActivity);
    window.addEventListener('keypress', handleUserActivity);
    window.addEventListener('click', handleUserActivity);
    window.addEventListener('scroll', handleUserActivity);

    // Initial Start
    startTimer();

    return () => {
      if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
      window.removeEventListener('mousemove', handleUserActivity);
      window.removeEventListener('keypress', handleUserActivity);
      window.removeEventListener('click', handleUserActivity);
      window.removeEventListener('scroll', handleUserActivity);
    };
  }, [status, userId]);

  const handleClockIn = async () => {
    if (!userId) {
      alert("Error: User ID not found. Please relogin.");
      return;
    }
    try {
      await api.clockIn(userId);
      setClockInTime(new Date());
      setStatus('active');
      setActiveTime(0);
      setRefreshHistoryTrigger(prev => prev + 1);
    } catch (e) {
      console.error(e);
      alert("Failed to clock in. Check console for details.");
    }
  };

  const handleClockOut = async () => {
    try {
      if (userId) await api.clockOut(userId);
      setStatus('logged-out');
      setClockInTime(null);
      setActiveTime(0);
      setInactiveWarning(false);
      setRefreshHistoryTrigger(prev => prev + 1);
    } catch (e) {
      console.error(e);
      alert("Failed to clock out");
    }
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusColor = (status: AttendanceStatus) => {
    switch (status) {
      case 'active': return 'bg-emerald-500';
      case 'inactive': return 'bg-amber-500';
      case 'logged-out': return 'bg-slate-400';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-slate-800">Employee Portal</h2>
                <p className="text-xs text-slate-500">Welcome back, {userName}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="gap-2">
                <div className={`w-2 h-2 rounded-full ${getStatusColor(status)}`} />
                {status.toUpperCase()}
              </Badge>
              <Button variant="outline" size="sm" onClick={onLogout}>
                <LogOut className="w-4 h-4 mr-2" /> Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {inactiveWarning && (
          <div className="mb-6 bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3 animate-in fade-in slide-in-from-top-4 duration-300">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="text-amber-900 mb-1">Inactivity Detected</h4>
              <p className="text-sm text-amber-700">Your status is now inactive. Move your mouse to resume.</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm">Current Status</CardTitle></CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 ${getStatusColor(status)} rounded-full flex items-center justify-center transition-colors duration-300`}>
                  <Activity className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="text-slate-900 capitalize font-medium">{status}</div>
                  <p className="text-xs text-slate-500">Real-time tracking</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm">Active Time Today</CardTitle></CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                  <Clock className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <div className="text-slate-900 font-mono text-lg">{formatDuration(activeTime)}</div>
                  <p className="text-xs text-slate-500">Since clock in</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Attendance Control</CardTitle>
            <CardDescription>Secure 3FA Session Active</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Button onClick={handleClockIn} disabled={status !== 'logged-out'} className="flex-1 h-14 bg-emerald-500 hover:bg-emerald-600 transition-all">
                <LogIn className="w-5 h-5 mr-2" /> Clock In
              </Button>
              <Button onClick={handleClockOut} disabled={status === 'logged-out'} variant="outline" className="flex-1 h-14">
                <LogOut className="w-5 h-5 mr-2" /> Clock Out
              </Button>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="history" className="space-y-6">
          <TabsList>
            <TabsTrigger value="history">Attendance History</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="devices">Devices</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
          </TabsList>
          
          <TabsContent value="history">
            <AttendanceHistory refreshTrigger={refreshHistoryTrigger} />
          </TabsContent>
          
          <TabsContent value="analytics"><ProductivityAnalytics /></TabsContent>
          <TabsContent value="devices"><DeviceManagement /></TabsContent>
          <TabsContent value="security"><BiometricSettings /></TabsContent>
        </Tabs>
      </main>
    </div>
  );
}