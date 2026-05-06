import { Wrench, CheckCircle, Clock, AlertTriangle, ArrowRight, User, Euro, Plus, X, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useRep } from '@/context/RepContext';
import { useToast } from '@/context/ToastContext';
import { useRouter } from 'next/navigation';
import AddVehicleModal from './AddVehicleModal';

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

const GarageDashboard = () => {
  const [deals, setDeals] = useState<GarageDeal[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddStockModalOpen, setIsAddStockModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { rep } = useRep();
  const { showToast } = useToast();
  const router = useRouter();

  const [formData, setFormData] = useState({
    make: '',
    model: '',
    vin: '',
    price: '',
    customerName: ''
  });

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

  const handleCreateDeal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rep) return;
    setIsSubmitting(true);

    try {
      const { data: vehicle, error: vError } = await supabase
        .from('vehicles')
        .insert({
          make: formData.make,
          model: formData.model,
          vin: formData.vin,
          price: parseFloat(formData.price),
          sale_price: parseFloat(formData.price),
          status: 'sold',
          location: 'Limerick',
          registration_number: formData.vin,
          created_by: rep
        })
        .select()
        .single();

      if (vError) throw vError;

      const { data: deal, error: dealError } = await supabase
        .from('deals')
        .insert({
          vehicle_id: vehicle.id,
          customer_name: formData.customerName,
          rep_code: rep,
          status: 'pending',
          stage: 'pending'
        })
        .select()
        .single();

      if (dealError) throw dealError;

      showToast({ message: 'Deal Created Successfully', type: 'success' });
      setIsModalOpen(false);
      router.push(`/garage/${deal.id}`);
    } catch (err: any) {
      showToast({ message: err.message || 'Failed to create deal', type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 py-8 animate-in slide-in-from-right duration-700">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-4xl font-black tracking-tighter mb-2 uppercase italic text-foreground">Deal Ledger</h2>
          <p className="text-slate-400 uppercase tracking-[0.4em] text-[10px] font-mono">Active Finance Pipeline & Garage Handshakes</p>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsAddStockModalOpen(true)}
            className="flex items-center gap-2 bg-blue-600/10 text-blue-600 border border-blue-500/20 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-sm hover:bg-blue-600 hover:text-white hover:border-blue-500 transition-all hover:scale-105 active:scale-95"
          >
            <Plus size={16} />
            Add to Stock
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all hover:scale-105 active:scale-95"
          >
            <Plus size={16} />
            Create New Deal
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-4 lg:space-y-4">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <Clock className="text-amber-500" size={20} />
              <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Active Deals</h4>
            </div>
            <p className="text-4xl font-black font-mono text-foreground tracking-tighter">{deals.length}</p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <CheckCircle className="text-teal-500" size={20} />
              <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Awaiting Prep</h4>
            </div>
            <p className="text-4xl font-black font-mono text-foreground tracking-tighter">
              {deals.filter(d => d.status === 'pending').length}
            </p>
          </div>
        </div>

        <div className="lg:col-span-3 space-y-4 md:space-y-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4 border border-dashed border-slate-200 rounded-3xl bg-slate-50/50">
              <div className="w-8 h-8 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin" />
              <p className="text-[10px] uppercase tracking-[0.3em] text-slate-400 font-mono">Syncing Deal Pipeline...</p>
            </div>
          ) : deals.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4 border border-dashed border-slate-200 rounded-3xl bg-slate-50/50">
              <Wrench size={40} className="text-slate-200" />
              <div className="text-center">
                <p className="text-sm font-black text-slate-400 uppercase tracking-[0.2em]">No Active Deals Found</p>
                <p className="text-[10px] text-slate-300 mt-1 uppercase tracking-widest font-mono">Create a deal manually or reserve from the Stock page.</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {deals.map(deal => {
                const totalPaid = (deal.payments || []).reduce((acc, p) => p.is_voided ? acc : acc + Number(p.amount), 0);
                const totalFinance = (deal.finance_apps || []).reduce((acc, f) => f.status === 'approved' ? acc + (Number(f.approved_amount) || 0) : acc, 0);
                const balanceDue = (deal.vehicles?.price || 0) - totalPaid - totalFinance;

                return (
                  <Link 
                    key={deal.id} 
                    href={`/garage/${deal.id}`}
                    className="bg-white p-5 md:p-6 flex flex-col md:flex-row items-center justify-between gap-4 md:gap-6 rounded-3xl border border-slate-200 hover:border-blue-500/50 transition-all group shadow-sm relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/[0.02] to-blue-500/0 opacity-0 group-hover:opacity-100 transition-opacity" />
                    
                    <div className="flex items-center gap-4 md:gap-6 w-full md:w-auto relative z-10">
                      <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center border border-slate-200 group-hover:border-blue-500/30 transition-colors">
                        <User size={20} className="text-slate-400 group-hover:text-blue-600 transition-colors" />
                      </div>
                      <div className="overflow-hidden">
                        <h4 className="text-lg md:text-xl font-black tracking-tight uppercase text-foreground group-hover:text-blue-600 transition-colors truncate italic">
                          {deal.customer_name}
                        </h4>
                        <p className="text-[9px] md:text-[10px] text-slate-400 font-mono tracking-[0.2em] uppercase mt-1 truncate">
                          {deal.vehicles?.make} {deal.vehicles?.model} <span className="opacity-30 mx-2">|</span> {deal.vehicles?.vin?.slice(-6)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between md:justify-end gap-8 md:gap-16 w-full md:w-auto pt-4 md:pt-0 border-t md:border-t-0 border-slate-100 relative z-10">
                      <div className="text-left md:text-right">
                        <p className="text-[9px] text-slate-400 uppercase tracking-[0.3em] mb-1 font-black">Balance Due</p>
                        <p className={`text-xl md:text-2xl font-black font-mono tracking-tighter ${balanceDue > 0 ? 'text-amber-600' : 'text-teal-600'}`}>
                          €{balanceDue.toLocaleString()}
                        </p>
                      </div>
                      <div className="p-3 rounded-2xl bg-slate-50 text-slate-400 group-hover:text-blue-600 group-hover:bg-slate-100 transition-all">
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

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-200"
            >
              <div className="p-8 border-b border-slate-200 flex items-center justify-between bg-slate-50">
                <div>
                  <h3 className="text-3xl font-black uppercase tracking-tight text-foreground italic">Create Manual Deal</h3>
                  <p className="text-[10px] text-slate-400 uppercase tracking-[0.4em] mt-1 font-mono">New Inventory Attribution Pipeline</p>
                </div>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                >
                  <X size={24} className="text-slate-400 hover:text-foreground" />
                </button>
              </div>

              <form onSubmit={handleCreateDeal} className="p-8 space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[9px] uppercase tracking-[0.3em] text-slate-400 font-black ml-1">Vehicle Make</label>
                    <input 
                      required
                      value={formData.make}
                      onChange={e => setFormData({...formData, make: e.target.value})}
                      placeholder="e.g. TOYOTA"
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm font-bold text-foreground outline-none focus:border-blue-500/50 transition-all placeholder:text-slate-300"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] uppercase tracking-[0.3em] text-slate-400 font-black ml-1">Vehicle Model</label>
                    <input 
                      required
                      value={formData.model}
                      onChange={e => setFormData({...formData, model: e.target.value})}
                      placeholder="e.g. CROWN"
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm font-bold text-foreground outline-none focus:border-blue-500/50 transition-all placeholder:text-slate-300"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[9px] uppercase tracking-[0.3em] text-slate-400 font-black ml-1">VIN Identification</label>
                  <input 
                    required
                    value={formData.vin}
                    onChange={e => setFormData({...formData, vin: e.target.value})}
                    placeholder="Enter Full Chassis Signature"
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm font-mono font-bold text-foreground outline-none focus:border-blue-500/50 transition-all placeholder:text-slate-300"
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[9px] uppercase tracking-[0.3em] text-slate-400 font-black ml-1">Market Value (€)</label>
                    <input 
                      required
                      type="number"
                      value={formData.price}
                      onChange={e => setFormData({...formData, price: e.target.value})}
                      placeholder="0.00"
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm font-mono font-bold text-blue-600 outline-none focus:border-blue-500/50 transition-all placeholder:text-slate-300"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] uppercase tracking-[0.3em] text-slate-400 font-black ml-1">Customer Identity</label>
                    <input 
                      required
                      value={formData.customerName}
                      onChange={e => setFormData({...formData, customerName: e.target.value})}
                      placeholder="Full Legal Name"
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm font-bold text-foreground outline-none focus:border-blue-500/50 transition-all placeholder:text-slate-300"
                    />
                  </div>
                </div>

                <div className="pt-6 flex gap-4">
                  <button 
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-all border border-slate-200"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-[2] py-4 bg-blue-600 text-white text-[10px] font-black uppercase tracking-[0.3em] rounded-2xl flex items-center justify-center gap-3 shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all disabled:opacity-50 active:scale-95"
                  >
                    {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Euro size={18} />}
                    Establish Deal Pipeline
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <AddVehicleModal 
        isOpen={isAddStockModalOpen}
        onClose={() => setIsAddStockModalOpen(false)}
        onSuccess={() => fetchDeals()}
      />
    </div>
  );
};

export default GarageDashboard;
