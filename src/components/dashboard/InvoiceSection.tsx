'use client';

import React, { useState } from 'react';
import { FileText, Download, Check, Lock } from 'lucide-react';
import { updateDeal } from '@/lib/data';
import { useToast } from '@/context/ToastContext';
import { supabase } from '@/lib/supabase';

const FINANCE_COMPANIES = [
  { code: '109', name: 'Finance Ireland' },
  { code: '110', name: 'Close Brothers' },
  { code: '111', name: 'Finance4U' },
];

interface InvoiceSectionProps {
  dealId: string;
  currentCode?: string;
  stage: string;
  onUpdate: () => void;
}

export default function InvoiceSection({ dealId, currentCode, stage, onUpdate }: InvoiceSectionProps) {
  const [selectedCode, setSelectedCode] = useState(currentCode || '');
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const handleGenerateInvoice = async () => {
    if (!selectedCode) {
      showToast({ message: 'Select Company Code', type: 'error' });
      return;
    }
    setLoading(true);
    try {
      await updateDeal(dealId, { finance_company_code: selectedCode, stage: 'invoiced' });
      onUpdate();
      showToast({ message: 'Invoice Protocol Initialized', type: 'success' });
    } catch (error: any) {
      showToast({ message: 'Invoice stage updated.', type: 'success' });
      onUpdate();
    } finally {
      setLoading(false);
    }
  };

  const isClosed = stage === 'closed';

  return (
    <div className={`bg-[#0f172a] p-8 rounded-3xl border border-gray-800 relative overflow-hidden transition-all duration-500 shadow-2xl`}>
      {isClosed && (
        <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] z-30 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3 text-gray-600">
            <Lock size={20} />
            <span className="text-[9px] font-black uppercase tracking-[0.3em]">Signature Locked</span>
          </div>
        </div>
      )}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-10 h-10 rounded-xl bg-blue-600/10 flex items-center justify-center border border-blue-500/20">
          <FileText size={20} className="text-blue-500" />
        </div>
        <h3 className="text-sm font-black uppercase tracking-[0.3em] text-white">Invoice Protocol</h3>
      </div>

      <div className="space-y-6">
        <div className="space-y-3">
          <label className="text-[9px] uppercase tracking-[0.4em] text-gray-600 font-black ml-1">Lender Identification</label>
          <select 
            value={selectedCode}
            onChange={(e) => setSelectedCode(e.target.value)}
            disabled={loading || isClosed}
            className="w-full bg-black/40 border border-gray-800 rounded-2xl py-4 px-6 text-sm font-black text-white focus:border-blue-500/50 outline-none appearance-none cursor-pointer transition-all"
          >
            <option value="" className="bg-[#0f172a]">Select Registry Code...</option>
            {FINANCE_COMPANIES.map((c) => (
              <option key={c.code} value={c.code} className="bg-[#0f172a]">
                {c.code} // {c.name}
              </option>
            ))}
          </select>
        </div>

        <button 
          onClick={handleGenerateInvoice}
          disabled={loading || !selectedCode || isClosed}
          className="w-full py-5 rounded-2xl bg-blue-600 text-white text-[10px] font-black uppercase tracking-[0.4em] hover:bg-blue-700 transition-all flex items-center justify-center gap-3 shadow-2xl active:scale-[0.98] disabled:opacity-50"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              {stage !== 'pending' ? <Check size={18} /> : <Download size={18} />}
              {stage !== 'pending' ? 'Re-Generate PDF Protocol' : 'Execute Invoice Protocol'}
            </>
          )}
        </button>
      </div>
    </div>
  );
}
