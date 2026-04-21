'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  PlusCircle, 
  Banknote, 
  CreditCard, 
  ArrowRightLeft, 
  AlertTriangle, 
  CheckCircle2, 
  Loader2,
  Trash2,
  ShieldAlert,
  Calendar,
  User,
  History
} from 'lucide-react';
import { useRep } from '@/context/RepContext';
import { useToast } from '@/context/ToastContext';
import { logPayment, voidPayment } from '@/lib/data';

type PaymentMethod = 'Cash' | 'Card' | 'Transfer';

interface Payment {
  id: string;
  amount: number;
  is_voided: boolean;
  payment_date: string;
  method: string;
  rep_code: string;
  void_reason?: string;
}

interface PaymentLoggerProps {
  dealId: string;
  payments: Payment[];
  onPaymentLogged?: () => void;
}

const METHOD_CONFIG: Record<string, { icon: React.ReactNode; label: string; color: string; border: string }> = {
  Cash: {
    icon: <Banknote size={16} />,
    label: 'Cash',
    color: 'text-emerald-600',
    border: 'border-emerald-200 bg-emerald-50',
  },
  Card: {
    icon: <CreditCard size={16} />,
    label: 'Card',
    color: 'text-sky-600',
    border: 'border-sky-200 bg-sky-50',
  },
  Transfer: {
    icon: <ArrowRightLeft size={16} />,
    label: 'Bank Transfer',
    color: 'text-violet-600',
    border: 'border-violet-200 bg-violet-50',
  },
};

export default function PaymentLogger({ dealId, payments, onPaymentLogged }: PaymentLoggerProps) {
  const { rep } = useRep();
  const { showToast } = useToast();

  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [method, setMethod] = useState<PaymentMethod>('Cash');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [amountError, setAmountError] = useState('');
  
  // Void state
  const [voidingId, setVoidingId] = useState<string | null>(null);
  const [voidReason, setVoidReason] = useState('');
  const [isVoiding, setIsVoiding] = useState(false);

  const validateAmount = (val: string) => {
    const num = parseFloat(val);
    if (!val || isNaN(num) || num <= 0) {
      setAmountError('Enter a valid amount greater than €0');
      return false;
    }
    setAmountError('');
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rep) return;
    if (!validateAmount(amount)) return;

    setIsSubmitting(true);
    try {
      await logPayment({
        dealId,
        amount: parseFloat(amount),
        date,
        method,
        repCode: rep,
      });

      showToast({
        message: `€${parseFloat(amount).toLocaleString()} logged by ${rep}`,
        type: 'success',
      });

      setAmount('');
      setDate(new Date().toISOString().split('T')[0]);
      setMethod('Cash');
      onPaymentLogged?.();
    } catch (err: any) {
      showToast({
        message: err?.message ?? 'Failed to log payment.',
        type: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVoid = async () => {
    if (!voidingId || !voidReason) return;
    
    setIsVoiding(true);
    try {
      await voidPayment(voidingId, voidReason);
      showToast({
        message: 'Payment voided successfully',
        type: 'success',
      });
      setVoidingId(null);
      setVoidReason('');
      onPaymentLogged?.();
    } catch (err: any) {
      showToast({
        message: 'Failed to void payment',
        type: 'error',
      });
    } finally {
      setIsVoiding(false);
    }
  };

  const totalReceived = payments.reduce((acc, p) => p.is_voided ? acc : acc + Number(p.amount), 0);

  return (
    <div className="space-y-8">
      {/* Entry Form */}
      <div className="glass-card p-8 relative overflow-hidden bg-white border-navy-border shadow-lg">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-xl font-black uppercase tracking-tight text-navy-accent">Log New Payment</h3>
            <p className="text-[10px] text-slate-400 uppercase tracking-[0.2em] mt-1 font-bold">
              Mandatory Attribution: <span className="text-amber-600">{rep ?? 'UNAUTHENTICATED'}</span>
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shadow-sm">
            <PlusCircle size={24} />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
          <div className="space-y-2">
            <label className="text-[9px] uppercase tracking-[0.3em] text-slate-400 font-bold ml-1">Amount (€)</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <span className="text-amber-600 font-mono text-sm">€</span>
              </div>
              <input
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full bg-slate-50 border border-navy-border rounded-2xl py-3 pl-10 pr-4 text-sm font-mono font-bold text-navy-accent focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 transition-all outline-none"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[9px] uppercase tracking-[0.3em] text-slate-400 font-bold ml-1">Transaction Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-slate-50 border border-navy-border rounded-2xl py-3 px-4 text-sm font-mono font-bold text-navy-accent focus:border-amber-500/50 outline-none [color-scheme:light]"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[9px] uppercase tracking-[0.3em] text-slate-400 font-bold ml-1">Payment Method</label>
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value as PaymentMethod)}
              className="w-full bg-slate-50 border border-navy-border rounded-2xl py-3 px-4 text-sm font-bold text-navy-accent focus:border-amber-500/50 outline-none appearance-none"
            >
              <option value="Cash">Cash Currency</option>
              <option value="Card">Credit/Debit Card</option>
              <option value="Transfer">Bank Transfer</option>
            </select>
          </div>

          <div className="md:col-span-3 mt-4">
            <button
              type="submit"
              disabled={!rep || isSubmitting}
              className="w-full bg-amber-600 text-white py-4 text-[10px] font-black uppercase tracking-[0.3em] rounded-2xl flex items-center justify-center gap-3 shadow-lg hover:bg-amber-500 transition-all"
            >
              {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle2 size={18} />}
              Commit Payment to Ledger
            </button>
          </div>
        </form>
      </div>

      {/* Audit List */}
      <div className="glass-card p-8 bg-slate-50 border border-navy-border rounded-3xl overflow-hidden shadow-sm">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white rounded-xl border border-navy-border">
              <History size={20} className="text-slate-400" />
            </div>
            <div>
              <h3 className="text-xl font-black uppercase tracking-tight text-navy-accent">Audit Trail</h3>
              <p className="text-[9px] text-slate-400 uppercase tracking-[0.2em] font-bold mt-1">Immutable Ledger Tracking</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[9px] text-slate-400 uppercase tracking-widest mb-1">Total Received</p>
            <p className="text-2xl font-mono font-black text-amber-600 tracking-tighter">€{totalReceived.toLocaleString()}</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          {/* Desktop Table */}
          <table className="w-full text-left hidden md:table">
            <thead>
              <tr className="border-b border-navy-border">
                <th className="pb-4 text-[9px] uppercase tracking-[0.2em] text-slate-400 font-black">Date</th>
                <th className="pb-4 text-[9px] uppercase tracking-[0.2em] text-slate-400 font-black">Method</th>
                <th className="pb-4 text-[9px] uppercase tracking-[0.2em] text-slate-400 font-black">Rep Code</th>
                <th className="pb-4 text-[9px] uppercase tracking-[0.2em] text-slate-400 font-black text-right">Amount</th>
                <th className="pb-4 text-[9px] uppercase tracking-[0.2em] text-slate-400 font-black text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {payments.map((p) => (
                <tr key={p.id} className={`group ${p.is_voided ? 'opacity-40 grayscale' : ''}`}>
                  <td className="py-4 text-xs font-mono font-bold text-slate-400">
                    {new Date(p.payment_date).toLocaleDateString()}
                  </td>
                  <td className="py-4">
                    <div className="flex items-center gap-2">
                      <span className={`p-1.5 rounded-lg border ${METHOD_CONFIG[p.method]?.border || 'border-navy-border'} ${METHOD_CONFIG[p.method]?.color || 'text-navy-accent'}`}>
                        {METHOD_CONFIG[p.method]?.icon || <Banknote size={12} />}
                      </span>
                      <span className="text-[10px] font-black uppercase tracking-widest text-navy-accent">{p.method}</span>
                    </div>
                  </td>
                  <td className="py-4">
                    <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                      <User size={12} className="text-slate-300" />
                      {p.rep_code}
                    </div>
                  </td>
                  <td className="py-4 text-right">
                    <p className={`text-sm font-mono font-black ${p.is_voided ? 'line-through text-slate-400' : 'text-navy-accent'}`}>
                      €{Number(p.amount).toLocaleString()}
                    </p>
                  </td>
                  <td className="py-4 text-right">
                    {!p.is_voided ? (
                      <button
                        onClick={() => setVoidingId(p.id)}
                        className="p-2 rounded-lg bg-rose-50 text-rose-600 opacity-0 group-hover:opacity-100 transition-all border border-rose-200 hover:bg-rose-600 hover:text-white"
                      >
                        <Trash2 size={14} />
                      </button>
                    ) : (
                      <span className="text-[8px] font-black uppercase tracking-widest text-rose-600 italic bg-rose-50 px-2 py-1 rounded-full border border-rose-100">
                        VOID: {p.void_reason}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-4">
            {payments.map((p) => (
              <div key={p.id} className={`p-4 rounded-2xl border border-navy-border bg-white ${p.is_voided ? 'opacity-40 grayscale' : ''} shadow-sm`}>
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2">
                    <span className={`p-1.5 rounded-lg border ${METHOD_CONFIG[p.method]?.border || 'border-navy-border'} ${METHOD_CONFIG[p.method]?.color || 'text-navy-accent'}`}>
                      {METHOD_CONFIG[p.method]?.icon || <Banknote size={12} />}
                    </span>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-navy-accent">{p.method}</p>
                      <p className="text-[8px] font-mono text-slate-400">{new Date(p.payment_date).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-mono font-black ${p.is_voided ? 'line-through text-slate-400' : 'text-navy-accent'}`}>
                      €{Number(p.amount).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-2 text-[9px] font-mono text-slate-400 uppercase tracking-widest">
                    <User size={10} />
                    Rep: {p.rep_code}
                  </div>
                  {!p.is_voided ? (
                    <button
                      onClick={() => setVoidingId(p.id)}
                      className="px-3 py-1.5 rounded-lg bg-rose-50 text-rose-600 text-[8px] font-black uppercase tracking-widest border border-rose-200"
                    >
                      Void
                    </button>
                  ) : (
                    <span className="text-[7px] font-black uppercase tracking-widest text-rose-600 italic bg-rose-50 px-2 py-1 rounded-full border border-rose-100">
                      VOIDED
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {payments.length === 0 && (
            <div className="py-12 text-center text-gray-600 uppercase tracking-[0.3em] text-[10px] font-bold">
              No transactions recorded
            </div>
          )}
        </div>
      </div>

      {/* Void Modal */}
      <AnimatePresence>
        {voidingId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-accent/40 backdrop-blur-md">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass-card p-8 max-w-md w-full border border-rose-200 bg-white shadow-2xl rounded-3xl"
            >
              <div className="flex flex-col items-center text-center gap-4">
                <div className="w-16 h-16 rounded-full bg-rose-50 flex items-center justify-center text-rose-600 border border-rose-100">
                  <ShieldAlert size={32} />
                </div>
                <div>
                  <h4 className="text-2xl font-black uppercase tracking-tight text-navy-accent">Void Transaction</h4>
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-2">
                    This action is permanent and will be logged in the audit trail.
                  </p>
                </div>
                
                <div className="w-full text-left space-y-2 mt-4">
                  <label className="text-[9px] uppercase tracking-[0.3em] text-slate-400 font-bold ml-1">Reason for Voiding</label>
                  <textarea
                    value={voidReason}
                    onChange={(e) => setVoidReason(e.target.value)}
                    placeholder="Describe why this payment is being voided..."
                    className="w-full bg-slate-50 border border-navy-border rounded-2xl p-4 text-sm text-navy-accent focus:border-rose-500/50 outline-none h-24 resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4 w-full mt-4">
                  <button
                    onClick={() => setVoidingId(null)}
                    className="py-3 px-6 rounded-2xl bg-slate-100 text-slate-500 text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleVoid}
                    disabled={!voidReason || isVoiding}
                    className="py-3 px-6 rounded-2xl bg-rose-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-rose-700 transition-all shadow-lg disabled:opacity-50"
                  >
                    {isVoiding ? 'Processing...' : 'Void Payment'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
