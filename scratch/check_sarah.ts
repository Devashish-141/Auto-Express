import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://sflhathpdqecvgsiixal.supabase.co';
const supabaseAnonKey = 'sb_publishable_nswJAyGxqYABFdOOBgC1ug_YIE8Jm8z';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkSarahDeal() {
  const { data: deal } = await supabase
    .from('deals')
    .select(`
      *,
      vehicles (*),
      payments (*)
    `)
    .eq('customer_name', 'Sarah Connor')
    .single();

  console.log('Sarah Deal Info:', JSON.stringify(deal, null, 2));
}

checkSarahDeal();
