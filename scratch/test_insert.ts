import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://sflhathpdqecvgsiixal.supabase.co';
const supabaseAnonKey = 'sb_publishable_nswJAyGxqYABFdOOBgC1ug_YIE8Jm8z'; // From .env.local

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testInsert() {
  console.log('Testing insert...');
  const { data, error } = await supabase
    .from('vehicles')
    .insert({
      vin: 'TEST-VIN-' + Date.now(),
      make: 'TEST-MAKE',
      model: 'TEST-MODEL',
      year: 2024,
      price: 10000,
      status: 'available',
      location: 'Limerick'
    })
    .select()
    .single();

  if (error) {
    console.error('Insert failed:', error);
  } else {
    console.log('Insert successful:', data);
  }
}

testInsert();
