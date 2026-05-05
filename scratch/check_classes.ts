import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://sflhathpdqecvgsiixal.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNmbGhhdGhwZHFlY3Znc2lpeGFsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3Nzk4NTI5OCwiZXhwIjoyMDkzNTYxMjk4fQ.8NTmsAq9M52a0HQfA9uBUH5e9KiM1NX0VJr5eDh8yok';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function checkClasses() {
  const { data, error } = await supabase
    .from('vehicles')
    .select('class');

  if (error) {
    console.error(error);
    return;
  }

  const counts: Record<string, number> = {};
  for (const item of data) {
    const c = item.class;
    counts[c] = (counts[c] || 0) + 1;
  }
  
  console.log('Class counts:', counts);
}

checkClasses();
