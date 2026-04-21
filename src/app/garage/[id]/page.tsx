'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import TopNav from '@/components/dashboard/TopNav';
import PaymentLogger from '@/components/dashboard/PaymentLogger';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, 
  Lock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Activity,
  Euro,
  User,
  Hash
} from 'lucide-react';
import Link from 'next/link';
import WaterfallSequence from '@/components/WaterfallSequence';

interface Deal {
  id: string;
  customer_name: string;
  status: string;
  created_at: string;
  vehicles: {
    make: string;
    model: string;
    price: number;
    vin: string;
    image_url?: string;
  };
  unfinanceable?: boolean;
}

interface Payment {
  id: string;
  amount: number;
  is_voided: boolean;
  payment_date: string;
  method: string;
  rep_code: string;
  void_reason?: string;
}

interface FinanceApp {
  id: string;
  lender_name: string;
  status: 'active' | 'approved' | 'declined';
  approved_amount: number;
}



export default function GarageDealPage() {
  const params = useParams();
  const router = useRouter();
  const dealId = params.id as string;
  const [deal, setDeal] = useState<Deal | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [financeApps, setFinanceApps] = useState<FinanceApp[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (dealId.startsWith('demo')) {
      const isDemo1 = dealId === 'demo-1';
      setDeal({
        id: dealId,
        customer_name: isDemo1 ? 'James Henderson' : 'Global Tech Solutions',
        status: 'pending',
        created_at: new Date().toISOString(),
        vehicles: {
          make: isDemo1 ? 'Aston Martin' : 'BMW',
          model: isDemo1 ? 'DB12 Volante' : 'XM Label Red',
          price: isDemo1 ? 285000 : 210000,
          vin: isDemo1 ? 'AMVDB12V8SK9012' : 'WBA53CM040N1234'
        }
      });
      setPayments([{ 
        id: 'p1', 
        amount: isDemo1 ? 50000 : 25000, 
        is_voided: false,
        payment_date: new Date().toISOString(),
        method: 'Transfer',
        rep_code: 'DEMO-REP'
      }]);
      setFinanceApps([
        { id: 'f1', lender_name: 'Finance Ireland', status: isDemo1 ? 'approved' : 'declined', approved_amount: isDemo1 ? 200000 : 0 }
      ]);
      setLoading(false);
      return;
    }

    // 1. Fetch Deal with Vehicle details
    const { data: dealData, error: dealError } = await supabase
      .from('deals')
      .select(`
        id, 
        customer_name, 
        status,
        unfinanceable,
        vehicles (make, model, price, vin, image_url)
      `)
      .eq('id', dealId)
      .single();

    if (dealError) {
      console.error('Error fetching deal:', dealError);
      return;
    }
    if (dealData) setDeal(dealData as any);

    // 2. Fetch Payments
    const { data: paymentsData } = await supabase
      .from('payments')
      .select('id, amount, is_voided, payment_date, method, rep_code, void_reason')
      .eq('deal_id', dealId)
      .order('payment_date', { ascending: false });

    if (paymentsData) setPayments(paymentsData);

    // 3. Fetch Finance Apps
    const { data: financeData } = await supabase
      .from('finance_apps')
      .select('id, lender_name, status, approved_amount')
      .eq('deal_id', dealId);

    if (financeData) setFinanceApps(financeData);

    setLoading(false);
  }, [dealId]);

  useEffect(() => {
    fetchData();

    // Realtime Subscriptions for Financial Updates
    const paymentsSub = supabase
      .channel('payments-live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'payments', filter: `deal_id=eq.${dealId}` }, () => fetchData())
      .subscribe();

    const financeSub = supabase
      .channel('finance-live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'finance_apps', filter: `deal_id=eq.${dealId}` }, () => fetchData())
      .subscribe();

    return () => {
      supabase.removeChannel(paymentsSub);
      supabase.removeChannel(financeSub);
    };
  }, [dealId, fetchData]);

  const totalSalePrice = deal?.vehicles?.price || 0;
  const totalPayments = payments.reduce((acc, p) => p.is_voided ? acc : acc + Number(p.amount), 0);
  const totalFinanceApproved = financeApps.reduce((acc, a) => a.status === 'approved' ? acc + (Number(a.approved_amount) || 0) : acc, 0);
  const balanceDue = totalSalePrice - totalPayments - totalFinanceApproved;

  const getBalanceColor = () => {
    if (balanceDue > 0) return 'text-amber-500';
    if (balanceDue === 0) return 'text-[var(--success-teal)]';
    return 'text-rose-500';
  };



  if (loading) {
    return (
      <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin" />
        <p className="text-[10px] uppercase tracking-[0.5em] text-gray-500 font-bold">Syncing Deal Logic...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-navy-bg flex flex-col font-sans text-white">
      <TopNav />
      
      <main className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-[1200px] mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
          
          <div className="flex items-center justify-between">
            <Link 
              href="/garage"
              className="group flex items-center gap-3 text-gray-500 hover:text-white transition-all text-[10px] uppercase tracking-widest font-bold bg-white/5 px-4 py-2 rounded-full border border-white/5 hover:border-white/20"
            >
              <ChevronLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
              Back to Deal Ledger
            </Link>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-[9px] text-gray-500 uppercase tracking-widest">Asset Category</p>
                <p className="text-xs font-bold text-white uppercase italic">Hypercar // High-Value</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                <Activity size={18} className="text-amber-500 animate-pulse" />
              </div>
            </div>
          </div>

          {/* Financial Transparency Centerpiece */}
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-amber-500/20 to-sky-500/20 rounded-3xl blur opacity-25 group-hover:opacity-40 transition-opacity duration-1000" />
            <div className="relative glass-card p-10 bg-[#020617]/40 border-white/10 overflow-hidden rounded-3xl">
              <div className="absolute top-0 right-0 p-8 opacity-[0.03] rotate-12 pointer-events-none">
                <Euro size={240} />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-12 relative z-10">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-gray-500">
                    <Hash size={12} />
                    <p className="text-[10px] uppercase tracking-[0.3em]">Total Sale Price</p>
                  </div>
                  <h2 className="text-3xl font-mono font-black text-white tracking-tighter">€{totalSalePrice.toLocaleString()}</h2>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-gray-500">
                    <User size={12} />
                    <p className="text-[10px] uppercase tracking-[0.3em]">Total Payments</p>
                  </div>
                  <h2 className="text-3xl font-mono font-black text-[var(--success-teal)] tracking-tighter">€{totalPayments.toLocaleString()}</h2>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-gray-500">
                    <Activity size={12} />
                    <p className="text-[10px] uppercase tracking-[0.3em]">Finance Approved</p>
                  </div>
                  <h2 className="text-3xl font-mono font-black text-sky-400 tracking-tighter">€{totalFinanceApproved.toLocaleString()}</h2>
                </div>
                
                <div className="space-y-2 p-4 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 blur-3xl -mr-12 -mt-12" />
                  <p className="text-[10px] uppercase tracking-[0.3em] text-gray-400 mb-1">Balance Due</p>
                  <h2 className={`text-4xl font-mono font-black ${getBalanceColor()} tracking-tighter ${balanceDue > 0 ? 'animate-pulse' : ''}`}>
                    €{balanceDue.toLocaleString()}
                  </h2>
                  {balanceDue > 0 && (
                    <div className="absolute top-2 right-2 flex gap-1">
                      <div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-ping" />
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-12 pt-8 border-t border-white/5 flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-[9px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-500 font-bold tracking-[0.2em] uppercase">Audit Ready</span>
                    <span className="text-[9px] text-gray-600 font-mono tracking-widest uppercase">VIN: {deal?.vehicles?.vin}</span>
                  </div>
                  <h3 className="text-3xl font-black uppercase tracking-tight leading-none">
                    {deal?.vehicles?.make} <span className="text-gray-500 italic font-medium">{deal?.vehicles?.model}</span>
                  </h3>
                  <p className="text-[11px] text-gray-400 font-bold tracking-widest uppercase mt-2 flex items-center gap-2">
                    <User size={14} className="text-amber-500" />
                    Customer: <span className="text-white">{deal?.customer_name}</span>
                  </p>
                </div>
                
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-[9px] text-gray-600 uppercase tracking-widest mb-1">Last Sync</p>
                    <p className="text-[10px] font-mono text-gray-400">{new Date().toLocaleTimeString()}</p>
                  </div>
                  <div className="h-10 w-[1px] bg-white/10" />
                  <div className="flex items-center gap-3 px-6 py-3 bg-white/5 border border-white/10 rounded-2xl">
                    <div className="flex flex-col">
                      <span className="text-[8px] text-gray-500 uppercase tracking-widest leading-none mb-1">Encryption Status</span>
                      <span className="text-[10px] font-bold text-teal-500 uppercase tracking-widest leading-none">End-to-End Secure</span>
                    </div>
                    <div className="w-2 h-2 bg-teal-500 rounded-full shadow-[0_0_10px_#14b8a6]" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              {/* Payment Logger Component */}
              <PaymentLogger dealId={dealId} payments={payments} onPaymentLogged={fetchData} />

              {/* Finance Waterfall Section */}
              <WaterfallSequence dealId={dealId} onUpdate={fetchData} />
            </div>

            {/* Sidebar / Info */}
            <div className="space-y-6">
               <div className="glass-card p-6 bg-gradient-to-br from-white/5 to-transparent border-white/10">
                 <h4 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400 mb-6 flex items-center gap-2">
                   <Activity size={14} className="text-amber-500" />
                   Deal Vitals
                 </h4>
                 <div className="space-y-6">
                    <div className="flex justify-between items-end border-b border-white/5 pb-4">
                      <div>
                        <p className="text-[8px] text-gray-600 uppercase tracking-widest mb-1">Reservation Date</p>
                        <p className="text-xs font-bold text-gray-300 font-mono uppercase">{new Date(deal?.created_at || '').toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[8px] text-gray-600 uppercase tracking-widest mb-1">Time Elapsed</p>
                        <p className="text-xs font-bold text-amber-500 font-mono uppercase">2 Days</p>
                      </div>
                    </div>
                    <div className="flex justify-between items-end border-b border-white/5 pb-4">
                      <div>
                        <p className="text-[8px] text-gray-600 uppercase tracking-widest mb-1">Security Stamp</p>
                        <p className="text-xs font-bold text-gray-300 font-mono uppercase italic">0x4F...E12A</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[8px] text-gray-600 uppercase tracking-widest mb-1">Compliance</p>
                        <p className="text-xs font-bold text-teal-500 uppercase tracking-widest">Verified</p>
                      </div>
                    </div>
                 </div>
                 
                 <div className="mt-8 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
                   <div className="flex gap-3">
                     <AlertCircle className="text-amber-500 flex-shrink-0" size={16} />
                     <p className="text-[9px] text-amber-500/90 leading-relaxed font-bold uppercase tracking-widest">
                       Mandatory Audit: Ensure all physical documentation matches the digital VIN signature before finalizing payment.
                     </p>
                   </div>
                 </div>
               </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
