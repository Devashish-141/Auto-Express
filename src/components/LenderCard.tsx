'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, CheckCircle2, XCircle, AlertCircle, Euro } from 'lucide-react';

export type LenderStatus = 'pending' | 'approved' | 'declined' | 'locked';

interface LenderCardProps {
  name: string;
  status: LenderStatus;
  approvedAmount: number;
  onStatusChange: (status: 'pending' | 'approved' | 'declined') => void;
  onAmountChange: (amount: number) => void;
  isLocked?: boolean;
}

const LenderCard = ({ 
  name, 
  status, 
  approvedAmount, 
  onStatusChange, 
  onAmountChange,
  isLocked = false 
}: LenderCardProps) => {
  
  const getBorderColor = () => {
    if (isLocked) return 'border-white/5';
    switch (status) {
      case 'approved': return 'border-teal-500 shadow-[0_0_15px_rgba(20,184,166,0.3)]';
      case 'declined': return 'border-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.3)]';
      case 'pending': return 'border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.3)]';
      default: return 'border-white/10';
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'approved': return 'text-teal-500';
      case 'declined': return 'text-rose-500';
      case 'pending': return 'text-amber-500';
      default: return 'text-gray-500';
    }
  };

  const getBgColor = () => {
    switch (status) {
      case 'approved': return 'bg-teal-500/10';
      case 'declined': return 'bg-rose-500/10';
      case 'pending': return 'bg-amber-500/10';
      default: return 'bg-white/5';
    }
  };

  return (
    <motion.div 
      initial={false}
      animate={{ 
        filter: isLocked ? 'blur(4px)' : 'blur(0px)',
        opacity: isLocked ? 0.6 : 1,
        scale: isLocked ? 0.98 : 1
      }}
      transition={{ duration: 0.4 }}
      className={`relative group ${isLocked ? 'pointer-events-none' : ''}`}
    >
      <div className={`glass-card p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all duration-500 border ${getBorderColor()} ${isLocked ? 'bg-black/40' : 'bg-[#020617]/60'}`}>
        
        {isLocked && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center">
            <Lock className="text-gray-600 mb-2" size={24} />
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-600 font-mono">Sequential Lock</span>
          </div>
        )}

        <div className="flex items-center gap-6">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border transition-all duration-500 ${getBgColor()} ${status === 'approved' ? 'border-teal-500/30' : status === 'declined' ? 'border-rose-500/30' : 'border-amber-500/30'}`}>
            {status === 'approved' ? <CheckCircle2 size={28} className="text-teal-500" /> :
             status === 'declined' ? <XCircle size={28} className="text-rose-500" /> :
             <AlertCircle size={28} className="text-amber-500" />}
          </div>
          <div>
            <h4 className="text-xl font-black uppercase tracking-tight text-white group-hover:tracking-wider transition-all duration-300">{name}</h4>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[9px] text-gray-500 uppercase tracking-widest font-mono">Lender Status:</span>
              <span className={`text-[9px] font-black uppercase tracking-widest ${getStatusColor()}`}>
                {status}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/5">
            {[
              { id: 'pending', label: 'Pending', color: 'hover:bg-amber-500/20 hover:text-amber-500' },
              { id: 'approved', label: 'Approved', color: 'hover:bg-teal-500/20 hover:text-teal-500' },
              { id: 'declined', label: 'Declined', color: 'hover:bg-rose-500/20 hover:text-rose-500' }
            ].map((btn) => (
              <button
                key={btn.id}
                onClick={() => onStatusChange(btn.id as any)}
                className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all duration-300 ${
                  status === btn.id 
                    ? btn.id === 'pending' ? 'bg-amber-500 text-black' 
                      : btn.id === 'approved' ? 'bg-teal-500 text-black' 
                      : 'bg-rose-500 text-black'
                    : `text-gray-500 ${btn.color}`
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>

          <AnimatePresence>
            {status === 'approved' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex flex-col"
              >
                <span className="text-[8px] text-gray-500 uppercase tracking-widest mb-1 font-bold">Manual funding input</span>
                <div className="relative group/input">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Euro size={14} className="text-teal-500" />
                  </div>
                  <input
                    type="number"
                    value={approvedAmount || ''}
                    onChange={(e) => onAmountChange(Number(e.target.value))}
                    placeholder="0.00"
                    className="w-40 bg-teal-500/5 border border-teal-500/20 rounded-xl py-2 pl-10 pr-4 text-sm font-mono font-bold text-teal-500 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500/30 transition-all placeholder:text-teal-900"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};

export default LenderCard;
