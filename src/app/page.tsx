'use client';

import React, { useEffect, useState } from 'react';
import TopNav from '@/components/dashboard/TopNav';
import SummaryCards from '@/components/dashboard/SummaryCards';
import MonthlyTrendChart from '@/components/dashboard/MonthlyTrendChart';
import AvailabilityDonut from '@/components/dashboard/AvailabilityDonut';
import InventoryList from '@/components/dashboard/InventoryList';
import { UpcomingAcquisitions, StockPerformance } from '@/components/dashboard/AcquisitionsAndPerformance';
import { supabase } from '@/lib/supabase';

export default function Home() {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchVehicles = async () => {
    const { data, error } = await supabase
      .from('vehicles')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (!error && data) {
      setVehicles(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchVehicles();

    const channel = supabase
      .channel('dashboard-sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'vehicles' }, () => {
        fetchVehicles();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 border-4 border-slate-200 border-t-navy-accent rounded-full animate-spin" />
        <p className="text-[10px] uppercase tracking-[0.5em] text-slate-500 font-bold">Syncing Asset Ledger...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans text-foreground">
      <TopNav />
      
      <main className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-[1600px] mx-auto space-y-6">
          
          {/* Top Row: Summary Cards */}
          <SummaryCards data={vehicles} />
          
          {/* Main Grid: 3 Columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6">
            
            {/* Left Column (Charts) */}
            <div className="col-span-1 lg:col-span-3 flex flex-col gap-6 order-2 lg:order-1">
              <div className="h-[300px] lg:h-1/2">
                <MonthlyTrendChart data={vehicles} />
              </div>
              <div className="h-[300px] lg:h-1/2">
                <AvailabilityDonut data={vehicles} />
              </div>
            </div>
            
            {/* Middle Column (Main Inventory) */}
            <div className="col-span-1 md:col-span-2 lg:col-span-6 order-1 lg:order-2 h-[500px] lg:h-[624px]">
              <InventoryList data={vehicles} onRefresh={fetchVehicles} />
            </div>
            
            {/* Right Column (Secondary Info) */}
            <div className="col-span-1 lg:col-span-3 flex flex-col gap-6 order-3">
              <UpcomingAcquisitions data={vehicles} />
              <StockPerformance data={vehicles} />
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
