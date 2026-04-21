import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkColumns() {
  const { data, error } = await supabase
    .from('payments')
    .select('*')
    .limit(1);

  if (error) {
    console.error('Error selecting from payments:', error);
  } else {
    console.log('Columns in payments:', Object.keys(data[0] || {}));
  }
}

checkColumns();
