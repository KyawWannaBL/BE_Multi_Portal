import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Authorization, X-Client-Info, apikey, Content-Type, X-Application-Name',
}

interface GPSUpdate {
  device_id: string
  user_id?: string
  vehicle_id?: string
  route_id?: string
  latitude: number
  longitude: number
  altitude?: number
  accuracy?: number
  speed?: number
  heading?: number
  battery_level?: number
  signal_strength?: number
  timestamp: string
}

interface GeofenceAlert {
  type: 'ENTRY' | 'EXIT'
  geofence_name: string
  geofence_type: string
  device_id: string
  user_id?: string
  location: { lat: number; lng: number }
  timestamp: string
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const url = new URL(req.url)
    const action = url.searchParams.get('action') || 'update'

    if (req.method === 'POST' && action === 'update') {
      // Handle GPS location update
      const gpsUpdate: GPSUpdate = await req.json()

      if (!gpsUpdate.device_id || !gpsUpdate.latitude || !gpsUpdate.longitude) {
        return new Response(
          JSON.stringify({ error: 'Missing required GPS data' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Process GPS update using database function
      const { data: processResult, error: processError } = await supabaseClient
        .rpc('process_gps_update_2026_02_18_18_00', {
          p_device_id: gpsUpdate.device_id,
          p_latitude: gpsUpdate.latitude,
          p_longitude: gpsUpdate.longitude,
          p_speed: gpsUpdate.speed,
          p_heading: gpsUpdate.heading,
          p_accuracy: gpsUpdate.accuracy
        })

      if (processError) {
        throw new Error(`GPS processing failed: ${processError.message}`)
      }

      // Update vehicle/personnel location if applicable
      if (gpsUpdate.vehicle_id) {
        await supabaseClient
          .from('vehicles_2026_02_18_17_00')
          .update({
            current_location: {
              latitude: gpsUpdate.latitude,
              longitude: gpsUpdate.longitude,
              updated_at: new Date().toISOString()
            }
          })
          .eq('vehicle_code', gpsUpdate.vehicle_id)
      }

      if (gpsUpdate.user_id) {
        await supabaseClient
          .from('delivery_personnel_2026_02_18_17_00')
          .update({
            current_location: {
              latitude: gpsUpdate.latitude,
              longitude: gpsUpdate.longitude,
              updated_at: new Date().toISOString()
            }
          })
          .eq('personnel_code', gpsUpdate.user_id)
      }

      // Broadcast real-time update to subscribers
      const channel = supabaseClient.channel('gps_tracking')
      await channel.send({
        type: 'broadcast',
        event: 'gps_update',
        payload: {
          device_id: gpsUpdate.device_id,
          user_id: gpsUpdate.user_id,
          location: {
            lat: gpsUpdate.latitude,
            lng: gpsUpdate.longitude
          },
          speed: gpsUpdate.speed,
          timestamp: new Date().toISOString(),
          events: processResult.events_triggered
        }
      })

      return new Response(
        JSON.stringify({
          success: true,
          tracking_id: processResult.tracking_id,
          events_triggered: processResult.events_triggered,
          is_moving: processResult.is_moving,
          message: 'GPS location updated successfully'
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (req.method === 'GET' && action === 'track') {
      // Get real-time tracking data for a device/route
      const deviceId = url.searchParams.get('device_id')
      const routeId = url.searchParams.get('route_id')
      const hours = parseInt(url.searchParams.get('hours') || '24')

      let query = supabaseClient
        .from('gps_tracking_2026_02_18_18_00')
        .select(`
          *,
          route_plans_2026_02_18_17_00!inner(route_code, zone, status)
        `)
        .gte('recorded_at', new Date(Date.now() - hours * 60 * 60 * 1000).toISOString())
        .order('recorded_at', { ascending: false })

      if (deviceId) {
        query = query.eq('device_id', deviceId)
      }
      if (routeId) {
        query = query.eq('route_id', routeId)
      }

      const { data: trackingData, error: trackingError } = await query.limit(1000)

      if (trackingError) {
        throw new Error(`Failed to fetch tracking data: ${trackingError.message}`)
      }

      // Get recent events
      const { data: events, error: eventsError } = await supabaseClient
        .from('realtime_events_2026_02_18_18_00')
        .select('*')
        .in('entity_id', deviceId ? [deviceId] : [])
        .gte('created_at', new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString()) // Last 6 hours
        .order('created_at', { ascending: false })
        .limit(50)

      // Calculate route statistics
      const stats = {
        total_points: trackingData?.length || 0,
        distance_traveled: 0,
        average_speed: 0,
        max_speed: 0,
        time_moving: 0,
        geofence_events: events?.filter(e => e.event_type === 'GEOFENCE_ENTRY').length || 0,
        speed_violations: events?.filter(e => e.event_type === 'SPEED_VIOLATION').length || 0
      }

      if (trackingData && trackingData.length > 1) {
        // Calculate total distance
        for (let i = 1; i < trackingData.length; i++) {
          const prev = trackingData[i-1]
          const curr = trackingData[i]
          const distance = calculateDistance(prev.latitude, prev.longitude, curr.latitude, curr.longitude)
          stats.distance_traveled += distance
        }

        // Calculate speed statistics
        const speeds = trackingData.filter(t => t.speed && t.speed > 0).map(t => t.speed)
        if (speeds.length > 0) {
          stats.average_speed = speeds.reduce((sum, speed) => sum + speed, 0) / speeds.length
          stats.max_speed = Math.max(...speeds)
        }

        // Calculate moving time
        stats.time_moving = trackingData.filter(t => t.is_moving).length * 5 // Assuming 5-minute intervals
      }

      return new Response(
        JSON.stringify({
          success: true,
          tracking_data: trackingData,
          events: events,
          statistics: stats,
          last_update: trackingData?.[0]?.recorded_at || null
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (req.method === 'POST' && action === 'geofence-alert') {
      // Handle geofence alerts
      const alert: GeofenceAlert = await req.json()

      // Create real-time event
      const { error: eventError } = await supabaseClient
        .from('realtime_events_2026_02_18_18_00')
        .insert({
          event_type: `GEOFENCE_${alert.type}`,
          entity_type: 'DEVICE',
          entity_id: alert.device_id,
          event_data: {
            geofence_name: alert.geofence_name,
            geofence_type: alert.geofence_type,
            user_id: alert.user_id
          },
          location: alert.location,
          priority: alert.geofence_type === 'RESTRICTED' ? 'HIGH' : 'NORMAL'
        })

      if (eventError) {
        throw new Error(`Failed to create geofence event: ${eventError.message}`)
      }

      // Broadcast alert to subscribers
      const channel = supabaseClient.channel('geofence_alerts')
      await channel.send({
        type: 'broadcast',
        event: 'geofence_alert',
        payload: alert
      })

      return new Response(
        JSON.stringify({
          success: true,
          message: `Geofence ${alert.type.toLowerCase()} alert processed`
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action or method' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('GPS tracking error:', error)
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

// Helper function for distance calculation
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