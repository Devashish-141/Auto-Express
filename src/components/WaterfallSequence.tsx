'use client';

import React, { useState } from 'react';
import LenderCard from './LenderCard';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert } from 'lucide-react';

type LenderStatus = 'locked' | 'pending' | 'approved' | 'declined';

const LENDERS = [
  'Finance Ireland',
  'Close Brothers',
  'Finance4U'
];

const WaterfallSequence = () => {
  const [statuses, setStatuses] = useState<LenderStatus[]>(['pending', 'locked', 'locked']);
  const [isUnfinanceable, setIsUnfinanceable] = useState(false);

  const handleApprove = (index: number, amount: number) => {
    const nextStatuses = [...statuses];
    nextStatuses[index] = 'approved';
    setStatuses(nextStatuses);
    setIsUnfinanceable(false);
  };

  const handleDecline = (index: number) => {
    const nextStatuses = [...statuses];
    nextStatuses[index] = 'declined';
    
    // Unlock next lender if it exists
    if (index < LENDERS.length - 1) {
      nextStatuses[index + 1] = 'pending';
    } else {
      // Last lender declined
      setIsUnfinanceable(true);
    }
    
    setStatuses(nextStatuses);
  };

  const handleReset = (index: number) => {
    const nextStatuses = [...statuses];
    nextStatuses[index] = 'pending';
    
    // Lock all subsequent lenders
    for (let i = index + 1; i < LENDERS.length; i++) {
      nextStatuses[i] = 'locked';
    }
    
    setStatuses(nextStatuses);
    setIsUnfinanceable(false);
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6 px-4 py-12">
      <div className="mb-10 text-center">
        <h2 className="text-3xl font-bold tracking-tight mb-2">Finance Waterfall</h2>
        <p className="text-gray-500 uppercase tracking-widest text-xs">Sequential Lender Application Gate</p>
      </div>

      <div className="grid gap-4">
        {LENDERS.map((name, index) => (
          <LenderCard
            key={name}
            name={name}
            status={statuses[index]}
            isCurrent={statuses[index] === 'pending'}
            onApprove={(amount) => handleApprove(index, amount)}
            onDecline={() => handleDecline(index)}
            onReset={() => handleReset(index)}
          />
        ))}
      </div>

      <AnimatePresence>
        {isUnfinanceable && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="mt-12 p-8 border-2 border-rose-500 bg-rose-500/10 rounded-2xl text-center"
          >
            <ShieldAlert size={48} className="text-rose-500 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-rose-500 mb-2 uppercase tracking-tighter">Deal Unfinanceable</h3>
            <p className="text-rose-200/60 text-sm">
              All lenders in the waterfall sequence have declined. 
              Deal status flagged as unfinanceable: true.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default WaterfallSequence;
