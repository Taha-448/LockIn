import { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';

const employees = [
  'Sarah Johnson',
  'Mike Chen',
  'Emma Davis',
  'Alex Turner',
  'Lisa Brown',
  'David Kim',
  'Rachel Green',
  'Tom Wilson',
];

// Mock calendar data for November 2024
const generateCalendarData = () => {
  const data: Record<string, Record<string, string>> = {};
  const statuses = ['present', 'late', 'absent', 'leave'];
  
  employees.forEach(employee => {
    data[employee] = {};
    for (let day = 1; day <= 30; day++) {
      // Weekend simulation (skip weekends)
      const dayOfWeek = new Date(2024, 10, day).getDay();
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        data[employee][day] = 'weekend';
      } else {
        // Random status for demo
        const rand = Math.random();
        if (rand > 0.95) data[employee][day] = 'absent';
        else if (rand > 0.90) data[employee][day] = 'late';
        else if (rand > 0.85) data[employee][day] = 'leave';
        else data[employee][day] = 'present';
      }
    }
  });
  
  return data;
};

const calendarData = generateCalendarData();

export function AttendanceCalendar() {
  const [selectedEmployee, setSelectedEmployee] = useState('all');
  const [currentMonth, setCurrentMonth] = useState(10); // November
  const [currentYear, setCurrentYear] = useState(2024);

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present':
        return 'bg-emerald-500';
      case 'late':
        return 'bg-amber-500';
      case 'absent':
        return 'bg-red-500';
      case 'leave':
        return 'bg-purple-500';
      case 'weekend':
        return 'bg-slate-200';
      default:
        return 'bg-slate-100';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'present':
        return 'Present';
      case 'late':
        return 'Late';
      case 'absent':
        return 'Absent';
      case 'leave':
        return 'Leave';
      case 'weekend':
        return 'Weekend';
      default:
        return 'Unknown';
    }
  };

  const filteredEmployees = selectedEmployee === 'all' ? employees : [selectedEmployee];

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <CardTitle>Calendar View</CardTitle>
            <CardDescription>Monthly attendance overview</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <div className="px-4 py-1.5 bg-slate-100 rounded-lg">
              <span>November 2024</span>
            </div>
            <Button variant="outline" size="sm">
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Employee Filter */}
        <div className="mb-6">
          <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
            <SelectTrigger className="w-full sm:w-[280px]">
              <SelectValue placeholder="Select employee" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Employees</SelectItem>
              {employees.map(emp => (
                <SelectItem key={emp} value={emp}>{emp}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 mb-6 p-4 bg-slate-50 rounded-lg">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-emerald-500 rounded" />
            <span className="text-sm text-slate-600">Present</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-amber-500 rounded" />
            <span className="text-sm text-slate-600">Late</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 rounded" />
            <span className="text-sm text-slate-600">Absent</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-purple-500 rounded" />
            <span className="text-sm text-slate-600">Leave</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-slate-200 rounded" />
            <span className="text-sm text-slate-600">Weekend</span>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="overflow-x-auto">
          <div className="min-w-[800px]">
            {/* Days Header */}
            <div className="grid gap-1 mb-2" style={{ gridTemplateColumns: `150px repeat(${daysInMonth}, 30px)` }}>
              <div className="text-sm text-slate-600 p-2">Employee</div>
              {days.map(day => (
                <div key={day} className="text-xs text-slate-600 text-center p-1">
                  {day}
                </div>
              ))}
            </div>

            {/* Employee Rows */}
            <div className="space-y-1">
              {filteredEmployees.map(employee => (
                <div
                  key={employee}
                  className="grid gap-1 items-center hover:bg-slate-50 rounded-lg transition-colors"
                  style={{ gridTemplateColumns: `150px repeat(${daysInMonth}, 30px)` }}
                >
                  <div className="text-sm text-slate-900 p-2 truncate">
                    {employee}
                  </div>
                  {days.map(day => {
                    const status = calendarData[employee]?.[day] || 'unknown';
                    return (
                      <div
                        key={day}
                        className={`h-8 ${getStatusColor(status)} rounded cursor-pointer hover:opacity-80 transition-opacity`}
                        title={`${employee} - Day ${day}: ${getStatusLabel(status)}`}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Summary Statistics */}
        {selectedEmployee !== 'all' && (
          <div className="mt-6 p-4 bg-slate-50 rounded-lg">
            <h4 className="mb-3">Monthly Summary for {selectedEmployee}</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <div className="text-sm text-slate-600">Present Days</div>
                <div className="text-emerald-600">18</div>
              </div>
              <div>
                <div className="text-sm text-slate-600">Late Days</div>
                <div className="text-amber-600">2</div>
              </div>
              <div>
                <div className="text-sm text-slate-600">Absent Days</div>
                <div className="text-red-600">1</div>
              </div>
              <div>
                <div className="text-sm text-slate-600">Attendance Rate</div>
                <div className="text-purple-600">90%</div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
