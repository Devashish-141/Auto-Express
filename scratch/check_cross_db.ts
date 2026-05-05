import { createClient } from '@supabase/supabase-js';

const projects = [
  {
    name: 'TN Solar Sitevisit',
    url: 'https://clhbnthrkfzdhtklwypi.supabase.co',
    key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNsaGJudGhya2Z6ZGh0a2x3eXBpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY2MjI2NzIsImV4cCI6MjA5MjE5ODY3Mn0.bCD4eE7n-mecmd25YfBnUbe8F2SiajHplubGs33MgZQ'
  },
  {
    name: 'Proposal Generator',
    url: 'https://aiuvtglosvjvxozayoie.supabase.co',
    key: 'sb_publishable_8PQ-voBBd5AkAsLtS9oEQw_AmuI3XBr'
  }
];

async function checkProject(p) {
  console.log(`\n--- Checking ${p.name} (${p.url}) ---`);
  const supabase = createClient(p.url, p.key);

  console.log('Checking vehicles table...');
  const { data: vehicles, error: vError } = await supabase.from('vehicles').select('*').limit(1);
  if (vError) {
    console.error('Vehicles table error:', vError.message);
  } else {
    console.log('Vehicles table exists! Found:', vehicles.length, 'records');
  }

  console.log('Checking reps table...');
  const { data: reps, error: rError } = await supabase.from('reps').select('*').limit(1);
  if (rError) {
    console.error('Reps table error:', rError.message);
  } else {
    console.log('Reps table exists! Found:', reps.length, 'records');
  }
}

async function run() {
  for (const p of projects) {
    await checkProject(p);
  }
}

run();
