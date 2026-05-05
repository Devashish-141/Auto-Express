import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// [KI-009] Data Import Configuration
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://sflhathpdqecvgsiixal.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNmbGhhdGhwZHFlY3Znc2lpeGFsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3Nzk4NTI5OCwiZXhwIjoyMDkzNTYxMjk4fQ.8NTmsAq9M52a0HQfA9uBUH5e9KiM1NX0VJr5eDh8yok';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const CSV_PATH = '/home/nickson/Documents/auto express system/Autoexpress - Autoexpress.csv';

/**
 * Simple CSV line parser that handles quoted fields with commas.
 */
function parseCSVLine(line: string) {
  const result = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"' && line[i + 1] === '"') {
      current += '"';
      i++;
    } else if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}

async function runImport() {
  console.log('--- Auto Express CSV Import ---');
  console.log('Source:', CSV_PATH);
  
  if (!fs.existsSync(CSV_PATH)) {
    console.error('Error: CSV file not found at', CSV_PATH);
    return;
  }

  const content = fs.readFileSync(CSV_PATH, 'utf-8');
  const lines = content.split('\n').filter(l => l.trim() !== '');
  
  if (lines.length === 0) {
    console.error('Error: CSV file is empty.');
    return;
  }

  const headers = parseCSVLine(lines[0]);
  console.log('Detected Headers:', headers.join(' | '));

  const vehicles = [];
  
  // Mapping based on CSV header positions:
  // 0: vehicle_id
  // 1: regfull
  // 2: regyear
  // 3: make
  // 4: model
  // 10: mileagevalue
  // 14: price
  // 15: picturerefs
  // 16: bodytype (class)

  for (let i = 1; i < lines.length; i++) {
    const data = parseCSVLine(lines[i]);
    if (data.length < 15) continue; // Skip incomplete lines

    const vehicle_id = data[0];
    const regfull = data[1];
    const regyear = parseInt(data[2]);
    const make = data[3];
    const model = data[4];
    const price = parseFloat(data[14]);
    const picturerefs = data[15] || '';
    const mileage = parseInt(data[10]) || 0;
    const bodytype = data[16] || 'Sedan';
    
    // Transformation: Take the first URL from picturerefs
    // picturerefs is usually a comma-separated list of URLs inside a quoted string
    const firstImage = picturerefs.split(',')[0].trim().replace(/^"|"$/g, '');
    
    // VIN placeholder logic:
    // If regfull looks like a VIN (long alphanumeric), use it. 
    // Otherwise, or if missing, generate a placeholder based on vehicle_id.
    let vin = regfull;
    if (!vin || vin.length < 10) {
       vin = `VIN-PLACEHOLDER-${vehicle_id}`;
    }

    vehicles.push({
      vin,
      registration_number: regfull,
      make: make || 'Unknown',
      model: model || 'Unknown',
      year: isNaN(regyear) ? null : regyear,
      price: isNaN(price) ? 0 : price, 
      image_url: firstImage,
      mileage,
      status: 'available',
      location: 'Limerick',
      class: bodytype
    });
  }

  console.log(`Successfully parsed ${vehicles.length} vehicle records.`);

  // Batch upsert in chunks to avoid payload limits
  const chunkSize = 50;
  let successCount = 0;

  for (let i = 0; i < vehicles.length; i += chunkSize) {
    const chunk = vehicles.slice(i, i + chunkSize);
    const chunkNumber = Math.floor(i / chunkSize) + 1;
    const totalChunks = Math.ceil(vehicles.length / chunkSize);
    
    process.stdout.write(`Uploading chunk ${chunkNumber}/${totalChunks}... `);
    
    const { error } = await supabase
      .from('vehicles')
      .upsert(chunk, { onConflict: 'vin' });

    if (error) {
      console.log('FAILED');
      console.error(`Error in chunk ${chunkNumber}:`, error.message);
    } else {
      console.log('DONE');
      successCount += chunk.length;
    }
  }

  console.log('------------------------------');
  console.log(`Import completed: ${successCount}/${vehicles.length} records processed.`);
  console.log('------------------------------');
}

runImport().catch(err => {
  console.error('Fatal error during import:', err);
});
