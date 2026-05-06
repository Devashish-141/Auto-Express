'use client';

import React, { useState } from 'react';
import { MapPin, ChevronDown, User, Car, CreditCard, BarChart3 } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useRep } from '@/context/RepContext';
import { motion, AnimatePresence } from 'framer-motion';

const TopNav = () => {
  const [isLocDropdownOpen, setIsLocDropdownOpen] = useState(false);
  const [isRepDropdownOpen, setIsRepDropdownOpen] = useState(false);

  const pathname = usePathname();
  const { rep, location, setLocation, login, setIsProfileOpen } = useRep();
  const isGarage = pathname.startsWith('/garage');
  const isReports = pathname.startsWith('/admin/reports');

  const locations = ['Limerick', 'Galway'];
  const reps = ['DEVA', 'NICK-01', 'AMANDA-01'];

  return (
    <div className="flex items-center justify-between px-12 py-5 border-b border-slate-200 bg-white/95 backdrop-blur-xl sticky top-0 z-[100] shadow-sm">
      {/* Left Section - Nav Switcher */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-2xl border border-slate-200 shadow-inner">
          <Link 
            href="/"
            className={`flex items-center gap-3 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all ${
              pathname === '/' ? 'bg-slate-900 text-white shadow-xl italic' : 'text-slate-400 hover:text-slate-900 hover:bg-white'
            }`}
          >
            <Car size={16} />
            <span className="hidden lg:inline">Ledger</span>
          </Link>
          <Link 
            href="/garage"
            className={`flex items-center gap-3 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all ${
              isGarage ? 'bg-slate-900 text-white shadow-xl italic' : 'text-slate-400 hover:text-slate-900 hover:bg-white'
            }`}
          >
            <CreditCard size={16} />
            <span className="hidden lg:inline">Waterfall</span>
          </Link>
          <Link 
            href="/admin/reports"
            className={`flex items-center gap-3 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all ${
              isReports ? 'bg-slate-900 text-white shadow-xl italic' : 'text-slate-400 hover:text-slate-900 hover:bg-white'
            }`}
          >
            <BarChart3 size={16} />
            <span className="hidden lg:inline">Registry</span>
          </Link>
        </div>
      </div>

      {/* Center Section - Logo */}
      <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 flex-col items-center">
        <Link href="/" className="group">
          <h2 className="text-3xl font-black italic tracking-tighter text-slate-900 group-hover:scale-105 transition-transform font-header uppercase">LUXE AUTO</h2>
        </Link>
        <div className="flex items-center gap-2 mt-1">
          <div className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
          <p className="text-[9px] tracking-[0.5em] text-slate-600 font-black uppercase">
            {isReports ? 'ADMIN // ANALYTICS' : isGarage ? 'FINANCE // PROTOCOL' : 'GLOBAL // INVENTORY'}
          </p>
        </div>
      </div>

      {/* Right Section - Actions */}
      <div className="flex items-center gap-6">
        {/* Location Switcher */}
        <div className="relative">
          <button 
            onClick={() => setIsLocDropdownOpen(!isLocDropdownOpen)}
            className="flex items-center gap-3 px-6 py-3 bg-slate-50 border border-slate-200 rounded-2xl hover:border-slate-900 transition-all group shadow-sm"
          >
            <MapPin size={14} className="text-blue-600" />
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest group-hover:text-slate-900">
              {location}
            </span>
            <ChevronDown size={14} className={`text-slate-400 transition-transform ${isLocDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          <AnimatePresence>
            {isLocDropdownOpen && (
              <motion.div 
                initial={{ opacity: 0, y: 15, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 15, scale: 0.95 }}
                className="absolute top-full right-0 mt-3 w-48 bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden z-[110] p-2"
              >
                {locations.map((loc) => (
                  <button
                    key={loc}
                    onClick={() => {
                      setLocation(loc);
                      setIsLocDropdownOpen(false);
                    }}
                    className={`w-full text-left px-5 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                      location === loc ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    {loc} DEPOT
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Rep Switcher */}
        <div className="relative">
          <button 
            onClick={() => setIsRepDropdownOpen(!isRepDropdownOpen)}
            className="flex items-center gap-3 px-6 py-3 bg-slate-50 border border-slate-200 rounded-2xl hover:border-slate-900 transition-all group shadow-sm"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-teal-500 shadow-[0_0_10px_rgba(20,184,166,0.2)] animate-pulse" />
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest group-hover:text-slate-900">
              {rep || 'GUEST'}
            </span>
            <ChevronDown size={14} className={`text-slate-400 transition-transform ${isRepDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          <AnimatePresence>
            {isRepDropdownOpen && (
              <motion.div 
                initial={{ opacity: 0, y: 15, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 15, scale: 0.95 }}
                className="absolute top-full right-0 mt-3 w-56 bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden z-[110] p-2"
              >
                {reps.map((r) => (
                  <button
                    key={r}
                    onClick={() => {
                      login(r);
                      setIsRepDropdownOpen(false);
                    }}
                    className={`w-full text-left px-5 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                      rep === r ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    ID: {r}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        <div className="h-10 w-[1px] bg-slate-200 mx-2 hidden lg:block" />

        <button 
          onClick={() => setIsProfileOpen(true)}
          className="relative group"
        >
          <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center group-hover:border-slate-900 transition-all shadow-sm group-hover:scale-110 active:scale-95">
            <User size={20} className="text-slate-400 group-hover:text-slate-900 transition-colors" />
          </div>
          <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-blue-600 rounded-full border-2 border-white animate-pulse shadow-sm" />
        </button>
      </div>
    </div>
  );
};

export default TopNav;
