'use client';

import React, { useState } from 'react';
import { ShieldCheck, Lock, CheckCircle2, MapPin } from 'lucide-react';
import { finalizeRegistration } from '@/lib/data';
import { useToast } from '@/context/ToastContext';

interface VRTWorkflowCardProps {
  dealId: string;
  vehicleId: string;
  stage: string;
  currentVrt?: number;
  currentReg?: string;
  onUpdate: () => void;
}

export default function VRTWorkflowCard({ dealId, vehicleId, stage, currentVrt, currentReg, onUpdate }: VRTWorkflowCardProps) {
  const [vrtAmount, setVrtAmount] = useState(currentVrt?.toString() || '');
  const [regNumber, setRegNumber] = useState(currentReg || '');
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const isUnlocked = stage === 'invoiced' || stage === 'registered' || stage === 'closed';
  const isRegistered = stage === 'registered' || stage === 'closed';
  const isClosed = stage === 'closed';

  const handleFinalize = async () => {
    if (!vrtAmount || !regNumber) {
      showToast({ message: 'Enter VRT and Registration', type: 'error' });
      return;
    }
    setLoading(true);
    try {
      await finalizeRegistration(dealId, vehicleId, Number(vrtAmount), regNumber);
      showToast({ message: 'Registration Finalized', type: 'success' });
      onUpdate();
    } catch (error) {
      showToast({ message: 'Failed to update registration', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

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
      {!isUnlocked && !isClosed && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-[4px] z-20 flex items-center justify-center p-8 text-center">
          <div className="flex flex-col items-center gap-4">
            <Lock size={28} className="text-gray-600" />
            <p className="text-[10px] uppercase tracking-[0.4em] text-gray-600 font-black">
              Stage Locked<br />
              <span className="text-[8px] opacity-40">Execute Invoice Protocol to Unlock VRT Stage</span>
            </p>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className={`w-10 h-10 rounded-xl ${isUnlocked ? 'bg-teal-500/10 text-teal-400 border border-teal-500/20' : 'bg-black/40 text-gray-700 border border-gray-800'} flex items-center justify-center`}>
            <ShieldCheck size={20} />
          </div>
          <h3 className={`text-sm font-black uppercase tracking-[0.3em] ${isUnlocked ? 'text-teal-400' : 'text-gray-700'}`}>VRT & Registration</h3>
        </div>
        {isRegistered && <CheckCircle2 size={24} className="text-teal-400" />}
      </div>

      <div className={`space-y-6 ${isClosed ? 'opacity-40 pointer-events-none' : ''}`}>
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-3">
            <label className="text-[9px] uppercase tracking-[0.4em] text-gray-600 font-black ml-1">VRT Liability (€)</label>
            <div className="relative">
              <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-600 font-mono font-black">€</span>
              <input 
                type="number"
                value={vrtAmount}
                onChange={(e) => setVrtAmount(e.target.value)}
                disabled={!isUnlocked || isRegistered || loading || isClosed}
                placeholder="0.00"
                className="w-full bg-black/40 border border-gray-800 rounded-2xl py-4 pl-10 pr-6 text-sm font-mono font-black text-white focus:border-teal-500/50 outline-none transition-all placeholder:text-gray-900"
              />
            </div>
          </div>
          <div className="space-y-3">
            <label className="text-[9px] uppercase tracking-[0.4em] text-gray-600 font-black ml-1">Irish Signature</label>
            <div className="relative">
              <MapPin size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-600" />
              <input 
                type="text"
                value={regNumber}
                onChange={(e) => setRegNumber(e.target.value)}
                disabled={!isUnlocked || isRegistered || loading || isClosed}
                placeholder="241-D-XXXX"
                className="w-full bg-black/40 border border-gray-800 rounded-2xl py-4 pl-12 pr-6 text-sm font-mono font-black text-white focus:border-teal-500/50 outline-none uppercase transition-all placeholder:text-gray-900"
              />
            </div>
          </div>
        </div>

        {!isRegistered && isUnlocked && (
          <button 
            onClick={handleFinalize}
            disabled={loading || isClosed}
            className="w-full py-5 rounded-2xl bg-teal-500 text-white text-[10px] font-black uppercase tracking-[0.4em] hover:bg-teal-600 transition-all flex items-center justify-center gap-3 shadow-2xl active:scale-[0.98]"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            ) : (
              'Finalize Irish Registration'
            )}
          </button>
        )}

        {isRegistered && (
          <div className="p-6 rounded-2xl bg-teal-500/5 border border-teal-500/20 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-teal-500/10 flex items-center justify-center">
              <CheckCircle2 size={20} className="text-teal-400" />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-[0.3em] text-teal-400 font-black">Registration Protocol Complete</p>
              <p className="text-[10px] text-gray-600 font-black mt-1 uppercase tracking-widest">Asset Successfully Transitioned</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
