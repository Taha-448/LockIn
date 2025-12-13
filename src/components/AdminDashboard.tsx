import { useState, useEffect } from 'react';
import { 
  Shield, LogOut, Users, Activity, Settings,
  AlertCircle, TrendingUp
} from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { EmployeeAttendanceView } from './EmployeeAttendanceView';
import { LiveSessionsView } from './LiveSessionsView';
import { EmployeeManagement } from './EmployeeManagement';
import { SecurityLogs } from './SecurityLogs';
import { AdminSettings } from './AdminSettings';
import { AttendanceCalendar } from './AttendanceCalendar';
import { api } from '../services/api';

interface AdminDashboardProps {
  onLogout: () => void;
}

export function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({
    totalEmployees: 0,
    activeSessions: 0,
    attendanceRate: 0,
    securityAlerts: 0
  });
  const [activities, setActivities] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const dashboardStats = await api.getAdminStats();
        if (dashboardStats) setStats(dashboardStats);

        const recentActivity = await api.getRecentActivity();
        setActivities(recentActivity);
      } catch (e) {
        console.error("Failed to load admin data");
      }
    };
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-slate-800 text-white sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-white font-semibold">Admin Portal</h2>
                <p className="text-xs text-slate-300">Administrator Dashboard</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="bg-amber-500/20 text-amber-300 border-amber-400">
                <Shield className="w-3 h-3 mr-1" />
                Admin Access
              </Badge>
              
              {/* FIX: Changed button style to be transparent background with visible white text */}
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onLogout} 
                className="text-white hover:bg-slate-700 hover:text-white border border-slate-600"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-slate-900 text-2xl font-bold">{stats.totalEmployees}</div>
                  <p className="text-xs text-slate-500 mt-1">Registered users</p>
                </div>
                <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-slate-900 text-2xl font-bold">{stats.activeSessions}</div>
                  <p className="text-xs text-slate-500 mt-1">Currently clocked in</p>
                </div>
                <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                  <Activity className="w-6 h-6 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Attendance Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-slate-900 text-2xl font-bold">{stats.attendanceRate}%</div>
                  <p className="text-xs text-slate-500 mt-1">Today</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Security Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-slate-900 text-2xl font-bold">{stats.securityAlerts}</div>
                  <p className="text-xs text-slate-500 mt-1">Requiring attention</p>
                </div>
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6 lg:w-auto lg:inline-grid">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="attendance">Attendance</TabsTrigger>
            <TabsTrigger value="live">Live Sessions</TabsTrigger>
            <TabsTrigger value="employees">Employees</TabsTrigger>
            <TabsTrigger value="logs">Security Logs</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Today's Summary</CardTitle>
                  <CardDescription>Quick overview of today's attendance</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg">
                      <div>
                        <p className="text-sm text-slate-600">On Time</p>
                        <div className="text-emerald-700 font-medium">{stats.activeSessions} employees</div>
                      </div>
                      <Badge className="bg-emerald-500">Live</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div>
                        <p className="text-sm text-slate-600">Total Registered</p>
                        <div className="text-slate-700 font-medium">{stats.totalEmployees} employees</div>
                      </div>
                      <Badge variant="outline">Total</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Latest attendance events</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {activities.length === 0 ? (
                      <p className="text-sm text-slate-500">No recent activity.</p>
                    ) : (
                      activities.map((activity, idx) => (
                        <div key={idx} className="flex items-center gap-3 p-2 hover:bg-slate-100 rounded-lg transition-colors">
                          <div className={`w-2 h-2 rounded-full ${
                            activity.status === 'success' ? 'bg-emerald-500' : 'bg-amber-500'
                          }`} />
                          <div className="flex-1">
                            <div className="text-sm text-slate-900 font-medium">{activity.name}</div>
                            <div className="text-xs text-slate-500">{activity.action}</div>
                          </div>
                          <div className="text-xs text-slate-400">
                            {new Date(activity.time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="attendance"><EmployeeAttendanceView /></TabsContent>
          <TabsContent value="live"><LiveSessionsView /></TabsContent>
          <TabsContent value="employees"><EmployeeManagement /></TabsContent>
          <TabsContent value="logs"><SecurityLogs /></TabsContent>
          <TabsContent value="settings"><AdminSettings /></TabsContent>
        </Tabs>
      </main>
    </div>
  );
}