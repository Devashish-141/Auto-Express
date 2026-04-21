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
  <div className="bg-white border border-navy-border rounded-xl p-5 relative overflow-hidden h-[200px] flex flex-col shadow-sm">
    <div className="relative z-10 flex items-center justify-between mb-4">
      <h3 className="text-xs font-black tracking-widest text-navy-accent uppercase">Upcoming Acquisitions</h3>
    </div>

    <div className="relative z-10 flex-1 flex flex-col justify-between">
      <div className="flex items-center justify-between py-2 border-b border-slate-100">
        <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Acquisitions</span>
        <span className="text-xs text-emerald-600 font-black">+1.2%</span>
      </div>
      <div className="flex items-center justify-between py-2 border-b border-slate-100">
        <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Revenue Acquired</span>
        <span className="text-xs text-emerald-600 font-black">+14.2%</span>
      </div>
      <div className="flex items-center justify-between py-2">
        <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Inventory Turn</span>
        <span className="text-xs text-navy-accent font-black">6.8</span>
      </div>
    </div>
  </div>
);

export const StockPerformance = () => (
  <div className="bg-white border border-navy-border rounded-xl p-5 relative overflow-hidden flex-1 flex flex-col mt-6 shadow-sm">
    <div className="relative z-10 flex items-center justify-between mb-4">
      <h3 className="text-xs font-black tracking-widest text-navy-accent uppercase">Stock Performance</h3>
      <button 
        onClick={() => alert('Performance options clicked')}
        className="text-slate-400 hover:text-navy-accent"
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
            tick={{ fill: '#020617', fontSize: 10, fontWeight: 700 }} 
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#64748b', fontSize: 10 }}
            ticks={[0, 2, 4, 6]}
          />
          <Tooltip 
            cursor={{ fill: 'rgba(2,6,23,0.05)' }}
            contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', fontSize: '12px', borderRadius: '8px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
            itemStyle={{ color: '#020617' }}
          />
          <Bar dataKey="value" fill="#020617" radius={[4, 4, 0, 0]} barSize={24} />
        </BarChart>
      </ResponsiveContainer>
    </div>
    
    <div className="relative z-10 flex items-center justify-between mt-4">
      <div className="text-center w-full">
        <p className="text-[10px] text-slate-400 font-bold uppercase">Revenue</p>
        <p className="text-xs text-emerald-600 font-black">+14.2%</p>
      </div>
      <div className="text-center w-full">
        <p className="text-[10px] text-slate-400 font-bold uppercase">Inventory Turn</p>
        <p className="text-xs text-navy-accent font-black">6.8</p>
      </div>
    </div>
  </div>
);
