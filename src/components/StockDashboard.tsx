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
          <h2 className="text-3xl font-black tracking-tight mb-2 uppercase italic text-foreground">Stock Bridge</h2>
          <p className="text-slate-400 uppercase tracking-widest text-[10px] font-mono">Live Inventory Management & Attribution</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Search VIN or Model..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl py-2 pl-10 pr-4 text-xs font-mono focus:border-blue-500/50 outline-none w-64 transition-all text-foreground placeholder:text-slate-300"
            />
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-blue-100 transition-all flex items-center gap-2"
          >
            <Plus size={16} />
            Add Vehicle
          </button>
          <button 
            onClick={fetchVehicles}
            className="p-2 border border-slate-200 rounded-xl text-slate-400 hover:text-blue-600 hover:bg-slate-50 transition-all"
            title="Refresh Data"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
        <div className="bg-white p-6 rounded-2xl flex items-center justify-between border-l-4 border-amber-500 shadow-sm border-y border-r border-slate-100">
          <div>
            <p className="text-[9px] text-slate-400 uppercase tracking-widest mb-1 font-black">Total Assets Value</p>
            <h4 className="text-2xl font-black font-mono text-foreground">€{totalAssetValue.toLocaleString()}</h4>
          </div>
          <TrendingUp className="text-amber-500 opacity-50" size={24} />
        </div>
        <div className="bg-white p-6 rounded-2xl flex items-center justify-between border-l-4 border-teal-500 shadow-sm border-y border-r border-slate-100">
          <div>
            <p className="text-[9px] text-slate-400 uppercase tracking-widest mb-1 font-black">Ready Units</p>
            <h4 className="text-2xl font-black font-mono text-teal-600">
              {vehicles.filter(v => v.status === 'available').length}
            </h4>
          </div>
          <div className="w-10 h-10 rounded-full bg-teal-50 flex items-center justify-center text-teal-600">
            <RefreshCw size={20} />
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl flex items-center justify-between border-l-4 border-blue-500 shadow-sm border-y border-r border-slate-100">
          <div>
            <p className="text-[9px] text-slate-400 uppercase tracking-widest mb-1 font-black">In Service</p>
            <h4 className="text-2xl font-black font-mono text-blue-600">
              {vehicles.filter(v => v.status === 'garage').length}
            </h4>
          </div>
          <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
            <Plus size={20} />
          </div>
        </div>
      </div>

      {loading && vehicles.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4 border border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
          <Loader2 size={32} className="animate-spin text-blue-600" />
          <p className="text-[10px] uppercase tracking-[0.3em] text-slate-400 font-mono">Syncing Asset Ledger...</p>
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
        <div className="text-center py-20 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
          <p className="text-slate-400 font-mono tracking-widest uppercase text-[10px]">No vehicles found matching search parameters</p>
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
