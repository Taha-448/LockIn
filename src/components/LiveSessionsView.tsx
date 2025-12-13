import { useState, useEffect } from 'react';
import { Activity, Clock, MapPin, Smartphone, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { api } from '../services/api';

export function LiveSessionsView() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchLive = async () => {
      try {
        const data = await api.getLiveSessions();
        setSessions(data);
      } catch (e) {
        console.error(e);
      }
    };
    fetchLive();
    const interval = setInterval(fetchLive, 10000); // Poll every 10s
    return () => clearInterval(interval);
  }, []);

  const filteredSessions = sessions.filter(session =>
    session.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    session.department.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle>Live Sessions</CardTitle>
              <CardDescription>Monitor all active employee sessions in real-time</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-sm text-slate-600">Live Updates</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <Input
              placeholder="Search by name or department..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead>Employee</TableHead>
                  <TableHead>Clock In</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Device & IP</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSessions.length === 0 ? (
                  <TableRow><TableCell colSpan={4} className="text-center py-8">No active sessions</TableCell></TableRow>
                ) : (
                  filteredSessions.map((session) => (
                    <TableRow key={session.id}>
                      <TableCell>
                        <div>
                          <div className="text-slate-900">{session.name}</div>
                          <div className="text-sm text-slate-500">{session.department}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {new Date(session.clockIn).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-emerald-100 text-emerald-700 border-emerald-200">
                          <div className="w-2 h-2 bg-emerald-500 rounded-full mr-2 animate-pulse" />
                          Active
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 text-sm text-slate-600">
                            <Smartphone className="w-3.5 h-3.5" />
                            {session.device}
                          </div>
                          <div className="text-xs text-slate-400">
                            IP: {session.ipAddress}
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}