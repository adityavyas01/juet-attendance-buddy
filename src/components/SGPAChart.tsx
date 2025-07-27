import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { SGPACGPAData } from '@/types';

interface SGPAChartProps {
  data: SGPACGPAData[];
}

const SGPAChart: React.FC<SGPAChartProps> = ({ data }) => {
  const chartData = data.map(item => ({
    semester: `Sem ${item.semester}`,
    SGPA: item.sgpa,
    CGPA: item.cgpa,
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="font-semibold text-sm mb-2">{label}</p>
          <div className="space-y-1 text-xs">
            {payload.map((entry: any, index: number) => (
              <p key={index} className="flex justify-between" style={{ color: entry.color }}>
                <span>{entry.dataKey}:</span>
                <span className="font-medium">{entry.value}</span>
              </p>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis 
            dataKey="semester" 
            tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
            tickLine={{ stroke: 'hsl(var(--border))' }}
          />
          <YAxis 
            domain={[0, 10]}
            tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
            tickLine={{ stroke: 'hsl(var(--border))' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            wrapperStyle={{ fontSize: '12px' }}
          />
          <Line 
            type="monotone" 
            dataKey="SGPA" 
            stroke="hsl(var(--secondary))" 
            strokeWidth={3}
            dot={{ r: 4, fill: 'hsl(var(--secondary))' }}
            activeDot={{ r: 6, fill: 'hsl(var(--secondary))' }}
          />
          <Line 
            type="monotone" 
            dataKey="CGPA" 
            stroke="hsl(var(--accent))" 
            strokeWidth={3}
            dot={{ r: 4, fill: 'hsl(var(--accent))' }}
            activeDot={{ r: 6, fill: 'hsl(var(--accent))' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SGPAChart;