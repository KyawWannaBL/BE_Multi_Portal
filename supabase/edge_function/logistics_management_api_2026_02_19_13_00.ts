import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Authorization, X-Client-Info, apikey, Content-Type, X-Application-Name',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    const { method } = req
    const url = new URL(req.url)
    const action = url.searchParams.get('action')

    // Route requests based on action parameter
    switch (action) {
      case 'create_shipment':
        return await createShipment(req, supabaseClient)
      case 'update_shipment_status':
        return await updateShipmentStatus(req, supabaseClient)
      case 'get_shipments':
        return await getShipments(req, supabaseClient)
      case 'get_shipment_tracking':
        return await getShipmentTracking(req, supabaseClient)
      case 'calculate_shipping_rate':
        return await calculateShippingRate(req, supabaseClient)
      case 'get_dashboard_metrics':
        return await getDashboardMetrics(req, supabaseClient)
      case 'record_cod_collection':
        return await recordCODCollection(req, supabaseClient)
      case 'get_locations':
        return await getLocations(req, supabaseClient)
      case 'get_branches':
        return await getBranches(req, supabaseClient)
      case 'create_customer':
        return await createCustomer(req, supabaseClient)
      case 'create_merchant':
        return await createMerchant(req, supabaseClient)
      case 'get_vehicles':
        return await getVehicles(req, supabaseClient)
      case 'update_vehicle_tracking':
        return await updateVehicleTracking(req, supabaseClient)
      case 'get_notifications':
        return await getNotifications(req, supabaseClient)
      case 'mark_notification_read':
        return await markNotificationRead(req, supabaseClient)
      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action parameter' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

// Create new shipment
async function createShipment(req: Request, supabaseClient: any) {
  const body = await req.json()
  
  const { data, error } = await supabaseClient.rpc('create_shipment', {
    p_merchant_id: body.merchant_id,
    p_customer_id: body.customer_id,
    p_sender_name: body.sender_name,
    p_sender_phone: body.sender_phone,
    p_sender_address: body.sender_address,
    p_sender_city: body.sender_city,
    p_sender_state: body.sender_state,
    p_receiver_name: body.receiver_name,
    p_receiver_phone: body.receiver_phone,
    p_receiver_address: body.receiver_address,
    p_receiver_city: body.receiver_city,
    p_receiver_state: body.receiver_state,
    p_package_type: body.package_type || 'DOCUMENT',
    p_weight: body.weight,
    p_dimensions: body.dimensions || {},
    p_declared_value: body.declared_value || 0,
    p_contents_description: body.contents_description,
    p_service_type: body.service_type || 'STANDARD',
    p_payment_method: body.payment_method || 'COD',
    p_cod_amount: body.cod_amount || 0,
    p_shipping_cost: body.shipping_cost,
    p_insurance_cost: body.insurance_cost || 0,
    p_total_cost: body.total_cost
  })

  if (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  // Get the created shipment details
  const { data: shipment, error: shipmentError } = await supabaseClient
    .from('shipments_2026_02_19_13_00')
    .select('*')
    .eq('id', data)
    .single()

  if (shipmentError) {
    return new Response(
      JSON.stringify({ error: shipmentError.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  return new Response(
    JSON.stringify({ success: true, shipment }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

// Update shipment status
async function updateShipmentStatus(req: Request, supabaseClient: any) {
  const body = await req.json()
  
  const { data, error } = await supabaseClient.rpc('update_shipment_status', {
    p_shipment_id: body.shipment_id,
    p_status: body.status,
    p_location: body.location,
    p_updated_by: body.updated_by,
    p_notes: body.notes || null
  })

  if (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  return new Response(
    JSON.stringify({ success: true }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

// Get shipments with filters
async function getShipments(req: Request, supabaseClient: any) {
  const url = new URL(req.url)
  const status = url.searchParams.get('status')
  const merchant_id = url.searchParams.get('merchant_id')
  const customer_id = url.searchParams.get('customer_id')
  const awb_number = url.searchParams.get('awb_number')
  const limit = parseInt(url.searchParams.get('limit') || '50')
  const offset = parseInt(url.searchParams.get('offset') || '0')

  let query = supabaseClient
    .from('shipments_2026_02_19_13_00')
    .select(`
      *,
      merchant:merchants_2026_02_19_13_00(business_name, contact_person),
      customer:customers_2026_02_19_13_00(full_name, phone),
      origin_branch:origin_branch_id(name, code),
      destination_branch:destination_branch_id(name, code),
      assigned_rider:assigned_rider_id(full_name, phone)
    `)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (status) query = query.eq('status', status)
  if (merchant_id) query = query.eq('merchant_id', merchant_id)
  if (customer_id) query = query.eq('customer_id', customer_id)
  if (awb_number) query = query.eq('awb_number', awb_number)

  const { data, error } = await query

  if (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  return new Response(
    JSON.stringify({ success: true, shipments: data }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

// Get shipment tracking history
async function getShipmentTracking(req: Request, supabaseClient: any) {
  const url = new URL(req.url)
  const shipment_id = url.searchParams.get('shipment_id')
  const awb_number = url.searchParams.get('awb_number')

  if (!shipment_id && !awb_number) {
    return new Response(
      JSON.stringify({ error: 'shipment_id or awb_number is required' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  let shipmentQuery = supabaseClient
    .from('shipments_2026_02_19_13_00')
    .select('id, awb_number, status, current_location')

  if (shipment_id) {
    shipmentQuery = shipmentQuery.eq('id', shipment_id)
  } else {
    shipmentQuery = shipmentQuery.eq('awb_number', awb_number)
  }

  const { data: shipment, error: shipmentError } = await shipmentQuery.single()

  if (shipmentError) {
    return new Response(
      JSON.stringify({ error: 'Shipment not found' }),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  const { data: tracking, error: trackingError } = await supabaseClient
    .from('shipment_tracking_2026_02_19_13_00')
    .select(`
      *,
      updated_by:updated_by(full_name),
      branch:branch_id(name, code)
    `)
    .eq('shipment_id', shipment.id)
    .order('timestamp', { ascending: true })

  if (trackingError) {
    return new Response(
      JSON.stringify({ error: trackingError.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  return new Response(
    JSON.stringify({ 
      success: true, 
      shipment,
      tracking_history: tracking 
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

// Calculate shipping rate
async function calculateShippingRate(req: Request, supabaseClient: any) {
  const body = await req.json()
  
  const { data, error } = await supabaseClient.rpc('calculate_domestic_rate', {
    p_from_state: body.from_state,
    p_to_state: body.to_state,
    p_weight: body.weight,
    p_service_type: body.service_type || 'STANDARD'
  })

  if (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  return new Response(
    JSON.stringify({ success: true, rate_calculation: data }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

// Get dashboard metrics
async function getDashboardMetrics(req: Request, supabaseClient: any) {
  const url = new URL(req.url)
  const user_id = url.searchParams.get('user_id')
  const branch_id = url.searchParams.get('branch_id')
  const date_from = url.searchParams.get('date_from')
  const date_to = url.searchParams.get('date_to')

  const { data, error } = await supabaseClient.rpc('get_dashboard_metrics', {
    p_user_id: user_id,
    p_branch_id: branch_id,
    p_date_from: date_from,
    p_date_to: date_to
  })

  if (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  return new Response(
    JSON.stringify({ success: true, metrics: data }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

// Record COD collection
async function recordCODCollection(req: Request, supabaseClient: any) {
  const body = await req.json()
  
  const { data, error } = await supabaseClient.rpc('record_cod_collection', {
    p_shipment_id: body.shipment_id,
    p_collected_by: body.collected_by,
    p_amount: body.amount,
    p_payment_method: body.payment_method
  })

  if (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  return new Response(
    JSON.stringify({ success: true, transaction_id: data }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

// Get Myanmar locations
async function getLocations(req: Request, supabaseClient: any) {
  const { data, error } = await supabaseClient
    .from('myanmar_locations_2026_02_19_13_00')
    .select('*')
    .order('state_division', { ascending: true })
    .order('township', { ascending: true })

  if (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  return new Response(
    JSON.stringify({ success: true, locations: data }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

// Get branches
async function getBranches(req: Request, supabaseClient: any) {
  const { data, error } = await supabaseClient
    .from('branches_2026_02_19_13_00')
    .select('*')
    .eq('status', 'ACTIVE')
    .order('name', { ascending: true })

  if (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  return new Response(
    JSON.stringify({ success: true, branches: data }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

// Create customer
async function createCustomer(req: Request, supabaseClient: any) {
  const body = await req.json()
  
  // Generate customer code
  const { data: customerCode, error: codeError } = await supabaseClient.rpc('generate_customer_code')
  
  if (codeError) {
    return new Response(
      JSON.stringify({ error: codeError.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  const { data, error } = await supabaseClient
    .from('customers_2026_02_19_13_00')
    .insert({
      customer_code: customerCode,
      full_name: body.full_name,
      company_name: body.company_name,
      phone: body.phone,
      email: body.email,
      address: body.address,
      city: body.city,
      state: body.state,
      postal_code: body.postal_code,
      customer_type: body.customer_type || 'INDIVIDUAL'
    })
    .select()
    .single()

  if (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  return new Response(
    JSON.stringify({ success: true, customer: data }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

// Create merchant
async function createMerchant(req: Request, supabaseClient: any) {
  const body = await req.json()
  
  // Generate merchant code
  const { data: merchantCode, error: codeError } = await supabaseClient.rpc('generate_merchant_code')
  
  if (codeError) {
    return new Response(
      JSON.stringify({ error: codeError.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  const { data, error } = await supabaseClient
    .from('merchants_2026_02_19_13_00')
    .insert({
      merchant_code: merchantCode,
      business_name: body.business_name,
      contact_person: body.contact_person,
      phone: body.phone,
      email: body.email,
      business_address: body.business_address,
      city: body.city,
      state: body.state,
      postal_code: body.postal_code,
      business_type: body.business_type,
      business_license: body.business_license,
      tax_id: body.tax_id
    })
    .select()
    .single()

  if (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  return new Response(
    JSON.stringify({ success: true, merchant: data }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

// Get vehicles
async function getVehicles(req: Request, supabaseClient: any) {
  const url = new URL(req.url)
  const branch_id = url.searchParams.get('branch_id')
  const status = url.searchParams.get('status')

  let query = supabaseClient
    .from('vehicles_2026_02_19_13_00')
    .select(`
      *,
      current_driver:current_driver_id(full_name, phone),
      home_branch:home_branch_id(name, code)
    `)
    .order('vehicle_number', { ascending: true })

  if (branch_id) query = query.eq('home_branch_id', branch_id)
  if (status) query = query.eq('status', status)

  const { data, error } = await query

  if (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  return new Response(
    JSON.stringify({ success: true, vehicles: data }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

// Update vehicle tracking
async function updateVehicleTracking(req: Request, supabaseClient: any) {
  const body = await req.json()
  
  const { data, error } = await supabaseClient
    .from('vehicle_tracking_2026_02_19_13_00')
    .insert({
      vehicle_id: body.vehicle_id,
      driver_id: body.driver_id,
      latitude: body.latitude,
      longitude: body.longitude,
      speed: body.speed,
      heading: body.heading,
      altitude: body.altitude,
      accuracy: body.accuracy,
      battery_level: body.battery_level,
      engine_status: body.engine_status,
      fuel_level: body.fuel_level
    })
    .select()
    .single()

  if (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  return new Response(
    JSON.stringify({ success: true, tracking: data }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

// Get notifications
async function getNotifications(req: Request, supabaseClient: any) {
  const url = new URL(req.url)
  const user_id = url.searchParams.get('user_id')
  const unread_only = url.searchParams.get('unread_only') === 'true'
  const limit = parseInt(url.searchParams.get('limit') || '50')

  if (!user_id) {
    return new Response(
      JSON.stringify({ error: 'user_id is required' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  let query = supabaseClient
    .from('notifications_2026_02_19_13_00')
    .select('*')
    .eq('recipient_id', user_id)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (unread_only) {
    query = query.eq('is_read', false)
  }

  const { data, error } = await query

  if (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  return new Response(
    JSON.stringify({ success: true, notifications: data }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

// Mark notification as read
async function markNotificationRead(req: Request, supabaseClient: any) {
  const body = await req.json()
  
  const { data, error } = await supabaseClient
    .from('notifications_2026_02_19_13_00')
    .update({ 
      is_read: true, 
      read_at: new Date().toISOString() 
    })
    .eq('id', body.notification_id)
    .select()
    .single()

  if (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  return new Response(
    JSON.stringify({ success: true, notification: data }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}