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

    if (email === 'work.devashishbhavsar14@gmail.com' && password === 'N1ckS0n@1') {
      login('DEVA');
      showToast({ message: 'Welcome back, Devashish', type: 'success' });
    } else if (email === 'admin' && password === '123') {
      login('NICK-01');
      showToast({ message: 'Admin Access Authorized', type: 'success' });
    } else {
      showToast({ message: 'Invalid credentials. Access Denied.', type: 'error' });
    }
    
    setIsLoading(false);
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#020617]">
      {/* Dynamic Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-teal-600/10 blur-[120px] rounded-full" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md p-1 mx-4 rounded-[2.5rem] bg-gradient-to-b from-gray-800 to-gray-900/50 shadow-2xl relative z-10"
      >
        <div className="bg-[#0f172a] rounded-[2.4rem] p-8 md:p-10 backdrop-blur-xl border border-gray-800/50">
          <div className="text-center mb-10">
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-blue-900/20"
            >
              <Cpu size={32} className="text-white" />
            </motion.div>
            <h1 className="text-3xl font-black tracking-tight text-white mb-2 italic">AUTO EXPRESS</h1>
            <p className="text-gray-500 text-[10px] uppercase tracking-[0.4em] font-black">Secured Management Protocol</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <label className="text-[9px] uppercase tracking-[0.3em] text-gray-600 font-black ml-1">Registry Identity / Email</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-700 group-focus-within:text-blue-500 transition-colors" size={18} />
                <input
                  type="text"
                  placeholder="name@autoexpress.ie"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-black/40 border-gray-800 border rounded-2xl py-4 pl-12 pr-4 text-white text-sm outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all placeholder:text-gray-900 font-black"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[9px] uppercase tracking-[0.3em] text-gray-600 font-black ml-1">Access Signature / Token</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-700 group-focus-within:text-blue-500 transition-colors" size={18} />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-black/40 border-gray-800 border rounded-2xl py-4 pl-12 pr-4 text-white text-sm outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all placeholder:text-gray-900 font-black"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full group bg-blue-600 text-white flex items-center justify-center gap-3 py-4 rounded-2xl font-black uppercase tracking-[0.3em] text-[10px] hover:bg-blue-700 transition-all shadow-xl shadow-blue-900/20 active:scale-95 disabled:opacity-50"
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

          <div className="mt-10 pt-8 border-t border-gray-800/50 text-center">
            <p className="text-[9px] text-gray-700 tracking-[0.3em] font-black uppercase italic">
              Unified Stock & Garage Protocol v2.6.0
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
