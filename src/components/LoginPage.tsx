'use client';

import React, { useState } from 'react';
import { useRep } from '../context/RepContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Mail, ShieldCheck, Cpu, ArrowRight, Loader2 } from 'lucide-react';
import { useToast } from '@/context/ToastContext';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useRep();
  const { showToast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    await new Promise(resolve => setTimeout(resolve, 800));

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedPassword = password.trim();

    if (normalizedEmail === 'work.devashishbhavsar14@gmail.com' && normalizedPassword === 'N1ckS0n@1') {
      login('DEVA');
      showToast({ message: 'Welcome back, Devashish', type: 'success' });
    } else if (normalizedEmail === 'admin' && normalizedPassword === '123') {
      login('NICK-01');
      showToast({ message: 'Admin Access Authorized', type: 'success' });
    } else {
      showToast({ message: 'Invalid credentials. Access Denied.', type: 'error' });
    }
    
    setIsLoading(false);
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white">
      {/* Dynamic Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/5 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-teal-600/5 blur-[120px] rounded-full" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md p-1 mx-4 rounded-[2.5rem] bg-gradient-to-b from-slate-100 to-slate-200/50 shadow-2xl relative z-10"
      >
        <div className="bg-white rounded-[2.4rem] p-8 md:p-10 backdrop-blur-xl border border-slate-200/50">
          <div className="text-center mb-10">
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-blue-100"
            >
              <Cpu size={32} className="text-white" />
            </motion.div>
            <h1 className="text-4xl font-black tracking-tighter text-black mb-2">AutoExpress</h1>

          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <label className="text-[9px] uppercase tracking-[0.3em] text-black font-black ml-1">Registry Identity / Email</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-black group-focus-within:text-blue-500 transition-colors" size={18} />
                <input
                  type="text"
                  placeholder="name@autoexpress.ie"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-50 border-slate-200 border rounded-2xl py-4 pl-12 pr-4 text-foreground text-sm outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all placeholder:text-black font-black"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[9px] uppercase tracking-[0.4em] text-black font-black ml-1">Access Signature / Token</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-black group-focus-within:text-blue-500 transition-colors" size={18} />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-50 border-slate-200 border rounded-2xl py-4 pl-12 pr-4 text-foreground text-sm outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all placeholder:text-black font-black"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full group bg-blue-600 text-white flex items-center justify-center gap-3 py-4 rounded-2xl font-black uppercase tracking-[0.3em] text-[10px] hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 active:scale-95 disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <>
                  Initialize Connection
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-10 pt-8 border-t border-slate-100 text-center">

          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
