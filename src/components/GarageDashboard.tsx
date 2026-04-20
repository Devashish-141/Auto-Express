'use client';

import React from 'react';
import VehicleCard from './VehicleCard';
import { Wrench, CheckCircle, Clock, AlertTriangle } from 'lucide-react';

const MOCK_GARAGE_VEHICLES = [
  { id: '2', make: 'BMW', model: '520d M-Sport', year: 2021, price: 38500, vin: 'WBA5F1234567890', status: 'garage', rep_code: 'AMANDA-01' },
] as const;

const GarageDashboard = () => {
  return (
    <div className="space-y-8 py-8 animate-in slide-in-from-right duration-700">
      <div>
        <h2 className="text-3xl font-bold tracking-tight mb-2 uppercase">Garage Services</h2>
        <p className="text-gray-500 uppercase tracking-widest text-xs">Technical Operations & Readiness Check</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <div className="glass-card p-6 border-l-4 border-amber-500">
            <div className="flex items-center gap-3 mb-4">
              <Clock className="text-amber-500" size={20} />
              <h4 className="text-sm font-bold uppercase tracking-widest">In Progress</h4>
            </div>
            <p className="text-3xl font-bold font-mono">1 Units</p>
          </div>

          <div className="glass-card p-6 border-l-4 border-gray-700">
            <div className="flex items-center gap-3 mb-4">
              <CheckCircle className="text-gray-500" size={20} />
              <h4 className="text-sm font-bold uppercase tracking-widest">Comp. Today</h4>
            </div>
            <p className="text-3xl font-bold font-mono">0 Units</p>
          </div>
        </div>

        <div className="lg:col-span-3 space-y-6">
          <div className="flex items-center justify-between px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded-lg">
            <div className="flex items-center gap-3 text-amber-500">
              <AlertTriangle size={18} />
              <span className="text-[10px] uppercase font-bold tracking-widest">Action Required: Pre-Sale Inspection Pending for 1 unit</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {MOCK_GARAGE_VEHICLES.map(vehicle => (
              <div key={vehicle.id} className="space-y-4">
                <VehicleCard vehicle={vehicle} />
                
                <div className="glass-card p-6 bg-black/40">
                  <h4 className="text-xs font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Wrench size={14} /> Service Checklist
                  </h4>
                  <div className="space-y-3">
                    {[
                      { task: 'Full Diagnostic Scan', done: true },
                      { task: 'Oil & Filter Change', done: true },
                      { task: 'Brake Pad Inspection', done: false },
                      { task: 'Valeting & Detail', done: false },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center justify-between text-sm py-2 border-b border-gray-800 last:border-0">
                        <span className={item.done ? 'text-gray-400 line-through' : 'text-gray-200'}>
                          {item.task}
                        </span>
                        <div className={`w-4 h-4 rounded border ${item.done ? 'bg-teal-500 border-teal-500' : 'border-gray-700'}`}>
                          {item.done && <CheckCircle size={14} className="text-[#020617]" />}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GarageDashboard;
