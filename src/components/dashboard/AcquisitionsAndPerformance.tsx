'use client';

import React, { useEffect, useState } from 'react';
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip, Cell } from 'recharts';
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
    <div className="bg-white border border-slate-200 rounded-3xl p-6 relative overflow-hidden h-[210px] flex flex-col shadow-sm">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/10 to-transparent pointer-events-none" />
      
      <div className="relative z-10 flex items-center justify-between mb-6">
        <h3 className="text-[10px] tracking-[0.4em] uppercase font-header force-black">Acquisitions Overview</h3>
      </div>

      <div className="relative z-10 flex-1 flex flex-col justify-between">
        <div className="flex items-center justify-between py-3 border-b border-slate-100">
          <span className="text-[10px] uppercase tracking-widest force-black">Total Acquired</span>
          <span className="text-sm text-black font-black font-mono">{stats.count}</span>
        </div>
        <div className="flex items-center justify-between py-3 border-b border-slate-100">
          <span className="text-[10px] uppercase tracking-widest force-black">Total Value</span>
          <span className="text-sm text-blue-600 font-black font-mono">€{(stats.revenue / 1000000).toFixed(1)}M</span>
        </div>
        <div className="flex items-center justify-between py-3">
          <span className="text-[10px] uppercase tracking-widest force-black">Inventory Turn</span>
          <span className="text-sm text-black font-black font-mono">{stats.turn}</span>
        </div>
      </div>
    </div>
  );
};

export const StockPerformance = ({ data: vehicles }: { data: any[] }) => {
  const [data, setData] = useState<{ name: string; value: number; color: string }[]>([]);
  const [totals, setTotals] = useState({ rev: 0, turn: 0 });

  useEffect(() => {
    const total = vehicles.length;
    const sold = vehicles.filter(v => v.status === 'sold');
    const revenue = vehicles.reduce((sum, v) => sum + (v.price || 0), 0);
    const turn = total > 0 ? (sold.length / total) * 10 : 0;

    setData([
      { name: 'Acq', value: parseFloat((total / 100).toFixed(1)), color: '#3b82f6' }, // Blue
      { name: 'Rev', value: parseFloat((revenue / 10000000).toFixed(1)), color: '#8b5cf6' }, // Violet
      { name: 'Turn', value: parseFloat(turn.toFixed(1)), color: '#10b981' }, // Emerald
    ]);
    
    setTotals({
      rev: revenue,
      turn: parseFloat(turn.toFixed(1))
    });
  }, [vehicles]);

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 relative overflow-hidden flex-1 flex flex-col mt-6 shadow-sm">
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50/10 to-transparent pointer-events-none" />
      
      <div className="relative z-10 flex items-center justify-between mb-6">
        <h3 className="text-[10px] tracking-[0.4em] uppercase font-header force-black">Stock Performance</h3>
        <button className="text-black hover:text-blue-600 transition-colors">
          <MoreVertical size={16} />
        </button>
      </div>

      <div className="relative z-10 flex-1 w-full mt-4 min-h-[120px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#000000', fontSize: 10, fontWeight: 900 }} 
            />
            <Tooltip 
              cursor={{ fill: '#f1f5f9' }}
              contentStyle={{ 
                backgroundColor: '#ffffff', 
                borderColor: '#e2e8f0', 
                fontSize: '11px', 
                borderRadius: '12px', 
                color: '#0f172a',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
              }}
            />
            <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={24}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      <div className="relative z-10 flex items-center justify-between mt-8 pt-6 border-t border-slate-100">
        <div className="text-center w-full">
          <p className="text-[9px] text-black font-black uppercase tracking-widest mb-1">Total Value</p>
          <p className="text-sm text-blue-600 font-bold font-mono">€{(totals.rev / 1000000).toFixed(1)}M</p>
        </div>
        <div className="text-center w-full border-l border-slate-100">
          <p className="text-[9px] text-black font-black uppercase tracking-widest mb-1">Inventory Turn</p>
          <p className="text-sm text-black font-black font-mono">{totals.turn}</p>
        </div>
      </div>
    </div>
  );
};
