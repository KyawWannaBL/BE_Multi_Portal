import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Authorization, X-Client-Info, apikey, Content-Type, X-Application-Name',
}

interface ParcelLocation {
  id: string
  parcel_id: string
  pickup_coordinates: { lat: number; lng: number }
  delivery_coordinates: { lat: number; lng: number }
  priority: string
  weight_kg: number
  cod_amount: number
}

interface RouteOptimizationRequest {
  zone: string
  date?: string
  max_parcels_per_route?: number
  vehicle_type?: string
}

interface OptimizedRoute {
  route_id: string
  waypoints: Array<{
    parcel_id: string
    coordinates: { lat: number; lng: number }
    type: 'pickup' | 'delivery'
    sequence: number
  }>
  total_distance_km: number
  estimated_duration_minutes: number
  assigned_personnel: {
    rider_id?: string
    driver_id?: string
    vehicle_id?: string
  }
}

// Haversine distance calculation
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371 // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return R * c
}

// Simple nearest neighbor TSP approximation for route optimization
function optimizeRoute(parcels: ParcelLocation[]): Array<{
  parcel_id: string
  coordinates: { lat: number; lng: number }
  type: 'pickup' | 'delivery'
  sequence: number
}> {
  const waypoints: Array<{
    parcel_id: string
    coordinates: { lat: number; lng: number }
    type: 'pickup' | 'delivery'
    sequence: number
  }> = []

  // Add all pickup points first (priority-based)
  const sortedParcels = parcels.sort((a, b) => {
    const priorityOrder = { 'URGENT': 3, 'EXPRESS': 2, 'STANDARD': 1 }
    return (priorityOrder[b.priority as keyof typeof priorityOrder] || 1) - 
           (priorityOrder[a.priority as keyof typeof priorityOrder] || 1)
  })

  // Start from depot (assume first parcel pickup as starting point)
  let currentLocation = sortedParcels[0]?.pickup_coordinates || { lat: 16.8661, lng: 96.1951 }
  let sequence = 1

  // Add pickup points in optimized order
  const unvisitedPickups = [...sortedParcels]
  while (unvisitedPickups.length > 0) {
    let nearestIndex = 0
    let nearestDistance = Infinity

    for (let i = 0; i < unvisitedPickups.length; i++) {
      const distance = calculateDistance(
        currentLocation.lat, currentLocation.lng,
        unvisitedPickups[i].pickup_coordinates.lat, unvisitedPickups[i].pickup_coordinates.lng
      )
      if (distance < nearestDistance) {
        nearestDistance = distance
        nearestIndex = i
      }
    }

    const nearestParcel = unvisitedPickups.splice(nearestIndex, 1)[0]
    waypoints.push({
      parcel_id: nearestParcel.parcel_id,
      coordinates: nearestParcel.pickup_coordinates,
      type: 'pickup',
      sequence: sequence++
    })
    currentLocation = nearestParcel.pickup_coordinates
  }

  // Add delivery points in optimized order
  const unvisitedDeliveries = [...sortedParcels]
  while (unvisitedDeliveries.length > 0) {
    let nearestIndex = 0
    let nearestDistance = Infinity

    for (let i = 0; i < unvisitedDeliveries.length; i++) {
      const distance = calculateDistance(
        currentLocation.lat, currentLocation.lng,
        unvisitedDeliveries[i].delivery_coordinates.lat, unvisitedDeliveries[i].delivery_coordinates.lng
      )
      if (distance < nearestDistance) {
        nearestDistance = distance
        nearestIndex = i
      }
    }

    const nearestParcel = unvisitedDeliveries.splice(nearestIndex, 1)[0]
    waypoints.push({
      parcel_id: nearestParcel.parcel_id,
      coordinates: nearestParcel.delivery_coordinates,
      type: 'delivery',
      sequence: sequence++
    })
    currentLocation = nearestParcel.delivery_coordinates
  }

  return waypoints
}

// Calculate total route distance and duration
function calculateRouteMetrics(waypoints: Array<{ coordinates: { lat: number; lng: number } }>): {
  total_distance_km: number
  estimated_duration_minutes: number
} {
  let totalDistance = 0
  for (let i = 1; i < waypoints.length; i++) {
    totalDistance += calculateDistance(
      waypoints[i-1].coordinates.lat, waypoints[i-1].coordinates.lng,
      waypoints[i].coordinates.lat, waypoints[i].coordinates.lng
    )
  }

  // Estimate duration: 30 km/h average speed + 10 minutes per stop
  const estimatedDuration = Math.round((totalDistance / 30) * 60 + (waypoints.length * 10))

  return {
    total_distance_km: Math.round(totalDistance * 100) / 100,
    estimated_duration_minutes: estimatedDuration
  }
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { zone, date = new Date().toISOString().split('T')[0], max_parcels_per_route = 15 }: RouteOptimizationRequest = await req.json()

    if (!zone) {
      return new Response(
        JSON.stringify({ error: 'Zone is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get unassigned parcels for the zone
    const { data: parcels, error: parcelsError } = await supabaseClient
      .from('parcels_2026_02_18_17_00')
      .select(`
        id,
        parcel_id,
        pickup_address,
        delivery_address,
        priority,
        weight_kg,
        cod_amount,
        status
      `)
      .eq('pickup_zone', zone)
      .eq('status', 'REGISTERED')
      .gte('created_at', `${date}T00:00:00`)
      .lt('created_at', `${date}T23:59:59`)

    if (parcelsError) {
      throw new Error(`Failed to fetch parcels: ${parcelsError.message}`)
    }

    if (!parcels || parcels.length === 0) {
      return new Response(
        JSON.stringify({ 
          message: 'No unassigned parcels found for the specified zone and date',
          optimized_routes: []
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Transform parcels data
    const parcelLocations: ParcelLocation[] = parcels.map(parcel => ({
      id: parcel.id,
      parcel_id: parcel.parcel_id,
      pickup_coordinates: parcel.pickup_address.coordinates,
      delivery_coordinates: parcel.delivery_address.coordinates,
      priority: parcel.priority || 'STANDARD',
      weight_kg: parcel.weight_kg || 0,
      cod_amount: parcel.cod_amount || 0
    }))

    // Group parcels into routes (max parcels per route)
    const routes: OptimizedRoute[] = []
    const parcelChunks: ParcelLocation[][] = []
    
    for (let i = 0; i < parcelLocations.length; i += max_parcels_per_route) {
      parcelChunks.push(parcelLocations.slice(i, i + max_parcels_per_route))
    }

    // Get available personnel and vehicles
    const { data: personnel } = await supabaseClient
      .from('delivery_personnel_2026_02_18_17_00')
      .select('personnel_code, role, current_status, zone_assignments')
      .eq('current_status', 'AVAILABLE')
      .contains('zone_assignments', [zone])

    const { data: vehicles } = await supabaseClient
      .from('vehicles_2026_02_18_17_00')
      .select('vehicle_code, vehicle_type, status, capacity_parcels')
      .eq('status', 'AVAILABLE')

    let personnelIndex = 0
    let vehicleIndex = 0

    // Optimize each route chunk
    for (let i = 0; i < parcelChunks.length; i++) {
      const chunk = parcelChunks[i]
      const optimizedWaypoints = optimizeRoute(chunk)
      const metrics = calculateRouteMetrics(optimizedWaypoints)

      // Assign personnel and vehicle
      const rider = personnel?.find(p => p.role === 'RIDER') || null
      const vehicle = vehicles?.[vehicleIndex % (vehicles?.length || 1)] || null

      if (rider && personnelIndex < (personnel?.length || 0)) {
        personnelIndex++
      }
      if (vehicle && vehicleIndex < (vehicles?.length || 0)) {
        vehicleIndex++
      }

      // Create route plan in database
      const routeCode = `${zone}-${date.replace(/-/g, '')}-${String(i + 1).padStart(3, '0')}`
      
      const { data: routePlan, error: routeError } = await supabaseClient
        .from('route_plans_2026_02_18_17_00')
        .insert({
          route_code: routeCode,
          route_date: date,
          zone: zone,
          total_parcels: chunk.length,
          total_distance_km: metrics.total_distance_km,
          estimated_duration_minutes: metrics.estimated_duration_minutes,
          optimized_waypoints: optimizedWaypoints,
          assigned_rider_id: rider?.personnel_code,
          assigned_vehicle_id: vehicle?.vehicle_code,
          status: 'PLANNED'
        })
        .select()
        .single()

      if (routeError) {
        console.error('Route creation error:', routeError)
        continue
      }

      // Update parcels with route assignment
      const parcelIds = chunk.map(p => p.id)
      await supabaseClient
        .from('parcels_2026_02_18_17_00')
        .update({
          assigned_route_id: routePlan.id,
          assigned_rider_id: rider?.personnel_code,
          assigned_vehicle_id: vehicle?.vehicle_code,
          status: 'ASSIGNED',
          updated_at: new Date().toISOString()
        })
        .in('id', parcelIds)

      // Update personnel status
      if (rider) {
        await supabaseClient
          .from('delivery_personnel_2026_02_18_17_00')
          .update({
            current_status: 'ASSIGNED',
            current_route_id: routePlan.id
          })
          .eq('personnel_code', rider.personnel_code)
      }

      // Update vehicle status
      if (vehicle) {
        await supabaseClient
          .from('vehicles_2026_02_18_17_00')
          .update({
            status: 'ASSIGNED',
            current_route_id: routePlan.id
          })
          .eq('vehicle_code', vehicle.vehicle_code)
      }

      routes.push({
        route_id: routePlan.id,
        waypoints: optimizedWaypoints,
        total_distance_km: metrics.total_distance_km,
        estimated_duration_minutes: metrics.estimated_duration_minutes,
        assigned_personnel: {
          rider_id: rider?.personnel_code,
          vehicle_id: vehicle?.vehicle_code
        }
      })
    }

    return new Response(
      JSON.stringify({
        success: true,
        zone: zone,
        date: date,
        total_parcels_processed: parcelLocations.length,
        routes_created: routes.length,
        optimized_routes: routes,
        summary: {
          total_distance_km: routes.reduce((sum, route) => sum + route.total_distance_km, 0),
          total_estimated_duration_minutes: routes.reduce((sum, route) => sum + route.estimated_duration_minutes, 0),
          personnel_assigned: routes.filter(r => r.assigned_personnel.rider_id).length,
          vehicles_assigned: routes.filter(r => r.assigned_personnel.vehicle_id).length
        }
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Route optimization error:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error', 
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})