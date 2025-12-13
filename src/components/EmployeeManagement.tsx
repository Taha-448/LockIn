import { useState, useEffect } from 'react';
import { Search, UserPlus, Edit, Trash2, Shield, Mail, Phone } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { api } from '../services/api';

export function EmployeeManagement() {
  const [searchQuery, setSearchQuery] = useState('');
  const [employees, setEmployees] = useState<any[]>([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await api.getAllUsers();
        setEmployees(data);
      } catch (e) {
        console.error(e);
      }
    };
    fetchUsers();
  }, []);

  const filteredEmployees = employees.filter(emp =>
    emp.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    emp.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>Employee Management</CardTitle>
            <CardDescription>View all registered users</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <Input
            placeholder="Search by name, email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead>Employee</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEmployees.map((employee) => (
                <TableRow key={employee.id}>
                  <TableCell>
                    <div className="font-medium text-slate-900">{employee.full_name}</div>
                  </TableCell>
                  <TableCell>{employee.email}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-slate-50">
                      {employee.department}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={employee.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-slate-100'}>
                      {employee.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-emerald-100 text-emerald-700">Active</Badge>
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