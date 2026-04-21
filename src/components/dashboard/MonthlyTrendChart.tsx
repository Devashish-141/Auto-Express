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
    <div className="bg-white border border-navy-border rounded-xl p-5 h-full flex flex-col relative shadow-sm">
      <div className="relative z-10 flex items-center justify-between mb-6">
        <h3 className="text-xs font-black tracking-widest text-navy-accent uppercase">Monthly Stock Trend</h3>
        <button 
          onClick={() => alert('Trend options clicked')}
          className="text-slate-400 hover:text-navy-accent"
        >
          <MoreVertical size={16} />
        </button>
      </div>

      <div className="relative z-10 flex-1 w-full h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 0, left: -25, bottom: 0 }}>
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#020617" stopOpacity={0.1}/>
                <stop offset="95%" stopColor="#020617" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#020617', fontSize: 10, fontWeight: 700 }} 
              dy={10}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#64748b', fontSize: 10 }}
              ticks={[0, 50, 100, 150, 200]}
            />
            <Tooltip 
              contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', fontSize: '12px', borderRadius: '8px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
              itemStyle={{ color: '#020617' }}
            />
            <Area 
              type="monotone" 
              dataKey="value" 
              stroke="#020617" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorValue)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-[2px] bg-navy-accent opacity-10" />
    </div>
  );
};

export default MonthlyTrendChart;
