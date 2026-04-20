'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Lock, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';

type LenderStatus = 'locked' | 'pending' | 'approved' | 'declined';

interface LenderCardProps {
  name: string;
  status: LenderStatus;
  onApprove: (amount: number) => void;
  onDecline: () => void;
  onReset: () => void;
  isCurrent: boolean;
}

const LenderCard = ({ name, status, onApprove, onDecline, onReset, isCurrent }: LenderCardProps) => {
  const isLocked = status === 'locked';

  return (
    <div className={`relative ${isLocked ? 'blur-sm pointer-events-none opacity-50' : ''} transition-all duration-300`}>
      <div className="glass-card p-6" style={{
        borderColor: status === 'approved' ? 'var(--success-teal)' : 
                     status === 'declined' ? 'var(--danger-rose)' : 
                     isCurrent ? 'var(--chrome-gold)' : 'var(--glass-border)'
      }}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${
              status === 'approved' ? 'bg-teal-500/20 text-teal-500' :
              status === 'declined' ? 'bg-rose-500/20 text-rose-500' :
              'bg-amber-500/20 text-amber-500'
            }`}>
              {status === 'approved' ? <CheckCircle2 size={24} /> :
               status === 'declined' ? <XCircle size={24} /> :
               <AlertCircle size={24} />}
            </div>
            <h3 className="text-lg font-bold uppercase tracking-wider">{name}</h3>
          </div>
          {isLocked && <Lock className="text-gray-600" size={20} />}
        </div>

        {!isLocked && (
          <div className="flex gap-3">
            {status === 'pending' && isCurrent && (
              <>
                <button 
                  onClick={() => onApprove(25000)} // Mock approved amount
                  className="flex-1 py-2 rounded bg-teal-500 text-[#020617] font-bold uppercase text-xs tracking-widest hover:brightness-110 transition-all"
                >
                  Approve
                </button>
                <button 
                  onClick={onDecline}
                  className="flex-1 py-2 rounded bg-rose-500 text-[#020617] font-bold uppercase text-xs tracking-widest hover:brightness-110 transition-all"
                >
                  Decline
                </button>
              </>
            )}
            {(status === 'approved' || status === 'declined') && (
              <button 
                onClick={onReset}
                className="w-full py-2 rounded border border-gray-700 text-gray-400 font-bold uppercase text-[10px] tracking-widest hover:bg-gray-800 transition-all"
              >
                Reset Decision
              </button>
            )}
          </div>
        )}

        {status === 'approved' && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 pt-4 border-t border-teal-500/20"
          >
            <label className="text-[10px] text-teal-500/70 font-mono uppercase">Approved Amount</label>
            <div className="text-2xl font-mono text-teal-400">€25,000.00</div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default LenderCard;
