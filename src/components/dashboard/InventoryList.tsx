'use client';

import React, { useState, useMemo } from 'react';
import { MoreVertical, ChevronDown, Check, ArrowUpDown, ArrowUp, ArrowDown, ShieldCheck, Loader2, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRep } from '@/context/RepContext';
import { useToast } from '@/context/ToastContext';
import { reserveVehicle, unreserveVehicle, getFinancialStatusByVehicle } from '@/lib/data';
import { useEffect } from 'react';
import { X, MapPin, Gauge, Wallet, Landmark, TrendingDown, Plus } from 'lucide-react';
import AddVehicleModal from '../AddVehicleModal';

const getActualVehicleImage = (make: string, model: string, defaultUrl?: string) => {
  const m = make.toLowerCase();
  const mod = model.toLowerCase();
  
  if (m.includes('aston') || mod.includes('db12')) return '/cars/aston-martin-db12.png';
  if (m.includes('porsche') && mod.includes('gt3')) return '/cars/porsche-911-gt3.png';
  if (m.includes('ferrari')) return '/cars/ferrari-f8-tributo.png';
  if (m.includes('lamborghini')) return '/cars/lamborghini-revuelto.png';
  if (m.includes('bentley')) return '/cars/bentley-bentayga.png';
  
  return defaultUrl || 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?q=80&w=200&auto=format&fit=crop';
};

const getStatusDetails = (status: string) => {
  switch (status.toLowerCase()) {
    case 'available':
      return { label: 'Available', color: 'text-teal-700 border-teal-200 bg-teal-50' };
    case 'sold':
      return { label: 'Reserved', color: 'text-amber-700 border-amber-200 bg-amber-50' };
    case 'in transit':
      return { label: 'In Transit', color: 'text-blue-700 border-blue-200 bg-blue-50' };
    default:
      return { label: status, color: 'text-black border-slate-200 bg-slate-50' };
  }
};

const InventoryList = ({ data, onRefresh }: { data: any[], onRefresh?: () => void }) => {
  const [selectedClass, setSelectedClass] = useState('All class');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<any | null>(null);
  const [financialData, setFinancialData] = useState<any | null>(null);
  const [isModalLoading, setIsModalLoading] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const { rep, location } = useRep();
  const { showToast } = useToast();

  const processedData = useMemo(() => {
    let filtered = data.filter(item => 
      item.location?.toLowerCase().includes(location.toLowerCase())
    );

    if (selectedClass !== 'All class') {
      filtered = filtered.filter(item => item.class === selectedClass);
    }

    return [...filtered].sort((a, b) => {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });
  }, [data, location, selectedClass, sortOrder]);

  const availableClasses = ['All class', ...Array.from(new Set(data.filter(i => i.location?.toLowerCase().includes(location.toLowerCase())).map(item => item.class))).filter(Boolean).sort()];

  const handleReserve = async (vehicleId: string, make: string, model: string) => {
    if (!rep) {
      showToast({ message: 'Identity Required to Initialize Protocol', type: 'error' });
      return;
    }
    setLoadingId(vehicleId);
    try {
      const dealId = await reserveVehicle(vehicleId, rep, 'Walk-in Customer', 0);
      showToast({
        message: `${make} ${model} Reserved Successfully`,
        type: 'success',
        link: { label: 'Manage Deal', href: `/garage/${dealId}` }
      });
      if (onRefresh) onRefresh();
    } catch (error) {
      showToast({ message: `Failed to reserve vehicle`, type: 'error' });
    } finally {
      setLoadingId(null);
    }
  };

  const handleUnreserve = async (vehicleId: string, make: string, model: string) => {
    setLoadingId(vehicleId);
    try {
      await unreserveVehicle(vehicleId);
      showToast({ message: `${make} ${model} Released back to Stock`, type: 'success' });
      if (onRefresh) onRefresh();
    } catch (error) {
      showToast({ message: `Failed to unreserve vehicle`, type: 'error' });
    } finally {
      setLoadingId(null);
    }
  };

  const handleOpenDetails = async (vehicle: any) => {
    setSelectedVehicle(vehicle);
    setFinancialData(null);
    
    if (vehicle.status.toLowerCase() === 'sold') {
      setIsModalLoading(true);
      try {
        const data = await getFinancialStatusByVehicle(vehicle.id);
        setFinancialData(data);
      } catch (error) {
        console.error('Failed to fetch financial data:', error);
      } finally {
        setIsModalLoading(false);
      }
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-[2rem] p-8 relative flex flex-col h-full shadow-sm overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/5 via-transparent to-amber-50/5 pointer-events-none" />
      
      <div className="relative z-20 flex items-center justify-between mb-10">
        <div>
          <h3 className="text-[11px] tracking-[0.4em] text-black uppercase font-bold mb-1">Stock Telemetry</h3>
          <p className="text-2xl font-extrabold uppercase tracking-tighter text-black font-sans">Real-Time Inventory</p>
        </div>
        
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
            className="flex items-center gap-3 border border-slate-200 rounded-2xl px-5 py-3 bg-slate-50 hover:border-slate-900 transition-all group shadow-sm"
          >
            {sortOrder === 'desc' ? <ArrowDown size={14} className="text-blue-600" /> : <ArrowUp size={14} className="text-blue-600" />}
            <span className="text-[10px] font-black text-black uppercase tracking-widest group-hover:text-black">
              {sortOrder === 'desc' ? 'Newest' : 'Oldest'}
            </span>
          </button>

          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 active:scale-95"
          >
            <Plus size={16} />
            Acquire Asset
          </button>
          
          <div className="relative">
            <button 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-3 border border-slate-200 rounded-2xl px-5 py-3 bg-slate-50 hover:border-blue-500/50 transition-colors"
            >
              <span className="text-[10px] font-black text-black uppercase tracking-widest">{selectedClass}</span>
              <ChevronDown size={14} className={`text-black transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            
            <AnimatePresence>
              {isDropdownOpen && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute top-full right-0 mt-3 w-56 max-h-72 overflow-y-auto bg-white border border-slate-200 rounded-2xl shadow-2xl z-50 p-2"
                >
                  {availableClasses.map((cls) => (
                    <button
                      key={cls}
                      onClick={() => {
                        setSelectedClass(cls);
                        setIsDropdownOpen(false);
                      }}
                      className="w-full text-left px-5 py-3 text-[10px] font-black uppercase tracking-widest text-black hover:text-blue-600 hover:bg-slate-50 rounded-xl transition-colors"
                    >
                      {cls}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <div className="relative z-10 flex-1 overflow-x-auto custom-scrollbar">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 text-[10px] text-black uppercase tracking-[0.3em] font-header font-black">
              <th className="pb-6 px-4">Asset Matrix</th>
              <th className="pb-6 px-4">Status</th>
              <th className="pb-6 px-4">Identification</th>
              <th className="pb-6 px-4">Deployment Site</th>
              <th className="pb-6 px-4 text-right">Market Value</th>
              <th className="pb-6 px-4 text-right">Protocol</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {processedData.map((item) => {
              const statusDetails = getStatusDetails(item.status);
              const isAvailable = item.status.toLowerCase() === 'available';
              const isReserved = item.status.toLowerCase() === 'sold';
              
              return (
                <tr key={item.id} className="group hover:bg-slate-50/80 transition-colors">
                  <td className="py-5 px-4">
                    <div className="flex items-center gap-5">
                      <div className="w-20 h-12 rounded-xl overflow-hidden relative border border-slate-200 bg-slate-50 flex items-center justify-center">
                        <img 
                          src={getActualVehicleImage(item.make, item.model, item.image_url)} 
                          alt={item.model}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                      </div>
                      <div>
                        <p className="text-sm text-black font-black italic uppercase tracking-tight">{item.make}</p>
                        <p className="text-[10px] text-black font-bold uppercase tracking-widest">{item.model}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-5 px-4">
                    <span className={`text-[9px] px-3 py-1 rounded-full border ${statusDetails.color} font-black uppercase tracking-widest`}>
                      {statusDetails.label}
                    </span>
                  </td>
                  <td className="py-5 px-4 text-[11px] text-black font-mono tracking-widest uppercase">VIN: {item.vin.slice(-8)}</td>
                  <td className="py-5 px-4 text-[11px] text-black font-bold uppercase tracking-widest italic">{item.location}</td>
                  <td className="py-5 px-6 text-sm text-black text-right font-mono font-bold tracking-tight whitespace-nowrap">€{item.price?.toLocaleString()}</td>
                  <td className="py-5 px-4 text-right">
                    <div className="flex items-center justify-end gap-3">
                      {isAvailable ? (
                        <button 
                          onClick={() => handleReserve(item.id, item.make, item.model)}
                          disabled={loadingId === item.id}
                          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 active:scale-95 disabled:opacity-50"
                        >
                          {loadingId === item.id ? <Loader2 size={12} className="animate-spin" /> : <ShieldCheck size={12} />}
                          RESERVE
                        </button>
                      ) : isReserved ? (
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => handleUnreserve(item.id, item.make, item.model)}
                            disabled={loadingId === item.id}
                            className="flex items-center gap-2 bg-amber-500 text-white px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-amber-600 transition-all shadow-lg shadow-amber-100 active:scale-95 disabled:opacity-50"
                          >
                            {loadingId === item.id ? <Loader2 size={12} className="animate-spin" /> : <RotateCcw size={12} />}
                            RELEASE
                          </button>
                          <button 
                            onClick={() => handleOpenDetails(item)}
                            className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg active:scale-95"
                          >
                            OPEN
                          </button>
                        </div>
                      ) : (
                        <button 
                          onClick={() => handleOpenDetails(item)}
                          className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg active:scale-95"
                        >
                          OPEN
                        </button>
                      )}
                      <button 
                        onClick={() => handleOpenDetails(item)}
                        className="p-2 hover:bg-slate-100 rounded-xl transition-all text-black hover:text-black"
                      >
                        <MoreVertical size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              )})}
          </tbody>
        </table>
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedVehicle && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xl">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 30 }}
              className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-[3rem] shadow-2xl overflow-hidden"
            >
              <div className="absolute top-8 right-8 z-50">
                <button 
                  onClick={() => setSelectedVehicle(null)}
                  className="p-3 bg-white/90 hover:bg-white rounded-2xl text-black hover:text-blue-600 transition-all backdrop-blur-md border border-slate-200 shadow-xl"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="h-64 md:h-80 bg-slate-50 relative overflow-hidden">
                <img 
                  src={getActualVehicleImage(selectedVehicle.make, selectedVehicle.model, selectedVehicle.image_url)} 
                  alt={selectedVehicle.model}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent" />
              </div>

              <div className="px-10 pb-10 -mt-16 relative z-10">
                <div className="flex items-center gap-4 mb-6">
                  <span className={`text-[10px] px-4 py-1.5 rounded-full border ${getStatusDetails(selectedVehicle.status).color} font-black tracking-[0.2em] uppercase shadow-sm`}>
                    {getStatusDetails(selectedVehicle.status).label}
                  </span>
                  <span className="text-[10px] text-black font-mono tracking-widest uppercase font-bold">VIN: {selectedVehicle.vin}</span>
                </div>

                <div className="flex items-end justify-between mb-10">
                  <div>
                    <h2 className="text-4xl md:text-5xl font-black italic text-black uppercase tracking-tighter leading-none">
                      {selectedVehicle.make} <span className="text-black font-normal not-italic">{selectedVehicle.model}</span>
                    </h2>
                    <p className="text-[11px] text-black uppercase tracking-[0.5em] font-black mt-3">Asset Protocol ID: {selectedVehicle.id.slice(0, 12)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[11px] text-black uppercase tracking-widest mb-2 font-black">Market Valuation</p>
                    <p className="text-4xl font-black text-black font-mono leading-none tracking-tighter italic">€{selectedVehicle.price?.toLocaleString()}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-10">
                  <div className="space-y-5">
                    <h4 className="text-[11px] font-black uppercase tracking-[0.4em] text-black flex items-center gap-3">
                      <div className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
                      Technical Matrix
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-slate-50 p-4 rounded-[1.5rem] border border-slate-100 shadow-inner">
                        <p className="text-[9px] text-black uppercase tracking-widest mb-2 font-black">Mileage Telemetry</p>
                        <p className="text-lg text-black font-black font-mono">{selectedVehicle.mileage?.toLocaleString()} <span className="text-[10px] text-black ml-1">KM</span></p>
                      </div>
                      <div className="bg-slate-50 p-4 rounded-[1.5rem] border border-slate-100 shadow-inner">
                        <p className="text-[9px] text-black uppercase tracking-widest mb-2 font-black">Release Epoch</p>
                        <p className="text-lg text-black font-black">{selectedVehicle.year}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-5">
                    <h4 className="text-[11px] font-black uppercase tracking-[0.4em] text-black flex items-center gap-3">
                      <div className="w-1.5 h-1.5 bg-blue-600 rounded-full" />
                      Financial Protocol
                    </h4>
                    {selectedVehicle.status.toLowerCase() === 'sold' ? (
                      <div className="bg-slate-50 p-5 rounded-[1.5rem] border border-slate-100 space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] text-black uppercase font-black tracking-widest">Active Balance</span>
                          <span className="text-sm font-mono text-amber-600 font-black animate-pulse">SYNCING...</span>
                        </div>
                        <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: '60%' }}
                            className="h-full bg-blue-600"
                          />
                        </div>
                        <button 
                          onClick={() => {
                            handleUnreserve(selectedVehicle.id, selectedVehicle.make, selectedVehicle.model);
                            setSelectedVehicle(null);
                          }}
                          className="w-full bg-amber-500 text-white py-3 rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-amber-600 transition-all shadow-lg active:scale-95"
                        >
                          Release back to Stock
                        </button>
                      </div>
                    ) : (
                      <button 
                        onClick={() => {
                          handleReserve(selectedVehicle.id, selectedVehicle.make, selectedVehicle.model);
                          setSelectedVehicle(null);
                        }}
                        disabled={loadingId === selectedVehicle.id}
                        className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black uppercase tracking-[0.3em] text-[10px] hover:bg-blue-700 transition-all shadow-2xl shadow-blue-100 active:scale-95 flex items-center justify-center gap-3"
                      >
                        {loadingId === selectedVehicle.id ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                        Initialize Pipeline
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      
      <AddVehicleModal 
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={() => onRefresh && onRefresh()}
      />
    </div>
  );
};

export default InventoryList;
