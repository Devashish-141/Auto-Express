'use client';

import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { MoreVertical } from 'lucide-react';

const data = [
  { name: 'Sedan', value: 38 },
  { name: 'SUV', value: 35 },
  { name: 'Coupe', value: 17 },
  { name: 'Hypercar', value: 10 },
];

const COLORS = ['#020617', '#1e293b', '#f59e0b', '#64748b'];

const AvailabilityDonut = () => {
  return (
    <div className="bg-white border border-navy-border rounded-xl p-5 h-full flex flex-col relative overflow-hidden shadow-sm">
      <div className="relative z-10 flex items-center justify-between mb-2">
        <h3 className="text-xs font-black tracking-widest text-navy-accent uppercase">Vehicle Availability</h3>
        <button 
          onClick={() => alert('Availability options clicked')}
          className="text-slate-400 hover:text-navy-accent"
        >
          <MoreVertical size={16} />
        </button>
      </div>

      <div className="relative z-10 flex-1 w-full flex items-center justify-center">
        <div className="w-full h-[200px] relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                stroke="#ffffff"
                strokeWidth={2}
                paddingAngle={2}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', fontSize: '12px', borderRadius: '8px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                itemStyle={{ color: '#020617' }}
                formatter={(value: any) => [`${value}%`, 'Share']}
              />
            </PieChart>
          </ResponsiveContainer>
          
          {/* Custom Labels overlay */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-[20%] right-[10%] text-right">
              <p className="text-[10px] text-slate-500 font-bold uppercase">Sedan</p>
              <p className="text-xs font-black text-navy-accent">38%</p>
            </div>
            <div className="absolute bottom-[10%] right-[25%] text-right">
              <p className="text-[10px] text-slate-500 font-bold uppercase">SUV</p>
              <p className="text-xs font-black text-navy-accent">35%</p>
            </div>
            <div className="absolute top-[35%] left-[5%]">
              <p className="text-[10px] text-slate-500 font-bold uppercase">Coupe</p>
              <p className="text-xs font-black text-navy-accent">17%</p>
            </div>
            <div className="absolute bottom-[15%] left-[5%]">
              <p className="text-[10px] text-slate-500 font-bold uppercase">Hypercar</p>
              <p className="text-xs font-black text-navy-accent">10%</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-[2px] bg-navy-accent opacity-10" />
    </div>
  );
};

export default AvailabilityDonut;
