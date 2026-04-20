'use client';

import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from 'recharts';
import { MoreVertical } from 'lucide-react';

const data = [
  { name: 'Jan', value: 30 },
  { name: 'Feb', value: 80 },
  { name: 'Mar', value: 60 },
  { name: 'Apr', value: 140 },
  { name: 'May', value: 110 },
  { name: 'Jun', value: 180 },
];

const MonthlyTrendChart = () => {
  return (
    <div className="bg-navy-card border border-navy-border rounded-xl p-5 h-full flex flex-col relative">
      <div className="absolute inset-0 bg-navy-card-gradient opacity-50 pointer-events-none rounded-xl" />
      
      <div className="relative z-10 flex items-center justify-between mb-6">
        <h3 className="text-xs tracking-widest text-gray-300 uppercase">Monthly Stock Trend</h3>
        <button 
          onClick={() => alert('Trend options clicked')}
          className="text-gray-500 hover:text-navy-accent"
        >
          <MoreVertical size={16} />
        </button>
      </div>

      <div className="relative z-10 flex-1 w-full h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 0, left: -25, bottom: 0 }}>
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ffffff" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#ffffff" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#2a3347" vertical={false} />
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#6b7280', fontSize: 10 }} 
              dy={10}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#6b7280', fontSize: 10 }}
              ticks={[0, 50, 100, 150, 200]}
            />
            <Tooltip 
              contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', fontSize: '12px' }}
              itemStyle={{ color: '#ffffff' }}
            />
            <Area 
              type="monotone" 
              dataKey="value" 
              stroke="#ffffff" 
              strokeWidth={2}
              fillOpacity={1} 
              fill="url(#colorValue)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-[1px] bg-navy-gradient opacity-50" />
    </div>
  );
};

export default MonthlyTrendChart;
