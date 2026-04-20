'use client';

import React, { useState } from 'react';
import VehicleCard from './VehicleCard';
import { Plus, Search, Filter, TrendingUp } from 'lucide-react';

const MOCK_VEHICLES = [
  { id: '1', make: 'Audi', model: 'A6 S-Line', year: 2022, price: 45900, vin: 'WAUZZZ4G1234567', status: 'available', rep_code: 'AMANDA-01' },
  { id: '2', make: 'BMW', model: '520d M-Sport', year: 2021, price: 38500, vin: 'WBA5F1234567890', status: 'garage', rep_code: 'AMANDA-01' },
  { id: '3', make: 'Mercedes', model: 'E220d', year: 2023, price: 52000, vin: 'W1K123456789012', status: 'available', rep_code: 'NICK-02' },
  { id: '4', make: 'Tesla', model: 'Model 3', year: 2022, price: 34000, vin: '5YJ3E1234567890', status: 'sold', rep_code: 'NICK-02' },
] as const;

const StockDashboard = () => {
  const [vehicles, setVehicles] = useState(MOCK_VEHICLES);
  const [search, setSearch] = useState('');

  const filteredVehicles = vehicles.filter(v => 
    v.make.toLowerCase().includes(search.toLowerCase()) || 
    v.model.toLowerCase().includes(search.toLowerCase()) ||
    v.vin.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 py-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight mb-2">Stock Bridge</h2>
          <p className="text-gray-500 uppercase tracking-widest text-xs">Live Inventory Management & Attribution</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
            <input 
              type="text" 
              placeholder="Search VIN or Model..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-black/20 border border-gray-800 rounded-lg py-2 pl-10 pr-4 text-sm font-mono focus:border-amber-500/50 outline-none w-64 transition-all"
            />
          </div>
          <button className="btn-primary flex items-center gap-2">
            <Plus size={18} />
            Add Vehicle
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
        <div className="glass-card p-6 flex items-center justify-between">
          <div>
            <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Total Assets</p>
            <h4 className="text-2xl font-bold font-mono">€{vehicles.reduce((acc, v) => acc + v.price, 0).toLocaleString()}</h4>
          </div>
          <TrendingUp className="text-amber-500" size={24} />
        </div>
        <div className="glass-card p-6">
          <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Ready Units</p>
          <h4 className="text-2xl font-bold font-mono text-[var(--success-teal)]">
            {vehicles.filter(v => v.status === 'available').length}
          </h4>
        </div>
        <div className="glass-card p-6">
          <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">In Service</p>
          <h4 className="text-2xl font-bold font-mono text-amber-500">
            {vehicles.filter(v => v.status === 'garage').length}
          </h4>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredVehicles.map(vehicle => (
          <VehicleCard 
            key={vehicle.id} 
            vehicle={vehicle} 
            onStatusChange={(id, status) => {
              // Handle status change logic here
              console.log('Status change:', id, status);
            }}
          />
        ))}
      </div>
      
      {filteredVehicles.length === 0 && (
        <div className="text-center py-20 bg-black/10 rounded-2xl border border-dashed border-gray-800">
          <p className="text-gray-500 font-mono tracking-widest uppercase text-sm">No vehicles found matching search parameters</p>
        </div>
      )}
    </div>
  );
};

export default StockDashboard;
