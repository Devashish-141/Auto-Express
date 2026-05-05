import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://sflhathpdqecvgsiixal.supabase.co';
const supabaseAnonKey = 'sb_publishable_nswJAyGxqYABFdOOBgC1ug_YIE8Jm8z';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function findSarah() {
  const { data: deals } = await supabase.from('deals').select('*').ilike('customer_name', '%sarah%');
  console.log('Deals with Sarah:', deals);

  const { data: vehicles } = await supabase.from('vehicles').select('*').ilike('make', '%sarah%');
  console.log('Vehicles with Sarah (Make):', vehicles);

  const { data: vehicles2 } = await supabase.from('vehicles').select('*').ilike('model', '%sarah%');
  console.log('Vehicles with Sarah (Model):', vehicles2);
}

findSarah();
