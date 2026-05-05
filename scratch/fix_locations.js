const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://sflhathpdqecvgsiixal.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNmbGhhdGhwZHFlY3Znc2lpeGFsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3Nzk4NTI5OCwiZXhwIjoyMDkzNTYxMjk4fQ.8NTmsAq9M52a0HQfA9uBUH5e9KiM1NX0VJr5eDh8yok';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function fixLocations() {
    console.log('Updating all "Main Garage" locations to "Limerick"...');
    const { data, error } = await supabase
        .from('vehicles')
        .update({ location: 'Limerick' })
        .eq('location', 'Main Garage')
        .select();

    if (error) {
        console.error('Error updating locations:', error);
    } else {
        console.log(`Successfully updated ${data?.length} vehicles to "Limerick".`);
    }
}

fixLocations();
