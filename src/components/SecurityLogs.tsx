import { useState, useEffect } from 'react';
import { Search, Shield, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { api } from '../services/api';

export function SecurityLogs() {
  const [logs, setLogs] = useState<any[]>([]);
  
  useEffect(() => {
    const fetchLogs = async () => {
      const data = await api.getSecurityLogs();
      setLogs(data);
    };
    fetchLogs();
  }, []);

  const getSeverityBadge = (severity: string) => {
    const styles: any = {
      success: 'bg-emerald-100 text-emerald-700',
      warning: 'bg-amber-100 text-amber-700',
      error: 'bg-red-100 text-red-700',
      info: 'bg-slate-100 text-slate-700'
    };
    return <Badge variant="outline" className={styles[severity] || styles.info}>{severity}</Badge>;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Security Logs</CardTitle>
        <CardDescription>Audit trail of system events</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead>Timestamp</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead>Details</TableHead>
                <TableHead>IP</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>{new Date(log.timestamp).toLocaleString()}</TableCell>
                  <TableCell>{log.user_identifier}</TableCell>
                  <TableCell>{log.event_type}</TableCell>
                  <TableCell>{getSeverityBadge(log.severity)}</TableCell>
                  <TableCell>{log.description}</TableCell>
                  <TableCell>{log.ip_address}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}