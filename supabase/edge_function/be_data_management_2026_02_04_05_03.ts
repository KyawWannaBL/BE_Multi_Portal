import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Authorization, X-Client-Info, apikey, Content-Type, X-Application-Name',
}

interface Database {
  public: {
    Tables: {
      delivery_ways: {
        Row: {
          id: string
          tracking_number: string
          status: string
          pickup_address: string
          delivery_address: string
          pickup_date: string | null
          delivery_date: string | null
          rider_name: string | null
          vehicle_type: string | null
          priority: number
          cod_amount: number
          delivery_fee: number
          weight: number | null
          special_instructions: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          tracking_number: string
          status?: string
          pickup_address: string
          delivery_address: string
          pickup_date?: string | null
          delivery_date?: string | null
          rider_name?: string | null
          vehicle_type?: string | null
          priority?: number
          cod_amount?: number
          delivery_fee: number
          weight?: number | null
          special_instructions?: string | null
        }
        Update: {
          tracking_number?: string
          status?: string
          pickup_address?: string
          delivery_address?: string
          pickup_date?: string | null
          delivery_date?: string | null
          rider_name?: string | null
          vehicle_type?: string | null
          priority?: number
          cod_amount?: number
          delivery_fee?: number
          weight?: number | null
          special_instructions?: string | null
        }
      }
      merchants_be: {
        Row: {
          id: string
          business_name: string
          business_type: string | null
          registration_number: string | null
          contact_person: string
          phone: string
          email: string | null
          address: string
          city: string
          status: string
          credit_limit: number
          current_balance: number
          payment_terms: number
          total_orders: number
          total_revenue: number
          registration_date: string
          last_order_date: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          business_name: string
          business_type?: string | null
          registration_number?: string | null
          contact_person: string
          phone: string
          email?: string | null
          address: string
          city: string
          status?: string
          credit_limit?: number
          current_balance?: number
          payment_terms?: number
          total_orders?: number
          total_revenue?: number
          notes?: string | null
        }
        Update: {
          business_name?: string
          business_type?: string | null
          registration_number?: string | null
          contact_person?: string
          phone?: string
          email?: string | null
          address?: string
          city?: string
          status?: string
          credit_limit?: number
          current_balance?: number
          payment_terms?: number
          total_orders?: number
          total_revenue?: number
          notes?: string | null
        }
      }
      deliverymen_be: {
        Row: {
          id: string
          employee_id: string
          full_name: string
          phone: string
          email: string | null
          address: string | null
          city: string | null
          date_of_birth: string | null
          hire_date: string
          employment_status: string
          vehicle_type: string | null
          vehicle_number: string | null
          license_number: string | null
          zone_assignment: string | null
          base_salary: number
          total_deliveries: number
          successful_deliveries: number
          failed_deliveries: number
          total_earnings: number
          current_cash_advance: number
          performance_rating: number
          last_active: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          employee_id: string
          full_name: string
          phone: string
          email?: string | null
          address?: string | null
          city?: string | null
          date_of_birth?: string | null
          hire_date?: string
          employment_status?: string
          vehicle_type?: string | null
          vehicle_number?: string | null
          license_number?: string | null
          zone_assignment?: string | null
          base_salary?: number
          total_deliveries?: number
          successful_deliveries?: number
          failed_deliveries?: number
          total_earnings?: number
          current_cash_advance?: number
          performance_rating?: number
        }
        Update: {
          employee_id?: string
          full_name?: string
          phone?: string
          email?: string | null
          address?: string | null
          city?: string | null
          date_of_birth?: string | null
          hire_date?: string
          employment_status?: string
          vehicle_type?: string | null
          vehicle_number?: string | null
          license_number?: string | null
          zone_assignment?: string | null
          base_salary?: number
          total_deliveries?: number
          successful_deliveries?: number
          failed_deliveries?: number
          total_earnings?: number
          current_cash_advance?: number
          performance_rating?: number
        }
      }
      broadcast_messages: {
        Row: {
          id: string
          message_title: string
          message_content: string
          message_type: string
          target_audience: string
          delivery_method: string
          scheduled_send_time: string | null
          sent_time: string | null
          status: string
          total_recipients: number
          successful_deliveries: number
          failed_deliveries: number
          created_at: string
          updated_at: string
        }
        Insert: {
          message_title: string
          message_content: string
          message_type?: string
          target_audience: string
          delivery_method?: string
          scheduled_send_time?: string | null
          status?: string
          total_recipients?: number
          successful_deliveries?: number
          failed_deliveries?: number
        }
        Update: {
          message_title?: string
          message_content?: string
          message_type?: string
          target_audience?: string
          delivery_method?: string
          scheduled_send_time?: string | null
          sent_time?: string | null
          status?: string
          total_recipients?: number
          successful_deliveries?: number
          failed_deliveries?: number
        }
      }
      system_settings_be: {
        Row: {
          id: string
          setting_category: string
          setting_key: string
          setting_value: string | null
          setting_type: string
          description: string | null
          is_public: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          setting_category: string
          setting_key: string
          setting_value?: string | null
          setting_type?: string
          description?: string | null
          is_public?: boolean
        }
        Update: {
          setting_category?: string
          setting_key?: string
          setting_value?: string | null
          setting_type?: string
          description?: string | null
          is_public?: boolean
        }
      }
    }
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient<Database>(
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
    const pathSegments = url.pathname.split('/').filter(Boolean)
    
    // Extract entity type and operation from path
    const entity = pathSegments[0] // delivery-ways, merchants, deliverymen, broadcast-messages, system-settings
    const operation = pathSegments[1] // list, create, update, delete, get
    const id = pathSegments[2] // specific ID for get/update/delete operations

    console.log(`Processing ${method} request for entity: ${entity}, operation: ${operation}, id: ${id}`)

    // Parse request body for POST/PUT requests
    let requestBody = null
    if (method === 'POST' || method === 'PUT') {
      requestBody = await req.json()
    }

    // Route to appropriate handler based on entity and operation
    let result
    switch (entity) {
      case 'delivery-ways':
        result = await handleDeliveryWays(supabaseClient, method, operation, id, requestBody)
        break
      case 'merchants':
        result = await handleMerchants(supabaseClient, method, operation, id, requestBody)
        break
      case 'deliverymen':
        result = await handleDeliverymen(supabaseClient, method, operation, id, requestBody)
        break
      case 'broadcast-messages':
        result = await handleBroadcastMessages(supabaseClient, method, operation, id, requestBody)
        break
      case 'system-settings':
        result = await handleSystemSettings(supabaseClient, method, operation, id, requestBody)
        break
      case 'failed-deliveries':
        result = await handleFailedDeliveries(supabaseClient, method, operation, id, requestBody)
        break
      case 'return-shipments':
        result = await handleReturnShipments(supabaseClient, method, operation, id, requestBody)
        break
      case 'cash-advances':
        result = await handleCashAdvances(supabaseClient, method, operation, id, requestBody)
        break
      default:
        throw new Error(`Unknown entity: ${entity}`)
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    console.error('Error in be-data-management function:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: 'Check function logs for more information'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})

// Delivery Ways handlers
async function handleDeliveryWays(supabaseClient: any, method: string, operation: string, id: string, body: any) {
  switch (operation) {
    case 'list':
      const { data: deliveryWays, error: listError } = await supabaseClient
        .from('delivery_ways')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (listError) throw listError
      return { success: true, data: deliveryWays }

    case 'get':
      if (!id) throw new Error('ID is required for get operation')
      
      const { data: deliveryWay, error: getError } = await supabaseClient
        .from('delivery_ways')
        .select('*')
        .eq('id', id)
        .single()
      
      if (getError) throw getError
      return { success: true, data: deliveryWay }

    case 'create':
      if (!body) throw new Error('Request body is required for create operation')
      
      const { data: newDeliveryWay, error: createError } = await supabaseClient
        .from('delivery_ways')
        .insert(body)
        .select()
        .single()
      
      if (createError) throw createError
      return { success: true, data: newDeliveryWay }

    case 'update':
      if (!id || !body) throw new Error('ID and request body are required for update operation')
      
      const { data: updatedDeliveryWay, error: updateError } = await supabaseClient
        .from('delivery_ways')
        .update(body)
        .eq('id', id)
        .select()
        .single()
      
      if (updateError) throw updateError
      return { success: true, data: updatedDeliveryWay }

    case 'delete':
      if (!id) throw new Error('ID is required for delete operation')
      
      const { error: deleteError } = await supabaseClient
        .from('delivery_ways')
        .delete()
        .eq('id', id)
      
      if (deleteError) throw deleteError
      return { success: true, message: 'Delivery way deleted successfully' }

    default:
      throw new Error(`Unknown operation: ${operation}`)
  }
}

// Merchants handlers
async function handleMerchants(supabaseClient: any, method: string, operation: string, id: string, body: any) {
  switch (operation) {
    case 'list':
      const { data: merchants, error: listError } = await supabaseClient
        .from('merchants_be')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (listError) throw listError
      return { success: true, data: merchants }

    case 'get':
      if (!id) throw new Error('ID is required for get operation')
      
      const { data: merchant, error: getError } = await supabaseClient
        .from('merchants_be')
        .select('*')
        .eq('id', id)
        .single()
      
      if (getError) throw getError
      return { success: true, data: merchant }

    case 'create':
      if (!body) throw new Error('Request body is required for create operation')
      
      const { data: newMerchant, error: createError } = await supabaseClient
        .from('merchants_be')
        .insert(body)
        .select()
        .single()
      
      if (createError) throw createError
      return { success: true, data: newMerchant }

    case 'update':
      if (!id || !body) throw new Error('ID and request body are required for update operation')
      
      const { data: updatedMerchant, error: updateError } = await supabaseClient
        .from('merchants_be')
        .update(body)
        .eq('id', id)
        .select()
        .single()
      
      if (updateError) throw updateError
      return { success: true, data: updatedMerchant }

    case 'delete':
      if (!id) throw new Error('ID is required for delete operation')
      
      const { error: deleteError } = await supabaseClient
        .from('merchants_be')
        .delete()
        .eq('id', id)
      
      if (deleteError) throw deleteError
      return { success: true, message: 'Merchant deleted successfully' }

    default:
      throw new Error(`Unknown operation: ${operation}`)
  }
}

// Deliverymen handlers
async function handleDeliverymen(supabaseClient: any, method: string, operation: string, id: string, body: any) {
  switch (operation) {
    case 'list':
      const { data: deliverymen, error: listError } = await supabaseClient
        .from('deliverymen_be')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (listError) throw listError
      return { success: true, data: deliverymen }

    case 'get':
      if (!id) throw new Error('ID is required for get operation')
      
      const { data: deliveryman, error: getError } = await supabaseClient
        .from('deliverymen_be')
        .select('*')
        .eq('id', id)
        .single()
      
      if (getError) throw getError
      return { success: true, data: deliveryman }

    case 'create':
      if (!body) throw new Error('Request body is required for create operation')
      
      const { data: newDeliveryman, error: createError } = await supabaseClient
        .from('deliverymen_be')
        .insert(body)
        .select()
        .single()
      
      if (createError) throw createError
      return { success: true, data: newDeliveryman }

    case 'update':
      if (!id || !body) throw new Error('ID and request body are required for update operation')
      
      const { data: updatedDeliveryman, error: updateError } = await supabaseClient
        .from('deliverymen_be')
        .update(body)
        .eq('id', id)
        .select()
        .single()
      
      if (updateError) throw updateError
      return { success: true, data: updatedDeliveryman }

    case 'delete':
      if (!id) throw new Error('ID is required for delete operation')
      
      const { error: deleteError } = await supabaseClient
        .from('deliverymen_be')
        .delete()
        .eq('id', id)
      
      if (deleteError) throw deleteError
      return { success: true, message: 'Deliveryman deleted successfully' }

    default:
      throw new Error(`Unknown operation: ${operation}`)
  }
}

// Broadcast Messages handlers
async function handleBroadcastMessages(supabaseClient: any, method: string, operation: string, id: string, body: any) {
  switch (operation) {
    case 'list':
      const { data: messages, error: listError } = await supabaseClient
        .from('broadcast_messages')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (listError) throw listError
      return { success: true, data: messages }

    case 'get':
      if (!id) throw new Error('ID is required for get operation')
      
      const { data: message, error: getError } = await supabaseClient
        .from('broadcast_messages')
        .select('*')
        .eq('id', id)
        .single()
      
      if (getError) throw getError
      return { success: true, data: message }

    case 'create':
      if (!body) throw new Error('Request body is required for create operation')
      
      const { data: newMessage, error: createError } = await supabaseClient
        .from('broadcast_messages')
        .insert(body)
        .select()
        .single()
      
      if (createError) throw createError
      return { success: true, data: newMessage }

    case 'update':
      if (!id || !body) throw new Error('ID and request body are required for update operation')
      
      const { data: updatedMessage, error: updateError } = await supabaseClient
        .from('broadcast_messages')
        .update(body)
        .eq('id', id)
        .select()
        .single()
      
      if (updateError) throw updateError
      return { success: true, data: updatedMessage }

    case 'send':
      if (!id) throw new Error('ID is required for send operation')
      
      // Update message status to 'sent' and set sent_time
      const { data: sentMessage, error: sendError } = await supabaseClient
        .from('broadcast_messages')
        .update({ 
          status: 'sent', 
          sent_time: new Date().toISOString(),
          successful_deliveries: body?.total_recipients || 0
        })
        .eq('id', id)
        .select()
        .single()
      
      if (sendError) throw sendError
      return { success: true, data: sentMessage, message: 'Message sent successfully' }

    case 'delete':
      if (!id) throw new Error('ID is required for delete operation')
      
      const { error: deleteError } = await supabaseClient
        .from('broadcast_messages')
        .delete()
        .eq('id', id)
      
      if (deleteError) throw deleteError
      return { success: true, message: 'Broadcast message deleted successfully' }

    default:
      throw new Error(`Unknown operation: ${operation}`)
  }
}

// System Settings handlers
async function handleSystemSettings(supabaseClient: any, method: string, operation: string, id: string, body: any) {
  switch (operation) {
    case 'list':
      const { data: settings, error: listError } = await supabaseClient
        .from('system_settings_be')
        .select('*')
        .order('setting_category', { ascending: true })
      
      if (listError) throw listError
      return { success: true, data: settings }

    case 'get':
      if (!id) throw new Error('ID is required for get operation')
      
      const { data: setting, error: getError } = await supabaseClient
        .from('system_settings_be')
        .select('*')
        .eq('id', id)
        .single()
      
      if (getError) throw getError
      return { success: true, data: setting }

    case 'update':
      if (!id || !body) throw new Error('ID and request body are required for update operation')
      
      const { data: updatedSetting, error: updateError } = await supabaseClient
        .from('system_settings_be')
        .update({ ...body, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()
      
      if (updateError) throw updateError
      return { success: true, data: updatedSetting }

    case 'create':
      if (!body) throw new Error('Request body is required for create operation')
      
      const { data: newSetting, error: createError } = await supabaseClient
        .from('system_settings_be')
        .insert(body)
        .select()
        .single()
      
      if (createError) throw createError
      return { success: true, data: newSetting }

    default:
      throw new Error(`Unknown operation: ${operation}`)
  }
}

// Failed Deliveries handlers
async function handleFailedDeliveries(supabaseClient: any, method: string, operation: string, id: string, body: any) {
  switch (operation) {
    case 'list':
      const { data: failedDeliveries, error: listError } = await supabaseClient
        .from('failed_deliveries')
        .select('*')
        .order('failure_date', { ascending: false })
      
      if (listError) throw listError
      return { success: true, data: failedDeliveries }

    case 'resolve':
      if (!id) throw new Error('ID is required for resolve operation')
      
      const { data: resolvedDelivery, error: resolveError } = await supabaseClient
        .from('failed_deliveries')
        .update({ 
          resolved: true, 
          resolved_date: new Date().toISOString(),
          notes: body?.resolution_notes || 'Resolved'
        })
        .eq('id', id)
        .select()
        .single()
      
      if (resolveError) throw resolveError
      return { success: true, data: resolvedDelivery }

    default:
      throw new Error(`Unknown operation: ${operation}`)
  }
}

// Return Shipments handlers
async function handleReturnShipments(supabaseClient: any, method: string, operation: string, id: string, body: any) {
  switch (operation) {
    case 'list':
      const { data: returnShipments, error: listError } = await supabaseClient
        .from('return_shipments')
        .select('*')
        .order('return_date', { ascending: false })
      
      if (listError) throw listError
      return { success: true, data: returnShipments }

    case 'update-status':
      if (!id || !body?.return_status) throw new Error('ID and return_status are required')
      
      const { data: updatedReturn, error: updateError } = await supabaseClient
        .from('return_shipments')
        .update({ 
          return_status: body.return_status,
          refund_status: body.refund_status || 'pending',
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single()
      
      if (updateError) throw updateError
      return { success: true, data: updatedReturn }

    default:
      throw new Error(`Unknown operation: ${operation}`)
  }
}

// Cash Advances handlers
async function handleCashAdvances(supabaseClient: any, method: string, operation: string, id: string, body: any) {
  switch (operation) {
    case 'list':
      const { data: cashAdvances, error: listError } = await supabaseClient
        .from('cash_advances')
        .select(`
          *,
          deliverymen_be!inner(employee_id, full_name, phone)
        `)
        .order('created_at', { ascending: false })
      
      if (listError) throw listError
      return { success: true, data: cashAdvances }

    case 'approve':
      if (!id) throw new Error('ID is required for approve operation')
      
      const { data: approvedAdvance, error: approveError } = await supabaseClient
        .from('cash_advances')
        .update({ 
          status: 'approved',
          disbursement_date: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single()
      
      if (approveError) throw approveError
      return { success: true, data: approvedAdvance }

    case 'create':
      if (!body) throw new Error('Request body is required for create operation')
      
      const { data: newAdvance, error: createError } = await supabaseClient
        .from('cash_advances')
        .insert({
          ...body,
          remaining_balance: body.amount
        })
        .select()
        .single()
      
      if (createError) throw createError
      return { success: true, data: newAdvance }

    default:
      throw new Error(`Unknown operation: ${operation}`)
  }
}