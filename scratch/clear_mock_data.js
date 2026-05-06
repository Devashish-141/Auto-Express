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

async function deepClearance() {
  console.log('Initiating Deep Asset Clearance Protocol...');

  // Target VINs (Original seed + fixed "23" car + test cars)
  const targetVins = [
    'VIN20ST907G12',
    'VIN20S4S07V13',
    'VIN20S1S07145',
    'VIN2067S00213',
    'VIN20S7B07412',
    '23',
    'TEST-VIN-1778006447524'
  ];

  for (const vin of targetVins) {
    console.log(`Attempting to purge asset: ${vin}`);
    const { error } = await supabase
      .from('vehicles')
      .delete()
      .eq('vin', vin);

    if (error) {
      console.warn(`Purge Failed for ${vin}: ${error.message}`);
    } else {
      console.log(`Asset ${vin} Purged Successfully.`);
    }
  }
}

deepClearance();
