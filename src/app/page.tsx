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
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-auto lg:h-[600px]">
            
            {/* Left Column */}
            <div className="col-span-1 lg:col-span-3 flex flex-col gap-6 h-full">
              <div className="flex-1">
                <MonthlyTrendChart />
              </div>
              <div className="flex-1">
                <AvailabilityDonut />
              </div>
            </div>
            
            {/* Middle Column */}
            <div className="col-span-1 lg:col-span-6 h-full">
              <InventoryList />
            </div>
            
            {/* Right Column */}
            <div className="col-span-1 lg:col-span-3 flex flex-col gap-6 h-full">
              <UpcomingAcquisitions />
              <StockPerformance />
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
