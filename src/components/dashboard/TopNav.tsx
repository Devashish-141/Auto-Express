'use client';

import React, { useState } from 'react';
import { Menu, Search, Settings, Bell, User, LayoutGrid, Car, CreditCard } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useRep } from '@/context/RepContext';

const TopNav = () => {
  const [searchValue, setSearchValue] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Searching for: ${searchValue}`);
  };

  const pathname = usePathname();
  const { rep } = useRep();
  const isGarage = pathname.startsWith('/garage');

  return (
    <div className="flex items-center justify-between px-4 md:px-6 py-3 md:py-4 border-b border-navy-border bg-white/80 backdrop-blur-md sticky top-0 z-[100]">
      {/* Left Section - Navigation Switcher & Logo (Mobile) */}
      <div className="flex items-center gap-3">
        <div className="flex md:hidden flex-col">
          <h1 className="text-[14px] tracking-[0.2em] font-black bg-navy-gradient text-transparent bg-clip-text uppercase italic">
            AE
          </h1>
        </div>

        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-navy-border">
          <Link 
            href="/"
            className={`flex items-center gap-2 px-3 md:px-4 py-1.5 rounded-lg text-[9px] md:text-[10px] font-bold uppercase tracking-widest transition-all ${
              !isGarage ? 'bg-navy-accent text-white shadow-lg' : 'text-slate-500 hover:text-navy-accent'
            }`}
          >
            <Car size={14} />
            <span className="hidden sm:inline">Stock</span>
          </Link>
          <Link 
            href="/garage"
            className={`flex items-center gap-2 px-3 md:px-4 py-1.5 rounded-lg text-[9px] md:text-[10px] font-bold uppercase tracking-widest transition-all ${
              isGarage ? 'bg-navy-accent text-white shadow-lg' : 'text-slate-500 hover:text-navy-accent'
            }`}
          >
            <CreditCard size={14} />
            <span className="hidden sm:inline">Garage</span>
          </Link>
        </div>
      </div>

      {/* Center Section - Logo (Desktop) */}
      <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 flex-col items-center">
        <Link href="/" className="pointer-events-auto">
          <img src="/logo.png" alt="Auto Express" className="h-8 md:h-10 object-contain" />
        </Link>
        <p className="text-[8px] tracking-[0.4em] text-amber-600 font-bold uppercase mt-1">
          {isGarage ? 'Financial Waterfall' : 'Global Asset Ledger'}
        </p>
      </div>

      {/* Right Section - Actions */}
      <div className="flex items-center gap-3 md:gap-5">
        <div className="hidden lg:flex items-center gap-2 px-3 py-1 bg-slate-100 border border-navy-border rounded-full">
          <div className="w-1.5 h-1.5 rounded-full bg-teal-600 animate-pulse" />
          <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">
            Rep: <span className="text-navy-accent font-bold">{rep || 'NONE'}</span>
          </span>
        </div>
        
        <div className="h-6 w-[1px] bg-slate-200 mx-1 hidden md:block" />

        <button 
          onClick={() => alert('Notifications clicked')}
          className="relative text-slate-400 hover:text-navy-accent transition-colors p-1"
        >
          <Bell size={18} className="md:w-5 md:h-5" />
          <span className="absolute top-0 right-0 w-2 h-2 bg-amber-600 rounded-full border-2 border-white"></span>
        </button>
        <button 
          onClick={() => alert('Profile clicked')}
          className="flex items-center gap-2 group"
        >
          <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-slate-100 flex items-center justify-center border border-navy-border group-hover:border-navy-accent transition-colors">
            <User size={14} className="md:w-4 md:h-4 text-slate-500 group-hover:text-navy-accent transition-colors" />
          </div>
        </button>
      </div>
    </div>
  );
};

export default TopNav;
