'use client';

import React, { useState } from 'react';
import { MoreVertical, ChevronDown, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRep } from '@/context/RepContext';
import { useToast } from '@/context/ToastContext';
import { reserveVehicle, unreserveVehicle, getFinancialStatusByVehicle } from '@/lib/data';
import { useEffect } from 'react';
import { X, MapPin, Gauge, ShieldCheck, Wallet, Landmark, TrendingDown, Plus } from 'lucide-react';
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
      return { label: 'Available', color: 'text-teal-400 border-teal-500/20 bg-teal-500/5' };
    case 'sold':
      return { label: 'Reserved', color: 'text-amber-500 border-amber-500/20 bg-amber-500/5' };
    case 'in transit':
      return { label: 'In Transit', color: 'text-blue-400 border-blue-500/20 bg-blue-500/5' };
    default:
      return { label: status, color: 'text-gray-500 border-gray-800 bg-gray-900/50' };
  }
};

const InventoryList = ({ data, onRefresh }: { data: any[], onRefresh?: () => void }) => {
  const [selectedClass, setSelectedClass] = useState('All class');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<any | null>(null);
  const [financialData, setFinancialData] = useState<any | null>(null);
  const [isModalLoading, setIsModalLoading] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const { rep, location } = useRep();
  const { showToast } = useToast();

  const locationFilteredData = data.filter(item => 
    item.location?.toLowerCase().includes(location.toLowerCase())
  );

  const availableClasses = ['All class', ...Array.from(new Set(locationFilteredData.map(item => item.class))).filter(Boolean).sort()];

  const filteredData = selectedClass === 'All class' 
    ? locationFilteredData 
    : locationFilteredData.filter(item => item.class === selectedClass);

  const handleReserve = async (vehicleId: string, make: string, model: string) => {
    if (!rep) return;
    setLoadingId(vehicleId);
    try {
      const dealId = await reserveVehicle(vehicleId, rep, 'Walk-in Customer', 0);
      showToast({
        message: `Vehicle Reserved Successfully`,
        type: 'success',
        link: { label: 'View Deal Detail', href: `/garage/${dealId}` }
      });
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
      showToast({ message: `${make} ${model} Released to Inventory`, type: 'success' });
    } catch (error) {
      showToast({ message: `Failed to unreserve vehicle`, type: 'error' });
    } finally {
      setLoadingId(null);
    }
  };

  const handleOpenDetails = async (vehicle: any) => {
    setSelectedVehicle(vehicle);
    setFinancialData(null);
    setOpenMenuId(null);
    
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
    <div className="bg-[#0f172a] border border-gray-800 rounded-2xl p-6 relative flex flex-col h-full shadow-2xl overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-amber-500/5 pointer-events-none" />
      
      <div className="relative z-20 flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <h3 className="text-[10px] tracking-[0.4em] text-gray-500 uppercase font-black">Real-Time Inventory</h3>
        </div>
        
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-blue-700 transition-all shadow-xl active:scale-95"
          >
            <Plus size={14} />
            Acquire Asset
          </button>
          
          <div className="relative">
            <button 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2 border border-gray-800 rounded-xl px-4 py-2 bg-black/40 hover:border-amber-500/50 transition-colors"
            >
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{selectedClass}</span>
              <ChevronDown size={14} className={`text-gray-500 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            
            <AnimatePresence>
              {isDropdownOpen && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute top-full right-0 mt-2 w-48 max-h-64 overflow-y-auto bg-[#1e293b] border border-gray-800 rounded-xl shadow-2xl z-50 p-1"
                >
                  {availableClasses.map((cls) => (
                    <button
                      key={cls}
                      onClick={() => {
                        setSelectedClass(cls);
                        setIsDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
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

      <div className="relative z-10 flex-1 overflow-auto custom-scrollbar">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-800 text-[9px] text-gray-500 uppercase tracking-[0.3em] font-black">
              <th className="pb-4 font-black">Asset</th>
              <th className="pb-4 font-black">Status</th>
              <th className="pb-4 font-black">Identification</th>
              <th className="pb-4 font-black">Site</th>
              <th className="pb-4 font-black text-right">Value</th>
              <th className="pb-4 font-black text-right">Protocol</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800/50">
            {filteredData.map((item) => {
              const statusDetails = getStatusDetails(item.status);
              return (
                <tr key={item.id} className="group hover:bg-white/[0.02] transition-colors">
                  <td className="py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-10 rounded-lg overflow-hidden relative border border-gray-800 bg-black/40 flex items-center justify-center">
                        <img 
                          src={getActualVehicleImage(item.make, item.model, item.image_url)} 
                          alt={item.model}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      </div>
                      <div>
                        <p className="text-xs text-white font-black italic uppercase tracking-tight">{item.make}</p>
                        <p className="text-[9px] text-gray-500 uppercase tracking-widest">{item.model}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4">
                    <span className={`text-[8px] px-2 py-0.5 rounded-full border ${statusDetails.color} font-black uppercase tracking-widest`}>
                      {statusDetails.label}
                    </span>
                  </td>
                  <td className="py-4 text-[10px] text-gray-500 font-mono tracking-widest uppercase">{item.vin.slice(-8)}</td>
                  <td className="py-4 text-[10px] text-gray-400 font-bold uppercase tracking-widest">{item.location}</td>
                  <td className="py-4 text-xs text-teal-400 text-right font-mono font-black">€{item.price?.toLocaleString()}</td>
                  <td className="py-4 text-right">
                    <button 
                      onClick={() => handleOpenDetails(item)}
                      className="p-2 hover:bg-white/5 rounded-xl transition-colors text-gray-600 hover:text-white"
                    >
                      <MoreVertical size={18} />
                    </button>
                  </td>
                </tr>
              )})}
          </tbody>
        </table>
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedVehicle && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl bg-[#0f172a] border border-gray-800 rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
              <div className="absolute top-6 right-6 z-50">
                <button 
                  onClick={() => setSelectedVehicle(null)}
                  className="p-2 bg-black/40 hover:bg-black/60 rounded-full text-white/50 hover:text-white transition-all backdrop-blur-md"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="h-48 md:h-64 bg-black/40 relative overflow-hidden">
                <img 
                  src={getActualVehicleImage(selectedVehicle.make, selectedVehicle.model, selectedVehicle.image_url)} 
                  alt={selectedVehicle.model}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-transparent to-transparent" />
              </div>

              <div className="px-8 pb-8 -mt-12 relative z-10">
                <div className="flex items-center gap-3 mb-4">
                  <span className={`text-[9px] px-3 py-1 rounded-full border ${getStatusDetails(selectedVehicle.status).color} font-black tracking-[0.2em] uppercase`}>
                    {getStatusDetails(selectedVehicle.status).label}
                  </span>
                  <span className="text-[9px] text-gray-500 font-mono tracking-widest uppercase">VIN: {selectedVehicle.vin}</span>
                </div>

                <div className="flex items-end justify-between mb-8">
                  <div>
                    <h2 className="text-4xl font-black italic text-white uppercase tracking-tighter">
                      {selectedVehicle.make} <span className="text-gray-500 font-normal not-italic">{selectedVehicle.model}</span>
                    </h2>
                    <p className="text-[10px] text-gray-500 uppercase tracking-[0.4em] font-mono mt-1">Asset Verification: {selectedVehicle.id.slice(0, 8)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1 font-black">Market Value</p>
                    <p className="text-3xl font-black text-teal-400 font-mono leading-none">€{selectedVehicle.price?.toLocaleString()}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="space-y-4">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-500">Technical Specs</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-black/40 p-3 rounded-2xl border border-gray-800">
                        <p className="text-[8px] text-gray-600 uppercase tracking-widest mb-1">Mileage</p>
                        <p className="text-sm text-white font-bold font-mono">{selectedVehicle.mileage?.toLocaleString()} km</p>
                      </div>
                      <div className="bg-black/40 p-3 rounded-2xl border border-gray-800">
                        <p className="text-[8px] text-gray-600 uppercase tracking-widest mb-1">Year</p>
                        <p className="text-sm text-white font-bold">{selectedVehicle.year}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-500">Financial Waterfall</h4>
                    {selectedVehicle.status.toLowerCase() === 'sold' ? (
                      <div className="bg-black/40 p-4 rounded-2xl border border-gray-800 space-y-3">
                        <div className="flex justify-between text-[10px] text-gray-400">
                          <span>Balance Remaining</span>
                          <span className="font-mono text-amber-500 font-black">Calculating...</span>
                        </div>
                      </div>
                    ) : (
                      <button 
                        onClick={() => {
                          handleReserve(selectedVehicle.id, selectedVehicle.make, selectedVehicle.model);
                          setSelectedVehicle(null);
                        }}
                        disabled={loadingId === selectedVehicle.id}
                        className="w-full bg-white text-black py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] hover:bg-amber-500 hover:text-white transition-all shadow-xl active:scale-95"
                      >
                        Initialize Deal Pipeline
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
