import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Authorization, X-Client-Info, apikey, Content-Type, X-Application-Name',
}

interface DomesticCalculationRequest {
  weight_kg: number
  township_id: string
  service_type: 'EXPRESS' | 'STANDARD' | 'ECONOMY'
  cod_amount?: number
  declared_value?: number
}

interface InternationalCalculationRequest {
  actual_weight_kg: number
  dimensions_cm: {
    length: number
    width: number
    height: number
  }
  destination_country_code: string
  service_type: 'EXPRESS' | 'STANDARD' | 'ECONOMY'
  airline_code?: string
  declared_value_usd?: number
}

interface AirCargoVolumeRequest {
  dimensions_cm: {
    length: number
    width: number
    height: number
  }
  actual_weight_kg: number
  airline_code?: string
}

// Exchange rates (in production, fetch from external API)
const EXCHANGE_RATES = {
  'USD_MMK': 2100,
  'EUR_MMK': 2280,
  'GBP_MMK': 2650,
  'SGD_MMK': 1560,
  'THB_MMK': 62,
  'MYR_MMK': 470,
  'CNY_MMK': 290,
  'JPY_MMK': 14,
  'KRW_MMK': 1.6,
  'INR_MMK': 25,
  'AUD_MMK': 1380,
  'CAD_MMK': 1550,
  'HKD_MMK': 270
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
    const action = url.searchParams.get('action') || 'calculate'

    if (req.method === 'POST' && action === 'domestic') {
      // Calculate domestic shipping rate
      const request: DomesticCalculationRequest = await req.json()

      if (!request.weight_kg || !request.township_id || !request.service_type) {
        return new Response(
          JSON.stringify({ error: 'Missing required parameters: weight_kg, township_id, service_type' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Call database function for calculation
      const { data: calculation, error: calcError } = await supabaseClient
        .rpc('calculate_domestic_rate_2026_02_18_18_00', {
          p_weight_kg: request.weight_kg,
          p_township_id: request.township_id,
          p_service_type: request.service_type,
          p_cod_amount: request.cod_amount || 0,
          p_declared_value: request.declared_value || 0
        })

      if (calcError) {
        throw new Error(`Calculation failed: ${calcError.message}`)
      }

      if (calculation.error) {
        return new Response(
          JSON.stringify({ error: calculation.error }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Save calculation history
      const { error: historyError } = await supabaseClient
        .from('shipping_calculations_2026_02_18_18_00')
        .insert({
          user_type: 'GUEST',
          origin_type: 'DOMESTIC',
          destination_location: calculation.destination,
          actual_weight_kg: request.weight_kg,
          dimensions_cm: { length: 0, width: 0, height: 0 },
          service_type: request.service_type,
          base_rate: calculation.base_rate,
          additional_charges: {
            cod_fee: calculation.cod_fee,
            insurance_fee: calculation.insurance_fee,
            fuel_surcharge: calculation.fuel_surcharge
          },
          total_amount: calculation.total_amount,
          currency: 'MMK',
          estimated_delivery_days: calculation.delivery_days,
          estimated_delivery_date: new Date(Date.now() + calculation.delivery_days * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          quote_valid_until: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        })

      if (historyError) {
        console.error('Failed to save calculation history:', historyError)
      }

      return new Response(
        JSON.stringify({
          success: true,
          calculation_type: 'domestic',
          ...calculation,
          quote_valid_until: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          estimated_delivery_date: new Date(Date.now() + calculation.delivery_days * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (req.method === 'POST' && action === 'international') {
      // Calculate international shipping rate
      const request: InternationalCalculationRequest = await req.json()

      if (!request.actual_weight_kg || !request.dimensions_cm || !request.destination_country_code || !request.service_type) {
        return new Response(
          JSON.stringify({ error: 'Missing required parameters: actual_weight_kg, dimensions_cm, destination_country_code, service_type' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Get destination information
      const { data: destination, error: destError } = await supabaseClient
        .from('international_destinations_2026_02_18_18_00')
        .select('*')
        .eq('country_code', request.destination_country_code)
        .eq('is_active', true)
        .single()

      if (destError || !destination) {
        return new Response(
          JSON.stringify({ error: 'Destination not found or not supported' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Check service availability
      const serviceAvailable = {
        'EXPRESS': destination.express_available,
        'STANDARD': destination.standard_available,
        'ECONOMY': destination.economy_available
      }[request.service_type]

      if (!serviceAvailable) {
        return new Response(
          JSON.stringify({ error: `${request.service_type} service not available for this destination` }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Get shipping rates
      const { data: rates, error: ratesError } = await supabaseClient
        .from('international_shipping_rates_2026_02_18_18_00')
        .select('*')
        .eq('destination_id', destination.id)
        .eq('service_type', request.service_type)
        .lte('weight_from_kg', request.actual_weight_kg)
        .gte('weight_to_kg', request.actual_weight_kg)
        .eq('is_active', true)
        .order('weight_from_kg', { ascending: false })
        .limit(1)

      if (ratesError || !rates || rates.length === 0) {
        return new Response(
          JSON.stringify({ error: 'No shipping rates found for this weight and destination' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      const rate = rates[0]

      // Get airline specifications if provided
      let airline = null
      if (request.airline_code) {
        const { data: airlineData } = await supabaseClient
          .from('air_cargo_specifications_2026_02_18_18_00')
          .select('*')
          .eq('airline_code', request.airline_code)
          .eq('is_active', true)
          .single()
        
        airline = airlineData
      }

      // Calculate volume weight
      const volume_cm3 = request.dimensions_cm.length * request.dimensions_cm.width * request.dimensions_cm.height
      const volume_weight_divisor = airline?.volume_weight_divisor || rate.volume_weight_divisor
      const volume_weight_kg = volume_cm3 / volume_weight_divisor

      // Determine chargeable weight
      const chargeable_weight_kg = Math.max(
        request.actual_weight_kg,
        volume_weight_kg,
        rate.min_chargeable_weight_kg
      )

      // Calculate base rate
      const base_rate = rate.base_rate_usd * chargeable_weight_kg

      // Calculate additional charges
      const fuel_surcharge = base_rate * rate.fuel_surcharge_percentage / 100
      const security_fee = rate.security_fee_usd
      const customs_fee = rate.customs_clearance_fee_usd
      const remote_area_fee = rate.remote_area_fee_usd

      // Calculate insurance fee
      let insurance_fee = 0
      if (request.declared_value_usd && request.declared_value_usd > 0) {
        insurance_fee = Math.min(
          request.declared_value_usd * rate.insurance_percentage / 100,
          rate.max_insurance_usd
        )
      }

      // Calculate oversized fee
      let oversized_fee = 0
      if (airline && (
        request.dimensions_cm.length > airline.oversized_threshold_cm ||
        request.dimensions_cm.width > airline.oversized_threshold_cm ||
        request.dimensions_cm.height > airline.oversized_threshold_cm
      )) {
        oversized_fee = base_rate * airline.oversized_fee_percentage / 100
      }

      // Calculate total
      const total_usd = base_rate + fuel_surcharge + security_fee + customs_fee + 
                       insurance_fee + oversized_fee + remote_area_fee

      // Convert to MMK
      const total_mmk = total_usd * EXCHANGE_RATES.USD_MMK

      // Calculate delivery time
      const delivery_days = destination.delivery_time_days + destination.customs_clearance_days

      const calculation = {
        actual_weight_kg: request.actual_weight_kg,
        volume_weight_kg: Math.round(volume_weight_kg * 100) / 100,
        chargeable_weight_kg: Math.round(chargeable_weight_kg * 100) / 100,
        base_rate_usd: Math.round(base_rate * 100) / 100,
        fuel_surcharge_usd: Math.round(fuel_surcharge * 100) / 100,
        security_fee_usd: security_fee,
        customs_fee_usd: customs_fee,
        insurance_fee_usd: Math.round(insurance_fee * 100) / 100,
        oversized_fee_usd: Math.round(oversized_fee * 100) / 100,
        remote_area_fee_usd: remote_area_fee,
        total_usd: Math.round(total_usd * 100) / 100,
        total_mmk: Math.round(total_mmk),
        delivery_days: delivery_days,
        service_type: request.service_type,
        airline_used: airline?.airline_name_en || 'Standard Air Cargo',
        airline_used_mm: airline?.airline_name_mm || 'ပုံမှန်လေကြောင်းကုန်စည်ပို့ဆောင်ရေး',
        destination: {
          country: destination.country_name_en,
          country_mm: destination.country_name_mm,
          zone: destination.zone_category,
          currency: destination.currency_code
        },
        volume_calculation: {
          volume_cm3: volume_cm3,
          volume_weight_divisor: volume_weight_divisor,
          volume_weight_kg: Math.round(volume_weight_kg * 100) / 100
        }
      }

      // Save calculation history
      const { error: historyError } = await supabaseClient
        .from('shipping_calculations_2026_02_18_18_00')
        .insert({
          user_type: 'GUEST',
          origin_type: 'INTERNATIONAL',
          destination_location: calculation.destination,
          actual_weight_kg: request.actual_weight_kg,
          dimensions_cm: request.dimensions_cm,
          volume_weight_kg: calculation.volume_weight_kg,
          chargeable_weight_kg: calculation.chargeable_weight_kg,
          service_type: request.service_type,
          airline_code: request.airline_code,
          base_rate: calculation.base_rate_usd,
          additional_charges: {
            fuel_surcharge: calculation.fuel_surcharge_usd,
            security_fee: calculation.security_fee_usd,
            customs_fee: calculation.customs_fee_usd,
            insurance_fee: calculation.insurance_fee_usd,
            oversized_fee: calculation.oversized_fee_usd,
            remote_area_fee: calculation.remote_area_fee_usd
          },
          total_amount: calculation.total_usd,
          currency: 'USD',
          estimated_delivery_days: calculation.delivery_days,
          estimated_delivery_date: new Date(Date.now() + calculation.delivery_days * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          quote_valid_until: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        })

      if (historyError) {
        console.error('Failed to save calculation history:', historyError)
      }

      return new Response(
        JSON.stringify({
          success: true,
          calculation_type: 'international',
          ...calculation,
          exchange_rate_usd_mmk: EXCHANGE_RATES.USD_MMK,
          quote_valid_until: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          estimated_delivery_date: new Date(Date.now() + calculation.delivery_days * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (req.method === 'POST' && action === 'volume') {
      // Calculate air cargo volume weight
      const request: AirCargoVolumeRequest = await req.json()

      if (!request.dimensions_cm || !request.actual_weight_kg) {
        return new Response(
          JSON.stringify({ error: 'Missing required parameters: dimensions_cm, actual_weight_kg' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Get airline specifications if provided
      let airline = null
      if (request.airline_code) {
        const { data: airlineData } = await supabaseClient
          .from('air_cargo_specifications_2026_02_18_18_00')
          .select('*')
          .eq('airline_code', request.airline_code)
          .eq('is_active', true)
          .single()
        
        airline = airlineData
      }

      // Calculate volume
      const volume_cm3 = request.dimensions_cm.length * request.dimensions_cm.width * request.dimensions_cm.height
      const volume_m3 = volume_cm3 / 1000000

      // Calculate volume weight using different divisors
      const standard_divisor = 6000 // IATA standard
      const airline_divisor = airline?.volume_weight_divisor || standard_divisor
      const dimensional_divisor = airline?.dimensional_weight_divisor || 5000

      const volume_weight_standard = volume_cm3 / standard_divisor
      const volume_weight_airline = volume_cm3 / airline_divisor
      const dimensional_weight = volume_cm3 / dimensional_divisor

      // Determine chargeable weight
      const chargeable_weight = Math.max(request.actual_weight_kg, volume_weight_airline)

      // Check size restrictions
      const size_restrictions = {
        within_limits: true,
        oversized: false,
        restrictions: []
      }

      if (airline) {
        if (request.dimensions_cm.length > airline.max_length_cm) {
          size_restrictions.within_limits = false
          size_restrictions.restrictions.push(`Length exceeds ${airline.max_length_cm}cm limit`)
        }
        if (request.dimensions_cm.width > airline.max_width_cm) {
          size_restrictions.within_limits = false
          size_restrictions.restrictions.push(`Width exceeds ${airline.max_width_cm}cm limit`)
        }
        if (request.dimensions_cm.height > airline.max_height_cm) {
          size_restrictions.within_limits = false
          size_restrictions.restrictions.push(`Height exceeds ${airline.max_height_cm}cm limit`)
        }
        if (request.actual_weight_kg > airline.max_weight_kg) {
          size_restrictions.within_limits = false
          size_restrictions.restrictions.push(`Weight exceeds ${airline.max_weight_kg}kg limit`)
        }

        // Check if oversized
        if (request.dimensions_cm.length > airline.oversized_threshold_cm ||
            request.dimensions_cm.width > airline.oversized_threshold_cm ||
            request.dimensions_cm.height > airline.oversized_threshold_cm) {
          size_restrictions.oversized = true
        }
      }

      const volumeCalculation = {
        dimensions_cm: request.dimensions_cm,
        actual_weight_kg: request.actual_weight_kg,
        volume_cm3: volume_cm3,
        volume_m3: Math.round(volume_m3 * 1000000) / 1000000,
        volume_weight_calculations: {
          standard_iata: {
            divisor: standard_divisor,
            volume_weight_kg: Math.round(volume_weight_standard * 100) / 100
          },
          airline_specific: {
            divisor: airline_divisor,
            volume_weight_kg: Math.round(volume_weight_airline * 100) / 100,
            airline: airline?.airline_name_en || 'Standard'
          },
          dimensional_weight: {
            divisor: dimensional_divisor,
            weight_kg: Math.round(dimensional_weight * 100) / 100
          }
        },
        chargeable_weight_kg: Math.round(chargeable_weight * 100) / 100,
        weight_difference: Math.round((chargeable_weight - request.actual_weight_kg) * 100) / 100,
        size_restrictions: size_restrictions,
        airline_info: airline ? {
          code: airline.airline_code,
          name_en: airline.airline_name_en,
          name_mm: airline.airline_name_mm,
          volume_divisor: airline.volume_weight_divisor,
          max_dimensions: {
            length: airline.max_length_cm,
            width: airline.max_width_cm,
            height: airline.max_height_cm
          },
          max_weight_kg: airline.max_weight_kg
        } : null
      }

      return new Response(
        JSON.stringify({
          success: true,
          calculation_type: 'volume',
          ...volumeCalculation
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (req.method === 'GET' && action === 'locations') {
      // Get locations data
      const type = url.searchParams.get('type') || 'states'

      if (type === 'states') {
        const { data: states, error } = await supabaseClient
          .from('myanmar_states_divisions_2026_02_18_18_00')
          .select('*')
          .eq('is_active', true)
          .order('name_en')

        if (error) throw error

        return new Response(
          JSON.stringify({ success: true, states }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      if (type === 'townships') {
        const stateId = url.searchParams.get('state_id')
        
        let query = supabaseClient
          .from('townships_2026_02_18_18_00')
          .select(`
            *,
            myanmar_states_divisions_2026_02_18_18_00!inner(name_en, name_mm, zone_classification)
          `)
          .eq('is_active', true)
          .order('name_en')

        if (stateId) {
          query = query.eq('state_division_id', stateId)
        }

        const { data: townships, error } = await query

        if (error) throw error

        return new Response(
          JSON.stringify({ success: true, townships }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      if (type === 'countries') {
        const { data: countries, error } = await supabaseClient
          .from('international_destinations_2026_02_18_18_00')
          .select('*')
          .eq('is_active', true)
          .order('country_name_en')

        if (error) throw error

        return new Response(
          JSON.stringify({ success: true, countries }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      if (type === 'airlines') {
        const { data: airlines, error } = await supabaseClient
          .from('air_cargo_specifications_2026_02_18_18_00')
          .select('*')
          .eq('is_active', true)
          .order('airline_name_en')

        if (error) throw error

        return new Response(
          JSON.stringify({ success: true, airlines }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    }

    if (req.method === 'GET' && action === 'rates') {
      // Get current exchange rates
      return new Response(
        JSON.stringify({
          success: true,
          exchange_rates: EXCHANGE_RATES,
          last_updated: new Date().toISOString()
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action or method' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Shipping calculator error:', error)
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