import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!; // Ideally Service Role if available, but Anon might work if RLS allows
const supabase = createClient(supabaseUrl, supabaseKey);

async function fixPrices() {
  console.log('Fetching vehicles with low prices...');
  const { data: vehicles, error } = await supabase
    .from('vehicles')
    .select('id, make, model, price')
    .lt('price', 1000);

  if (error) {
    console.error('Error fetching vehicles:', error);
    return;
  }

  if (!vehicles || vehicles.length === 0) {
    console.log('No vehicles found with low prices.');
    return;
  }

  console.log(`Found ${vehicles.length} vehicles to update.`);

  for (const vehicle of vehicles) {
    const newPrice = vehicle.price * 1000;
    console.log(`Updating ${vehicle.make} ${vehicle.model} from ${vehicle.price} to ${newPrice}`);
    
    const { error: updateError } = await supabase
      .from('vehicles')
      .update({ price: newPrice })
      .eq('id', vehicle.id);

    if (updateError) {
      console.error(`Error updating vehicle ${vehicle.id}:`, updateError);
    } else {
      console.log(`Successfully updated ${vehicle.id}`);
    }
  }
}

fixPrices();
