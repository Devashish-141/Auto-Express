import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://sflhathpdqecvgsiixal.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNmbGhhdGhwZHFlY3Znc2lpeGFsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3Nzk4NTI5OCwiZXhwIjoyMDkzNTYxMjk4fQ.8NTmsAq9M52a0HQfA9uBUH5e9KiM1NX0VJr5eDh8yok';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function createMockDeal() {
  console.log('--- Creating Mock Deal & Financial Details ---');

  // 1. Get an available vehicle
  const { data: vehicles, error: vError } = await supabase
    .from('vehicles')
    .select('*')
    .eq('status', 'available')
    .limit(1);

  if (vError || !vehicles || vehicles.length === 0) {
    console.error('Error finding available vehicle:', vError || 'No available vehicles found.');
    return;
  }

  const vehicle = vehicles[0];
  console.log(`Using Vehicle: ${vehicle.make} ${vehicle.model} (VIN: ${vehicle.vin})`);

  // 2. Mark vehicle as sold
  await supabase.from('vehicles').update({ status: 'sold' }).eq('id', vehicle.id);

  // 3. Create the Deal
  const { data: deal, error: dealError } = await supabase
    .from('deals')
    .insert({
      vehicle_id: vehicle.id,
      customer_name: 'Sarah Connor',
      rep_code: 'NICK-01',
      status: 'pending',
      stage: 'pending'
    })
    .select()
    .single();

  if (dealError) {
    console.error('Error creating deal:', dealError);
    return;
  }

  console.log(`Created Deal ID: ${deal.id} for Sarah Connor`);

  // 4. Add Payments (Financial Details)
  const payments = [
    { deal_id: deal.id, amount: 2500, rep_code: 'NICK-01', method: 'Card', payment_date: new Date().toISOString() },
    { deal_id: deal.id, amount: 5000, rep_code: 'NICK-01', method: 'Transfer', payment_date: new Date().toISOString() }
  ];

  const { error: pError } = await supabase.from('payments').insert(payments);
  if (pError) console.error('Error adding payments:', pError);
  else console.log('Added 2 payments totaling €7,500');

  // 5. Add Finance Applications
  const financeApps = [
    { deal_id: deal.id, lender_name: 'Finance Ireland', status: 'declined', approved_amount: 0 },
    { deal_id: deal.id, lender_name: 'Close Brothers', status: 'approved', approved_amount: vehicle.price - 10000 }
  ];

  const { error: fError } = await supabase.from('finance_apps').insert(financeApps);
  if (fError) console.error('Error adding finance apps:', fError);
  else console.log(`Added 2 finance apps. Close Brothers approved €${(vehicle.price - 10000).toLocaleString()}`);

  console.log('\n--- SUCCESS: Mock Deal Generated ---');
  console.log(`View it at: http://localhost:3001/garage/${deal.id}`);
}

createMockDeal();
