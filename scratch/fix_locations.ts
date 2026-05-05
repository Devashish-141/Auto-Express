import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixLocations() {
    console.log('Updating all "Main Garage" locations to "Limerick"...');
    const { data, error, count } = await supabase
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
