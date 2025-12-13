import { useState, useEffect } from 'react';
import { Search, Download } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { api } from '../services/api';

// Props definition to accept the trigger
interface AttendanceHistoryProps {
  refreshTrigger?: number; 
}

interface AttendanceRecord {
  id: number;
  clock_in_time: string;
  clock_out_time: string | null;
  status: string;
}

export function AttendanceHistory({ refreshTrigger = 0 }: AttendanceHistoryProps) {
  const [data, setData] = useState<AttendanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const userId = parseInt(localStorage.getItem('user_id') || '0');
        if(userId) {
          const history = await api.getAttendanceHistory(userId);
          setData(history);
        }
      } catch (error) {
        console.error("Failed to load history", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [refreshTrigger]); // <--- Reruns whenever this number changes

  const formatDate = (isoString: string) => {
    if(!isoString) return '--';
    return new Date(isoString).toLocaleString();
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>Attendance History</CardTitle>
            <CardDescription>View and track your attendance records</CardDescription>
          </div>
          <Button variant="outline" size="sm"><Download className="w-4 h-4 mr-2" /> Export</Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead>Date & Time In</TableHead>
                <TableHead>Time Out</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={3} className="text-center">Loading...</TableCell></TableRow>
              ) : data.length === 0 ? (
                <TableRow><TableCell colSpan={3} className="text-center">No records found</TableCell></TableRow>
              ) : (
                data.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>{formatDate(record.clock_in_time)}</TableCell>
                    <TableCell>{record.clock_out_time ? formatDate(record.clock_out_time) : 'Active Session'}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={record.clock_out_time ? "bg-slate-100" : "bg-emerald-100 text-emerald-700"}>
                        {record.clock_out_time ? 'Completed' : 'Active'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}