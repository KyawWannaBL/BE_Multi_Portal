import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Authorization, X-Client-Info, apikey, Content-Type, X-Application-Name',
}

interface SystemConfig {
  setting_key: string;
  setting_value: string;
  setting_type: string;
  description?: string;
  min_value?: number;
  max_value?: number;
}

interface Voucher {
  id?: string;
  voucher_number: string;
  voucher_type: string;
  amount: number;
  description?: string;
  reference_number?: string;
  branch_id?: string;
  status: string;
  transaction_date: string;
}

interface CashAdvance {
  id?: string;
  advance_number: string;
  deliveryman_id: string;
  deliveryman_name: string;
  amount: number;
  purpose?: string;
  status: string;
  advance_date: string;
  due_date?: string;
  repaid_amount?: number;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
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
    )

    const { action, type, data, id } = await req.json()

    switch (action) {
      case 'get_system_config':
        return await getSystemConfig(supabaseClient)
      
      case 'update_system_config':
        return await updateSystemConfig(supabaseClient, data)
      
      case 'reset_system_config':
        return await resetSystemConfig(supabaseClient)
      
      case 'create_voucher':
        return await createVoucher(supabaseClient, data)
      
      case 'get_vouchers':
        return await getVouchers(supabaseClient, data)
      
      case 'update_voucher':
        return await updateVoucher(supabaseClient, id, data)
      
      case 'delete_voucher':
        return await deleteVoucher(supabaseClient, id)
      
      case 'create_cash_advance':
        return await createCashAdvance(supabaseClient, data)
      
      case 'get_cash_advances':
        return await getCashAdvances(supabaseClient, data)
      
      case 'update_cash_advance':
        return await updateCashAdvance(supabaseClient, id, data)
      
      case 'repay_cash_advance':
        return await repayCashAdvance(supabaseClient, id, data.amount)
      
      case 'submit_form':
        return await submitForm(supabaseClient, data)
      
      case 'validate_form':
        return await validateForm(data)
      
      case 'export_data':
        return await exportData(supabaseClient, type, data)
      
      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
    }
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

async function getSystemConfig(supabaseClient: any) {
  const { data, error } = await supabaseClient
    .from('system_configuration')
    .select('*')
    .order('setting_key')

  if (error) throw error

  return new Response(
    JSON.stringify({ success: true, data }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function updateSystemConfig(supabaseClient: any, configs: SystemConfig[]) {
  const updates = []
  
  for (const config of configs) {
    const { data, error } = await supabaseClient
      .from('system_configuration')
      .upsert({
        setting_key: config.setting_key,
        setting_value: config.setting_value,
        setting_type: config.setting_type,
        description: config.description,
        min_value: config.min_value,
        max_value: config.max_value,
        updated_at: new Date().toISOString()
      })
      .select()

    if (error) throw error
    updates.push(data)
  }

  return new Response(
    JSON.stringify({ success: true, message: 'System configuration updated successfully', data: updates }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function resetSystemConfig(supabaseClient: any) {
  const defaultConfigs = [
    { setting_key: 'wayIdLength', setting_value: '6', setting_type: 'integer', description: 'Number of digits for Way ID generation (4-10)', min_value: 4, max_value: 10 },
    { setting_key: 'promotionCodeLength', setting_value: '8', setting_type: 'integer', description: 'Length of promotion codes (6-12 characters)', min_value: 6, max_value: 12 },
    { setting_key: 'contactPhone', setting_value: '+95 9 123 456789', setting_type: 'string', description: 'Customer support contact number' },
    { setting_key: 'maxStationDistance', setting_value: '5000', setting_type: 'integer', description: 'Maximum distance between stations in meters', min_value: 100, max_value: 50000 }
  ]

  return await updateSystemConfig(supabaseClient, defaultConfigs)
}

async function createVoucher(supabaseClient: any, voucher: Voucher) {
  // Generate voucher number if not provided
  if (!voucher.voucher_number) {
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '')
    const { count } = await supabaseClient
      .from('vouchers')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', new Date().toISOString().slice(0, 10))
    
    voucher.voucher_number = `VCH-${date}-${String(count + 1).padStart(3, '0')}`
  }

  const { data, error } = await supabaseClient
    .from('vouchers')
    .insert(voucher)
    .select()

  if (error) throw error

  return new Response(
    JSON.stringify({ success: true, message: 'Voucher created successfully', data: data[0] }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function getVouchers(supabaseClient: any, filters: any = {}) {
  let query = supabaseClient
    .from('vouchers')
    .select('*')
    .order('created_at', { ascending: false })

  if (filters.type) {
    query = query.eq('voucher_type', filters.type)
  }
  
  if (filters.status) {
    query = query.eq('status', filters.status)
  }
  
  if (filters.date_from) {
    query = query.gte('transaction_date', filters.date_from)
  }
  
  if (filters.date_to) {
    query = query.lte('transaction_date', filters.date_to)
  }

  const { data, error } = await query

  if (error) throw error

  // Calculate summary statistics
  const totalIncome = data.filter(v => v.voucher_type === 'income' && v.status === 'approved')
    .reduce((sum, v) => sum + parseFloat(v.amount), 0)
  
  const totalExpense = data.filter(v => v.voucher_type === 'expense' && v.status === 'approved')
    .reduce((sum, v) => sum + parseFloat(v.amount), 0)
  
  const pendingAmount = data.filter(v => v.status === 'pending')
    .reduce((sum, v) => sum + parseFloat(v.amount), 0)

  return new Response(
    JSON.stringify({ 
      success: true, 
      data,
      summary: {
        totalIncome,
        totalExpense,
        netProfit: totalIncome - totalExpense,
        pendingAmount,
        totalVouchers: data.length
      }
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function updateVoucher(supabaseClient: any, id: string, updates: Partial<Voucher>) {
  const { data, error } = await supabaseClient
    .from('vouchers')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()

  if (error) throw error

  return new Response(
    JSON.stringify({ success: true, message: 'Voucher updated successfully', data: data[0] }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function deleteVoucher(supabaseClient: any, id: string) {
  const { error } = await supabaseClient
    .from('vouchers')
    .delete()
    .eq('id', id)

  if (error) throw error

  return new Response(
    JSON.stringify({ success: true, message: 'Voucher deleted successfully' }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function createCashAdvance(supabaseClient: any, advance: CashAdvance) {
  // Generate advance number if not provided
  if (!advance.advance_number) {
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '')
    const { count } = await supabaseClient
      .from('cash_advances')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', new Date().toISOString().slice(0, 10))
    
    advance.advance_number = `ADV-${date}-${String(count + 1).padStart(3, '0')}`
  }

  const { data, error } = await supabaseClient
    .from('cash_advances')
    .insert(advance)
    .select()

  if (error) throw error

  return new Response(
    JSON.stringify({ success: true, message: 'Cash advance created successfully', data: data[0] }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function getCashAdvances(supabaseClient: any, filters: any = {}) {
  let query = supabaseClient
    .from('cash_advances')
    .select('*')
    .order('created_at', { ascending: false })

  if (filters.deliveryman_id) {
    query = query.eq('deliveryman_id', filters.deliveryman_id)
  }
  
  if (filters.status) {
    query = query.eq('status', filters.status)
  }

  const { data, error } = await query

  if (error) throw error

  // Calculate summary
  const totalAdvanced = data.reduce((sum, a) => sum + parseFloat(a.amount), 0)
  const totalRepaid = data.reduce((sum, a) => sum + parseFloat(a.repaid_amount || 0), 0)
  const outstanding = totalAdvanced - totalRepaid

  return new Response(
    JSON.stringify({ 
      success: true, 
      data,
      summary: {
        totalAdvanced,
        totalRepaid,
        outstanding,
        activeAdvances: data.filter(a => a.status === 'active').length
      }
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function updateCashAdvance(supabaseClient: any, id: string, updates: Partial<CashAdvance>) {
  const { data, error } = await supabaseClient
    .from('cash_advances')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()

  if (error) throw error

  return new Response(
    JSON.stringify({ success: true, message: 'Cash advance updated successfully', data: data[0] }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function repayCashAdvance(supabaseClient: any, id: string, repaymentAmount: number) {
  // Get current advance
  const { data: advance, error: fetchError } = await supabaseClient
    .from('cash_advances')
    .select('*')
    .eq('id', id)
    .single()

  if (fetchError) throw fetchError

  const newRepaidAmount = (advance.repaid_amount || 0) + repaymentAmount
  const isFullyRepaid = newRepaidAmount >= advance.amount

  const { data, error } = await supabaseClient
    .from('cash_advances')
    .update({
      repaid_amount: newRepaidAmount,
      status: isFullyRepaid ? 'repaid' : 'active',
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()

  if (error) throw error

  return new Response(
    JSON.stringify({ 
      success: true, 
      message: `Repayment of ${repaymentAmount} MMK recorded successfully`,
      data: data[0]
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function submitForm(supabaseClient: any, formData: any) {
  const { data, error } = await supabaseClient
    .from('form_submissions')
    .insert({
      form_type: formData.form_type,
      form_data: formData.data,
      user_id: formData.user_id,
      status: 'submitted'
    })
    .select()

  if (error) throw error

  return new Response(
    JSON.stringify({ success: true, message: 'Form submitted successfully', data: data[0] }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function validateForm(formData: any) {
  const errors: any = {}

  // System configuration validation
  if (formData.form_type === 'system_config') {
    if (formData.wayIdLength && (formData.wayIdLength < 4 || formData.wayIdLength > 10)) {
      errors.wayIdLength = 'Way ID length must be between 4 and 10 digits'
    }
    
    if (formData.promotionCodeLength && (formData.promotionCodeLength < 6 || formData.promotionCodeLength > 12)) {
      errors.promotionCodeLength = 'Promotion code length must be between 6 and 12 characters'
    }
    
    if (formData.contactPhone && !/^\+?[\d\s\-\(\)]+$/.test(formData.contactPhone)) {
      errors.contactPhone = 'Please enter a valid phone number'
    }
  }

  // Voucher validation
  if (formData.form_type === 'voucher') {
    if (!formData.amount || formData.amount <= 0) {
      errors.amount = 'Amount must be greater than 0'
    }
    
    if (!formData.voucher_type || !['income', 'expense', 'transfer'].includes(formData.voucher_type)) {
      errors.voucher_type = 'Please select a valid voucher type'
    }
    
    if (!formData.description || formData.description.trim().length < 5) {
      errors.description = 'Description must be at least 5 characters long'
    }
  }

  // Cash advance validation
  if (formData.form_type === 'cash_advance') {
    if (!formData.amount || formData.amount <= 0) {
      errors.amount = 'Amount must be greater than 0'
    }
    
    if (formData.amount > 500000) {
      errors.amount = 'Amount cannot exceed 500,000 MMK'
    }
    
    if (!formData.deliveryman_id) {
      errors.deliveryman_id = 'Please select a deliveryman'
    }
  }

  const isValid = Object.keys(errors).length === 0

  return new Response(
    JSON.stringify({ success: true, isValid, errors }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function exportData(supabaseClient: any, type: string, filters: any = {}) {
  let data: any[] = []
  let filename = ''

  switch (type) {
    case 'vouchers':
      const vouchersResult = await getVouchers(supabaseClient, filters)
      const vouchersData = await vouchersResult.json()
      data = vouchersData.data
      filename = `vouchers_export_${new Date().toISOString().slice(0, 10)}.csv`
      break
      
    case 'cash_advances':
      const advancesResult = await getCashAdvances(supabaseClient, filters)
      const advancesData = await advancesResult.json()
      data = advancesData.data
      filename = `cash_advances_export_${new Date().toISOString().slice(0, 10)}.csv`
      break
      
    default:
      throw new Error('Invalid export type')
  }

  // Convert to CSV
  if (data.length === 0) {
    return new Response(
      JSON.stringify({ success: false, message: 'No data to export' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  const headers = Object.keys(data[0]).join(',')
  const rows = data.map(row => 
    Object.values(row).map(value => 
      typeof value === 'string' && value.includes(',') ? `"${value}"` : value
    ).join(',')
  )
  
  const csv = [headers, ...rows].join('\n')

  return new Response(csv, {
    headers: {
      ...corsHeaders,
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="${filename}"`
    }
  })
}