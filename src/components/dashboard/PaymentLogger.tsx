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
    color: 'text-emerald-400',
    border: 'border-emerald-500/40 bg-emerald-500/10',
  },
  Card: {
    icon: <CreditCard size={16} />,
    label: 'Card',
    color: 'text-sky-400',
    border: 'border-sky-500/40 bg-sky-500/10',
  },
  Transfer: {
    icon: <ArrowRightLeft size={16} />,
    label: 'Bank Transfer',
    color: 'text-violet-400',
    border: 'border-violet-500/40 bg-violet-500/10',
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
      <div className="glass-card p-8 relative overflow-hidden bg-[#020617]/40">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-xl font-black uppercase tracking-tight">Log New Payment</h3>
            <p className="text-[10px] text-gray-500 uppercase tracking-[0.2em] mt-1 font-bold">
              Mandatory Attribution: <span className="text-amber-500">{rep ?? 'UNAUTHENTICATED'}</span>
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
            <PlusCircle size={24} />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
          <div className="space-y-2">
            <label className="text-[9px] uppercase tracking-[0.3em] text-gray-500 font-bold ml-1">Amount (€)</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <span className="text-amber-500 font-mono text-sm">€</span>
              </div>
              <input
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full bg-black/40 border border-white/5 rounded-2xl py-3 pl-10 pr-4 text-sm font-mono font-bold text-white focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 transition-all outline-none"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[9px] uppercase tracking-[0.3em] text-gray-500 font-bold ml-1">Transaction Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-black/40 border border-white/5 rounded-2xl py-3 px-4 text-sm font-mono font-bold text-white focus:border-amber-500/50 outline-none [color-scheme:dark]"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[9px] uppercase tracking-[0.3em] text-gray-500 font-bold ml-1">Payment Method</label>
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value as PaymentMethod)}
              className="w-full bg-black/40 border border-white/5 rounded-2xl py-3 px-4 text-sm font-bold text-white focus:border-amber-500/50 outline-none appearance-none"
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
              className="w-full btn-primary py-4 text-[10px] font-black uppercase tracking-[0.3em] flex items-center justify-center gap-3 shadow-[0_10px_20px_rgba(245,158,11,0.2)]"
            >
              {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle2 size={18} />}
              Commit Payment to Ledger
            </button>
          </div>
        </form>
      </div>

      {/* Audit List */}
      <div className="glass-card p-8 bg-black/20 border-white/5 rounded-3xl overflow-hidden">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/5 rounded-xl border border-white/10">
              <History size={20} className="text-gray-400" />
            </div>
            <div>
              <h3 className="text-xl font-black uppercase tracking-tight">Audit Trail</h3>
              <p className="text-[9px] text-gray-500 uppercase tracking-[0.2em] font-bold mt-1">Immutable Ledger Tracking</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[9px] text-gray-500 uppercase tracking-widest mb-1">Total Received</p>
            <p className="text-2xl font-mono font-black text-amber-500 tracking-tighter">€{totalReceived.toLocaleString()}</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/5">
                <th className="pb-4 text-[9px] uppercase tracking-[0.2em] text-gray-600 font-black">Date</th>
                <th className="pb-4 text-[9px] uppercase tracking-[0.2em] text-gray-600 font-black">Method</th>
                <th className="pb-4 text-[9px] uppercase tracking-[0.2em] text-gray-600 font-black">Rep Code</th>
                <th className="pb-4 text-[9px] uppercase tracking-[0.2em] text-gray-600 font-black text-right">Amount</th>
                <th className="pb-4 text-[9px] uppercase tracking-[0.2em] text-gray-600 font-black text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {payments.map((p) => (
                <tr key={p.id} className={`group ${p.is_voided ? 'opacity-40 grayscale' : ''}`}>
                  <td className="py-4 text-xs font-mono font-bold text-gray-400">
                    {new Date(p.payment_date).toLocaleDateString()}
                  </td>
                  <td className="py-4">
                    <div className="flex items-center gap-2">
                      <span className={`p-1.5 rounded-lg border ${METHOD_CONFIG[p.method]?.border || 'border-white/5'} ${METHOD_CONFIG[p.method]?.color || 'text-white'}`}>
                        {METHOD_CONFIG[p.method]?.icon || <Banknote size={12} />}
                      </span>
                      <span className="text-[10px] font-black uppercase tracking-widest text-white">{p.method}</span>
                    </div>
                  </td>
                  <td className="py-4">
                    <div className="flex items-center gap-2 text-xs font-mono text-gray-500">
                      <User size={12} className="text-gray-600" />
                      {p.rep_code}
                    </div>
                  </td>
                  <td className="py-4 text-right">
                    <p className={`text-sm font-mono font-black ${p.is_voided ? 'line-through text-gray-600' : 'text-white'}`}>
                      €{Number(p.amount).toLocaleString()}
                    </p>
                  </td>
                  <td className="py-4 text-right">
                    {!p.is_voided ? (
                      <button
                        onClick={() => setVoidingId(p.id)}
                        className="p-2 rounded-lg bg-rose-500/10 text-rose-500 opacity-0 group-hover:opacity-100 transition-all border border-rose-500/20 hover:bg-rose-500 hover:text-white"
                      >
                        <Trash2 size={14} />
                      </button>
                    ) : (
                      <span className="text-[8px] font-black uppercase tracking-widest text-rose-500 italic bg-rose-500/10 px-2 py-1 rounded-full">
                        VOID: {p.void_reason}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
              {payments.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-gray-600 uppercase tracking-[0.3em] text-[10px] font-bold">
                    No transactions recorded on this ledger
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Void Modal */}
      <AnimatePresence>
        {voidingId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass-card p-8 max-w-md w-full border-rose-500/50 bg-black"
            >
              <div className="flex flex-col items-center text-center gap-4">
                <div className="w-16 h-16 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-500 border border-rose-500/30">
                  <ShieldAlert size={32} />
                </div>
                <div>
                  <h4 className="text-2xl font-black uppercase tracking-tight text-white">Void Transaction</h4>
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-2">
                    This action is permanent and will be logged in the audit trail.
                  </p>
                </div>
                
                <div className="w-full text-left space-y-2 mt-4">
                  <label className="text-[9px] uppercase tracking-[0.3em] text-gray-500 font-bold ml-1">Reason for Voiding</label>
                  <textarea
                    value={voidReason}
                    onChange={(e) => setVoidReason(e.target.value)}
                    placeholder="Describe why this payment is being voided..."
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm text-white focus:border-rose-500/50 outline-none h-24 resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4 w-full mt-4">
                  <button
                    onClick={() => setVoidingId(null)}
                    className="py-3 px-6 rounded-2xl bg-white/5 text-white text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleVoid}
                    disabled={!voidReason || isVoiding}
                    className="py-3 px-6 rounded-2xl bg-rose-500 text-white text-[10px] font-black uppercase tracking-widest hover:bg-rose-600 transition-all shadow-[0_10px_20px_rgba(244,63,94,0.2)] disabled:opacity-50"
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
