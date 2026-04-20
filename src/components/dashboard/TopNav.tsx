'use client';

import React, { useState } from 'react';
import { Menu, Search, Settings, Bell, User } from 'lucide-react';

const TopNav = () => {
  const [searchValue, setSearchValue] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Searching for: ${searchValue}`);
  };

  return (
    <div className="flex items-center justify-between px-6 py-4 border-b border-navy-border bg-navy-card">
      {/* Left Section */}
      <div className="flex items-center gap-6">
        <button 
          onClick={() => alert('Menu toggled')}
          className="text-gray-400 hover:text-navy-accent transition-colors"
        >
          <Menu size={24} />
        </button>
        <form onSubmit={handleSearch} className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
          <input 
            type="text" 
            placeholder="Search" 
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="bg-[#1e293b] border border-navy-border rounded-full py-1.5 pl-10 pr-4 text-sm text-gray-300 focus:outline-none focus:border-white/50 w-64"
          />
        </form>
      </div>

      {/* Center Logo */}
      <div className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center">
        <h1 className="text-xl tracking-[0.2em] font-semibold bg-navy-gradient text-transparent bg-clip-text uppercase">
          Luxe Auto
        </h1>
        <p className="text-[9px] tracking-[0.3em] text-gray-400 uppercase mt-0.5">
          Stock Management
        </p>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-5 text-gray-400">
        <button 
          onClick={() => alert('Global search clicked')}
          className="hover:text-navy-accent transition-colors"
        >
          <Search size={20} />
        </button>
        <button 
          onClick={() => alert('Settings clicked')}
          className="hover:text-navy-accent transition-colors"
        >
          <Settings size={20} />
        </button>
        <button 
          onClick={() => alert('Notifications clicked')}
          className="relative hover:text-navy-accent transition-colors"
        >
          <Bell size={20} />
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>
        <button 
          onClick={() => alert('Profile clicked')}
          className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center border border-gray-600 hover:border-white transition-colors"
        >
          <User size={16} className="text-gray-300" />
        </button>
      </div>
    </div>
  );
};

export default TopNav;
