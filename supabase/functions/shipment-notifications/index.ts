import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

serve(async (req) => {
  const { record, old_record } = await req.json()

  // Only trigger if status has changed
  if (record.status !== old_record.status) {
    const message_en = `Your shipment ${record.tracking_no} is now ${record.status.replace(/_/g, ' ')}.`;
    const message_my = `သင်၏ပါဆယ် ${record.tracking_no} သည် ယခုအခါ ${record.status} အခြေအနေသို့ ရောက်ရှိနေပါသည်။`;
    
    console.log(`Bilingual Notification Queued: ${message_en} / ${message_my}`);
    // Here you would integrate with your SMS or Email gateway
  }

  return new Response(JSON.stringify({ success: true }), { headers: { "Content-Type": "application/json" } })
})
