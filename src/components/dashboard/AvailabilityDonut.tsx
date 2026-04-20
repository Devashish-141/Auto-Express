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

const COLORS = ['#ffffff', '#94a3b8', '#4a5568', '#2d3748'];

const AvailabilityDonut = () => {
  return (
    <div className="bg-navy-card border border-navy-border rounded-xl p-5 h-full flex flex-col relative overflow-hidden">
      <div className="absolute inset-0 bg-navy-card-gradient opacity-50 pointer-events-none rounded-xl" />
      
      <div className="relative z-10 flex items-center justify-between mb-2">
        <h3 className="text-xs tracking-widest text-gray-300 uppercase">Vehicle Availability</h3>
        <button 
          onClick={() => alert('Availability options clicked')}
          className="text-gray-500 hover:text-navy-accent"
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
                stroke="none"
                paddingAngle={2}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', fontSize: '12px', borderRadius: '8px' }}
                itemStyle={{ color: '#ffffff' }}
                formatter={(value: any) => [`${value}%`, 'Share']}
              />
            </PieChart>
          </ResponsiveContainer>
          
          {/* Custom Labels overlay since recharts labels can be tricky to position exactly like the image */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-[20%] right-[10%] text-right">
              <p className="text-[10px] text-gray-400">Sedan</p>
              <p className="text-xs font-bold text-white">38%</p>
            </div>
            <div className="absolute bottom-[10%] right-[25%] text-right">
              <p className="text-[10px] text-gray-400">SUV</p>
              <p className="text-xs font-bold text-white">35%</p>
            </div>
            <div className="absolute top-[35%] left-[5%]">
              <p className="text-[10px] text-gray-400">Coupe</p>
              <p className="text-xs font-bold text-white">17%</p>
            </div>
            <div className="absolute bottom-[15%] left-[5%]">
              <p className="text-[10px] text-gray-400">Hypercar</p>
              <p className="text-xs font-bold text-white">10%</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-[1px] bg-navy-gradient opacity-50" />
    </div>
  );
};

export default AvailabilityDonut;
