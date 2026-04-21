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
    <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-navy-card/80 backdrop-blur-md sticky top-0 z-[100]">
      {/* Left Section - Navigation Switcher */}
      <div className="flex items-center gap-2 bg-black/40 p-1 rounded-xl border border-white/5">
        <Link 
          href="/"
          className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${
            !isGarage ? 'bg-white/10 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'
          }`}
        >
          <Car size={14} />
          Stock
        </Link>
        <Link 
          href="/garage"
          className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${
            isGarage ? 'bg-white/10 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'
          }`}
        >
          <CreditCard size={14} />
          Garage
        </Link>
      </div>

      <div className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-none">
        <h1 className="text-xl tracking-[0.3em] font-black bg-navy-gradient text-transparent bg-clip-text uppercase italic">
          Auto Express
        </h1>
        <p className="text-[8px] tracking-[0.4em] text-amber-500/80 font-bold uppercase mt-0.5">
          {isGarage ? 'Financial Waterfall' : 'Global Asset Ledger'}
        </p>
      </div>

      <div className="flex items-center gap-5">
        <div className="hidden lg:flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full">
          <div className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
          <span className="text-[9px] font-mono text-gray-400 uppercase tracking-widest">
            Rep: <span className="text-white">{rep || 'NONE'}</span>
          </span>
        </div>
        
        <div className="h-6 w-[1px] bg-white/10 mx-2 hidden md:block" />

        <button 
          onClick={() => alert('Notifications clicked')}
          className="relative text-gray-500 hover:text-white transition-colors"
        >
          <Bell size={20} />
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-amber-500 rounded-full border-2 border-navy-card"></span>
        </button>
        <button 
          onClick={() => alert('Profile clicked')}
          className="flex items-center gap-2 group"
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center border border-white/10 group-hover:border-white/30 transition-colors">
            <User size={16} className="text-gray-400 group-hover:text-white transition-colors" />
          </div>
        </button>
      </div>
    </div>
  );
};

export default TopNav;
