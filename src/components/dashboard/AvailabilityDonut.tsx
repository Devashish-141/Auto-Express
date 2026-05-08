'use client';

import React, { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { MoreVertical } from 'lucide-react';

const COLORS = ['#1e3a8a', '#f59e0b', '#3b82f6', '#10b981', '#6366f1', '#f43f5e', '#8b5cf6'];

const AvailabilityDonut = ({ data: rawData }: { data: any[] }) => {
  const [data, setData] = useState<{ name: string; value: number; percentage?: number }[]>([]);

  useEffect(() => {
    const counts: Record<string, number> = {};
    rawData.forEach(v => {
      const c = v.class || 'Other';
      counts[c] = (counts[c] || 0) + 1;
    });

    const total = rawData.length;
    let sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    
    if (sorted.length > 5) {
      const top = sorted.slice(0, 4);
      const otherCount = sorted.slice(4).reduce((sum, item) => sum + item[1], 0);
      top.push(['Other', otherCount]);
      sorted = top;
    }

    const formattedData = sorted.map(([name, count]) => ({
      name,
      value: count,
      percentage: Math.round((count / total) * 100)
    }));

    setData(formattedData);
  }, [rawData]);

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 h-full flex flex-col relative overflow-hidden shadow-sm">
      <div className="relative z-10 flex items-center justify-between mb-4">
        <h3 className="text-[10px] tracking-[0.4em] uppercase force-black">Vehicle Availability</h3>
        <button className="text-black hover:text-blue-600 transition-colors">
          <MoreVertical size={16} />
        </button>
      </div>

      <div className="relative z-10 flex-1 w-full flex items-center justify-center">
        <div className="w-full h-[220px] relative flex">
          <div className="w-1/2 h-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  stroke="none"
                  paddingAngle={4}
                  dataKey="value"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} opacity={0.8} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', fontSize: '10px' }}
                  itemStyle={{ color: '#1e3a8a' }}
                  formatter={(value: any, name: any, props: any) => [`${props.payload.percentage}% (${value})`, 'Share']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          <div className="w-1/2 flex flex-col justify-center pl-6 space-y-4">
            {data.map((item, i) => (
              <div key={item.name} className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                <div>
                  <p className="text-[9px] uppercase tracking-widest leading-none mb-1 force-black">{item.name}</p>
                  <p className="text-sm font-black text-foreground font-mono leading-none italic">{item.percentage}%</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-slate-100 to-transparent" />
    </div>
  );
};

export default AvailabilityDonut;
