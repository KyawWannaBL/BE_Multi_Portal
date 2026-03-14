import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Authorization, X-Client-Info, apikey, Content-Type, X-Application-Name',
};

interface RequestBody {
  action: string;
  [key: string]: any;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const url = new URL(req.url);
    const action = url.searchParams.get('action');

    let body: RequestBody = { action: action || '' };
    
    if (req.method === 'POST' || req.method === 'PUT') {
      body = await req.json();
    }

    console.log('Advanced Features API - Action:', action, 'Body:', body);

    switch (action) {
      // QR Code Operations
      case 'generate_qr_code':
        return await generateQRCode(supabaseClient, body);
      
      case 'scan_qr_code':
        return await scanQRCode(supabaseClient, body);
      
      case 'get_qr_codes':
        return await getQRCodes(supabaseClient, body);

      // GPS Tracking Operations
      case 'record_gps_location':
        return await recordGPSLocation(supabaseClient, body);
      
      case 'get_gps_tracking':
        return await getGPSTracking(supabaseClient, body);
      
      case 'get_live_locations':
        return await getLiveLocations(supabaseClient, body);

      // Electronic Signature Operations
      case 'save_signature':
        return await saveElectronicSignature(supabaseClient, body);
      
      case 'get_signatures':
        return await getSignatures(supabaseClient, body);
      
      case 'verify_signature':
        return await verifySignature(supabaseClient, body);

      // Route Optimization Operations
      case 'optimize_route':
        return await optimizeRoute(supabaseClient, body);
      
      case 'get_routes':
        return await getRoutes(supabaseClient, body);
      
      case 'update_route_status':
        return await updateRouteStatus(supabaseClient, body);

      // Real-time Events
      case 'get_realtime_events':
        return await getRealtimeEvents(supabaseClient, body);
      
      case 'create_event':
        return await createEvent(supabaseClient, body);

      // Geofencing
      case 'check_geofence':
        return await checkGeofence(supabaseClient, body);
      
      case 'get_geofences':
        return await getGeofences(supabaseClient, body);

      default:
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'Invalid action specified',
            available_actions: [
              'generate_qr_code', 'scan_qr_code', 'get_qr_codes',
              'record_gps_location', 'get_gps_tracking', 'get_live_locations',
              'save_signature', 'get_signatures', 'verify_signature',
              'optimize_route', 'get_routes', 'update_route_status',
              'get_realtime_events', 'create_event',
              'check_geofence', 'get_geofences'
            ]
          }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
    }
  } catch (error) {
    console.error('Advanced Features API Error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Internal server error' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

// QR Code Functions
async function generateQRCode(supabaseClient: any, body: RequestBody) {
  const { qr_type, reference_id, reference_type, data = {}, generated_by } = body;

  if (!qr_type || !reference_id || !reference_type) {
    return new Response(
      JSON.stringify({ success: false, error: 'Missing required fields: qr_type, reference_id, reference_type' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  const { data: result, error } = await supabaseClient.rpc('generate_qr_code_advanced_2026_02_19_15_00', {
    p_qr_type: qr_type,
    p_reference_id: reference_id,
    p_reference_type: reference_type,
    p_data: data,
    p_generated_by: generated_by
  });

  if (error) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  return new Response(
    JSON.stringify({ 
      success: true, 
      qr_code: result[0]?.qr_code,
      qr_id: result[0]?.qr_id,
      message: result[0]?.message
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function scanQRCode(supabaseClient: any, body: RequestBody) {
  const { qr_code, scanned_by, scan_metadata = {} } = body;

  if (!qr_code) {
    return new Response(
      JSON.stringify({ success: false, error: 'Missing required field: qr_code' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  const { data: result, error } = await supabaseClient.rpc('scan_qr_code_2026_02_19_15_00', {
    p_qr_code: qr_code,
    p_scanned_by: scanned_by,
    p_scan_metadata: scan_metadata
  });

  if (error) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  return new Response(
    JSON.stringify({ 
      success: result[0]?.success || false,
      qr_data: result[0]?.qr_data,
      reference_id: result[0]?.reference_id,
      reference_type: result[0]?.reference_type,
      message: result[0]?.message
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function getQRCodes(supabaseClient: any, body: RequestBody) {
  const { reference_id, reference_type, qr_type, status, limit = 50 } = body;

  let query = supabaseClient
    .from('qr_codes_advanced_2026_02_19_15_00')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (reference_id) query = query.eq('reference_id', reference_id);
  if (reference_type) query = query.eq('reference_type', reference_type);
  if (qr_type) query = query.eq('qr_type', qr_type);
  if (status) query = query.eq('status', status);

  const { data, error } = await query;

  if (error) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  return new Response(
    JSON.stringify({ success: true, qr_codes: data }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

// GPS Tracking Functions
async function recordGPSLocation(supabaseClient: any, body: RequestBody) {
  const { 
    device_id, latitude, longitude, vehicle_id, rider_id, shipment_id,
    altitude, accuracy, speed, heading, battery_level, metadata = {}
  } = body;

  if (!device_id || latitude === undefined || longitude === undefined) {
    return new Response(
      JSON.stringify({ success: false, error: 'Missing required fields: device_id, latitude, longitude' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  const { data: result, error } = await supabaseClient.rpc('record_gps_location_2026_02_19_15_00', {
    p_device_id: device_id,
    p_latitude: latitude,
    p_longitude: longitude,
    p_vehicle_id: vehicle_id,
    p_rider_id: rider_id,
    p_shipment_id: shipment_id,
    p_altitude: altitude,
    p_accuracy: accuracy,
    p_speed: speed,
    p_heading: heading,
    p_battery_level: battery_level,
    p_metadata: metadata
  });

  if (error) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  return new Response(
    JSON.stringify({ 
      success: true,
      location_id: result[0]?.location_id,
      message: result[0]?.message
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function getGPSTracking(supabaseClient: any, body: RequestBody) {
  const { device_id, vehicle_id, rider_id, shipment_id, hours = 24, limit = 100 } = body;

  let query = supabaseClient
    .from('gps_tracking_advanced_2026_02_19_15_00')
    .select('*')
    .gte('recorded_at', new Date(Date.now() - hours * 60 * 60 * 1000).toISOString())
    .order('recorded_at', { ascending: false })
    .limit(limit);

  if (device_id) query = query.eq('device_id', device_id);
  if (vehicle_id) query = query.eq('vehicle_id', vehicle_id);
  if (rider_id) query = query.eq('rider_id', rider_id);
  if (shipment_id) query = query.eq('shipment_id', shipment_id);

  const { data, error } = await query;

  if (error) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  return new Response(
    JSON.stringify({ success: true, tracking_data: data }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function getLiveLocations(supabaseClient: any, body: RequestBody) {
  // Get latest location for each active device/vehicle
  const { data, error } = await supabaseClient
    .from('gps_tracking_advanced_2026_02_19_15_00')
    .select('*')
    .gte('recorded_at', new Date(Date.now() - 30 * 60 * 1000).toISOString()) // Last 30 minutes
    .order('recorded_at', { ascending: false });

  if (error) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // Group by device_id and get latest location for each
  const latestLocations = data.reduce((acc: any, location: any) => {
    if (!acc[location.device_id] || new Date(location.recorded_at) > new Date(acc[location.device_id].recorded_at)) {
      acc[location.device_id] = location;
    }
    return acc;
  }, {});

  return new Response(
    JSON.stringify({ success: true, live_locations: Object.values(latestLocations) }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

// Electronic Signature Functions
async function saveElectronicSignature(supabaseClient: any, body: RequestBody) {
  const { 
    signature_data, signature_type, reference_id, reference_type, signer_name,
    signer_id_number, signer_phone, signed_by, metadata = {}
  } = body;

  if (!signature_data || !signature_type || !reference_id || !reference_type || !signer_name) {
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Missing required fields: signature_data, signature_type, reference_id, reference_type, signer_name' 
      }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  const { data: result, error } = await supabaseClient.rpc('save_electronic_signature_2026_02_19_15_00', {
    p_signature_data: signature_data,
    p_signature_type: signature_type,
    p_reference_id: reference_id,
    p_reference_type: reference_type,
    p_signer_name: signer_name,
    p_signer_id_number: signer_id_number,
    p_signer_phone: signer_phone,
    p_signed_by: signed_by,
    p_metadata: metadata
  });

  if (error) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  return new Response(
    JSON.stringify({ 
      success: true,
      signature_id: result[0]?.signature_id,
      message: result[0]?.message
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function getSignatures(supabaseClient: any, body: RequestBody) {
  const { reference_id, reference_type, signature_type, limit = 50 } = body;

  let query = supabaseClient
    .from('electronic_signatures_2026_02_19_15_00')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (reference_id) query = query.eq('reference_id', reference_id);
  if (reference_type) query = query.eq('reference_type', reference_type);
  if (signature_type) query = query.eq('signature_type', signature_type);

  const { data, error } = await query;

  if (error) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  return new Response(
    JSON.stringify({ success: true, signatures: data }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function verifySignature(supabaseClient: any, body: RequestBody) {
  const { signature_id, verification_status, verified_by } = body;

  if (!signature_id || !verification_status) {
    return new Response(
      JSON.stringify({ success: false, error: 'Missing required fields: signature_id, verification_status' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  const { data, error } = await supabaseClient
    .from('electronic_signatures_2026_02_19_15_00')
    .update({
      verification_status,
      verified_by,
      verified_at: new Date().toISOString()
    })
    .eq('id', signature_id)
    .select()
    .single();

  if (error) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  return new Response(
    JSON.stringify({ success: true, signature: data }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

// Route Optimization Functions
async function optimizeRoute(supabaseClient: any, body: RequestBody) {
  const { route_name, vehicle_id, rider_id, start_location, waypoints = [], end_location } = body;

  if (!route_name || !vehicle_id || !start_location) {
    return new Response(
      JSON.stringify({ success: false, error: 'Missing required fields: route_name, vehicle_id, start_location' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // Simple route optimization (for demo - in production, use proper algorithms)
  const optimizedSequence = waypoints;
  const totalDistance = waypoints.length * 5.5; // Simplified calculation
  const estimatedDuration = waypoints.length * 15; // Simplified calculation

  const { data, error } = await supabaseClient
    .from('route_optimizations_2026_02_19_15_00')
    .insert({
      route_name,
      vehicle_id,
      rider_id,
      start_location,
      end_location,
      waypoints,
      optimized_sequence: optimizedSequence,
      total_distance: totalDistance,
      estimated_duration: estimatedDuration
    })
    .select()
    .single();

  if (error) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  return new Response(
    JSON.stringify({ 
      success: true, 
      route: data,
      optimized_sequence: optimizedSequence,
      total_distance: totalDistance,
      estimated_duration: estimatedDuration
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function getRoutes(supabaseClient: any, body: RequestBody) {
  const { vehicle_id, rider_id, status, limit = 50 } = body;

  let query = supabaseClient
    .from('route_optimizations_2026_02_19_15_00')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (vehicle_id) query = query.eq('vehicle_id', vehicle_id);
  if (rider_id) query = query.eq('rider_id', rider_id);
  if (status) query = query.eq('status', status);

  const { data, error } = await query;

  if (error) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  return new Response(
    JSON.stringify({ success: true, routes: data }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function updateRouteStatus(supabaseClient: any, body: RequestBody) {
  const { route_id, status, actual_duration } = body;

  if (!route_id || !status) {
    return new Response(
      JSON.stringify({ success: false, error: 'Missing required fields: route_id, status' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  const updateData: any = { status };
  
  if (status === 'IN_PROGRESS') {
    updateData.started_at = new Date().toISOString();
  } else if (status === 'COMPLETED') {
    updateData.completed_at = new Date().toISOString();
    if (actual_duration) updateData.actual_duration = actual_duration;
  }

  const { data, error } = await supabaseClient
    .from('route_optimizations_2026_02_19_15_00')
    .update(updateData)
    .eq('id', route_id)
    .select()
    .single();

  if (error) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  return new Response(
    JSON.stringify({ success: true, route: data }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

// Real-time Events Functions
async function getRealtimeEvents(supabaseClient: any, body: RequestBody) {
  const { event_category, reference_id, user_id, hours = 24, limit = 100 } = body;

  let query = supabaseClient
    .from('realtime_events_2026_02_19_15_00')
    .select('*')
    .gte('created_at', new Date(Date.now() - hours * 60 * 60 * 1000).toISOString())
    .order('created_at', { ascending: false })
    .limit(limit);

  if (event_category) query = query.eq('event_category', event_category);
  if (reference_id) query = query.eq('reference_id', reference_id);
  if (user_id) query = query.eq('user_id', user_id);

  const { data, error } = await query;

  if (error) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  return new Response(
    JSON.stringify({ success: true, events: data }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function createEvent(supabaseClient: any, body: RequestBody) {
  const { event_type, event_category, reference_id, reference_type, user_id, device_id, event_data, severity = 'INFO' } = body;

  if (!event_type || !event_category || !event_data) {
    return new Response(
      JSON.stringify({ success: false, error: 'Missing required fields: event_type, event_category, event_data' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  const { data, error } = await supabaseClient
    .from('realtime_events_2026_02_19_15_00')
    .insert({
      event_type,
      event_category,
      reference_id,
      reference_type,
      user_id,
      device_id,
      event_data,
      severity
    })
    .select()
    .single();

  if (error) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  return new Response(
    JSON.stringify({ success: true, event: data }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

// Geofencing Functions
async function checkGeofence(supabaseClient: any, body: RequestBody) {
  const { latitude, longitude, device_id } = body;

  if (latitude === undefined || longitude === undefined) {
    return new Response(
      JSON.stringify({ success: false, error: 'Missing required fields: latitude, longitude' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // Simple geofence check (for demo - in production, use proper geospatial queries)
  const { data: geofences, error } = await supabaseClient
    .from('geofences_2026_02_19_15_00')
    .select('*')
    .eq('is_active', true);

  if (error) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  const triggeredGeofences = [];
  
  for (const geofence of geofences) {
    if (geofence.fence_type === 'CIRCULAR') {
      const center = geofence.coordinates;
      const distance = calculateDistance(latitude, longitude, center.lat, center.lng);
      
      if (distance <= geofence.radius) {
        triggeredGeofences.push({
          ...geofence,
          distance,
          triggered_at: new Date().toISOString()
        });
      }
    }
  }

  return new Response(
    JSON.stringify({ 
      success: true, 
      triggered_geofences: triggeredGeofences,
      total_checked: geofences.length
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function getGeofences(supabaseClient: any, body: RequestBody) {
  const { branch_id, is_active = true } = body;

  let query = supabaseClient
    .from('geofences_2026_02_19_15_00')
    .select('*')
    .order('created_at', { ascending: false });

  if (branch_id) query = query.eq('branch_id', branch_id);
  if (is_active !== undefined) query = query.eq('is_active', is_active);

  const { data, error } = await query;

  if (error) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  return new Response(
    JSON.stringify({ success: true, geofences: data }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

// Utility function to calculate distance between two points
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const d = R * c; // Distance in kilometers
  return d;
}