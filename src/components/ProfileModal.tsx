'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Shield, Calendar, MapPin, Power, BadgeCheck, Mail, Cpu } from 'lucide-react';
import { useRep } from '@/context/RepContext';
import { useToast } from '@/context/ToastContext';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ProfileModal = ({ isOpen, onClose }: ProfileModalProps) => {
  const { repDetails, location, logout } = useRep();
  const { showToast } = useToast();

  if (!repDetails) return null;

  const handleLogout = () => {
    logout();
    onClose();
    showToast({ message: 'Session Terminated Successfully', type: 'success' });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[200] bg-slate-900/40 backdrop-blur-md cursor-pointer"
          />

          {/* Side Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed top-0 right-0 h-full w-full max-w-md z-[210] bg-white border-l border-slate-200 shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Premium Header */}
            <div className="relative p-10 pt-16 bg-gradient-to-br from-blue-600/5 via-transparent to-transparent">
              <div className="absolute top-8 right-8">
                <button 
                  onClick={onClose}
                  className="p-3 bg-slate-100 hover:bg-slate-200 rounded-2xl text-slate-400 hover:text-blue-600 transition-all border border-slate-200"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex flex-col items-center text-center">
                <div className="relative mb-6">
                  <div className="w-24 h-24 rounded-[2rem] bg-gradient-to-tr from-blue-600 to-blue-400 p-1 shadow-xl shadow-blue-100">
                    <div className="w-full h-full rounded-[1.8rem] bg-white flex items-center justify-center border border-slate-100">
                      <User size={40} className="text-blue-500" />
                    </div>
                  </div>
                  <div className="absolute -bottom-1 -right-1 bg-teal-500 text-white p-2 rounded-xl border-4 border-white shadow-lg">
                    <BadgeCheck size={16} />
                  </div>
                </div>
                
                <h3 className="text-3xl font-black tracking-tight text-foreground uppercase italic leading-none">{repDetails.name}</h3>
                <div className="flex items-center gap-2 mt-3 bg-blue-500/10 px-4 py-1.5 rounded-full border border-blue-500/20">
                  <Cpu size={12} className="text-blue-500" />
                  <p className="text-[10px] text-blue-600 font-black uppercase tracking-[0.3em]">
                    Registry ID: {repDetails.rep_code}
                  </p>
                </div>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-10 space-y-10 custom-scrollbar">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 text-center">
                  <p className="text-[9px] uppercase tracking-[0.4em] text-slate-400 font-black mb-2">Sold YTD</p>
                  <p className="text-3xl font-black text-foreground italic">14</p>
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 text-center">
                  <p className="text-[9px] uppercase tracking-[0.4em] text-slate-400 font-black mb-2">Performance</p>
                  <p className="text-3xl font-black text-teal-600 italic">98%</p>
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-[10px] font-black uppercase tracking-[0.5em] text-blue-600/50 ml-1">Identity Profile</p>
                <div className="space-y-3">
                  <div className="bg-slate-50 border border-slate-200 rounded-[1.5rem] p-5 flex items-center gap-5">
                    <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500 border border-blue-500/10">
                      <Mail size={20} />
                    </div>
                    <div>
                      <p className="text-[8px] uppercase tracking-[0.3em] text-slate-500 font-black mb-1">Electronic Mail</p>
                      <p className="text-xs text-foreground font-bold lowercase tracking-wide">{repDetails.email || 'N/A'}</p>
                    </div>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 rounded-[1.5rem] p-5 flex items-center gap-5">
                    <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500 border border-amber-500/10">
                      <Shield size={20} />
                    </div>
                    <div>
                      <p className="text-[8px] uppercase tracking-[0.3em] text-slate-500 font-black mb-1">Clearance Tier</p>
                      <p className="text-xs text-foreground font-bold uppercase tracking-widest italic">
                        {repDetails.rep_code === 'NICK-01' ? 'System Administrator' : 'Executive Representative'}
                      </p>
                    </div>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 rounded-[1.5rem] p-5 flex items-center gap-5">
                    <div className="w-12 h-12 rounded-2xl bg-teal-500/10 flex items-center justify-center text-teal-500 border border-teal-500/10">
                      <MapPin size={20} />
                    </div>
                    <div>
                      <p className="text-[8px] uppercase tracking-[0.3em] text-slate-500 font-black mb-1">Active Showroom</p>
                      <p className="text-xs text-foreground font-bold uppercase tracking-widest">{location} Branch</p>
                    </div>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 rounded-[1.5rem] p-5 flex items-center gap-5">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 border border-indigo-500/10">
                      <Calendar size={20} />
                    </div>
                    <div>
                      <p className="text-[8px] uppercase tracking-[0.3em] text-slate-500 font-black mb-1">Registry Since</p>
                      <p className="text-xs text-foreground font-bold uppercase tracking-widest">
                        {new Date(repDetails.created_at).toLocaleDateString('en-IE', { month: 'long', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="p-10 bg-slate-50 border-t border-slate-200 space-y-4">
              <button
                onClick={handleLogout}
                className="w-full bg-red-600 text-white flex items-center justify-center gap-4 py-5 rounded-2xl font-black uppercase tracking-[0.4em] text-[11px] transition-all shadow-xl shadow-red-100 hover:bg-red-700 active:scale-[0.98]"
              >
                <Power size={18} />
                Logout Protocol
              </button>
              
              <button
                onClick={onClose}
                className="w-full bg-white hover:bg-slate-100 text-slate-400 hover:text-blue-600 flex items-center justify-center gap-3 py-5 rounded-2xl font-black uppercase tracking-[0.4em] text-[11px] transition-all border border-slate-200 active:scale-[0.98]"
              >
                Cancel / Return
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ProfileModal;
