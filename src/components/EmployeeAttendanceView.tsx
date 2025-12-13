import { useState, useEffect } from 'react';
import { Search, Download } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { api } from '../services/api';

export function EmployeeAttendanceView() {
  const [data, setData] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await api.getAllAttendance();
        setData(result);
      } catch (e) { console.error(e); }
    };
    fetchData();
    
    // Refresh data every 30 seconds to see live updates
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const filteredData = data.filter(record => 
    record.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    record.department.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>Employee Attendance & Productivity</CardTitle>
            <CardDescription>Detailed logs including inactivity duration</CardDescription>
          </div>
          <Button variant="outline" size="sm"><Download className="w-4 h-4 mr-2" /> Export</Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input 
              placeholder="Search by name or department..." 
              value={searchQuery} 
              onChange={(e) => setSearchQuery(e.target.value)} 
              className="pl-10"
            />
          </div>
        </div>

        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead>Employee</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Clock In/Out</TableHead>
                
                {/* NEW COLUMNS */}
                <TableHead>Offline (Inactive)</TableHead>
                <TableHead>Productivity</TableHead>
                
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.map((record) => (
                <TableRow key={record.id}>
                  <TableCell>
                    <div className="font-medium text-slate-900">{record.name}</div>
                  </TableCell>
                  <TableCell><Badge variant="outline">{record.department}</Badge></TableCell>
                  <TableCell>{record.date}</TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <span className="text-emerald-600">In: {record.clockIn}</span>
                      <br />
                      <span className="text-slate-500">Out: {record.clockOut}</span>
                    </div>
                  </TableCell>
                  
                  {/* INACTIVE TIME DISPLAY */}
                  <TableCell>
                    <span className="font-mono text-amber-600 bg-amber-50 px-2 py-1 rounded text-xs font-medium">
                      {record.inactiveTime}
                    </span>
                  </TableCell>

                  {/* PRODUCTIVITY BAR */}
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${
                            record.productivity >= 80 ? 'bg-emerald-500' : 
                            record.productivity >= 50 ? 'bg-amber-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${record.productivity}%` }}
                        />
                      </div>
                      <span className="text-sm text-slate-600">{record.productivity}%</span>
                    </div>
                  </TableCell>

                  <TableCell>
                    <Badge variant="outline" className={record.status === 'Active' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-50 text-slate-600'}>
                      {record.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}