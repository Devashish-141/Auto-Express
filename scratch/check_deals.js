const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const envPath = path.resolve(process.cwd(), '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');

const getEnvVar = (name) => {
  const match = envContent.match(new RegExp(`${name}=(.*)`));
  return match ? match[1].trim() : null;
};

const supabaseUrl = getEnvVar('NEXT_PUBLIC_SUPABASE_URL');
const supabaseKey = getEnvVar('NEXT_PUBLIC_SUPABASE_ANON_KEY');

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDeals() {
  const { data: deals, error } = await supabase
    .from('deals')
    .select('*, vehicles(*)');

  if (error) {
    console.error(error);
  } else {
    console.log(`Found ${deals.length} deals.`);
    deals.forEach(d => {
      console.log(`Deal ${d.id} for vehicle ${d.vehicles?.make} ${d.vehicles?.model} (${d.vehicles?.vin})`);
    });
  }
}

checkDeals();
