'use client';

import React, { useState, useEffect, useCallback } from 'react';
import LenderCard, { LenderStatus } from './LenderCard';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert } from 'lucide-react';
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
    const { data, error } = await supabase
      .from('finance_apps')
      .select('id, lender_name, status, approved_amount')
      .eq('deal_id', dealId);

    if (!error && data) {
      setFinanceApps(data as any);
      const finance4U = data.find(a => a.lender_name === 'Finance4U');
      setIsUnfinanceable(finance4U?.status === 'declined');
    }
    setLoading(false);
  }, [dealId]);

  useEffect(() => {
    fetchFinanceData();
    const channel = supabase.channel(`finance-sequence-${dealId}`).on('postgres_changes', { event: '*', schema: 'public', table: 'finance_apps', filter: `deal_id=eq.${dealId}` }, () => {
      fetchFinanceData();
      if (onUpdate) onUpdate();
    }).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [dealId, fetchFinanceData, onUpdate]);

  const handleStatusChange = async (lender: string, status: string) => {
    const dbStatus = status === 'pending' ? 'active' : status;
    const existing = financeApps.find(a => a.lender_name === lender);

    if (existing?.id) {
      await supabase.from('finance_apps').update({ status: dbStatus }).eq('id', existing.id);
    } else {
      await supabase.from('finance_apps').insert({ deal_id: dealId, lender_name: lender, status: dbStatus, approved_amount: 0 });
    }

    if (lender === 'Finance4U') {
      await supabase.from('deals').update({ unfinanceable: status === 'declined' }).eq('id', dealId);
      setIsUnfinanceable(status === 'declined');
    }

    fetchFinanceData();
    if (onUpdate) onUpdate();
  };

  const handleAmountChange = async (lender: string, amount: number) => {
    const existing = financeApps.find(a => a.lender_name === lender);
    if (existing?.id) {
      await supabase.from('finance_apps').update({ approved_amount: amount }).eq('id', existing.id);
    } else {
      await supabase.from('finance_apps').insert({ deal_id: dealId, lender_name: lender, status: 'approved', approved_amount: amount });
    }
    fetchFinanceData();
    if (onUpdate) onUpdate();
  };

  const getLenderStatus = (name: string): LenderStatus => {
    const app = financeApps.find(a => a.lender_name === name);
    if (app) return app.status === 'active' ? 'pending' : app.status as any;
    const index = LENDERS.indexOf(name);
    if (index === 0) return 'pending'; 
    const prevLender = LENDERS[index - 1];
    const prevApp = financeApps.find(a => a.lender_name === prevLender);
    if (prevApp?.status === 'declined') return 'pending';
    return 'locked';
  };

  if (loading) return (
    <div className="flex justify-center py-20">
      <div className="w-10 h-10 border-4 border-white/10 border-t-blue-500 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-8 animate-in slide-in-from-right duration-1000">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black tracking-tighter uppercase text-white italic">Finance Waterfall</h2>
          <p className="text-gray-600 uppercase tracking-[0.4em] text-[10px] font-black mt-2">Sequential Application & Liquidity Protocol</p>
        </div>
        <div className="px-6 py-3 bg-blue-600/10 border border-blue-500/20 rounded-2xl text-[10px] font-black text-blue-400 uppercase tracking-[0.3em] italic">
          Logic Sequence Active
        </div>
      </div>

      <div className="grid gap-6">
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
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="mt-12 relative group"
          >
            <div className="absolute -inset-2 bg-red-600/10 rounded-[2.5rem] blur-xl opacity-50" />
            <div className="relative bg-[#0f172a] p-10 border-2 border-red-500/30 rounded-[2rem] text-center shadow-2xl">
              <ShieldAlert size={56} className="text-red-500 mx-auto mb-6 animate-bounce" />
              <h3 className="text-3xl font-black text-white mb-3 uppercase tracking-tight italic">Protocol Failure: Unfinanceable</h3>
              <p className="text-gray-500 text-[10px] uppercase tracking-[0.4em] font-black max-w-lg mx-auto leading-relaxed">
                Sequential hard-declines detected. Customer lacks sufficient liquidity for asset acquisition via standard channels.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default WaterfallSequence;
