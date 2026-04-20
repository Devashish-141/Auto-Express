'use client';

import React from 'react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';

const mockSparklineData = [
  { value: 400 }, { value: 300 }, { value: 550 }, 
  { value: 450 }, { value: 700 }, { value: 650 }, 
  { value: 800 }
];

const Card = ({ title, value }: { title: string, value: string }) => (
  <div className="relative overflow-hidden rounded-xl bg-navy-card border border-navy-border p-5 flex flex-col justify-between h-[120px] group">
    {/* Inner shadow / gradient overlay */}
    <div className="absolute inset-0 bg-navy-card-gradient opacity-50 pointer-events-none" />
    
    <div className="relative z-10 flex flex-col items-center text-center">
      <h3 className="text-[10px] text-gray-400 uppercase tracking-widest mb-1">{title}</h3>
      <p className="text-4xl font-light text-white tracking-wider">{value}</p>
    </div>

    {/* Sparkline */}
    <div className="absolute bottom-0 left-0 right-0 h-10 opacity-60 group-hover:opacity-100 transition-opacity">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={mockSparklineData}>
          <Line 
            type="monotone" 
            dataKey="value" 
            stroke="#ffffff" 
            strokeWidth={1.5} 
            dot={false} 
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
    
    {/* Top gold border highlight */}
    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-[1px] bg-navy-gradient opacity-50" />
  </div>
);

const SummaryCards = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card title="Total Inventory" value="724" />
      <Card title="Units in Stock" value="491" />
      <Card title="Intransit" value="233" />
      <Card title="Sold YTD" value="3,150" />
    </div>
  );
};

export default SummaryCards;
