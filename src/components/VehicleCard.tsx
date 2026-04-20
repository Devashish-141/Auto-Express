'use client';

import React from 'react';
import { Car, Hash, Euro, User, Calendar, ArrowRight } from 'lucide-react';

interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  price: number;
  vin: string;
  status: 'available' | 'sold' | 'garage' | 'unfinanceable';
  rep_code: string;
}

interface VehicleCardProps {
  vehicle: Vehicle;
  onStatusChange?: (id: string, status: string) => void;
}

const VehicleCard = ({ vehicle, onStatusChange }: VehicleCardProps) => {
  const statusColors = {
    available: 'var(--chrome-gold)',
    sold: 'var(--success-teal)',
    garage: 'var(--chrome-gold)',
    unfinanceable: 'var(--danger-rose)',
  };

  const statusLabel = {
    available: 'Ready for Sale',
    sold: 'Finalized Sale',
    garage: 'In Service',
    unfinanceable: 'Unfinanceable',
  };

  return (
    <div className="glass-card p-6 group">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-xl font-bold tracking-tight uppercase">
            {vehicle.make} <span className="text-gray-500">{vehicle.model}</span>
          </h3>
          <p className="text-[10px] text-gray-500 font-mono tracking-widest uppercase mt-1">
            Manufacturing Year: {vehicle.year}
          </p>
        </div>
        <div 
          className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-tighter"
          style={{ 
            backgroundColor: `${statusColors[vehicle.status]}20`, 
            color: statusColors[vehicle.status],
            border: `1px solid ${statusColors[vehicle.status]}40`
          }}
        >
          {statusLabel[vehicle.status]}
        </div>
      </div>

      <div className="space-y-4 mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-gray-400">
            <Hash size={14} />
            <span className="text-[10px] uppercase tracking-widest">VIN Sequence</span>
          </div>
          <span className="mono text-xs font-bold text-[#f8fafc]">{vehicle.vin}</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-gray-400">
            <Euro size={14} />
            <span className="text-[10px] uppercase tracking-widest">Market Price</span>
          </div>
          <span className="mono text-lg font-bold text-[var(--chrome-gold)]">
            €{vehicle.price.toLocaleString()}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-gray-400">
            <User size={14} />
            <span className="text-[10px] uppercase tracking-widest">Rep ID</span>
          </div>
          <span className="text-xs font-bold text-gray-300">{vehicle.rep_code}</span>
        </div>
      </div>

      <div className="flex gap-2">
        {vehicle.status === 'available' && (
          <button 
            onClick={() => onStatusChange?.(vehicle.id, 'garage')}
            className="flex-1 py-2 rounded border border-gray-800 text-gray-400 font-bold uppercase text-[10px] tracking-widest hover:bg-gray-800 transition-all flex items-center justify-center gap-2"
          >
            Send to Garage
          </button>
        )}
        
        {vehicle.status === 'garage' && (
          <button 
            onClick={() => onStatusChange?.(vehicle.id, 'available')}
            className="flex-1 py-2 rounded bg-amber-500/10 text-amber-500 border border-amber-500/20 font-bold uppercase text-[10px] tracking-widest hover:bg-amber-500/20 transition-all flex items-center justify-center gap-2"
          >
            Complete Service
          </button>
        )}

        {vehicle.status !== 'sold' && (
          <button 
            className="p-2 aspect-square rounded border border-gray-800 text-gray-400 hover:text-white hover:border-gray-600 transition-all"
            title="Finance Details"
          >
            <ArrowRight size={16} />
          </button>
        )}
      </div>
    </div>
  );
};

export default VehicleCard;
