import { supabase } from './supabase';

export async function getVehicles() {
  const { data, error } = await supabase
    .from('vehicles')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function updateVehicleStatus(id: string, status: string) {
  const { data, error } = await supabase
    .from('vehicles')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select();

  if (error) throw error;
  return data;
}

export async function getFinanceApplications(dealId: string) {
  const { data, error } = await supabase
    .from('finance_apps')
    .select('*')
    .eq('deal_id', dealId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data;
}

export async function updateLenderStatus(id: string, status: string, amount?: number) {
  const updateData: any = { status, updated_at: new Date().toISOString() };
  if (amount !== undefined) updateData.approved_amount = amount;

  const { data, error } = await supabase
    .from('finance_apps')
    .update(updateData)
    .eq('id', id)
    .select();

  if (error) throw error;
  return data;
}

export async function reserveVehicle(vehicleId: string, repCode: string, customerName: string, deposit: number = 0) {
  const { data, error } = await supabase.rpc('reserve_vehicle', {
    p_vehicle_id: vehicleId,
    p_rep_code: repCode,
    p_customer_name: customerName,
    p_deposit: deposit
  });

  if (error) throw error;
  return data; // Returns the v_deal_id
}

export async function unreserveVehicle(vehicleId: string) {
  // In a real app, this might update vehicle status back to 'available' 
  // and delete/cancel the associated deal.
  const { data, error } = await supabase
    .from('vehicles')
    .update({ status: 'available' })
    .eq('id', vehicleId)
    .select();

  if (error) throw error;
  return data;
}

// [KI-002] Payment Attribution — every payment is permanently stamped with the active rep_code.
// This is the programmatic solution to the "Amanda Problem": no payment can be inserted
// without a rep_code, making it impossible to log revenue anonymously.
interface LogPaymentParams {
  dealId: string;
  amount: number;
  date: string;
  method: 'Cash' | 'Card' | 'Transfer';
  repCode: string; // Mandatory — never optional
}

export async function logPayment({ dealId, amount, date, method, repCode }: LogPaymentParams) {
  const { data, error } = await supabase
    .from('payments')
    .insert({
      deal_id: dealId,
      amount,
      payment_date: date,
      method,
      rep_code: repCode, // Attribution stamp — immutable after insert
      is_voided: false,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getFinancialStatusByVehicle(vehicleId: string) {
  // 1. Get the latest deal for this vehicle
  const { data: deal, error: dealError } = await supabase
    .from('deals')
    .select(`
      id,
      customer_name,
      status,
      payments (amount, is_voided),
      finance_apps (approved_amount, status)
    `)
    .eq('vehicle_id', vehicleId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (dealError && dealError.code !== 'PGRST116') throw dealError;
  if (!deal) return null;

  const totalPayments = (deal.payments as any[] || []).reduce((acc, p) => p.is_voided ? acc : acc + Number(p.amount), 0);
  const totalFinance = (deal.finance_apps as any[] || []).reduce((acc, f) => f.status === 'approved' ? acc + (Number(f.approved_amount) || 0) : acc, 0);

  return {
    dealId: deal.id,
    customerName: deal.customer_name,
    totalPayments,
    totalFinance,
  };
}
