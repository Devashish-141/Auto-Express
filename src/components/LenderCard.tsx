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
    if (isLocked) return 'border-slate-100';
    switch (status) {
      case 'approved': return 'border-teal-500 shadow-sm';
      case 'declined': return 'border-rose-500 shadow-sm';
      case 'pending': return 'border-amber-500 shadow-sm';
      default: return 'border-navy-border';
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'approved': return 'text-teal-600';
      case 'declined': return 'text-rose-600';
      case 'pending': return 'text-amber-600';
      default: return 'text-slate-400';
    }
  };

  const getBgColor = () => {
    switch (status) {
      case 'approved': return 'bg-teal-50';
      case 'declined': return 'bg-rose-50';
      case 'pending': return 'bg-amber-50';
      default: return 'bg-slate-100';
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
      <div className={`glass-card p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all duration-500 border ${getBorderColor()} ${isLocked ? 'bg-slate-50' : 'bg-white shadow-sm'}`}>
        
        {isLocked && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center">
            <Lock className="text-slate-300 mb-2" size={24} />
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-300 font-mono">Sequential Lock</span>
          </div>
        )}

        <div className="flex items-center gap-6">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border transition-all duration-500 ${getBgColor()} ${status === 'approved' ? 'border-teal-200' : status === 'declined' ? 'border-rose-200' : 'border-amber-200'}`}>
            {status === 'approved' ? <CheckCircle2 size={28} className="text-teal-600" /> :
             status === 'declined' ? <XCircle size={28} className="text-rose-600" /> :
             <AlertCircle size={28} className="text-amber-600" />}
          </div>
          <div>
            <h4 className="text-xl font-black uppercase tracking-tight text-navy-accent group-hover:tracking-wider transition-all duration-300">{name}</h4>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[9px] text-slate-400 uppercase tracking-widest font-mono">Lender Status:</span>
              <span className={`text-[9px] font-black uppercase tracking-widest ${getStatusColor()}`}>
                {status}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 w-full md:w-auto pt-4 md:pt-0 border-t md:border-t-0 border-slate-100">
          <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-xl border border-navy-border w-full sm:w-auto overflow-x-auto px-2">
            {[
              { id: 'pending', label: 'Pending', color: 'hover:bg-amber-100 hover:text-amber-600' },
              { id: 'approved', label: 'Approved', color: 'hover:bg-teal-100 hover:text-teal-600' },
              { id: 'declined', label: 'Declined', color: 'hover:bg-rose-100 hover:text-rose-600' }
            ].map((btn) => (
              <button
                key={btn.id}
                onClick={() => onStatusChange(btn.id as any)}
                className={`flex-1 sm:flex-none px-3 py-2 md:px-4 rounded-lg text-[8px] md:text-[9px] font-black uppercase tracking-widest transition-all duration-300 ${
                  status === btn.id 
                    ? btn.id === 'pending' ? 'bg-amber-500 text-white' 
                      : btn.id === 'approved' ? 'bg-teal-500 text-white' 
                      : 'bg-rose-500 text-white'
                    : `text-slate-400 ${btn.color}`
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
                className="flex flex-col w-full sm:w-40"
              >
                <span className="text-[7px] md:text-[8px] text-slate-400 uppercase tracking-widest mb-1 font-bold">Manual funding input</span>
                <div className="relative group/input">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Euro size={12} className="text-teal-600" />
                  </div>
                  <input
                    type="number"
                    value={approvedAmount || ''}
                    onChange={(e) => onAmountChange(Number(e.target.value))}
                    placeholder="0.00"
                    className="w-full bg-teal-50 border border-teal-200 rounded-xl py-2 pl-8 pr-4 text-xs md:text-sm font-mono font-bold text-teal-600 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500/30 transition-all placeholder:text-teal-200"
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
