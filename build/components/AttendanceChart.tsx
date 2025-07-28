import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Subject } from '@/types';

interface AttendanceChartProps {
  subjects: Subject[];
}

const AttendanceChart: React.FC<AttendanceChartProps> = ({ subjects }) => {
  const data = subjects.map(subject => ({
    name: subject.code,
    fullName: subject.name,
    percentage: subject.percentage,
    attended: subject.attendance.lectures.attended + 
              subject.attendance.tutorials.attended + 
              subject.attendance.practicals.attended,
    total: subject.attendance.lectures.total + 
           subject.attendance.tutorials.total + 
           subject.attendance.practicals.total,
  }));

  const getBarColor = (percentage: number) => {
    if (percentage >= 75) return 'hsl(var(--success))';
    if (percentage >= 65) return 'hsl(var(--warning))';
    return 'hsl(var(--destructive))';
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="font-semibold text-sm">{data.fullName}</p>
          <p className="text-xs text-muted-foreground mb-2">{label}</p>
          <div className="space-y-1 text-xs">
            <p className="flex justify-between">
              <span>Attendance:</span>
              <span className="font-medium">{data.percentage}%</span>
            </p>
            <p className="flex justify-between">
              <span>Classes:</span>
              <span>{data.attended}/{data.total}</span>
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis 
            dataKey="name" 
            tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
            tickLine={{ stroke: 'hsl(var(--border))' }}
          />
          <YAxis 
            domain={[0, 100]}
            tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
            tickLine={{ stroke: 'hsl(var(--border))' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="percentage" radius={[4, 4, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getBarColor(entry.percentage)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default AttendanceChart;