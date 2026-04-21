'use client';

import React, { useState, useEffect, useCallback } from 'react';
import LenderCard, { LenderStatus } from './LenderCard';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, Info } from 'lucide-react';
import { supabase } from '@/lib/supabase';

const LENDERS = ['Finance Ireland', 'Close Brothers', 'Finance4U'];

interface WaterfallSequenceProps {
  dealId: string;
  onUpdate?: () => void;
}

interface FinanceApp {
  id?: string;
  lender_name: string;
  status: 'active' | 'approved' | 'declined';
  approved_amount: number;
}

const WaterfallSequence = ({ dealId, onUpdate }: WaterfallSequenceProps) => {
  const [financeApps, setFinanceApps] = useState<FinanceApp[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUnfinanceable, setIsUnfinanceable] = useState(false);

  const fetchFinanceData = useCallback(async () => {
    if (dealId.startsWith('demo')) {
      const isDemo1 = dealId === 'demo-1';
      setFinanceApps([
        { lender_name: 'Finance Ireland', status: isDemo1 ? 'approved' : 'declined', approved_amount: isDemo1 ? 200000 : 0 }
      ]);
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('finance_apps')
      .select('id, lender_name, status, approved_amount')
      .eq('deal_id', dealId);

    if (!error && data) {
      setFinanceApps(data as any);
      
      // Check if Finance4U is declined for unfinanceable state
      const finance4U = data.find(a => a.lender_name === 'Finance4U');
      if (finance4U?.status === 'declined') {
        setIsUnfinanceable(true);
      } else {
        setIsUnfinanceable(false);
      }
    }
    setLoading(false);
  }, [dealId]);

  useEffect(() => {
    fetchFinanceData();

    const channel = supabase
      .channel(`finance-sequence-${dealId}`)
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'finance_apps', 
        filter: `deal_id=eq.${dealId}` 
      }, () => {
        fetchFinanceData();
        if (onUpdate) onUpdate();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [dealId, fetchFinanceData, onUpdate]);

  const handleStatusChange = async (lender: string, status: string) => {
    // Map UI 'pending' to DB 'active'
    const dbStatus = status === 'pending' ? 'active' : status;
    const existing = financeApps.find(a => a.lender_name === lender);

    if (existing?.id) {
      const { error } = await supabase
        .from('finance_apps')
        .update({ status: dbStatus })
        .eq('id', existing.id);
      
      if (error) {
        console.error('Update error:', error.message);
        return;
      }
    } else {
      const { error } = await supabase
        .from('finance_apps')
        .insert({
          deal_id: dealId,
          lender_name: lender,
          status: dbStatus,
          approved_amount: 0
        });
      
      if (error) {
        console.error('Insert error:', error.message);
        return;
      }
    }

    // Special case: Finance4U declined means unfinanceable
    if (lender === 'Finance4U' && status === 'declined') {
      await supabase
        .from('deals')
        .update({ unfinanceable: true })
        .eq('id', dealId);
      setIsUnfinanceable(true);
    } else if (lender === 'Finance4U' && status !== 'declined') {
       await supabase
        .from('deals')
        .update({ unfinanceable: false })
        .eq('id', dealId);
      setIsUnfinanceable(false);
    }

    fetchFinanceData();
    if (onUpdate) onUpdate();
  };

  const handleAmountChange = async (lender: string, amount: number) => {
    const existing = financeApps.find(a => a.lender_name === lender);
    if (existing?.id) {
      await supabase
        .from('finance_apps')
        .update({ approved_amount: amount })
        .eq('id', existing.id);
    } else {
      await supabase
        .from('finance_apps')
        .insert({
          deal_id: dealId,
          lender_name: lender,
          status: 'approved',
          approved_amount: amount
        });
    }
    fetchFinanceData();
    if (onUpdate) onUpdate();
  };

  const getLenderStatus = (name: string): LenderStatus => {
    const app = financeApps.find(a => a.lender_name === name);
    if (app) return app.status === 'active' ? 'pending' : app.status as any;
    
    // Waterfall logic
    const index = LENDERS.indexOf(name);
    if (index === 0) return 'pending'; 
    
    const prevLender = LENDERS[index - 1];
    const prevApp = financeApps.find(a => a.lender_name === prevLender);
    
    if (prevApp?.status === 'declined') return 'pending';
    return 'locked';
  };

  if (loading) return (
    <div className="flex justify-center py-12">
      <div className="w-8 h-8 border-2 border-amber-500/20 border-t-amber-500 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-2">
        <div>
          <h2 className="text-xl md:text-2xl font-black tracking-tight uppercase text-navy-accent">Finance Waterfall</h2>
          <p className="text-slate-400 uppercase tracking-widest text-[8px] md:text-[9px] mt-1 font-bold">[KI-001] Sequential Application Gate</p>
        </div>
        <div className="flex items-center">
          <div className="px-3 py-1.5 md:px-4 md:py-2 bg-amber-50 border border-amber-200 rounded-xl text-[8px] md:text-[10px] font-black text-amber-600 tracking-tighter uppercase italic">
            Sequential Locking Active
          </div>
        </div>
      </div>

      <div className="grid gap-4">
        {LENDERS.map((name) => {
          const status = getLenderStatus(name);
          const app = financeApps.find(a => a.lender_name === name);
          
          return (
            <LenderCard
              key={name}
              name={name}
              status={status}
              isLocked={status === 'locked'}
              approvedAmount={app?.approved_amount || 0}
              onStatusChange={(s) => handleStatusChange(name, s)}
              onAmountChange={(a) => handleAmountChange(name, a)}
            />
          );
        })}
      </div>

      <AnimatePresence>
        {isUnfinanceable && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="mt-8 relative group"
          >
            <div className="absolute -inset-1 bg-rose-500/5 rounded-2xl blur opacity-25" />
            <div className="relative glass-card p-6 md:p-8 border-2 border-rose-500/50 bg-rose-50 rounded-2xl text-center backdrop-blur-xl">
              <ShieldAlert size={40} className="text-rose-600 mx-auto mb-4 animate-pulse md:w-12 md:h-12" />
              <h3 className="text-lg md:text-2xl font-black text-rose-600 mb-2 uppercase tracking-tighter italic">Customer Unfinanceable - Cash Sale Only</h3>
              <p className="text-rose-600/80 text-[8px] md:text-[10px] uppercase tracking-[0.2em] font-bold">
                All lenders in the waterfall sequence have issued a hard decline. 
                Manual override required for progression.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default WaterfallSequence;
