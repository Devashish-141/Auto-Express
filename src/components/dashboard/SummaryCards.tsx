'use client';

import React, { useEffect, useState } from 'react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { useRep } from '@/context/RepContext';

const mockSparklineData = [
  { value: 400 }, { value: 300 }, { value: 550 }, 
  { value: 450 }, { value: 700 }, { value: 650 }, 
  { value: 800 }
];

const Card = ({ title, value }: { title: string, value: string | number }) => (
  <div className="relative overflow-hidden rounded-2xl bg-[#0f172a] border border-gray-800/50 p-6 flex flex-col justify-between h-[130px] shadow-2xl group hover:border-amber-500/30 transition-all">
    <div className="relative z-10 flex flex-col items-center text-center">
      <h3 className="text-[9px] text-gray-500 uppercase tracking-[0.3em] mb-2 font-black">{title}</h3>
      <p className="text-4xl font-black text-white tracking-tighter leading-none">{value}</p>
    </div>

    {/* Sparkline */}
    <div className="absolute bottom-0 left-0 right-0 h-12 opacity-40 transition-opacity">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={mockSparklineData}>
          <Line 
            type="monotone" 
            dataKey="value" 
            stroke="#ffffff" 
            strokeWidth={2} 
            dot={false} 
            isAnimationActive={true}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
    
    <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/5 to-transparent" />
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card title="Total Inventory" value={stats.total} />
      <Card title="Units in Stock" value={stats.available} />
      <Card title="Intransit" value={stats.intransit} />
      <Card title="Sold YTD" value={stats.sold} />
    </div>
  );
};

export default SummaryCards;
