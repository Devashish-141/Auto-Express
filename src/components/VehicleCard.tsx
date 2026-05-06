'use client';

import React from 'react';
import { Car, Hash, Euro, User, Calendar, ArrowRight, Gauge, Fuel, Settings } from 'lucide-react';

interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  price: number;
  vin: string;
  status: 'available' | 'sold' | 'garage' | 'unfinanceable';
  rep_code: string;
  mileage?: number;
  image_url?: string;
  transmission?: string;
  fuel_type?: string;
}

interface VehicleCardProps {
  vehicle: Vehicle;
  onStatusChange?: (id: string, status: string) => void;
}

const VehicleCard = ({ vehicle, onStatusChange }: VehicleCardProps) => {
  const statusColors = {
    available: '#d4af37', // Gold
    sold: '#14b8a6', // Teal
    garage: '#f59e0b', // Amber
    unfinanceable: '#ef4444', // Red
  };

  const statusLabel = {
    available: 'Ready for Sale',
    sold: 'Finalized Sale',
    garage: 'In Service',
    unfinanceable: 'Unfinanceable',
  };

  return (
    <div className="glass-card p-6 group hover:border-gray-700 transition-all">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold tracking-tight uppercase text-foreground">
            {vehicle.make} <span className="text-black">{vehicle.model}</span>
          </h3>
          <p className="text-[9px] text-black font-mono tracking-widest uppercase mt-1">
            VIN: {vehicle.vin?.slice(-8)}
          </p>
        </div>
        <div 
          className="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter"
          style={{ 
            backgroundColor: `${statusColors[vehicle.status]}20`, 
            color: statusColors[vehicle.status],
            border: `1px solid ${statusColors[vehicle.status]}40`
          }}
        >
          {statusLabel[vehicle.status]}
        </div>
      </div>

      {vehicle.image_url && (
        <div className="w-full h-32 rounded-xl overflow-hidden mb-6 bg-slate-50 border border-slate-200">
          <img src={vehicle.image_url} alt={vehicle.model} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-black">
            <Gauge size={12} />
            <span className="text-[8px] uppercase tracking-widest font-bold">Mileage</span>
          </div>
          <span className="text-xs font-mono font-bold text-black">
            {vehicle.mileage?.toLocaleString() || '---'} KM
          </span>
        </div>

        <div className="space-y-1">
          <div className="flex items-center gap-2 text-black">
            <Calendar size={12} />
            <span className="text-[8px] uppercase tracking-widest font-bold">Year</span>
          </div>
          <span className="text-xs font-mono font-bold text-black">
            {vehicle.year}
          </span>
        </div>

        <div className="space-y-1">
          <div className="flex items-center gap-2 text-black">
            <Fuel size={12} />
            <span className="text-[8px] uppercase tracking-widest font-bold">Fuel</span>
          </div>
          <span className="text-xs font-bold text-black uppercase">
            {vehicle.fuel_type || '---'}
          </span>
        </div>

        <div className="space-y-1">
          <div className="flex items-center gap-2 text-black">
            <Euro size={12} />
            <span className="text-[8px] uppercase tracking-widest font-bold">Market Price</span>
          </div>
          <span className="text-md font-mono font-bold text-amber-500">
            €{vehicle.price.toLocaleString()}
          </span>
        </div>
      </div>

      <div className="flex gap-2">
        {vehicle.status === 'available' && (
          <button 
            onClick={() => onStatusChange?.(vehicle.id, 'garage')}
            className="flex-1 py-3 rounded-xl border border-slate-200 text-black font-black uppercase text-[9px] tracking-[0.2em] hover:bg-gray-800 transition-all flex items-center justify-center gap-2"
          >
            Send to Garage
          </button>
        )}
        
        {vehicle.status === 'garage' && (
          <button 
            onClick={() => onStatusChange?.(vehicle.id, 'available')}
            className="flex-1 py-3 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20 font-black uppercase text-[9px] tracking-[0.2em] hover:bg-amber-500/20 transition-all flex items-center justify-center gap-2"
          >
            Complete Service
          </button>
        )}

        {vehicle.status !== 'sold' && (
          <button 
            className="p-3 aspect-square rounded-xl border border-slate-200 text-black hover:text-blue-600 hover:border-gray-600 transition-all flex items-center justify-center"
            title="View Details"
          >
            <ArrowRight size={16} />
          </button>
        )}
      </div>
    </div>
  );
};

export default VehicleCard;
