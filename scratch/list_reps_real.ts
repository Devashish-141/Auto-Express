import { createClient } from '@supabase/supabase-js';

const s = createClient(
  'https://sflhathpdqecvgsiixal.supabase.co', 
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNmbGhhdGhwZHFlY3Znc2lpeGFsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3Nzk4NTI5OCwiZXhwIjoyMDkzNTYxMjk4fQ.8NTmsAq9M52a0HQfA9uBUH5e9KiM1NX0VJr5eDh8yok'
);

async function listReps() {
  const { data, error } = await s.from('reps').select('*');
  if (error) console.error(error);
  else console.log(JSON.stringify(data, null, 2));
}

listReps();
