'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

type Rep = {
  id: string;
  rep_code: string;
  name: string;
  active: boolean;
  created_at: string;
};

type RepContextType = {
  rep: string | null;
  repDetails: Rep | null;
  location: string;
  isProfileOpen: boolean;
  setIsProfileOpen: (open: boolean) => void;
  login: (code: string) => Promise<void>;
  logout: () => void;
  setLocation: (loc: string) => void;
};

const RepContext = createContext<RepContextType | undefined>(undefined);

export const RepProvider = ({ children }: { children: React.ReactNode }) => {
  const [rep, setRep] = useState<string | null>(null);
  const [repDetails, setRepDetails] = useState<Rep | null>(null);
  const [location, setLocationState] = useState<string>('Limerick');
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const fetchRepDetails = async (code: string) => {
    const { data, error } = await supabase
      .from('reps')
      .select('*')
      .eq('rep_code', code.toUpperCase())
      .single();
    
    if (!error && data) {
      setRepDetails(data);
    }
  };

  useEffect(() => {
    const savedRep = localStorage.getItem('rep_code');
    if (savedRep) {
      setRep(savedRep);
      fetchRepDetails(savedRep);
    }

    const savedLocation = localStorage.getItem('selected_location');
    if (savedLocation) {
      setLocationState(savedLocation);
    }
  }, []);

  const login = async (code: string) => {
    const formattedCode = code.toUpperCase();
    localStorage.setItem('rep_code', formattedCode);
    setRep(formattedCode);
    await fetchRepDetails(formattedCode);
  };

  const logout = () => {
    localStorage.removeItem('rep_code');
    setRep(null);
    setRepDetails(null);
  };

  const setLocation = (loc: string) => {
    localStorage.setItem('selected_location', loc);
    setLocationState(loc);
  };

  return (
    <RepContext.Provider value={{ rep, repDetails, location, isProfileOpen, setIsProfileOpen, login, logout, setLocation }}>
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
