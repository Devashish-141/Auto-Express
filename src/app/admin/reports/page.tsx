'use client';

import React, { useState, useEffect, useMemo } from 'react';
import TopNav from '@/components/dashboard/TopNav';
import { 
  Download, 
  Search, 
  Filter, 
  Calendar, 
  User as UserIcon, 
  TrendingUp, 
  DollarSign, 
  Award,
  ChevronDown
} from 'lucide-react';
import { getSalesReportData, getReps } from '@/lib/data';
import { useToast } from '@/context/ToastContext';

export default function AdminReportsPage() {
  const [data, setData] = useState<any[]>([]);
  const [reps, setReps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [selectedRep, setSelectedRep] = useState('All Reps');
  const [selectedStatus, setSelectedStatus] = useState('All Status');

  useEffect(() => {
    async function fetchData() {
      try {
        const [salesData, repsData] = await Promise.all([
          getSalesReportData(),
          getReps()
        ]);
        setData(salesData);
        setReps(repsData);
      } catch (error) {
        console.error('Error fetching report data:', error);
        showToast({ message: 'Failed to load report data', type: 'error' });
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [showToast]);

  const filteredData = useMemo(() => {
    return data.filter(item => {
      const itemDate = new Date(item.created_at);
      const startMatch = !dateRange.start || itemDate >= new Date(dateRange.start);
      const endMatch = !dateRange.end || itemDate <= new Date(dateRange.end);
      const repMatch = selectedRep === 'All Reps' || item.rep_code === selectedRep;
      const statusMatch = selectedStatus === 'All Status' || item.stage === selectedStatus.toLowerCase();
      
      return startMatch && endMatch && repMatch && statusMatch;
    });
  }, [data, dateRange, selectedRep, selectedStatus]);

  const summary = useMemo(() => {
    const totalSalesCount = filteredData.length;
    const totalRevenue = filteredData.reduce((acc, item) => acc + (Number(item.vehicle?.price) || 0), 0);
    const totalVRT = filteredData.reduce((acc, item) => acc + (Number(item.vrt_amount) || 0), 0);
    const totalCommissionPool = (totalRevenue - totalVRT) * 0.03;

    const repSales: Record<string, number> = {};
    filteredData.forEach(item => {
      repSales[item.rep_code] = (repSales[item.rep_code] || 0) + 1;
    });
    const topRepCode = Object.entries(repSales).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';
    const topRepName = reps.find(r => r.rep_code === topRepCode)?.name || topRepCode;

    return {
      totalSalesCount,
      totalRevenue,
      totalCommissionPool,
      topRepName
    };
  }, [filteredData, reps]);

  const handleExportCSV = () => {
    const headers = ['Date', 'Vehicle', 'VIN', 'Sale Price', 'VRT Amount', 'Total Paid', 'Finance Co', 'Rep Code', 'Commissionable'];
    const rows = filteredData.map(item => {
      const totalPaid = (item.payments || []).reduce((acc: number, p: any) => p.is_voided ? acc : acc + Number(p.amount), 0);
      const commissionable = (Number(item.vehicle?.price) || 0) - (Number(item.vrt_amount) || 0);
      
      return [
        new Date(item.created_at).toLocaleDateString(),
        `${item.vehicle?.make} ${item.vehicle?.model}`,
        item.vehicle?.vin,
        item.vehicle?.price,
        item.vrt_amount || 0,
        totalPaid,
        item.finance_company_code || 'N/A',
        item.rep_code,
        commissionable
      ];
    });

    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `sales_report_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showToast({ message: 'CSV Exported Successfully', type: 'success' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans text-foreground">
      <TopNav />
      
      <main className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-[1600px] mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-4xl font-black uppercase tracking-tighter mb-1 italic">Sales & Commissions</h1>
              <p className="text-[10px] uppercase tracking-[0.4em] text-black font-black">Administrative Oversight & Reporting</p>
            </div>
            <button 
              onClick={handleExportCSV}
              className="flex items-center gap-2 px-8 py-4 bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 active:scale-95"
            >
              <Download size={18} />
              Export Protocol Data
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-8 border border-slate-200 rounded-[2rem] relative overflow-hidden group shadow-sm">
              <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                <TrendingUp size={64} className="text-blue-600" />
              </div>
              <p className="text-[9px] uppercase tracking-[0.4em] text-black font-black mb-6">Total Sales for Period</p>
              <div className="flex items-end gap-4">
                <h2 className="text-4xl font-black font-mono tracking-tighter text-foreground">€{summary.totalRevenue.toLocaleString()}</h2>
                <span className="text-[10px] text-teal-600 font-black mb-1.5 uppercase tracking-[0.2em]">{summary.totalSalesCount} Units</span>
              </div>
            </div>

            <div className="bg-white p-8 border border-slate-200 rounded-[2rem] relative overflow-hidden group shadow-sm">
              <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                <DollarSign size={64} className="text-teal-600" />
              </div>
              <p className="text-[9px] uppercase tracking-[0.4em] text-black font-black mb-6">Total Commission Pool</p>
              <div className="flex items-end gap-4">
                <h2 className="text-4xl font-black font-mono tracking-tighter text-teal-600">€{summary.totalCommissionPool.toLocaleString()}</h2>
                <span className="text-[10px] text-black font-black mb-1.5 uppercase tracking-[0.2em]">3% Baseline</span>
              </div>
            </div>

            <div className="bg-white p-8 border border-slate-200 rounded-[2rem] relative overflow-hidden group shadow-sm">
              <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                <Award size={64} className="text-blue-600" />
              </div>
              <p className="text-[9px] uppercase tracking-[0.4em] text-black font-black mb-6">Top Performing Rep</p>
              <div className="flex items-end gap-4">
                <h2 className="text-4xl font-black uppercase tracking-tighter text-blue-600 italic">{summary.topRepName}</h2>
                <span className="text-[10px] text-black font-black mb-1.5 uppercase tracking-[0.2em]">Lead Velocity</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 border border-slate-200 flex flex-wrap items-center gap-8 rounded-[1.5rem] shadow-sm">
            <div className="flex items-center gap-3">
              <Calendar size={14} className="text-black" />
              <input 
                type="date" 
                value={dateRange.start}
                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                className="bg-transparent border-none text-[10px] font-black uppercase tracking-[0.2em] focus:ring-0 cursor-pointer text-foreground" 
              />
              <span className="text-black font-black">/</span>
              <input 
                type="date" 
                value={dateRange.end}
                onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                className="bg-transparent border-none text-[10px] font-black uppercase tracking-[0.2em] focus:ring-0 cursor-pointer text-foreground" 
              />
            </div>

            <div className="h-8 w-[1px] bg-slate-100 hidden md:block" />

            <div className="flex items-center gap-3">
              <UserIcon size={14} className="text-black" />
              <select 
                value={selectedRep}
                onChange={(e) => setSelectedRep(e.target.value)}
                className="bg-transparent border-none text-[10px] font-black uppercase tracking-[0.2em] focus:ring-0 cursor-pointer text-foreground appearance-none pr-6"
              >
                <option value="All Reps" className="bg-white">All Reps</option>
                {reps.map(r => (
                  <option key={r.rep_code} value={r.rep_code} className="bg-white">{r.name}</option>
                ))}
              </select>
            </div>

            <div className="h-8 w-[1px] bg-slate-100 hidden md:block" />

            <div className="flex items-center gap-3">
              <Filter size={14} className="text-black" />
              <select 
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="bg-transparent border-none text-[10px] font-black uppercase tracking-[0.2em] focus:ring-0 cursor-pointer text-foreground appearance-none pr-6"
              >
                <option value="All Status" className="bg-white">All Status</option>
                <option value="Invoiced" className="bg-white">Invoiced</option>
                <option value="Registered" className="bg-white">Registered</option>
                <option value="Closed" className="bg-white">Closed</option>
              </select>
            </div>
          </div>

          <div className="bg-white border border-slate-200 overflow-hidden rounded-[2rem] shadow-sm">
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-[9px] uppercase tracking-[0.3em] font-black bg-slate-50">
                    <th className="px-8 py-5 force-black">Date</th>
                    <th className="px-8 py-5 force-black">Asset Identification</th>
                    <th className="px-8 py-5 text-right force-black">Market Value</th>
                    <th className="px-8 py-5 text-right force-black">VRT Offset</th>
                    <th className="px-8 py-5 text-right force-black">Total Realized</th>
                    <th className="px-8 py-5 force-black">Protocol</th>
                    <th className="px-8 py-5 text-right force-black">Commissionable</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredData.map((item) => {
                    const totalPaid = (item.payments || []).reduce((acc: number, p: any) => p.is_voided ? acc : acc + Number(p.amount), 0);
                    const commissionable = (Number(item.vehicle?.price) || 0) - (Number(item.vrt_amount) || 0);
                    
                    return (
                      <tr key={item.id} className="group hover:bg-slate-50 transition-colors">
                        <td className="px-8 py-5 text-[10px] font-mono text-black">
                          {new Date(item.created_at).toLocaleDateString('en-IE')}
                        </td>
                        <td className="px-8 py-5">
                          <p className="text-[11px] font-black uppercase tracking-tight text-foreground italic">{item.vehicle?.make} {item.vehicle?.model}</p>
                          <p className="text-[9px] font-mono text-black uppercase tracking-widest">{item.vehicle?.vin}</p>
                        </td>
                        <td className="px-8 py-5 text-right text-xs font-mono font-black text-foreground">
                          €{Number(item.vehicle?.price || 0).toLocaleString()}
                        </td>
                        <td className="px-8 py-5 text-right text-xs font-mono text-black">
                          €{Number(item.vrt_amount || 0).toLocaleString()}
                        </td>
                        <td className="px-8 py-5 text-right text-xs font-mono font-black text-teal-600">
                          €{totalPaid.toLocaleString()}
                        </td>
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-3">
                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-black">{item.rep_code}</span>
                          </div>
                        </td>
                        <td className="px-8 py-5 text-right">
                          <span className="text-sm font-mono font-black text-blue-600">
                            €{commissionable.toLocaleString()}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            
            {filteredData.length === 0 && (
              <div className="py-24 text-center flex flex-col items-center gap-6">
                <Search size={48} className="text-black" />
                <p className="text-[10px] uppercase tracking-[0.4em] text-black font-black">No matching telemetry found</p>
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
}
