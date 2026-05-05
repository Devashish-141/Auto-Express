'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  PlusCircle, 
  RotateCcw,
  Banknote, 
  CreditCard, 
  ArrowRightLeft, 
  CheckCircle2, 
  Loader2,
  Trash2,
  ShieldAlert,
  History,
  User
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
    color: 'text-teal-400',
    border: 'border-teal-500/20 bg-teal-500/5',
  },
  Card: {
    icon: <CreditCard size={16} />,
    label: 'Card',
    color: 'text-blue-400',
    border: 'border-blue-500/20 bg-blue-500/5',
  },
  Transfer: {
    icon: <ArrowRightLeft size={16} />,
    label: 'Bank Transfer',
    color: 'text-indigo-400',
    border: 'border-indigo-500/20 bg-indigo-500/5',
  },
};

export default function PaymentLogger({ dealId, payments, onPaymentLogged }: PaymentLoggerProps) {
  const { rep } = useRep();
  const { showToast } = useToast();

  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [method, setMethod] = useState<PaymentMethod>('Cash');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [voidingId, setVoidingId] = useState<string | null>(null);
  const [voidReason, setVoidReason] = useState('');
  const [isVoiding, setIsVoiding] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rep || !amount) return;

    setIsSubmitting(true);
    try {
      await logPayment({
        dealId,
        amount: parseFloat(amount),
        date,
        method,
        repCode: rep,
      });

      showToast({ message: `€${parseFloat(amount).toLocaleString()} Logged`, type: 'success' });
      setAmount('');
      onPaymentLogged?.();
    } catch (err: any) {
      showToast({ message: err?.message ?? 'Failed to log payment.', type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVoid = async () => {
    if (!voidingId || !voidReason) return;
    setIsVoiding(true);
    try {
      await voidPayment(voidingId, voidReason);
      showToast({ message: 'Payment Voided', type: 'success' });
      setVoidingId(null);
      setVoidReason('');
      onPaymentLogged?.();
    } catch (err: any) {
      showToast({ message: 'Failed to void payment', type: 'error' });
    } finally {
      setIsVoiding(false);
    }
  };

  const totalReceived = payments.reduce((acc, p) => p.is_voided ? acc : acc + Number(p.amount), 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="bg-[#0f172a] p-8 md:p-10 rounded-[2.5rem] border border-gray-800 shadow-2xl relative overflow-hidden">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h3 className="text-2xl font-black uppercase tracking-tight text-white italic">Log Payment Protocol</h3>
            <p className="text-[10px] text-gray-500 uppercase tracking-[0.4em] mt-2 font-black">
              Attribution: <span className="text-blue-500">{rep ?? 'PENDING'}</span>
            </p>
          </div>
          <button 
            type="button"
            onClick={() => { setAmount(''); setMethod('Cash'); }}
            className="w-12 h-12 rounded-2xl bg-black/40 border border-gray-800 flex items-center justify-center text-gray-500 hover:text-white transition-all hover:scale-110 active:scale-95"
          >
            <RotateCcw size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-8 items-end">
          <div className="space-y-3">
            <label className="text-[9px] uppercase tracking-[0.4em] text-gray-600 font-black ml-1">Cash Value (€)</label>
            <div className="relative">
              <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-600 font-mono font-black">€</span>
              <input
                required
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full bg-black/40 border border-gray-800 rounded-2xl py-4 pl-10 pr-6 text-sm font-mono font-black text-white focus:border-blue-500/50 outline-none transition-all"
              />
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[9px] uppercase tracking-[0.4em] text-gray-600 font-black ml-1">Execution Date</label>
            <input
              required
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-black/40 border border-gray-800 rounded-2xl py-4 px-6 text-sm font-mono font-black text-white focus:border-blue-500/50 outline-none [color-scheme:dark]"
            />
          </div>

          <div className="space-y-3">
            <label className="text-[9px] uppercase tracking-[0.4em] text-gray-600 font-black ml-1">Transfer Method</label>
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value as PaymentMethod)}
              className="w-full bg-black/40 border border-gray-800 rounded-2xl py-4 px-6 text-sm font-black text-white focus:border-blue-500/50 outline-none appearance-none"
            >
              <option value="Cash" className="bg-[#0f172a]">Physical Cash</option>
              <option value="Card" className="bg-[#0f172a]">Terminal Card</option>
              <option value="Transfer" className="bg-[#0f172a]">Direct Wire</option>
            </select>
          </div>

          <div className="md:col-span-3 mt-6">
            <button
              type="submit"
              disabled={!rep || isSubmitting}
              className="w-full bg-blue-600 text-white py-5 text-[10px] font-black uppercase tracking-[0.4em] rounded-2xl flex items-center justify-center gap-4 shadow-2xl hover:bg-blue-700 transition-all active:scale-[0.98] disabled:opacity-50"
            >
              {isSubmitting ? <Loader2 size={20} className="animate-spin" /> : <PlusCircle size={20} />}
              Commit to Financial Ledger
            </button>
          </div>
        </form>
      </div>

      <div className="bg-[#0f172a] p-8 md:p-10 rounded-[2.5rem] border border-gray-800 shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-5">
            <div className="w-12 h-12 rounded-2xl bg-black/40 border border-gray-800 flex items-center justify-center text-gray-500">
              <History size={24} />
            </div>
            <div>
              <h3 className="text-2xl font-black uppercase tracking-tight text-white italic">Audit Signature</h3>
              <p className="text-[9px] text-gray-600 uppercase tracking-[0.4em] font-black mt-2">Immutable Transaction Sequence</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[9px] text-gray-600 uppercase tracking-[0.4em] font-black mb-2">Total Accumulated</p>
            <p className="text-3xl font-black font-mono text-teal-400 tracking-tighter italic">€{totalReceived.toLocaleString()}</p>
          </div>
        </div>

        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-800/50">
                <th className="pb-6 text-[9px] uppercase tracking-[0.4em] text-gray-600 font-black">Timestamp</th>
                <th className="pb-6 text-[9px] uppercase tracking-[0.4em] text-gray-600 font-black">Methodology</th>
                <th className="pb-6 text-[9px] uppercase tracking-[0.4em] text-gray-600 font-black">Attribution</th>
                <th className="pb-6 text-[9px] uppercase tracking-[0.4em] text-gray-600 font-black text-right">Value</th>
                <th className="pb-6 text-[9px] uppercase tracking-[0.4em] text-gray-600 font-black text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/30">
              {payments.map((p) => (
                <tr key={p.id} className={`group ${p.is_voided ? 'opacity-30 grayscale' : ''}`}>
                  <td className="py-6 text-[10px] font-mono font-black text-gray-500 uppercase tracking-widest">
                    {new Date(p.payment_date).toLocaleDateString('en-IE')}
                  </td>
                  <td className="py-6">
                    <div className="flex items-center gap-3">
                      <span className={`p-2 rounded-xl border ${METHOD_CONFIG[p.method]?.border} ${METHOD_CONFIG[p.method]?.color}`}>
                        {METHOD_CONFIG[p.method]?.icon}
                      </span>
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-300">{p.method}</span>
                    </div>
                  </td>
                  <td className="py-6">
                    <div className="flex items-center gap-3 text-[10px] font-black text-gray-500 uppercase tracking-widest">
                      <User size={14} className="text-gray-700" />
                      {p.rep_code}
                    </div>
                  </td>
                  <td className="py-6 text-right">
                    <p className={`text-sm font-mono font-black ${p.is_voided ? 'line-through text-gray-600' : 'text-white'}`}>
                      €{Number(p.amount).toLocaleString()}
                    </p>
                  </td>
                  <td className="py-6 text-right">
                    {!p.is_voided ? (
                      <button
                        onClick={() => setVoidingId(p.id)}
                        className="p-3 rounded-xl bg-red-500/10 text-red-500 opacity-0 group-hover:opacity-100 transition-all border border-red-500/20 hover:bg-red-500 hover:text-white"
                      >
                        <Trash2 size={16} />
                      </button>
                    ) : (
                      <span className="text-[8px] font-black uppercase tracking-widest text-red-500 italic bg-red-500/5 px-3 py-1 rounded-full border border-red-500/10">
                        VOID: {p.void_reason}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {payments.length === 0 && (
            <div className="py-16 text-center text-gray-700 uppercase tracking-[0.4em] text-[10px] font-black">
              Zero Signal: No Transactions Found
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {voidingId && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#0f172a] p-10 max-w-lg w-full border border-red-500/20 shadow-2xl rounded-[2.5rem]"
            >
              <div className="flex flex-col items-center text-center gap-6">
                <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 border border-red-500/20">
                  <ShieldAlert size={40} />
                </div>
                <div>
                  <h4 className="text-3xl font-black uppercase tracking-tight text-white italic">Invalidate Sequence</h4>
                  <p className="text-[10px] text-gray-500 uppercase tracking-[0.3em] mt-3 font-black leading-relaxed">
                    Critical Operation: This will strike the transaction from active balance and log the intent in the audit chain.
                  </p>
                </div>
                
                <div className="w-full text-left space-y-3 mt-6">
                  <label className="text-[9px] uppercase tracking-[0.4em] text-gray-600 font-black ml-1">Void Intent Signature</label>
                  <textarea
                    required
                    value={voidReason}
                    onChange={(e) => setVoidReason(e.target.value)}
                    placeholder="Provide rationale for ledger invalidation..."
                    className="w-full bg-black/40 border border-gray-800 rounded-3xl p-6 text-sm text-white focus:border-red-500/50 outline-none h-32 resize-none transition-all placeholder:text-gray-800"
                  />
                </div>

                <div className="grid grid-cols-2 gap-6 w-full mt-6">
                  <button
                    onClick={() => setVoidingId(null)}
                    className="py-5 bg-white/5 text-gray-500 text-[10px] font-black uppercase tracking-[0.3em] rounded-2xl hover:bg-white/10 transition-all"
                  >
                    Abort
                  </button>
                  <button
                    onClick={handleVoid}
                    disabled={!voidReason || isVoiding}
                    className="py-5 bg-red-600 text-white text-[10px] font-black uppercase tracking-[0.3em] rounded-2xl hover:bg-red-700 transition-all shadow-2xl disabled:opacity-50"
                  >
                    {isVoiding ? 'Voiding...' : 'Finalize Void'}
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
