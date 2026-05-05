'use client';

import React, { useEffect, useState } from 'react';
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import { MoreVertical } from 'lucide-react';

export const UpcomingAcquisitions = ({ data: vehicles }: { data: any[] }) => {
  const [stats, setStats] = useState({ count: 0, revenue: 0, turn: 0 });

  useEffect(() => {
    const total = vehicles.length;
    const sold = vehicles.filter(v => v.status === 'sold');
    const revenue = vehicles.reduce((sum, v) => sum + (v.price || 0), 0);
    const turn = total > 0 ? (sold.length / total) * 10 : 0;

    setStats({
      count: total,
      revenue,
      turn: parseFloat(turn.toFixed(1))
    });
  }, [vehicles]);

  return (
    <div className="bg-[#0f172a] border border-gray-800 rounded-2xl p-6 relative overflow-hidden h-[210px] flex flex-col shadow-2xl">
      <div className="relative z-10 flex items-center justify-between mb-6">
        <h3 className="text-[10px] font-black tracking-[0.4em] text-gray-500 uppercase">Acquisitions Overview</h3>
      </div>

      <div className="relative z-10 flex-1 flex flex-col justify-between">
        <div className="flex items-center justify-between py-3 border-b border-gray-800/50">
          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Total Acquired</span>
          <span className="text-sm text-teal-400 font-black font-mono">{stats.count}</span>
        </div>
        <div className="flex items-center justify-between py-3 border-b border-gray-800/50">
          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Total Value</span>
          <span className="text-sm text-teal-400 font-black font-mono">€{(stats.revenue / 1000000).toFixed(1)}M</span>
        </div>
        <div className="flex items-center justify-between py-3">
          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Inventory Turn</span>
          <span className="text-sm text-white font-black font-mono">{stats.turn}</span>
        </div>
      </div>
      
      <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-gray-800 to-transparent" />
    </div>
  );
};

export const StockPerformance = ({ data: vehicles }: { data: any[] }) => {
  const [data, setData] = useState<{ name: string; value: number }[]>([]);
  const [totals, setTotals] = useState({ rev: 0, turn: 0 });

  useEffect(() => {
    const total = vehicles.length;
    const sold = vehicles.filter(v => v.status === 'sold');
    const revenue = vehicles.reduce((sum, v) => sum + (v.price || 0), 0);
    const turn = total > 0 ? (sold.length / total) * 10 : 0;

    setData([
      { name: 'Acq', value: parseFloat((total / 100).toFixed(1)) },
      { name: 'Rev', value: parseFloat((revenue / 10000000).toFixed(1)) },
      { name: 'Turn', value: parseFloat(turn.toFixed(1)) },
    ]);
    
    setTotals({
      rev: revenue,
      turn: parseFloat(turn.toFixed(1))
    });
  }, [vehicles]);

  return (
    <div className="bg-[#0f172a] border border-gray-800 rounded-2xl p-6 relative overflow-hidden flex-1 flex flex-col mt-6 shadow-2xl">
      <div className="relative z-10 flex items-center justify-between mb-6">
        <h3 className="text-[10px] font-black tracking-[0.4em] text-gray-500 uppercase">Stock Performance</h3>
        <button className="text-gray-600 hover:text-white transition-colors">
          <MoreVertical size={16} />
        </button>
      </div>

      <div className="relative z-10 flex-1 w-full mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 0, right: 0, left: -30, bottom: 0 }}>
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#475569', fontSize: 10, fontWeight: 700 }} 
            />
            <Tooltip 
              cursor={{ fill: 'rgba(255,255,255,0.02)' }}
              contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', fontSize: '12px', borderRadius: '12px', color: '#fff' }}
              itemStyle={{ color: '#f59e0b' }}
            />
            <Bar dataKey="value" fill="#ffffff" radius={[6, 6, 0, 0]} barSize={32} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      <div className="relative z-10 flex items-center justify-between mt-8 pt-6 border-t border-gray-800/50">
        <div className="text-center w-full">
          <p className="text-[9px] text-gray-600 font-black uppercase tracking-widest mb-1">Total Value</p>
          <p className="text-xs text-teal-400 font-black font-mono italic">€{(totals.rev / 1000000).toFixed(1)}M</p>
        </div>
        <div className="text-center w-full border-l border-gray-800/50">
          <p className="text-[9px] text-gray-600 font-black uppercase tracking-widest mb-1">Inventory Turn</p>
          <p className="text-xs text-white font-black font-mono">{totals.turn}</p>
        </div>
      </div>
    </div>
  );
};
