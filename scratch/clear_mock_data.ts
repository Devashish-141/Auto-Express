import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function clearMockData() {
  console.log('Initiating Asset Clearance Protocol...');

  // Mock VINs from seed file
  const mockVins = [
    'VIN20ST907G12',
    'VIN20S4S07V13',
    'VIN20S1S07145',
    'VIN2067S00213',
    'VIN20S7B07412'
  ];

  // Also include the ones with weird prices (23, 75) if they still exist
  // though we fixed them earlier, maybe the user wants them gone.

  const { data, error } = await supabase
    .from('vehicles')
    .delete()
    .in('vin', mockVins);

  if (error) {
    console.error('Clearance Failed:', error);
  } else {
    console.log('Mock Assets Purged Successfully.');
  }

  // Check if there are any other cars that might be considered "mock"
  // If the user wants ALL cars gone, we could just delete all.
  // But let's start with the known seed data.
}

clearMockData();
