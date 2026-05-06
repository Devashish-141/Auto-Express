'use client';

import React, { useEffect, useState } from 'react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { useRep } from '@/context/RepContext';

const mockSparklineData = [
  { value: 400 }, { value: 300 }, { value: 550 }, 
  { value: 450 }, { value: 700 }, { value: 650 }, 
  { value: 800 }
];

const Card = ({ title, value, color = "#2563eb" }: { title: string, value: string | number, color?: string }) => (
  <div className="relative overflow-hidden rounded-[2rem] bg-white border border-slate-200 p-8 flex flex-col justify-between h-[160px] shadow-sm group hover:border-blue-500/30 transition-all">
    <div className="relative z-10">
      <h3 className="text-[10px] text-slate-700 uppercase tracking-[0.4em] mb-3 font-bold font-header">{title}</h3>
      <p className="text-5xl font-black text-slate-900 tracking-tighter leading-none italic">{value}</p>
    </div>

    {/* Sparkline */}
    <div className="absolute bottom-0 left-0 right-0 h-16 opacity-30 transition-opacity">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={mockSparklineData}>
          <Line 
            type="monotone" 
            dataKey="value" 
            stroke={color} 
            strokeWidth={3} 
            dot={false} 
            isAnimationActive={true}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
    
    <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-${color}/5 to-transparent rounded-full -mr-8 -mt-8`} />
  </div>
);

const SummaryCards = ({ data }: { data: any[] }) => {
  const { location } = useRep();
  const [stats, setStats] = useState({ total: 0, available: 0, intransit: 0, sold: 0 });

  useEffect(() => {
    const filteredData = data.filter(v => 
      v.location?.toLowerCase().includes(location.toLowerCase())
    );

    const total = filteredData.length;
    const available = filteredData.filter(v => v.status === 'available').length;
    const sold = filteredData.filter(v => v.status === 'sold').length;
    
    setStats({ total, available, intransit: 0, sold });
  }, [data, location]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card title="Total Inventory" value={stats.total} color="#2563eb" />
      <Card title="Units in Stock" value={stats.available} color="#0d9488" />
      <Card title="Intransit" value={stats.intransit} color="#6366f1" />
      <Card title="Sold YTD" value={stats.sold} color="#d97706" />
    </div>
  );
};

export default SummaryCards;
