'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PlusCircle, Banknote, CreditCard, ArrowRightLeft, AlertTriangle, CheckCircle2, Loader2 } from 'lucide-react';
import { useRep } from '@/context/RepContext';
import { useToast } from '@/context/ToastContext';
import { logPayment } from '@/lib/data';

type PaymentMethod = 'Cash' | 'Card' | 'Transfer';

interface PaymentLoggerProps {
  dealId: string;
  onPaymentLogged?: () => void;
}

const METHOD_CONFIG: Record<PaymentMethod, { icon: React.ReactNode; label: string; color: string; border: string }> = {
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

export default function PaymentLogger({ dealId, onPaymentLogged }: PaymentLoggerProps) {
  const { rep } = useRep();
  const { showToast } = useToast();

  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [method, setMethod] = useState<PaymentMethod>('Cash');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [amountError, setAmountError] = useState('');

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
        repCode: rep, // [KI-002] Rep attribution enforced — the Amanda Problem is solved here
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
        message: err?.message ?? 'Failed to log payment. Check connection.',
        type: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="glass-card p-6 relative overflow-hidden">
      {/* Top section header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-base font-bold uppercase tracking-wider">Log Payment</h3>
          <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-0.5">
            Attributed to:{' '}
            <span className="text-[var(--chrome-gold)] font-mono font-bold">{rep ?? '—'}</span>
          </p>
        </div>
        <div className="w-10 h-10 rounded-xl bg-[var(--chrome-gold)]/10 border border-[var(--chrome-gold)]/20 flex items-center justify-center text-[var(--chrome-gold)]">
          <PlusCircle size={20} />
        </div>
      </div>

      {/* Rep gate warning */}
      <AnimatePresence>
        {!rep && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="mb-4 flex items-center gap-3 p-3 rounded-lg border border-rose-500/30 bg-rose-500/10"
          >
            <AlertTriangle size={16} className="text-rose-400 shrink-0" />
            <p className="text-[11px] text-rose-300 leading-tight">
              No rep authenticated. Return to the dashboard and log in to record a payment.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Amount */}
        <div>
          <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-1.5">
            Amount (€)
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-mono text-sm">€</span>
            <input
              type="number"
              min="0.01"
              step="0.01"
              placeholder="0.00"
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value);
                if (amountError) validateAmount(e.target.value);
              }}
              onBlur={() => validateAmount(amount)}
              disabled={!rep || isSubmitting}
              className={`w-full bg-black/30 border rounded-lg py-2.5 pl-8 pr-4 text-sm font-mono text-white placeholder:text-gray-700 outline-none transition-all focus:border-[var(--chrome-gold)]/60 focus:ring-1 focus:ring-[var(--chrome-gold)]/20 disabled:opacity-40 disabled:cursor-not-allowed ${
                amountError ? 'border-rose-500/60' : 'border-gray-800 hover:border-gray-700'
              }`}
            />
          </div>
          <AnimatePresence>
            {amountError && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="text-[10px] text-rose-400 mt-1 font-mono"
              >
                {amountError}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* Date */}
        <div>
          <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-1.5">
            Date
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            disabled={!rep || isSubmitting}
            className="w-full bg-black/30 border border-gray-800 hover:border-gray-700 rounded-lg py-2.5 px-3 text-sm font-mono text-white outline-none transition-all focus:border-[var(--chrome-gold)]/60 focus:ring-1 focus:ring-[var(--chrome-gold)]/20 disabled:opacity-40 disabled:cursor-not-allowed [color-scheme:dark]"
          />
        </div>

        {/* Method */}
        <div>
          <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-2">
            Method
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(Object.keys(METHOD_CONFIG) as PaymentMethod[]).map((m) => {
              const cfg = METHOD_CONFIG[m];
              const isSelected = method === m;
              return (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMethod(m)}
                  disabled={!rep || isSubmitting}
                  className={`flex flex-col items-center gap-1.5 py-3 px-2 rounded-lg border text-[10px] uppercase tracking-widest font-bold transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed ${
                    isSelected
                      ? `${cfg.border} ${cfg.color}`
                      : 'border-gray-800 text-gray-600 hover:border-gray-700 hover:text-gray-400'
                  }`}
                >
                  <span className={isSelected ? cfg.color : 'text-gray-600'}>{cfg.icon}</span>
                  {cfg.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Attribution stamp */}
        {rep && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--chrome-gold)]/5 border border-[var(--chrome-gold)]/15">
            <CheckCircle2 size={12} className="text-[var(--chrome-gold)] shrink-0" />
            <p className="text-[10px] font-mono text-[var(--chrome-gold)]/80">
              This entry will be permanently stamped with rep_code:{' '}
              <strong className="text-[var(--chrome-gold)]">{rep}</strong>
            </p>
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={!rep || isSubmitting}
          className="w-full btn-primary flex items-center justify-center gap-2 text-xs py-3 disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none"
        >
          {isSubmitting ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Recording Payment…
            </>
          ) : (
            <>
              <PlusCircle size={16} />
              Record Payment
            </>
          )}
        </button>
      </form>
    </div>
  );
}
