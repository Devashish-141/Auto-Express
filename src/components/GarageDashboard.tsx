import { Wrench, CheckCircle, Clock, AlertTriangle, ArrowRight, User, Euro } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';
import Link from 'next/link';

interface GarageDeal {
  id: string;
  customer_name: string;
  status: string;
  created_at: string;
  vehicles: {
    make: string;
    model: string;
    price: number;
    vin: string;
  };
  payments: { amount: number; is_voided: boolean }[];
  finance_apps: { approved_amount: number; status: string }[];
}

const DEMO_DEALS: GarageDeal[] = [
  {
    id: 'demo-1',
    customer_name: 'James Henderson',
    status: 'pending',
    created_at: new Date().toISOString(),
    vehicles: {
      make: 'Aston Martin',
      model: 'DB12 Volante',
      price: 285000,
      vin: 'AMVDB12V8SK9012'
    },
    payments: [{ amount: 50000, is_voided: false }],
    finance_apps: [{ approved_amount: 200000, status: 'approved' }]
  },
  {
    id: 'demo-2',
    customer_name: 'Global Tech Solutions',
    status: 'pending',
    created_at: new Date().toISOString(),
    vehicles: {
      make: 'BMW',
      model: 'XM Label Red',
      price: 210000,
      vin: 'WBA53CM040N1234'
    },
    payments: [{ amount: 25000, is_voided: false }],
    finance_apps: [{ approved_amount: 0, status: 'declined' }]
  }
];

const GarageDashboard = () => {
  const [deals, setDeals] = useState<GarageDeal[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDeals = async () => {
    const { data, error } = await supabase
      .from('deals')
      .select(`
        id,
        customer_name,
        status,
        created_at,
        vehicles (make, model, price, vin),
        payments (amount, is_voided),
        finance_apps (approved_amount, status)
      `)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setDeals(data as any);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchDeals();

    const channel = supabase
      .channel('garage-updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'deals' }, () => fetchDeals())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'payments' }, () => fetchDeals())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'finance_apps' }, () => fetchDeals())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const displayDeals = deals.length > 0 ? deals : DEMO_DEALS;

  return (
    <div className="space-y-8 py-8 animate-in slide-in-from-right duration-700">
      <div>
        <h2 className="text-3xl font-bold tracking-tight mb-2 uppercase italic text-navy-accent">Deal Ledger</h2>
        <p className="text-slate-400 uppercase tracking-widest text-xs">Active Finance Pipeline & Garage Handshakes</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-4 lg:space-y-4">
          <div className="glass-card p-6 border-l-4 border-amber-600 bg-amber-50">
            <div className="flex items-center gap-3 mb-4">
              <Clock className="text-amber-600" size={20} />
              <h4 className="text-sm font-bold uppercase tracking-widest text-navy-accent">Active Deals</h4>
            </div>
            <p className="text-3xl font-bold font-mono text-navy-accent">{displayDeals.length}</p>
          </div>

          <div className="glass-card p-6 border-l-4 border-teal-600 bg-teal-50">
            <div className="flex items-center gap-3 mb-4">
              <CheckCircle className="text-teal-600" size={20} />
              <h4 className="text-sm font-bold uppercase tracking-widest text-navy-accent">Awaiting Prep</h4>
            </div>
            <p className="text-3xl font-bold font-mono text-navy-accent">
              {displayDeals.filter(d => d.status === 'pending').length}
            </p>
          </div>
        </div>

        <div className="lg:col-span-3 space-y-4 md:space-y-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4 border border-dashed border-navy-border rounded-2xl">
              <div className="w-8 h-8 border-4 border-slate-100 border-t-navy-accent rounded-full animate-spin" />
              <p className="text-[10px] uppercase tracking-[0.3em] text-slate-400">Syncing Deal Pipeline...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {deals.length === 0 && (
                <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-200 rounded-lg mb-2">
                  <AlertTriangle className="text-amber-600" size={14} />
                  <span className="text-[9px] font-bold text-amber-600 uppercase tracking-widest">Demo Mode Active</span>
                </div>
              )}
              {displayDeals.map(deal => {
                const totalPaid = (deal.payments || []).reduce((acc, p) => p.is_voided ? acc : acc + Number(p.amount), 0);
                const totalFinance = (deal.finance_apps || []).reduce((acc, f) => f.status === 'approved' ? acc + (Number(f.approved_amount) || 0) : acc, 0);
                const balanceDue = (deal.vehicles?.price || 0) - totalPaid - totalFinance;

                return (
                  <Link 
                    key={deal.id} 
                    href={`/garage/${deal.id}`}
                    className="glass-card p-4 md:p-6 flex flex-col md:flex-row items-center justify-between gap-4 md:gap-6 bg-white hover:bg-slate-50 transition-all group border-l-2 border-l-slate-100 hover:border-l-amber-600 shadow-sm"
                  >
                    <div className="flex items-center gap-4 md:gap-6 w-full md:w-auto">
                      <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-slate-100 flex items-center justify-center border border-navy-border flex-shrink-0">
                        <User size={18} className="md:w-5 md:h-5 text-slate-400" />
                      </div>
                      <div className="overflow-hidden">
                        <h4 className="text-md md:text-lg font-bold tracking-tight uppercase text-navy-accent group-hover:text-amber-600 transition-colors truncate">
                          {deal.customer_name}
                        </h4>
                        <p className="text-[9px] md:text-[10px] text-slate-400 font-mono tracking-widest uppercase mt-1 truncate">
                          {deal.vehicles?.make} {deal.vehicles?.model} | {deal.vehicles?.vin?.slice(-6)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between md:justify-end gap-6 md:gap-12 w-full md:w-auto pt-4 md:pt-0 border-t md:border-t-0 border-slate-100">
                      <div className="text-left md:text-right">
                        <p className="text-[8px] md:text-[9px] text-slate-400 uppercase tracking-widest mb-1">Balance Due</p>
                        <p className={`text-lg md:text-xl font-mono font-bold ${balanceDue > 0 ? 'text-amber-600' : 'text-teal-600'}`}>
                          €{balanceDue.toLocaleString()}
                        </p>
                      </div>
                      <div className="p-2 rounded-full bg-slate-50 text-slate-400 group-hover:text-navy-accent group-hover:bg-slate-100 transition-colors">
                        <ArrowRight size={18} className="md:w-5 md:h-5" />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GarageDashboard;
