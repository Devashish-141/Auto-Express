'use client';

import React, { useState } from 'react';
import { MoreVertical, ChevronDown, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRep } from '@/context/RepContext';
import { useToast } from '@/context/ToastContext';
import { supabase } from '@/lib/supabase';
import { reserveVehicle, unreserveVehicle, getFinancialStatusByVehicle } from '@/lib/data';
import { useEffect } from 'react';
import { X, MapPin, Gauge, ShieldCheck, Wallet, Landmark, TrendingDown } from 'lucide-react';

const classes = ['All class', 'Sedan', 'SUV', 'Coupe', 'Hypercar'];

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
      return { label: 'Available', color: 'text-emerald-600 border-emerald-200' };
    case 'sold':
      return { label: 'Reserved', color: 'text-navy-accent border-navy-border' };
    case 'in transit':
      return { label: 'In Transit', color: 'text-amber-600 border-amber-200' };
    default:
      return { label: status, color: 'text-slate-400 border-slate-200' };
  }
};

const InventoryList = () => {
  const [data, setData] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState('All class');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [selectedVehicle, setSelectedVehicle] = useState<any | null>(null);
  const [financialData, setFinancialData] = useState<any | null>(null);
  const [isModalLoading, setIsModalLoading] = useState(false);
  const { rep } = useRep();
  const { showToast } = useToast();

  const fetchVehicles = async () => {
    try {
      const { data: vehicles, error } = await supabase
        .from('vehicles')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setData(vehicles || []);
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setIsInitialLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();

    // Subscribe to real-time updates for the vehicles table
    const channel = supabase
      .channel('inventory-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'vehicles' }, () => {
        fetchVehicles();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const filteredData = selectedClass === 'All class' 
    ? data 
    : data.filter(item => item.class === selectedClass);

  const handleReserve = async (vehicleId: string, make: string, model: string) => {
    if (!rep) return;
    setLoadingId(vehicleId);
    
    // Optimistic Update: Change status locally for instant feedback
    const originalData = [...data];
    setData(prev => prev.map(item => 
      item.id === vehicleId ? { ...item, status: 'sold' } : item
    ));

    try {
      const dealId = await reserveVehicle(vehicleId, rep, 'Walk-in Customer', 0);
      
      showToast({
        message: `Vehicle Reserved Successfully`,
        type: 'success',
        link: { label: 'View Deal Detail', href: `/garage/${dealId}` }
      });
    } catch (error) {
      console.error('Reservation error:', error);
      // Rollback on error
      setData(originalData);
      showToast({
        message: `Failed to reserve vehicle`,
        type: 'error'
      });
    } finally {
      setLoadingId(null);
    }
  };

  const handleUnreserve = async (vehicleId: string, make: string, model: string) => {
    setLoadingId(vehicleId);
    try {
      await unreserveVehicle(vehicleId);
      showToast({
        message: `${make} ${model} Released to Inventory`,
        type: 'success'
      });
      // The status will update automatically via the real-time subscription
    } catch (error) {
      console.error('Unreserve error:', error);
      showToast({
        message: `Failed to unreserve vehicle`,
        type: 'error'
      });
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
    <div className="bg-white border border-navy-border rounded-xl p-5 relative flex flex-col h-full shadow-sm">
      <div className="absolute inset-0 bg-navy-card-gradient opacity-10 pointer-events-none rounded-xl" />
      
      <div className="relative z-20 flex items-center justify-between mb-4">
        <h3 className="text-xs tracking-widest text-slate-400 uppercase">Real-Time Inventory Overview</h3>
        
        <div className="flex items-center gap-4">
          <div className="relative">
            <button 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2 border border-navy-border rounded-md px-3 py-1 bg-slate-50 hover:border-navy-accent transition-colors"
            >
              <span className="text-xs text-slate-500">{selectedClass}</span>
              <ChevronDown size={14} className={`text-slate-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {isDropdownOpen && (
              <div className="absolute top-full right-0 mt-1 w-32 bg-navy-card border border-navy-border rounded-md shadow-xl z-30">
                {classes.map((cls) => (
                  <button
                    key={cls}
                    onClick={() => {
                      setSelectedClass(cls);
                      setIsDropdownOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 text-xs text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                  >
                    {cls}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button 
            onClick={() => alert('Options menu clicked')}
            className="text-gray-500 hover:text-navy-accent"
          >
            <MoreVertical size={16} />
          </button>
        </div>
      </div>

      <div className="relative z-10 flex-1 overflow-auto">
        {/* Desktop Table View */}
        <div className="hidden lg:block">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-navy-border text-[10px] text-slate-400 uppercase tracking-widest">
                <th className="pb-3 font-medium">Vehicle</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 font-medium">VIN</th>
                <th className="pb-3 font-medium">Mileage</th>
                <th className="pb-3 font-medium">Location</th>
                <th className="pb-3 font-medium text-right">Price</th>
                <th className="pb-3 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isInitialLoading ? (
                <tr>
                  <td colSpan={7} className="py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-6 h-6 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
                      <p className="text-[10px] text-gray-500 uppercase tracking-widest font-mono">Syncing Inventory Live...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredData.map((item) => {
                const statusDetails = getStatusDetails(item.status);
                return (
                  <tr key={item.id} className="group hover:bg-slate-50 transition-colors">
                    <td className="py-3">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-10 rounded-md overflow-hidden relative border border-navy-border bg-slate-100 flex items-center justify-center">
                          <img 
                            src={getActualVehicleImage(item.make, item.model, item.image_url)} 
                            alt={item.model}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                            onError={(e) => {
                              e.currentTarget.src = 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?q=80&w=200&auto=format&fit=crop';
                            }}
                          />
                        </div>
                        <div>
                          <p className="text-xs text-navy-accent font-bold">{item.make}</p>
                          <p className="text-[10px] text-slate-400">{item.model}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3">
                      <span className={`text-[10px] px-2 py-1 rounded-full border ${statusDetails.color} bg-slate-50 font-bold tracking-tighter`}>
                        {statusDetails.label}
                      </span>
                    </td>
                    <td className="py-3 text-xs text-slate-400 font-mono">{item.vin}</td>
                    <td className="py-3 text-xs text-slate-400">{item.mileage?.toLocaleString()}</td>
                    <td className="py-3 text-xs text-slate-400">{item.location}</td>
                    <td className="py-3 text-xs text-navy-accent text-right font-mono font-bold">€{item.price?.toLocaleString()}</td>
                    <td className={`py-3 text-right relative ${openMenuId === item.id ? 'z-50' : 'z-20'}`}>
                      <button 
                        onClick={() => setOpenMenuId(openMenuId === item.id ? null : item.id)}
                        className="p-2 hover:bg-slate-100 rounded-md transition-colors text-slate-400 hover:text-navy-accent"
                      >
                        <MoreVertical size={18} />
                      </button>

                      <AnimatePresence>
                        {openMenuId === item.id && (
                          <>
                            <div 
                              className="fixed inset-0 z-[90] bg-black/20 backdrop-blur-[2px]" 
                              onClick={() => setOpenMenuId(null)}
                            />
                            <motion.div 
                              initial={{ opacity: 0, scale: 0.95, y: -10 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.95, y: -10 }}
                              className="absolute right-0 top-full mt-2 w-48 bg-white border border-navy-border rounded-xl shadow-xl z-[100] p-1.5 overflow-hidden"
                            >
                              <div className="absolute inset-0 bg-navy-card-gradient opacity-20 pointer-events-none" />
                              <div className="relative z-10">
                                {item.status.toLowerCase() !== 'sold' ? (
                                  <button 
                                    onClick={() => {
                                      handleReserve(item.id, item.make, item.model);
                                      setOpenMenuId(null);
                                    }}
                                    disabled={loadingId === item.id}
                                    className="w-full text-left px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors flex items-center justify-between"
                                  >
                                    <span>{loadingId === item.id ? '...' : 'Reserve Vehicle'}</span>
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]" />
                                  </button>
                                ) : (
                                  <button 
                                    onClick={() => {
                                      handleUnreserve(item.id, item.make, item.model);
                                      setOpenMenuId(null);
                                    }}
                                    disabled={loadingId === item.id}
                                    className="w-full text-left px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-rose-600 hover:bg-rose-50 rounded-lg transition-colors flex items-center justify-between"
                                  >
                                    <span>{loadingId === item.id ? '...' : 'Unreserve'}</span>
                                    <div className="w-1.5 h-1.5 rounded-full bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.3)]" />
                                  </button>
                                )}
                                
                                <div className="h-[1px] bg-slate-100 my-1 mx-2" />
                                
                                <button 
                                  onClick={() => handleOpenDetails(item)}
                                  className="w-full text-left px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:bg-slate-50 rounded-lg transition-colors flex items-center justify-between"
                                >
                                  <span>View Asset Details</span>
                                  <ChevronDown size={14} className="-rotate-90 opacity-50" />
                                </button>
                              </div>
                            </motion.div>
                          </>
                        )}
                      </AnimatePresence>
                    </td>
                  </tr>
                )})}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="lg:hidden space-y-3">
          {isInitialLoading ? (
            <div className="py-10 text-center">
              <div className="w-6 h-6 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin mx-auto mb-2" />
              <p className="text-[10px] text-gray-500 uppercase tracking-widest">Syncing...</p>
            </div>
          ) : filteredData.map((item) => {
            const statusDetails = getStatusDetails(item.status);
            return (
              <div 
                key={item.id} 
                className="p-4 rounded-xl border border-navy-border bg-slate-50 space-y-4 shadow-sm"
                onClick={() => handleOpenDetails(item)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg overflow-hidden border border-navy-border bg-white">
                       <img 
                        src={getActualVehicleImage(item.make, item.model, item.image_url)} 
                        alt={item.model}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?q=80&w=200&auto=format&fit=crop';
                        }}
                      />
                    </div>
                    <div>
                      <p className="text-sm text-navy-accent font-bold">{item.make}</p>
                      <p className="text-[10px] text-slate-400 uppercase tracking-widest">{item.model}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-mono font-bold text-navy-accent">€{item.price?.toLocaleString()}</p>
                    <span className={`text-[8px] px-2 py-0.5 rounded-full border ${statusDetails.color} bg-white font-bold uppercase tracking-widest`}>
                      {statusDetails.label}
                    </span>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                  <div>
                    <p className="text-[8px] text-slate-400 uppercase tracking-widest">Mileage</p>
                    <p className="text-[10px] text-slate-500 font-mono font-bold">{item.mileage?.toLocaleString()} km</p>
                  </div>
                  <div>
                    <p className="text-[8px] text-slate-400 uppercase tracking-widest">Location</p>
                    <p className="text-[10px] text-slate-500 font-bold">{item.location}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-[1px] bg-navy-gradient opacity-50" />

      {/* Asset Details Modal */}
      <AnimatePresence>
        {selectedVehicle && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedVehicle(null)}
              className="absolute inset-0 bg-navy-accent/40 backdrop-blur-md"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl bg-white border border-navy-border rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="absolute inset-0 bg-navy-card-gradient opacity-20 pointer-events-none" />
              
              {/* Asset Image Header */}
              <div className="relative h-48 md:h-64 bg-slate-100 overflow-hidden border-b border-navy-border group-modal">
                <img 
                  src={getActualVehicleImage(selectedVehicle.make, selectedVehicle.model, selectedVehicle.image_url)} 
                  alt={selectedVehicle.model}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover-modal:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent opacity-60" />
              </div>
              
              {/* Modal Header */}
              <div className="relative z-10 p-6 flex items-start justify-between border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`text-[9px] px-2 py-0.5 rounded-full border ${getStatusDetails(selectedVehicle.status).color} bg-white font-bold tracking-widest uppercase`}>
                      {getStatusDetails(selectedVehicle.status).label}
                    </span>
                    <span className="text-[9px] text-slate-400 font-mono tracking-widest uppercase">Asset ID: {selectedVehicle.id.slice(0, 8)}</span>
                  </div>
                  <h2 className="text-3xl font-bold tracking-tighter text-navy-accent">
                    {selectedVehicle.make} <span className="text-slate-400 font-normal">{selectedVehicle.model}</span>
                  </h2>
                </div>
                <button 
                  onClick={() => setSelectedVehicle(null)}
                  className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-navy-accent transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Modal Body */}
              {/* Modal Body */}
              <div className="relative z-10 p-4 md:p-6 grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 overflow-y-auto max-h-[70vh] md:max-h-none">
                {/* Technical Specs */}
                <div className="space-y-6">
                  <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-600">Asset Specifications</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 rounded-xl bg-slate-50 border border-navy-border">
                      <p className="text-[9px] text-slate-400 uppercase tracking-widest mb-1">Price</p>
                      <p className="text-lg font-mono font-bold text-navy-accent">€{selectedVehicle.price?.toLocaleString()}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 border border-navy-border">
                      <p className="text-[9px] text-slate-400 uppercase tracking-widest mb-1">Mileage</p>
                      <p className="text-lg font-mono font-bold text-navy-accent">{selectedVehicle.mileage?.toLocaleString()} km</p>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 border border-navy-border flex items-center gap-3">
                      <MapPin size={16} className="text-slate-300 hidden sm:block" />
                      <div>
                        <p className="text-[9px] text-slate-400 uppercase tracking-widest">Location</p>
                        <p className="text-xs font-bold text-navy-accent">{selectedVehicle.location}</p>
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 border border-navy-border flex items-center gap-3">
                      <ShieldCheck size={16} className="text-slate-300 hidden sm:block" />
                      <div>
                        <p className="text-[9px] text-slate-400 uppercase tracking-widest">Year</p>
                        <p className="text-xs font-bold text-navy-accent">{selectedVehicle.year}</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-100 border border-navy-border font-mono">
                    <p className="text-[9px] text-slate-400 uppercase tracking-widest mb-1">Chassis Number (VIN)</p>
                    <p className="text-[10px] md:text-sm text-navy-accent font-bold select-all break-all">{selectedVehicle.vin}</p>
                  </div>
                </div>

                {/* Financial Status */}
                <div className="space-y-6">
                  <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-sky-400">Financial Transparency</h4>
                  
                  {selectedVehicle.status.toLowerCase() === 'sold' ? (
                    isModalLoading ? (
                      <div className="flex flex-col items-center justify-center h-40 gap-3 border border-white/5 rounded-2xl bg-white/[0.01]">
                        <div className="w-5 h-5 border-2 border-sky-500/30 border-t-sky-500 rounded-full animate-spin" />
                        <p className="text-[9px] text-gray-500 uppercase tracking-widest">Calculating Balances...</p>
                      </div>
                    ) : financialData ? (
                      <div className="space-y-4">
                        <div className="p-4 rounded-2xl bg-slate-50 border border-navy-border space-y-4 shadow-sm">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Wallet size={14} className="text-emerald-600" />
                              <span className="text-[10px] text-slate-400 uppercase tracking-widest">Direct Payments</span>
                            </div>
                            <span className="text-sm font-mono font-bold text-emerald-600">€{financialData.totalPayments.toLocaleString()}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Landmark size={14} className="text-sky-600" />
                              <span className="text-[10px] text-slate-400 uppercase tracking-widest">Finance Approved</span>
                            </div>
                            <span className="text-sm font-mono font-bold text-sky-600">€{financialData.totalFinance.toLocaleString()}</span>
                          </div>
                          <div className="h-[1px] bg-slate-200" />
                          <div className="flex items-center justify-between pt-2">
                            <div className="flex items-center gap-2">
                              <TrendingDown size={14} className="text-amber-600" />
                              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.1em]">Balance Remaining</span>
                            </div>
                            <span className="text-lg md:text-xl font-mono font-bold text-amber-600">
                              €{(selectedVehicle.price - financialData.totalPayments - financialData.totalFinance).toLocaleString()}
                            </span>
                          </div>
                        </div>
                        
                        <a 
                          href={`/garage/${financialData.dealId}`}
                          className="block w-full text-center py-3 rounded-xl bg-white/5 border border-white/10 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 hover:bg-white/10 hover:text-white transition-all"
                        >
                          Access Full Deal Ledger
                        </a>
                      </div>
                    ) : (
                      <div className="p-8 text-center border border-dashed border-white/10 rounded-2xl bg-white/[0.01]">
                        <p className="text-[10px] text-gray-600 uppercase tracking-widest">No active deal linked</p>
                      </div>
                    )
                  ) : (
                    <div className="space-y-6">
                      <div className="p-6 md:p-8 text-center border border-dashed border-white/10 rounded-2xl bg-white/[0.01]">
                        <p className="text-[10px] text-gray-500 uppercase tracking-[0.15em] leading-relaxed mb-6">
                          Asset is currently in <span className="text-green-400">available</span> inventory. No financial obligations or reservations exist for this asset.
                        </p>
                        
                        <button 
                          onClick={() => {
                            handleReserve(selectedVehicle.id, selectedVehicle.make, selectedVehicle.model);
                            setSelectedVehicle(null);
                          }}
                          disabled={loadingId === selectedVehicle.id}
                          className="w-full py-4 rounded-2xl bg-amber-500 text-black text-[10px] font-black uppercase tracking-[0.2em] hover:bg-amber-400 transition-all flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(245,158,11,0.2)]"
                        >
                          {loadingId === selectedVehicle.id ? (
                            <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                          ) : (
                            <>
                              <ShieldCheck size={16} />
                              Reserve Asset Now
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="relative z-10 bg-slate-50 p-4 px-6 border-t border-navy-border flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-600" />
                  <span className="text-[8px] text-slate-400 uppercase tracking-[0.2em]">End-to-End Asset Audit</span>
                </div>
                <p className="text-[8px] text-slate-400 font-mono">ENCRYPTED // {selectedVehicle.vin}</p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default InventoryList;
