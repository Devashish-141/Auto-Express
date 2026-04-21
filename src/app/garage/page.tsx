'use client';

import React from 'react';
import TopNav from '@/components/dashboard/TopNav';
import GarageDashboard from '@/components/GarageDashboard';

export default function GaragePage() {
  return (
    <div className="min-h-screen bg-navy-bg flex flex-col font-sans text-white">
      <TopNav />
      
      <main className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-[1200px] mx-auto animate-in fade-in duration-700">
          <GarageDashboard />
        </div>
      </main>
    </div>
  );
}
