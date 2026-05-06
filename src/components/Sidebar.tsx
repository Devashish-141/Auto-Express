'use client';

import React, { useState } from 'react';
import { Package, Wrench, BarChart3, LogOut, User } from 'lucide-react';
import { useRep } from '../context/RepContext';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Sidebar = ({ activeTab, setActiveTab }: SidebarProps) => {
  const { rep, logout } = useRep();

  const menuItems = [
    { id: 'stock', label: 'Stock Bridge', icon: Package },
    { id: 'garage', label: 'Garage Dashboard', icon: Wrench },
    { id: 'finance', label: 'Finance Waterfall', icon: BarChart3 },
  ];

  return (
    <div className="w-64 h-screen fixed left-0 top-0 bg-background border-r border-slate-200 flex flex-col p-6 z-50">
      <div className="mb-10">
        <h1 className="text-xl font-black tracking-tighter text-black uppercase">
          AutoExpress
        </h1>

      </div>

      <nav className="flex-1 space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 ${
              activeTab === item.id 
                ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' 
                : 'text-black hover:text-black hover:bg-gray-800/50 border border-transparent'
            }`}
          >
            <item.icon size={18} />
            <span className="text-xs font-bold uppercase tracking-widest">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="mt-auto pt-6 border-t border-slate-200">
        <div className="glass-card p-4 mb-4 bg-amber-500/5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-500">
              <User size={16} />
            </div>
            <div>
              <p className="text-[10px] text-black uppercase leading-none">Active Rep</p>
              <p className="text-xs font-bold text-foreground uppercase">{rep}</p>
            </div>
          </div>
        </div>
        
        <button 
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-rose-500 hover:bg-rose-500/10 transition-all border border-transparent hover:border-rose-500/20"
        >
          <LogOut size={18} />
          <span className="text-xs font-bold uppercase tracking-widest">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
