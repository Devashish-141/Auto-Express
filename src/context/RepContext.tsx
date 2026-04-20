'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

type RepContextType = {
  rep: string | null;
  login: (code: string) => void;
  logout: () => void;
};

const RepContext = createContext<RepContextType | undefined>(undefined);

export const RepProvider = ({ children }: { children: React.ReactNode }) => {
  const [rep, setRep] = useState<string | null>(null);

  useEffect(() => {
    const savedRep = localStorage.getItem('rep_code');
    if (savedRep) setRep(savedRep);
  }, []);

  const login = (code: string) => {
    const formattedCode = code.toUpperCase();
    localStorage.setItem('rep_code', formattedCode);
    setRep(formattedCode);
  };

  const logout = () => {
    localStorage.removeItem('rep_code');
    setRep(null);
  };

  return (
    <RepContext.Provider value={{ rep, login, logout }}>
      {children}
    </RepContext.Provider>
  );
};

export const useRep = () => {
  const context = useContext(RepContext);
  if (context === undefined) {
    throw new Error('useRep must be used within a RepProvider');
  }
  return context;
};
