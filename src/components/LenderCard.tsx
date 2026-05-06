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
  
  const getStatusColor = () => {
    switch (status) {
      case 'approved': return 'text-teal-400';
      case 'declined': return 'text-rose-400';
      case 'pending': return 'text-amber-400';
      default: return 'text-black';
    }
  };

  const getIcon = () => {
    switch (status) {
      case 'approved': return <CheckCircle2 size={24} className="text-teal-400" />;
      case 'declined': return <XCircle size={24} className="text-rose-400" />;
      default: return <AlertCircle size={24} className="text-amber-400" />;
    }
  };

  return (
    <motion.div 
      initial={false}
      animate={{ 
        filter: isLocked ? 'grayscale(1) opacity(0.5)' : 'none',
        scale: isLocked ? 0.98 : 1
      }}
      className={`relative group ${isLocked ? 'pointer-events-none' : ''}`}
    >
      <div className={`bg-white p-6 md:p-8 rounded-3xl border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-8 transition-all duration-500 shadow-xl overflow-hidden`}>
        
        {isLocked && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-50 backdrop-blur-[2px]">
            <Lock className="text-black mb-2" size={20} />
            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-black font-mono">Sequence Locked</span>
          </div>
        )}

        <div className="flex items-center gap-6 relative z-10">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center bg-slate-50 border border-slate-200 shadow-inner`}>
            {getIcon()}
          </div>
          <div>
            <h4 className="text-xl font-black uppercase tracking-tight text-white group-hover:text-blue-400 transition-colors italic">{name}</h4>
            <div className="flex items-center gap-3 mt-1.5">
              <span className="text-[8px] text-black uppercase tracking-widest font-black">Lender Signal:</span>
              <span className={`text-[8px] font-black uppercase tracking-[0.2em] ${getStatusColor()}`}>
                {status}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-6 w-full md:w-auto pt-6 md:pt-0 border-t md:border-t-0 border-slate-200/50 relative z-10">
          <div className="flex items-center gap-3 bg-slate-50 p-2 rounded-2xl border border-slate-200 w-full sm:w-auto">
            {[
              { id: 'pending', label: 'Wait', color: 'hover:text-amber-400' },
              { id: 'approved', label: 'Pass', color: 'hover:text-teal-400' },
              { id: 'declined', label: 'Fail', color: 'hover:text-rose-400' }
            ].map((btn) => (
              <button
                key={btn.id}
                onClick={() => onStatusChange(btn.id as any)}
                className={`flex-1 sm:flex-none px-5 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] transition-all duration-300 ${
                  status === btn.id 
                    ? btn.id === 'pending' ? 'bg-amber-500 text-white shadow-[0_0_15px_rgba(245,158,11,0.3)]' 
                      : btn.id === 'approved' ? 'bg-teal-500 text-white shadow-[0_0_15px_rgba(20,184,166,0.3)]' 
                      : 'bg-rose-500 text-white shadow-[0_0_15px_rgba(244,63,94,0.3)]'
                    : `text-black ${btn.color}`
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
                className="flex flex-col w-full sm:w-48"
              >
                <span className="text-[8px] text-black uppercase tracking-widest mb-2 font-black ml-1">Manual Credit Input</span>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-teal-400 font-mono font-black">
                    <Euro size={12} />
                  </div>
                  <input
                    type="number"
                    value={approvedAmount || ''}
                    onChange={(e) => onAmountChange(Number(e.target.value))}
                    placeholder="0.00"
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 pl-10 pr-4 text-sm font-mono font-black text-teal-400 focus:border-teal-500/50 outline-none transition-all placeholder:text-black"
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
