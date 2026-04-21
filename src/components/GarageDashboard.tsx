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
        <h2 className="text-3xl font-bold tracking-tight mb-2 uppercase italic">Deal Ledger</h2>
        <p className="text-gray-500 uppercase tracking-widest text-xs">Active Finance Pipeline & Garage Handshakes</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <div className="glass-card p-6 border-l-4 border-amber-500 bg-amber-500/5">
            <div className="flex items-center gap-3 mb-4">
              <Clock className="text-amber-500" size={20} />
              <h4 className="text-sm font-bold uppercase tracking-widest">Active Deals</h4>
            </div>
            <p className="text-3xl font-bold font-mono">{displayDeals.length}</p>
          </div>

          <div className="glass-card p-6 border-l-4 border-teal-500 bg-teal-500/5">
            <div className="flex items-center gap-3 mb-4">
              <CheckCircle className="text-teal-500" size={20} />
              <h4 className="text-sm font-bold uppercase tracking-widest">Awaiting Prep</h4>
            </div>
            <p className="text-3xl font-bold font-mono">
              {displayDeals.filter(d => d.status === 'pending').length}
            </p>
          </div>
        </div>

        <div className="lg:col-span-3 space-y-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4 border border-dashed border-white/10 rounded-2xl">
              <div className="w-8 h-8 border-4 border-white/5 border-t-white/30 rounded-full animate-spin" />
              <p className="text-[10px] uppercase tracking-[0.3em] text-gray-500">Syncing Deal Pipeline...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {deals.length === 0 && (
                <div className="flex items-center gap-2 px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded-lg mb-2">
                  <AlertTriangle className="text-amber-500" size={14} />
                  <span className="text-[9px] font-bold text-amber-500 uppercase tracking-widest">Demo Mode Active: Showing placeholder deals for presentation</span>
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
                    className="glass-card p-6 flex flex-col md:flex-row items-center justify-between gap-6 hover:bg-white/[0.03] transition-all group border-l-2 border-l-white/10 hover:border-l-amber-500"
                  >
                    <div className="flex items-center gap-6">
                      <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                        <User size={20} className="text-gray-400" />
                      </div>
                      <div>
                        <h4 className="text-lg font-bold tracking-tight uppercase group-hover:text-amber-500 transition-colors">
                          {deal.customer_name}
                        </h4>
                        <p className="text-[10px] text-gray-500 font-mono tracking-widest uppercase mt-1">
                          {deal.vehicles?.make} {deal.vehicles?.model} | VIN: {deal.vehicles?.vin?.slice(-6)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-12">
                      <div className="text-right">
                        <p className="text-[9px] text-gray-500 uppercase tracking-widest mb-1">Balance Due</p>
                        <p className={`text-xl font-mono font-bold ${balanceDue > 0 ? 'text-amber-500' : 'text-teal-500'}`}>
                          €{balanceDue.toLocaleString()}
                        </p>
                      </div>
                      <div className="p-2 rounded-full bg-white/5 text-gray-500 group-hover:text-white transition-colors">
                        <ArrowRight size={20} />
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
