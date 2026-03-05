import { supabase } from '../src/lib/supabase';

async function seedProduction() {
  console.log('🚀 Starting Production Seed...');

  // 1. Seed a Test Hub (Yangon Central)
  const { data: hub } = await supabase.from('hubs').insert([
    { name: 'Yangon Central Hub', lat: 16.84, lng: 96.15 }
  ]).select().single();

  // 2. Seed a Live Vehicle for LogisticsMap verification
  await supabase.from('vehicles').insert([
    { 
      plate_number: 'YGN-2026-BRT', 
      status: 'ACTIVE', 
      fuel_level: 95, 
      current_location: { lat: 16.842, lng: 96.152 } 
    }
  ]);

  // 3. Seed one "Pending Registration" Shipment for Office Queue verification
  await supabase.from('shipments').insert([
    {
      tamper_tag_id: 'TT-PROD-001',
      status: 'pending_reg',
      pieces: 1,
      condition: 'OK',
      weight: 2.5,
      sender_name: 'Britium Test Merchant',
      sender_phone: '09123456789',
      photos: ['https://images.unsplash.com/photo-1566576721346-d4a3b4eaad55?w=500'],
      created_at: new Date().toISOString()
    }
  ]);

  console.log('✅ Production Seed Complete. Login to verify Dashboard.');
}

seedProduction();