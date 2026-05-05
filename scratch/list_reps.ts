import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://sflhathpdqecvgsiixal.supabase.co';
const supabaseAnonKey = 'sb_publishable_nswJAyGxqYABFdOOBgC1ug_YIE8Jm8z';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function listReps() {
  const { data, error } = await supabase.from('reps').select('*');
  if (error) {
    console.error('Error:', error);
  } else {
    console.log('Reps:', data);
  }
}

listReps();
