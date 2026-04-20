import { supabase } from './supabase';

export async function getVehicles() {
  const { data, error } = await supabase
    .from('deals')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function updateVehicleStatus(id: string, status: string) {
  const { data, error } = await supabase
    .from('deals')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select();

  if (error) throw error;
  return data;
}

export async function getFinanceApplications(dealId: string) {
  const { data, error } = await supabase
    .from('finance_applications')
    .select('*')
    .eq('deal_id', dealId)
    .order('sequence_order', { ascending: true });

  if (error) throw error;
  return data;
}

export async function updateLenderStatus(id: string, status: string, amount?: number) {
  const updateData: any = { status, updated_at: new Date().toISOString() };
  if (amount !== undefined) updateData.approved_amount = amount;

  const { data, error } = await supabase
    .from('finance_applications')
    .update(updateData)
    .eq('id', id)
    .select();

  if (error) throw error;
  return data;
}
