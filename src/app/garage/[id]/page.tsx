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
    if (balanceDue > 0) return 'text-amber-600';
    if (balanceDue === 0) return 'text-emerald-600';
    return 'text-rose-600';
  };



  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 border-4 border-slate-100 border-t-navy-accent rounded-full animate-spin" />
        <p className="text-[10px] uppercase tracking-[0.5em] text-slate-400 font-bold">Syncing Deal Logic...</p>
      </div>
    );
  }

  const getActualVehicleImage = (make: string, model: string, defaultUrl?: string) => {
    const m = make?.toLowerCase() || '';
    const mod = model?.toLowerCase() || '';
    
    if (m.includes('aston') || mod.includes('db12')) return '/cars/aston-martin-db12.png';
    if (m.includes('porsche') && mod.includes('gt3')) return '/cars/porsche-911-gt3.png';
    if (m.includes('ferrari')) return '/cars/ferrari-f8-tributo.png';
    if (m.includes('lamborghini')) return '/cars/lamborghini-revuelto.png';
    if (m.includes('bentley')) return '/cars/bentley-bentayga.png';
    
    return defaultUrl || 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?q=80&w=800&auto=format&fit=crop';
  };

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans text-navy-accent">
      <TopNav />
      
      <main className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-[1200px] mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
          
          <div className="flex items-center justify-between">
            <Link 
              href="/garage"
              className="group flex items-center gap-3 text-slate-400 hover:text-navy-accent transition-all text-[10px] uppercase tracking-widest font-bold bg-slate-50 px-4 py-2 rounded-full border border-navy-border hover:border-navy-accent"
            >
              <ChevronLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
              Back to Deal Ledger
            </Link>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-[9px] text-slate-400 uppercase tracking-widest">Asset Category</p>
                <p className="text-xs font-bold text-navy-accent uppercase italic">Hypercar // High-Value</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-slate-50 border border-navy-border flex items-center justify-center">
                <Activity size={18} className="text-amber-600 animate-pulse" />
              </div>
            </div>
          </div>

          {/* Financial Transparency Centerpiece */}
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-amber-600/10 to-sky-600/10 rounded-3xl blur opacity-25 group-hover:opacity-40 transition-opacity duration-1000" />
            <div className="relative glass-card p-6 md:p-10 bg-white border-navy-border shadow-xl overflow-hidden rounded-3xl">
              <div className="absolute top-0 right-0 p-8 opacity-[0.03] rotate-12 pointer-events-none hidden md:block text-navy-accent">
                <Euro size={240} />
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 md:gap-12 relative z-10">
                <div className="space-y-1 md:space-y-2">
                  <div className="flex items-center gap-2 text-slate-400">
                    <Hash size={12} />
                    <p className="text-[8px] md:text-[10px] uppercase tracking-[0.3em]">Total Sale Price</p>
                  </div>
                  <h2 className="text-xl md:text-3xl font-mono font-black text-navy-accent tracking-tighter">€{totalSalePrice.toLocaleString()}</h2>
                </div>
                
                <div className="space-y-1 md:space-y-2">
                  <div className="flex items-center gap-2 text-slate-400">
                    <User size={12} />
                    <p className="text-[8px] md:text-[10px] uppercase tracking-[0.3em]">Total Payments</p>
                  </div>
                  <h2 className="text-xl md:text-3xl font-mono font-black text-emerald-600 tracking-tighter">€{totalPayments.toLocaleString()}</h2>
                </div>

                <div className="space-y-1 md:space-y-2">
                  <div className="flex items-center gap-2 text-slate-400">
                    <Activity size={12} />
                    <p className="text-[8px] md:text-[10px] uppercase tracking-[0.3em]">Finance Approved</p>
                  </div>
                  <h2 className="text-xl md:text-3xl font-mono font-black text-sky-600 tracking-tighter">€{totalFinanceApproved.toLocaleString()}</h2>
                </div>
                
                <div className="space-y-1 md:space-y-2 p-4 bg-slate-50 rounded-2xl border border-navy-border shadow-inner relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 blur-3xl -mr-12 -mt-12" />
                  <p className="text-[8px] md:text-[10px] uppercase tracking-[0.3em] text-slate-400 mb-1">Balance Due</p>
                  <h2 className={`text-2xl md:text-4xl font-mono font-black ${getBalanceColor()} tracking-tighter ${balanceDue > 0 ? 'animate-pulse' : ''}`}>
                    €{balanceDue.toLocaleString()}
                  </h2>
                  {balanceDue > 0 && (
                    <div className="absolute top-2 right-2 flex gap-1">
                      <div className="w-1.5 h-1.5 bg-amber-600 rounded-full animate-ping" />
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-8 md:mt-12 pt-6 md:pt-8 border-t border-slate-100 flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="flex flex-col md:flex-row gap-6 md:gap-10">
                  {/* Actual Car Image */}
                  <div className="w-full md:w-64 h-32 md:h-40 rounded-2xl overflow-hidden border border-navy-border bg-slate-50 relative group-hover:shadow-2xl transition-all duration-500">
                    <img 
                      src={getActualVehicleImage(deal?.vehicles?.make || '', deal?.vehicles?.model || '', deal?.vehicles?.image_url)} 
                      alt={deal?.vehicles?.model}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-3 mb-1">
                      <span className="text-[8px] md:text-[9px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 font-bold tracking-[0.2em] uppercase border border-amber-100">Audit Ready</span>
                      <span className="text-[8px] md:text-[9px] text-slate-400 font-mono tracking-widest uppercase truncate max-w-[200px]">VIN: {deal?.vehicles?.vin}</span>
                    </div>
                    <h3 className="text-xl md:text-3xl font-black uppercase tracking-tight leading-none text-navy-accent">
                      {deal?.vehicles?.make} <span className="text-slate-400 italic font-medium">{deal?.vehicles?.model}</span>
                    </h3>
                    <p className="text-[10px] md:text-[11px] text-slate-500 font-bold tracking-widest uppercase mt-2 flex items-center gap-2">
                      <User size={14} className="text-amber-600" />
                      Customer: <span className="text-navy-accent">{deal?.customer_name}</span>
                    </p>
                  </div>
                </div>
                
                <div className="flex flex-wrap items-center gap-4 md:gap-6 pt-4 md:pt-0 border-t md:border-t-0 border-slate-100 md:border-none">
                  <div className="text-right">
                    <p className="text-[8px] md:text-[9px] text-slate-400 uppercase tracking-widest mb-1">Last Sync</p>
                    <p className="text-[9px] md:text-[10px] font-mono text-slate-500 font-bold">{new Date().toLocaleTimeString()}</p>
                  </div>
                  <div className="h-10 w-[1px] bg-slate-100 hidden sm:block" />
                  <div className="flex items-center gap-3 px-4 md:px-6 py-2 md:py-3 bg-slate-50 border border-navy-border rounded-2xl flex-1 md:flex-none shadow-sm">
                    <div className="flex flex-col">
                      <span className="text-[7px] md:text-[8px] text-slate-400 uppercase tracking-widest leading-none mb-1">Security Status</span>
                      <span className="text-[8px] md:text-[10px] font-bold text-emerald-600 uppercase tracking-widest leading-none">Secure</span>
                    </div>
                    <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-emerald-600 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
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
                    <div className="flex justify-between items-end border-b border-slate-100 pb-4">
                      <div>
                        <p className="text-[8px] text-slate-400 uppercase tracking-widest mb-1">Reservation Date</p>
                        <p className="text-xs font-bold text-navy-accent font-mono uppercase">{new Date(deal?.created_at || '').toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[8px] text-slate-400 uppercase tracking-widest mb-1">Time Elapsed</p>
                        <p className="text-xs font-bold text-amber-600 font-mono uppercase">2 Days</p>
                      </div>
                    </div>
                    <div className="flex justify-between items-end border-b border-slate-100 pb-4">
                      <div>
                        <p className="text-[8px] text-slate-400 uppercase tracking-widest mb-1">Security Stamp</p>
                        <p className="text-xs font-bold text-navy-accent font-mono uppercase italic">0x4F...E12A</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[8px] text-slate-400 uppercase tracking-widest mb-1">Compliance</p>
                        <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest">Verified</p>
                      </div>
                    </div>
                 </div>
                 
                 <div className="mt-8 p-4 rounded-xl bg-amber-50 border border-amber-200">
                   <div className="flex gap-3">
                     <AlertCircle className="text-amber-600 flex-shrink-0" size={16} />
                     <p className="text-[9px] text-amber-600 leading-relaxed font-bold uppercase tracking-widest">
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
