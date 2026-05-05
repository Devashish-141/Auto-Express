'use client';

import React, { useState, useEffect, useCallback } from 'react';
import VehicleCard from './VehicleCard';
import { Plus, Search, TrendingUp, Loader2, RefreshCw } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import AddVehicleModal from './AddVehicleModal';

const StockDashboard = () => {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchVehicles = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('vehicles')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setVehicles(data);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchVehicles();

    // Subscribe to changes
    const channel = supabase
      .channel('stock-updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'vehicles' }, () => {
        fetchVehicles();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchVehicles]);

  const filteredVehicles = vehicles.filter(v => 
    v.make.toLowerCase().includes(search.toLowerCase()) || 
    v.model.toLowerCase().includes(search.toLowerCase()) ||
    v.vin.toLowerCase().includes(search.toLowerCase())
  );

  const totalAssetValue = vehicles.reduce((acc, v) => acc + (Number(v.price) || 0), 0);

  return (
    <div className="space-y-8 py-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight mb-2 uppercase italic text-white">Stock Bridge</h2>
          <p className="text-gray-500 uppercase tracking-widest text-[10px] font-mono">Live Inventory Management & Attribution</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
            <input 
              type="text" 
              placeholder="Search VIN or Model..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-black/20 border border-gray-800 rounded-xl py-2 pl-10 pr-4 text-xs font-mono focus:border-amber-500/50 outline-none w-64 transition-all text-white"
            />
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-amber-600 hover:bg-amber-500 text-white px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-lg transition-all flex items-center gap-2"
          >
            <Plus size={16} />
            Add Vehicle
          </button>
          <button 
            onClick={fetchVehicles}
            className="p-2 border border-gray-800 rounded-xl text-gray-500 hover:text-white hover:bg-gray-800 transition-all"
            title="Refresh Data"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
        <div className="glass-card p-6 flex items-center justify-between border-l-2 border-amber-500">
          <div>
            <p className="text-[9px] text-gray-500 uppercase tracking-widest mb-1 font-bold">Total Assets Value</p>
            <h4 className="text-2xl font-bold font-mono text-white">€{totalAssetValue.toLocaleString()}</h4>
          </div>
          <TrendingUp className="text-amber-500 opacity-50" size={24} />
        </div>
        <div className="glass-card p-6 flex items-center justify-between border-l-2 border-[var(--success-teal)]">
          <div>
            <p className="text-[9px] text-gray-500 uppercase tracking-widest mb-1 font-bold">Ready Units</p>
            <h4 className="text-2xl font-bold font-mono text-[var(--success-teal)]">
              {vehicles.filter(v => v.status === 'available').length}
            </h4>
          </div>
          <div className="w-10 h-10 rounded-full bg-[var(--success-teal)]/10 flex items-center justify-center text-[var(--success-teal)]">
            <RefreshCw size={20} />
          </div>
        </div>
        <div className="glass-card p-6 flex items-center justify-between border-l-2 border-blue-500">
          <div>
            <p className="text-[9px] text-gray-500 uppercase tracking-widest mb-1 font-bold">In Service</p>
            <h4 className="text-2xl font-bold font-mono text-blue-500">
              {vehicles.filter(v => v.status === 'garage').length}
            </h4>
          </div>
          <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
            <Plus size={20} />
          </div>
        </div>
      </div>

      {loading && vehicles.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4 border border-dashed border-gray-800 rounded-2xl">
          <Loader2 size={32} className="animate-spin text-amber-500" />
          <p className="text-[10px] uppercase tracking-[0.3em] text-gray-500 font-mono">Syncing Asset Ledger...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredVehicles.map(vehicle => (
            <VehicleCard 
              key={vehicle.id} 
              vehicle={vehicle} 
              onStatusChange={async (id, status) => {
                const { error } = await supabase
                  .from('vehicles')
                  .update({ status })
                  .eq('id', id);
                if (!error) fetchVehicles();
              }}
            />
          ))}
        </div>
      )}
      
      {!loading && filteredVehicles.length === 0 && (
        <div className="text-center py-20 bg-black/10 rounded-2xl border border-dashed border-gray-800">
          <p className="text-gray-500 font-mono tracking-widest uppercase text-[10px]">No vehicles found matching search parameters</p>
        </div>
      )}

      <AddVehicleModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchVehicles}
      />
    </div>
  );
};

export default StockDashboard;
