'use client';

import React from 'react';
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import { MoreVertical } from 'lucide-react';

const performanceData = [
  { name: 'Acq', value: 3.5 },
  { name: 'Rev', value: 5.2 },
  { name: 'Turn', value: 2.8 },
];

export const UpcomingAcquisitions = () => (
  <div className="bg-navy-card border border-navy-border rounded-xl p-5 relative overflow-hidden h-[200px] flex flex-col">
    <div className="absolute inset-0 bg-navy-card-gradient opacity-50 pointer-events-none rounded-xl" />
    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-[1px] bg-navy-gradient opacity-50" />
    
    <div className="relative z-10 flex items-center justify-between mb-4">
      <h3 className="text-xs tracking-widest text-gray-300 uppercase">Upcoming Acquisitions</h3>
    </div>

    <div className="relative z-10 flex-1 flex flex-col justify-between">
      <div className="flex items-center justify-between py-2 border-b border-gray-800/50">
        <span className="text-xs text-gray-400">Acquisitions</span>
        <span className="text-xs text-green-400">+1.2%</span>
      </div>
      <div className="flex items-center justify-between py-2 border-b border-gray-800/50">
        <span className="text-xs text-gray-400">Revenue Acquired</span>
        <span className="text-xs text-green-400">+14.2%</span>
      </div>
      <div className="flex items-center justify-between py-2">
        <span className="text-xs text-gray-400">Inventory Turn</span>
        <span className="text-xs text-white">6.8</span>
      </div>
    </div>
  </div>
);

export const StockPerformance = () => (
  <div className="bg-navy-card border border-navy-border rounded-xl p-5 relative overflow-hidden flex-1 flex flex-col mt-6">
    <div className="absolute inset-0 bg-navy-card-gradient opacity-50 pointer-events-none rounded-xl" />
    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-[1px] bg-navy-gradient opacity-50" />
    
    <div className="relative z-10 flex items-center justify-between mb-4">
      <h3 className="text-xs tracking-widest text-gray-300 uppercase">Stock Performance</h3>
      <button 
        onClick={() => alert('Performance options clicked')}
        className="text-gray-500 hover:text-navy-accent"
      >
        <MoreVertical size={16} />
      </button>
    </div>

    <div className="relative z-10 flex-1 w-full mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={performanceData} margin={{ top: 0, right: 0, left: -30, bottom: 0 }}>
          <XAxis 
            dataKey="name" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#6b7280', fontSize: 10 }} 
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#6b7280', fontSize: 10 }}
            ticks={[0, 2, 4, 6]}
          />
          <Tooltip 
            cursor={{ fill: 'rgba(255,255,255,0.02)' }}
            contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', fontSize: '12px' }}
            itemStyle={{ color: '#ffffff' }}
          />
          <Bar dataKey="value" fill="#ffffff" radius={[4, 4, 0, 0]} barSize={24} />
        </BarChart>
      </ResponsiveContainer>
    </div>
    
    <div className="relative z-10 flex items-center justify-between mt-4">
      <div className="text-center w-full">
        <p className="text-[10px] text-gray-500">Revenue</p>
        <p className="text-xs text-green-400">+14.2%</p>
      </div>
      <div className="text-center w-full">
        <p className="text-[10px] text-gray-500">Inventory Turn</p>
        <p className="text-xs text-white">6.8</p>
      </div>
    </div>
  </div>
);
