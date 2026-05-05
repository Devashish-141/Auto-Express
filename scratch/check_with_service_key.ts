import { createClient } from '@supabase/supabase-js';

const url = 'https://clhbnthrkfzdhtklwypi.supabase.co';
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNsaGJudGhya2Z6ZGh0a2x3eXBpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjYyMjY3MiwiZXhwIjoyMDkyMTk4NjcyfQ.WtJD2BGdKHWmmQWlHep_-TqjXgKC6p5VBWbhBLRj4lg';

async function listSchemas() {
  const supabase = createClient(url, serviceKey);
  
  // Try to query pg_namespace
  const { data, error } = await supabase.rpc('get_schemas'); // If it exists
  if (error) {
    console.log('RPC get_schemas failed, trying raw query...');
    // We can't do raw queries easily via client, but we can try to select from a table in another schema
    // if we know it exists.
  }
  
  // Let's try common tables in public schema again with service key
  const tables = ['vehicles', 'reps', 'deals', 'payments', 'finance_apps', 'jobs'];
  for (const table of tables) {
    const { data, error } = await supabase.from(table).select('*').limit(1);
    if (error) {
      console.log(`Table ${table}: Error - ${error.message}`);
    } else {
      console.log(`Table ${table}: EXISTS! Found ${data?.length} rows`);
    }
  }
}

listSchemas();
