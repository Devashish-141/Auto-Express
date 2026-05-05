import { createClient } from '@supabase/supabase-js';

const url = 'https://aiuvtglosvjvxozayoie.supabase.co';
const key = 'sb_publishable_8PQ-voBBd5AkAsLtS9oEQw_AmuI3XBr';

async function check() {
  const supabase = createClient(url, key);
  const { data, error } = await supabase.from('vehicles').select('*').limit(1);
  if (error) {
    console.log('Error:', error.message);
  } else {
    console.log('Success! Found:', data.length, 'vehicles');
  }
}

check();
