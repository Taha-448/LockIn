import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, Activity } from 'lucide-react';
import { api } from '../services/api';

export function ProductivityAnalytics() {
  const [weeklyData, setWeeklyData] = useState<any[]>([]);
  const [averages, setAverages] = useState({ prod: 0, active: 0, inactive: 0 });

  useEffect(() => {
    const fetchData = async () => {
      const userId = parseInt(localStorage.getItem('user_id') || '0');
      if (userId) {
        const data = await api.getWeeklyAnalytics(userId);
        setWeeklyData(data);
        
        // Calculate simple averages for the cards
        if (data.length > 0) {
          const totalProd = data.reduce((acc:any, curr:any) => acc + curr.productivity, 0);
          const totalActive = data.reduce((acc:any, curr:any) => acc + curr.activeTime, 0);
          setAverages({
            prod: Math.round(totalProd / data.length),
            active: parseFloat((totalActive / data.length).toFixed(1)),
            inactive: 0.5 // Static for demo or calculate similarly
          });
        }
      }
    };
    fetchData();
  }, []);

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-sm">Avg. Productivity</CardTitle></CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-slate-900 text-2xl">{averages.prod}%</div>
              <TrendingUp className="w-4 h-4 text-emerald-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-sm">Avg. Active Hours</CardTitle></CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-slate-900 text-2xl">{averages.active} hrs</div>
              <Activity className="w-4 h-4 text-emerald-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-sm">Inactive Hours</CardTitle></CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-slate-900 text-2xl">{averages.inactive} hrs</div>
              <TrendingDown className="w-4 h-4 text-amber-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Card>
        <CardHeader>
          <CardTitle>Weekly Activity Breakdown</CardTitle>
          <CardDescription>Real-time data from your attendance logs</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="day" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip contentStyle={{ backgroundColor: 'white', borderRadius: '8px' }} />
              <Legend />
              <Bar dataKey="activeTime" name="Active (hrs)" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="inactiveTime" name="Inactive (hrs)" fill="#f59e0b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}