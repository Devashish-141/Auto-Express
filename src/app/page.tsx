'use client';

import React from 'react';
import TopNav from '@/components/dashboard/TopNav';
import SummaryCards from '@/components/dashboard/SummaryCards';
import MonthlyTrendChart from '@/components/dashboard/MonthlyTrendChart';
import AvailabilityDonut from '@/components/dashboard/AvailabilityDonut';
import InventoryList from '@/components/dashboard/InventoryList';
import { UpcomingAcquisitions, StockPerformance } from '@/components/dashboard/AcquisitionsAndPerformance';

export default function Home() {
  return (
    <div className="min-h-screen bg-navy-bg flex flex-col font-sans text-white">
      <TopNav />
      
      <main className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-[1600px] mx-auto space-y-6">
          
          {/* Top Row: Summary Cards */}
          <SummaryCards />
          
          {/* Main Grid: 3 Columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6">
            
            {/* Left Column (Charts) */}
            <div className="col-span-1 lg:col-span-3 flex flex-col gap-6 order-2 lg:order-1">
              <div className="h-[300px] lg:h-1/2">
                <MonthlyTrendChart />
              </div>
              <div className="h-[300px] lg:h-1/2">
                <AvailabilityDonut />
              </div>
            </div>
            
            {/* Middle Column (Main Inventory) */}
            <div className="col-span-1 md:col-span-2 lg:col-span-6 order-1 lg:order-2 h-[500px] lg:h-[624px]">
              <InventoryList />
            </div>
            
            {/* Right Column (Secondary Info) */}
            <div className="col-span-1 lg:col-span-3 flex flex-col gap-6 order-3">
              <UpcomingAcquisitions />
              <StockPerformance />
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
