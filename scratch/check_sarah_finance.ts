import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://sflhathpdqecvgsiixal.supabase.co';
const supabaseAnonKey = 'sb_publishable_nswJAyGxqYABFdOOBgC1ug_YIE8Jm8z';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkSarahFinance() {
  const { data: apps } = await supabase
    .from('finance_apps')
    .select('*')
    .eq('deal_id', '991af984-1aed-481f-967d-ede3dea31069');

  console.log('Sarah Finance Apps:', apps);
}

checkSarahFinance();
