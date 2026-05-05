import { createClient } from '@supabase/supabase-js';

const url = 'https://clhbnthrkfzdhtklwypi.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNsaGJudGhya2Z6ZGh0a2x3eXBpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY2MjI2NzIsImV4cCI6MjA5MjE5ODY3Mn0.bCD4eE7n-mecmd25YfBnUbe8F2SiajHplubGs33MgZQ';

async function listTables() {
  const supabase = createClient(url, key);
  
  // This is a hacky way to list tables if we don't have admin access, 
  // but let's try to query some common ones or use RPC if available.
  // Or just try to select from a table we know might exist.
  
  const tablesToTry = ['vehicles', 'cars', 'inventory', 'reps', 'deals', 'jobs'];
  
  for (const table of tablesToTry) {
    const { data, error } = await supabase.from(table).select('*').limit(1);
    if (error) {
      console.log(`Table ${table}: Error - ${error.message}`);
    } else {
      console.log(`Table ${table}: EXISTS! Found ${data.length} rows (limit 1)`);
    }
  }
}

listTables();
