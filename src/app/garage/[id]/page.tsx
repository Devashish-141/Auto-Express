'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import TopNav from '@/components/dashboard/TopNav';
import PaymentLogger from '@/components/dashboard/PaymentLogger';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, 
  CheckCircle2,
  Euro,
  User,
  Hash,
  Activity,
  AlertCircle
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
}

interface Payment {
  id: string;
  amount: number;
  is_voided: boolean;
  payment_date: string;
  method: string;
  rep_code: string;
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
    try {
      const { data: dealData, error: dealError } = await supabase
        .from('deals')
        .select(`
          id, 
          customer_name, 
          status,
          created_at,
          vehicles (make, model, price, vin, image_url)
        `)
        .eq('id', dealId)
        .single();

      if (dealError || !dealData) {
        router.push('/garage');
        return;
      }
      
      setDeal(dealData as any);

      const { data: paymentsData } = await supabase
        .from('payments')
        .select('id, amount, is_voided, payment_date, method, rep_code')
        .eq('deal_id', dealId)
        .order('payment_date', { ascending: false });

      if (paymentsData) setPayments(paymentsData);

      const { data: financeData } = await supabase
        .from('finance_apps')
        .select('id, lender_name, status, approved_amount')
        .eq('deal_id', dealId);

      if (financeData) setFinanceApps(financeData);
    } catch (err) {
      router.push('/garage');
    } finally {
      setLoading(false);
    }
  }, [dealId, router]);

  useEffect(() => {
    fetchData();
    const paymentsSub = supabase.channel('payments-live').on('postgres_changes', { event: '*', schema: 'public', table: 'payments', filter: `deal_id=eq.${dealId}` }, () => fetchData()).subscribe();
    const financeSub = supabase.channel('finance-live').on('postgres_changes', { event: '*', schema: 'public', table: 'finance_apps', filter: `deal_id=eq.${dealId}` }, () => fetchData()).subscribe();
    return () => {
      supabase.removeChannel(paymentsSub);
      supabase.removeChannel(financeSub);
    };
  }, [dealId, fetchData]);

  const totalSalePrice = deal?.vehicles?.price || 0;
  const totalPayments = payments.reduce((acc, p) => p.is_voided ? acc : acc + Number(p.amount), 0);
  const totalFinanceApproved = financeApps.reduce((acc, a) => a.status === 'approved' ? acc + (Number(a.approved_amount) || 0) : acc, 0);
  const balanceDue = totalSalePrice - totalPayments - totalFinanceApproved;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin" />
        <p className="text-[10px] uppercase tracking-[0.5em] text-black font-black">Syncing Ledger...</p>
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
    <div className="min-h-screen bg-background flex flex-col font-sans text-foreground">
      <TopNav />
      
      <main className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-[1400px] mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
          
          <div className="flex items-center justify-between">
            <Link 
              href="/garage"
              className="group flex items-center gap-3 text-black hover:text-blue-600 transition-all text-[10px] font-black uppercase tracking-[0.2em] bg-white px-6 py-3 rounded-2xl border border-slate-200 hover:border-blue-500 shadow-sm"
            >
              <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
              Return to Ledger
            </Link>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-[9px] text-black uppercase tracking-[0.3em] font-black">Asset Status</p>
                <p className="text-xs font-black text-teal-600 uppercase italic tracking-tighter">Verified // Financial Hold</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center">
                <Activity size={20} className="text-amber-500 animate-pulse" />
              </div>
            </div>
          </div>

          <div className="bg-white p-8 md:p-12 rounded-[2.5rem] border border-slate-200 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-12 opacity-5 rotate-12 pointer-events-none hidden md:block text-foreground">
              <Euro size={240} />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 md:gap-16 relative z-10">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-black">
                  <Hash size={14} />
                  <p className="text-[9px] uppercase tracking-[0.4em] font-black">Market Value</p>
                </div>
                <h2 className="text-2xl md:text-4xl font-black font-mono text-foreground tracking-tighter italic">€{totalSalePrice.toLocaleString()}</h2>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-black">
                  <User size={14} />
                  <p className="text-[9px] uppercase tracking-[0.4em] font-black">Realized Cash</p>
                </div>
                <h2 className="text-2xl md:text-4xl font-black font-mono text-teal-600 tracking-tighter italic">€{totalPayments.toLocaleString()}</h2>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-black">
                  <Activity size={14} />
                  <p className="text-[9px] uppercase tracking-[0.4em] font-black">Finance Credit</p>
                </div>
                <h2 className="text-2xl md:text-4xl font-black font-mono text-blue-600 tracking-tighter italic">€{totalFinanceApproved.toLocaleString()}</h2>
              </div>
              
              <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200 relative overflow-hidden">
                <p className="text-[9px] uppercase tracking-[0.4em] text-black font-black mb-2">Remaining Balance</p>
                <h2 className={`text-3xl md:text-5xl font-black font-mono tracking-tighter ${balanceDue > 0 ? 'text-amber-600 animate-pulse' : 'text-teal-600'}`}>
                  €{balanceDue.toLocaleString()}
                </h2>
              </div>
            </div>

            <div className="mt-12 pt-10 border-t border-slate-100 flex flex-col md:flex-row md:items-end justify-between gap-8">
              <div className="flex flex-col md:flex-row gap-8 md:gap-12 items-center">
                <div className="w-full md:w-80 h-40 md:h-48 rounded-3xl overflow-hidden border border-slate-200 bg-slate-50 relative shadow-xl group-hover:border-blue-500/30 transition-all duration-500">
                  <img 
                    src={getActualVehicleImage(deal?.vehicles?.make || '', deal?.vehicles?.model || '', deal?.vehicles?.image_url)} 
                    alt={deal?.vehicles?.model}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-[9px] px-3 py-1 rounded-full bg-amber-50 text-amber-600 font-black tracking-[0.3em] uppercase border border-amber-100">Audit Secured</span>
                    <span className="text-[9px] text-black font-mono tracking-widest uppercase">VIN: {deal?.vehicles?.vin}</span>
                  </div>
                  <h3 className="text-3xl md:text-5xl font-black uppercase tracking-tighter leading-none text-foreground italic">
                    {deal?.vehicles?.make} <span className="text-black font-normal not-italic">{deal?.vehicles?.model}</span>
                  </h3>
                  <div className="flex items-center gap-3 mt-4">
                    <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100">
                      <User size={16} />
                    </div>
                    <p className="text-[10px] md:text-xs text-black font-bold tracking-[0.2em] uppercase force-black">
                      Client Protocol: <span className="force-black">{deal?.customer_name}</span>
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <p className="text-[9px] text-black uppercase tracking-[0.3em] font-black mb-1">Telemetry Sync</p>
                  <p className="text-[10px] font-mono text-black font-black">{new Date().toLocaleTimeString()}</p>
                </div>
                <div className="bg-teal-50 border border-teal-100 px-6 py-4 rounded-3xl flex items-center gap-4 shadow-sm">
                  <div className="flex flex-col">
                    <span className="text-[8px] text-black uppercase tracking-widest mb-1 font-black">Protocol Status</span>
                    <span className="text-[10px] font-black text-teal-600 uppercase tracking-[0.2em]">Verified</span>
                  </div>
                  <div className="w-2 h-2 bg-teal-500 rounded-full shadow-[0_0_15px_rgba(20,184,166,0.3)] animate-pulse" />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2 space-y-12">
              <PaymentLogger dealId={dealId} payments={payments} onPaymentLogged={fetchData} />
              <WaterfallSequence dealId={dealId} onUpdate={fetchData} />
            </div>

            <div className="space-y-8">
               <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                 <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-black mb-8 flex items-center gap-3">
                   <Activity size={16} className="text-amber-500" />
                   Deal Vitals
                 </h4>
                 <div className="space-y-8">
                    <div className="flex justify-between items-end border-b border-slate-100 pb-6">
                      <div>
                        <p className="text-[9px] text-black uppercase tracking-widest mb-1 font-black">Acquisition Date</p>
                        <p className="text-xs font-black text-foreground font-mono uppercase italic">{new Date(deal?.created_at || '').toLocaleDateString('en-IE')}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[9px] text-black uppercase tracking-widest mb-1 font-black">Protocol Age</p>
                        <p className="text-xs font-black text-amber-600 font-mono uppercase">Active</p>
                      </div>
                    </div>
                    <div className="flex justify-between items-end border-b border-slate-100 pb-6">
                      <div>
                        <p className="text-[9px] text-black uppercase tracking-widest mb-1 font-black">Digital Signature</p>
                        <p className="text-xs font-black text-blue-600 font-mono uppercase italic">SECURED-SHA256</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[9px] text-black uppercase tracking-widest mb-1 font-black">Compliance</p>
                        <p className="text-[10px] font-black text-teal-600 uppercase tracking-[0.2em] italic">SECURE</p>
                      </div>
                    </div>
                 </div>
                 
                 <div className="mt-10 p-5 rounded-2xl bg-amber-50 border border-amber-100">
                   <div className="flex gap-4">
                     <AlertCircle className="text-amber-500 flex-shrink-0" size={20} />
                     <p className="text-[9px] text-amber-600 leading-relaxed font-black uppercase tracking-widest">
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
