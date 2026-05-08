'use client';

import React, { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from 'recharts';
import { MoreVertical } from 'lucide-react';
import { supabase } from '@/lib/supabase';

const MonthlyTrendChart = ({ data: rawData }: { data: any[] }) => {
  const [data, setData] = useState<{ name: string; value: number }[]>([]);

  useEffect(() => {
    const yearCounts: Record<string, number> = {};
    rawData.forEach(v => {
      if (v.year) {
        yearCounts[v.year] = (yearCounts[v.year] || 0) + 1;
      }
    });

    const formattedData = Object.keys(yearCounts)
      .sort((a, b) => parseInt(a) - parseInt(b))
      .map(year => ({
        name: year,
        value: yearCounts[year]
      }));

    // Take only the last 6 years to avoid cluttering the chart if there are many years
    setData(formattedData.slice(-6));
  }, [rawData]);

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 h-full flex flex-col relative shadow-sm">
      <div className="relative z-10 flex items-center justify-between mb-6">
        <h3 className="text-xs font-black tracking-widest text-blue-600 uppercase">Stock by Manufacture Year</h3>
        <button 
          onClick={() => {}}
          className="text-black hover:text-blue-600"
        >
          <MoreVertical size={16} />
        </button>
      </div>

      <div className="relative z-10 flex-1 w-full h-[200px]">
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 0, left: -25, bottom: 0 }}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1e3a8a" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#1e3a8a" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#000000', fontSize: 10, fontWeight: 900 }} 
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#000000', fontSize: 10, fontWeight: 900 }}
              />
              <Tooltip 
                contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', fontSize: '12px', borderRadius: '8px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                itemStyle={{ color: '#1e3a8a' }}
              />
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke="#1e3a8a" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorValue)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-full text-black text-xs">Loading data...</div>
        )}
      </div>
      
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-[2px] bg-blue-600 opacity-10" />
    </div>
  );
};

export default MonthlyTrendChart;
