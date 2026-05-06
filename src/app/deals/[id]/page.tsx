'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import TopNav from '@/components/dashboard/TopNav';
import { ChevronLeft, Car, User, Calendar, ShieldCheck, CreditCard, Lock, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { getDeal, closeDeal } from '@/lib/data';
import { useToast } from '@/context/ToastContext';
import InvoiceSection from '@/components/dashboard/InvoiceSection';
import VRTWorkflowCard from '@/components/dashboard/VRTWorkflowCard';

export default function DealDetailPage() {
  const params = useParams();
  const router = useRouter();
  const dealId = params.id as string;
  const [deal, setDeal] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const { showToast } = useToast();

  const fetchDeal = useCallback(async () => {
    try {
      const data = await getDeal(dealId);
      setDeal(data);
    } catch (error) {
      console.error('Error fetching deal:', error);
      showToast({ message: 'Failed to load deal details', type: 'error' });
    } finally {
      setLoading(false);
    }
  }, [dealId, showToast]);

  useEffect(() => {
    fetchDeal();
  }, [fetchDeal]);

  const handleCloseDeal = async () => {
    if (!deal) return;
    setActionLoading(true);
    try {
      await closeDeal(deal.id, deal.vehicle_id);
      showToast({ message: 'Deal Closed Successfully', type: 'success' });
      fetchDeal();
    } catch (error) {
      console.error('Error closing deal:', error);
      showToast({ message: 'Failed to close deal', type: 'error' });
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-navy-accent/20 border-t-navy-accent rounded-full animate-spin" />
      </div>
    );
  }

  if (!deal) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <p className="text-slate-500 uppercase tracking-widest font-bold">Deal not found</p>
        <Link href="/" className="text-navy-accent hover:underline uppercase tracking-widest text-xs font-bold">Back to Dashboard</Link>
      </div>
    );
  }

  const isClosed = deal.stage === 'closed';
  const isRegistered = deal.stage === 'registered' || isClosed;
  const stageColors: Record<string, string> = {
    pending: 'border-amber-500/30 text-amber-500 bg-amber-500/10',
    invoiced: 'border-blue-500/30 text-blue-500 bg-blue-500/10',
    registered: 'border-teal-500/30 text-teal-500 bg-teal-500/10',
    closed: 'border-gray-500/30 text-slate-400 bg-gray-500/10',
  };

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans text-foreground">
      <TopNav />
      
      <main className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-[1200px] mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          
          <div className="flex items-center justify-between">
            <Link 
              href="/"
              className="flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors text-xs uppercase tracking-widest font-bold"
            >
              <ChevronLeft size={16} />
              Back to Dashboard
            </Link>
            
            <div className="flex items-center gap-3">
              <span className="text-[10px] uppercase tracking-[0.2em] text-slate-500">Deal Stage:</span>
              <span className={`px-3 py-1 rounded-full border ${stageColors[deal.stage || 'pending']} text-[10px] font-bold uppercase`}>
                {deal.stage || 'Pending'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Deal Header Card */}
              <div className={`glass-card p-8 relative overflow-hidden ${isClosed ? 'opacity-90' : ''}`}>
                {isClosed && (
                  <div className="absolute top-0 right-0 p-4 z-20">
                    <div className="flex items-center gap-2 px-4 py-1 bg-teal-500/20 border border-teal-500/30 rounded-full text-teal-500 text-[10px] font-black uppercase tracking-widest">
                      <Lock size={12} />
                      Immutable Record
                    </div>
                  </div>
                )}
                
                <div className="flex items-start justify-between mb-8">
                  <div>
                    <h1 className="text-4xl font-bold tracking-tight mb-2 uppercase">Deal Detail</h1>
                    <p className="font-mono text-slate-500 text-sm tracking-widest">{dealId}</p>
                  </div>
                  <div className="w-16 h-16 rounded-2xl bg-slate-100 border border-white/10 flex items-center justify-center">
                    <Car size={32} className="text-slate-400" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-8 py-8 border-y border-white/5">
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-slate-500 mb-4">Customer Details</p>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                        <User size={18} className="text-slate-400" />
                      </div>
                      <div>
                        <p className="text-sm font-bold">{deal.customer_name || 'Walk-in Customer'}</p>
                        <p className="text-xs text-slate-500">Rep: {deal.rep_code}</p>
                      </div>
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-slate-500 mb-4">Vehicle Identity</p>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                        <ShieldCheck size={18} className="text-slate-400" />
                      </div>
                      <div>
                        <p className="text-sm font-bold uppercase">{deal.vehicle?.make} {deal.vehicle?.model}</p>
                        <p className="text-xs text-slate-500 font-mono">{deal.vehicle?.vin}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Workflow Sections */}
                <div className="mt-8 space-y-12">
                  {/* Stage 1: Finance Summary */}
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs uppercase tracking-widest text-slate-500">Finance Application Pipeline</h3>
                      {deal.finance_apps?.some((f: any) => f.status === 'approved') && (
                        <span className="text-[10px] text-teal-500 font-bold uppercase tracking-widest flex items-center gap-1">
                          <CheckCircle2 size={12} /> Approved
                        </span>
                      )}
                    </div>
                    <div className="space-y-4">
                      {['Finance Ireland', 'Close Brothers', 'Finance4U'].map((lender) => {
                        const app = deal.finance_apps?.find((f: any) => f.lender_name === lender);
                        const status = app?.status || 'Locked';
                        const statusColors: Record<string, string> = {
                          approved: 'text-teal-500',
                          declined: 'text-rose-500',
                          active: 'text-amber-500',
                          Locked: 'text-slate-600'
                        };
                        return (
                          <div key={lender} className="flex items-center justify-between p-4 rounded-xl bg-slate-100 border border-white/10">
                            <div className="flex items-center gap-3">
                              <div className={`w-2 h-2 rounded-full ${statusColors[status].replace('text', 'bg')}`} />
                              <span className="text-sm font-medium">{lender}</span>
                            </div>
                            <div className="flex items-center gap-4">
                              {app?.approved_amount && (
                                <span className="text-xs font-mono font-bold">€{app.approved_amount.toLocaleString()}</span>
                              )}
                              <span className={`text-[10px] uppercase font-bold tracking-widest ${statusColors[status]}`}>
                                {status}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Stage 2: Invoice & VRT */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-white/5">
                    <InvoiceSection 
                      dealId={dealId} 
                      currentCode={deal.finance_company_code} 
                      stage={deal.stage || 'pending'}
                      onUpdate={fetchDeal}
                    />
                    <VRTWorkflowCard 
                      dealId={dealId}
                      vehicleId={deal.vehicle_id}
                      stage={deal.stage || 'pending'}
                      currentVrt={deal.vrt_amount}
                      currentReg={deal.reg_number}
                      onUpdate={fetchDeal}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar Actions */}
            <div className="space-y-6">
              {/* Close Deal Section - Teal Accent */}
              <div className={`glass-card p-6 border border-teal-500/20 bg-teal-500/5 shadow-[0_0_40px_rgba(20,184,166,0.05)]`}>
                <h4 className="text-xs uppercase tracking-widest text-teal-500 mb-4 font-bold">Deal Finalization</h4>
                <p className="text-[10px] text-slate-500 mb-6 leading-relaxed uppercase tracking-wider">
                  Closing this deal will permanently update the asset registry and lock all financial records.
                </p>
                
                <button 
                  onClick={handleCloseDeal}
                  disabled={!isRegistered || isClosed || actionLoading}
                  className={`w-full py-4 rounded-xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] transition-all
                    ${isClosed 
                      ? 'bg-teal-500/20 text-teal-500 border border-teal-500/30' 
                      : 'bg-teal-500 text-white hover:bg-teal-600 shadow-[0_0_20px_rgba(20,184,166,0.3)] disabled:opacity-30 disabled:grayscale'
                    }
                  `}
                >
                  {actionLoading ? (
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  ) : isClosed ? (
                    <>
                      <CheckCircle2 size={16} />
                      Deal Closed
                    </>
                  ) : (
                    <>
                      <Lock size={16} />
                      Close Deal
                    </>
                  )}
                </button>

                {!isRegistered && !isClosed && (
                  <p className="mt-4 text-[8px] text-slate-600 text-center uppercase tracking-widest">
                    Locked until VRT & Registration are finalized
                  </p>
                )}
              </div>

              {/* Financial Summary Sidebar */}
              <div className="glass-card p-6">
                <h4 className="text-xs uppercase tracking-widest text-slate-500 mb-6 font-bold">Financial Summary</h4>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-[10px] uppercase tracking-widest text-slate-400">Vehicle Price</span>
                    <span className="text-xs font-mono font-bold">€{deal.vehicle?.price?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[10px] uppercase tracking-widest text-slate-400">Payments Received</span>
                    <span className="text-xs font-mono font-bold text-teal-500">
                      €{deal.payments?.reduce((acc: number, p: any) => p.is_voided ? acc : acc + Number(p.amount), 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[10px] uppercase tracking-widest text-slate-400">Finance Approved</span>
                    <span className="text-xs font-mono font-bold text-blue-400">
                      €{deal.finance_apps?.reduce((acc: number, f: any) => f.status === 'approved' ? acc + (Number(f.approved_amount) || 0) : acc, 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="border-t border-white/5 pt-6 flex flex-col gap-2">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] uppercase tracking-widest text-white font-bold">Remaining</span>
                      <span className="text-lg font-mono font-bold text-amber-500">
                        €{(
                          Number(deal.vehicle?.price || 0) - 
                          deal.payments?.reduce((acc: number, p: any) => p.is_voided ? acc : acc + Number(p.amount), 0) -
                          deal.finance_apps?.reduce((acc: number, f: any) => f.status === 'approved' ? acc + (Number(f.approved_amount) || 0) : acc, 0)
                        ).toLocaleString()}
                      </span>
                    </div>
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
