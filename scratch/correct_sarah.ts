import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://sflhathpdqecvgsiixal.supabase.co';
const supabaseAnonKey = 'sb_publishable_nswJAyGxqYABFdOOBgC1ug_YIE8Jm8z';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function correctSarah() {
  console.log('Voiding the incorrect 23M payment for Sarah Connor...');
  const { error } = await supabase
    .from('payments')
    .update({ 
      is_voided: true, 
      void_reason: 'Correction of accidental test entry' 
    })
    .eq('id', 'ac7436d2-69c8-46cd-856f-621144011c1e');

  if (error) {
    console.error('Error:', error);
  } else {
    console.log('Payment voided successfully.');
  }
}

correctSarah();
