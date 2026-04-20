'use client';

import React, { useState } from 'react';
import { useRep } from '../context/RepContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, ShieldCheck, Cpu } from 'lucide-react';

const RepGate = () => {
  const [code, setCode] = useState('');
  const { login } = useRep();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length >= 3) {
      login(code);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#020617]">
      {/* Decorative background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-amber-500/10 blur-[120px] rounded-full pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card w-full max-w-md p-8 text-center mx-4"
        style={{
          border: '1px solid rgba(245, 158, 11, 0.2)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
        }}
      >
        <div className="mb-8">
          <div className="w-20 h-20 bg-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(245,158,11,0.3)]">
            <Cpu size={40} className="text-[#020617]" />
          </div>
          <h1 className="text-2xl font-bold tracking-widest text-[#f8fafc] mb-2 uppercase">Rep Gate</h1>
          <p className="text-gray-400 text-sm tracking-widest uppercase">Identify for Attribution</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            <input
              type="text"
              placeholder="ENTER REP CODE"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              autoFocus
              className="w-full bg-black/40 border-gray-800 border rounded-lg py-4 pl-12 pr-4 text-amber-500 text-center text-xl tracking-[0.3em] font-mono outline-none focus:border-amber-500/50 transition-all placeholder:text-gray-700 placeholder:tracking-normal placeholder:text-sm"
            />
          </div>

          <button
            type="submit"
            className="btn-primary w-full flex items-center justify-center gap-2 py-4"
          >
            <ShieldCheck size={20} />
            Authorize Access
          </button>
        </form>

        <p className="mt-8 text-[10px] text-gray-500 tracking-[0.2em] font-mono uppercase">
          Auto Express Ireland | v2.1.0 Sec-Core
        </p>
      </motion.div>
    </div>
  );
};

export default RepGate;
