'use client';

import React from 'react';
import { useRep } from '../context/RepContext';
import LoginPage from './LoginPage';
import ProfileModal from './ProfileModal';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const { rep, isProfileOpen, setIsProfileOpen } = useRep();

  if (!rep) {
    return <LoginPage />;
  }

  return (
    <>
      <main className="min-h-screen bg-[#020617] text-white">
        {children}
      </main>
      
      <ProfileModal 
        isOpen={isProfileOpen} 
        onClose={() => setIsProfileOpen(false)} 
      />
    </>
  );
}
