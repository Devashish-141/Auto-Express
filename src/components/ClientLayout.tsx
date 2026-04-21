'use client';

import React from 'react';
import { useRep } from '../context/RepContext';
import RepGate from './RepGate';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const { rep } = useRep();

  return (
    <>
      <main>
        {children}
      </main>
    </>
  );
}
