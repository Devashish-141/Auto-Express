'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import TopNav from '@/components/dashboard/TopNav';
import { ChevronLeft, Car, User, Calendar, ShieldCheck, CreditCard } from 'lucide-react';
import Link from 'next/link';

export default function DealDetailPage() {
  const params = useParams();
  const dealId = params.id as string;

  return (
    <div className="min-h-screen bg-navy-bg flex flex-col font-sans text-white">
      <TopNav />
      
      <main className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-[1200px] mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          
          <div className="flex items-center justify-between">
            <Link 
              href="/"
              className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors text-xs uppercase tracking-widest font-bold"
            >
              <ChevronLeft size={16} />
              Back to Dashboard
            </Link>
            
            <div className="flex items-center gap-3">
              <span className="text-[10px] uppercase tracking-[0.2em] text-gray-500">Deal Status:</span>
              <span className="px-3 py-1 rounded-full border border-amber-500/30 text-amber-500 text-[10px] font-bold uppercase bg-amber-500/10">
                Pending Finance
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              <div className="glass-card p-8">
                <div className="flex items-start justify-between mb-8">
                  <div>
                    <h1 className="text-4xl font-bold tracking-tight mb-2 uppercase">Deal Detail</h1>
                    <p className="font-mono text-gray-500 text-sm tracking-widest">{dealId}</p>
                  </div>
                  <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                    <Car size={32} className="text-gray-400" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-8 py-8 border-y border-white/5">
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-4">Customer Details</p>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
                        <User size={18} className="text-gray-400" />
                      </div>
                      <div>
                        <p className="text-sm font-bold">Walk-in Customer</p>
                        <p className="text-xs text-gray-500">Standard Attribution</p>
                      </div>
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-4">Reservation Date</p>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
                        <Calendar size={18} className="text-gray-400" />
                      </div>
                      <div>
                        <p className="text-sm font-bold">{new Date().toLocaleDateString()}</p>
                        <p className="text-xs text-gray-500">System Time</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 space-y-6">
                  <h3 className="text-xs uppercase tracking-widest text-gray-500">Waterfall Status</h3>
                  <div className="space-y-4">
                    {[
                      { name: 'Finance Ireland', status: 'Pending', color: 'text-amber-500' },
                      { name: 'Close Brothers', status: 'Locked', color: 'text-gray-600' },
                      { name: 'Finance4U', status: 'Locked', color: 'text-gray-600' }
                    ].map((step, i) => (
                      <div key={i} className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10">
                        <div className="flex items-center gap-3">
                          <div className={`w-2 h-2 rounded-full ${step.color.replace('text', 'bg')}`} />
                          <span className="text-sm font-medium">{step.name}</span>
                        </div>
                        <span className={`text-[10px] uppercase font-bold tracking-widest ${step.color}`}>
                          {step.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar Actions */}
            <div className="space-y-6">
              <div className="glass-card p-6 bg-amber-500/5 border-amber-500/20">
                <h4 className="text-xs uppercase tracking-widest text-amber-500 mb-4 font-bold">Next Step</h4>
                <p className="text-sm text-gray-400 mb-6">Initialize the Finance Waterfall to begin the approval sequence.</p>
                <button className="btn-primary w-full flex items-center justify-center gap-2">
                  <ShieldCheck size={18} />
                  Start Waterfall
                </button>
              </div>

              <div className="glass-card p-6">
                <h4 className="text-xs uppercase tracking-widest text-gray-500 mb-4 font-bold">Finance Summary</h4>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-xs text-gray-400">Vehicle Price</span>
                    <span className="text-xs font-mono font-bold">$265,000</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs text-gray-400">Total Approved</span>
                    <span className="text-xs font-mono font-bold text-gray-600">$0</span>
                  </div>
                  <div className="border-t border-white/5 pt-4 flex justify-between">
                    <span className="text-xs text-white">Remaining Balance</span>
                    <span className="text-sm font-mono font-bold text-amber-500">$265,000</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
