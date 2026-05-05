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
    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800 bg-[#020617]/90 backdrop-blur-xl sticky top-0 z-[100] shadow-2xl">
      {/* Left Section - Nav Switcher */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5 bg-black/40 p-1.5 rounded-[1.2rem] border border-gray-800">
          <Link 
            href="/"
            className={`flex items-center gap-2.5 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all ${
              pathname === '/' ? 'bg-blue-600 text-white shadow-xl shadow-blue-900/30 italic' : 'text-gray-500 hover:text-white hover:bg-white/5'
            }`}
          >
            <Car size={16} />
            <span className="hidden lg:inline">Ledger</span>
          </Link>
          <Link 
            href="/garage"
            className={`flex items-center gap-2.5 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all ${
              isGarage ? 'bg-blue-600 text-white shadow-xl shadow-blue-900/30 italic' : 'text-gray-500 hover:text-white hover:bg-white/5'
            }`}
          >
            <CreditCard size={16} />
            <span className="hidden lg:inline">Waterfall</span>
          </Link>
          <Link 
            href="/admin/reports"
            className={`flex items-center gap-2.5 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all ${
              isReports ? 'bg-blue-600 text-white shadow-xl shadow-blue-900/30 italic' : 'text-gray-500 hover:text-white hover:bg-white/5'
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
          <img src="/logo.png" alt="Auto Express" className="h-10 object-contain group-hover:scale-105 transition-transform" />
        </Link>
        <div className="flex items-center gap-2 mt-2">
          <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
          <p className="text-[9px] tracking-[0.5em] text-gray-500 font-black uppercase">
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
            className="flex items-center gap-3 px-5 py-2.5 bg-black/40 border border-gray-800 rounded-2xl hover:border-blue-500 transition-all group"
          >
            <MapPin size={14} className="text-blue-500" />
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest group-hover:text-white">
              {location}
            </span>
            <ChevronDown size={14} className={`text-gray-700 transition-transform ${isLocDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          <AnimatePresence>
            {isLocDropdownOpen && (
              <motion.div 
                initial={{ opacity: 0, y: 15, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 15, scale: 0.95 }}
                className="absolute top-full right-0 mt-3 w-44 bg-[#0f172a] border border-gray-800 rounded-2xl shadow-2xl overflow-hidden z-[110] p-1.5"
              >
                {locations.map((loc) => (
                  <button
                    key={loc}
                    onClick={() => {
                      setLocation(loc);
                      setIsLocDropdownOpen(false);
                    }}
                    className={`w-full text-left px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                      location === loc ? 'bg-blue-600 text-white' : 'text-gray-500 hover:bg-white/5 hover:text-white'
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
            className="flex items-center gap-3 px-5 py-2.5 bg-black/40 border border-gray-800 rounded-2xl hover:border-blue-500 transition-all group"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-teal-400 shadow-[0_0_10px_rgba(45,212,191,0.5)] animate-pulse" />
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest group-hover:text-white">
              {rep || 'GUEST'}
            </span>
            <ChevronDown size={14} className={`text-gray-700 transition-transform ${isRepDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          <AnimatePresence>
            {isRepDropdownOpen && (
              <motion.div 
                initial={{ opacity: 0, y: 15, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 15, scale: 0.95 }}
                className="absolute top-full right-0 mt-3 w-52 bg-[#0f172a] border border-gray-800 rounded-2xl shadow-2xl overflow-hidden z-[110] p-1.5"
              >
                {reps.map((r) => (
                  <button
                    key={r}
                    onClick={() => {
                      login(r);
                      setIsRepDropdownOpen(false);
                    }}
                    className={`w-full text-left px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                      rep === r ? 'bg-blue-600 text-white' : 'text-gray-500 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    ID: {r}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        <div className="h-8 w-[1px] bg-gray-800 mx-2 hidden lg:block" />

        <button 
          onClick={() => setIsProfileOpen(true)}
          className="relative group"
        >
          <div className="w-10 h-10 rounded-2xl bg-black/40 border border-gray-800 flex items-center justify-center group-hover:border-blue-500 transition-all shadow-xl group-hover:scale-110 active:scale-95">
            <User size={18} className="text-gray-500 group-hover:text-white transition-colors" />
          </div>
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full border-2 border-[#020617] animate-pulse" />
        </button>
      </div>
    </div>
  );
};

export default TopNav;
