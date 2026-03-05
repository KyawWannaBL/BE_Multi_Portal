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
    return new Response(null, { headers: corsHeaders })
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

    const { method } = req
    const url = new URL(req.url)
    const pathSegments = url.pathname.split('/').filter(Boolean)
    
    // Extract report type and operation from path
    const reportType = pathSegments[0] // delivery, merchant, financial, performance, custom
    const operation = pathSegments[1] // generate, export, list, get

    console.log(`Processing ${method} request for report type: ${reportType}, operation: ${operation}`)

    // Parse request body for POST requests
    let requestBody = null
    if (method === 'POST') {
      requestBody = await req.json()
    }

    // Parse query parameters for filters
    const searchParams = url.searchParams
    const filters = {
      startDate: searchParams.get('start_date'),
      endDate: searchParams.get('end_date'),
      status: searchParams.get('status'),
      city: searchParams.get('city'),
      merchantId: searchParams.get('merchant_id'),
      deliverymanId: searchParams.get('deliveryman_id'),
      format: searchParams.get('format') || 'json' // json, csv, pdf
    }

    // Route to appropriate report handler
    let result
    switch (reportType) {
      case 'delivery':
        result = await generateDeliveryReport(supabaseClient, operation, filters, requestBody)
        break
      case 'merchant':
        result = await generateMerchantReport(supabaseClient, operation, filters, requestBody)
        break
      case 'financial':
        result = await generateFinancialReport(supabaseClient, operation, filters, requestBody)
        break
      case 'performance':
        result = await generatePerformanceReport(supabaseClient, operation, filters, requestBody)
        break
      case 'custom':
        result = await generateCustomReport(supabaseClient, operation, filters, requestBody)
        break
      case 'dashboard':
        result = await generateDashboardData(supabaseClient, filters)
        break
      default:
        throw new Error(`Unknown report type: ${reportType}`)
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    console.error('Error in reporting function:', error)
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

// Delivery Report Generator
async function generateDeliveryReport(supabaseClient: any, operation: string, filters: any, body: any) {
  let query = supabaseClient
    .from('delivery_ways')
    .select('*')

  // Apply date filters
  if (filters.startDate) {
    query = query.gte('created_at', filters.startDate)
  }
  if (filters.endDate) {
    query = query.lte('created_at', filters.endDate)
  }
  if (filters.status) {
    query = query.eq('status', filters.status)
  }

  const { data: deliveries, error } = await query.order('created_at', { ascending: false })
  
  if (error) throw error

  // Generate summary statistics
  const summary = {
    totalDeliveries: deliveries.length,
    pendingDeliveries: deliveries.filter(d => d.status === 'pending').length,
    inTransitDeliveries: deliveries.filter(d => d.status === 'in_transit').length,
    deliveredDeliveries: deliveries.filter(d => d.status === 'delivered').length,
    failedDeliveries: deliveries.filter(d => d.status === 'failed').length,
    returnedDeliveries: deliveries.filter(d => d.status === 'returned').length,
    totalRevenue: deliveries.reduce((sum, d) => sum + (d.delivery_fee || 0), 0),
    totalCOD: deliveries.reduce((sum, d) => sum + (d.cod_amount || 0), 0),
    averageDeliveryFee: deliveries.length > 0 ? deliveries.reduce((sum, d) => sum + (d.delivery_fee || 0), 0) / deliveries.length : 0,
    successRate: deliveries.length > 0 ? (deliveries.filter(d => d.status === 'delivered').length / deliveries.length) * 100 : 0
  }

  // Group by status for chart data
  const statusDistribution = [
    { name: 'Pending', value: summary.pendingDeliveries, color: '#f59e0b' },
    { name: 'In Transit', value: summary.inTransitDeliveries, color: '#3b82f6' },
    { name: 'Delivered', value: summary.deliveredDeliveries, color: '#10b981' },
    { name: 'Failed', value: summary.failedDeliveries, color: '#ef4444' },
    { name: 'Returned', value: summary.returnedDeliveries, color: '#8b5cf6' }
  ]

  // Group by rider for performance analysis
  const riderPerformance = deliveries.reduce((acc: any, delivery) => {
    const rider = delivery.rider_name || 'Unassigned'
    if (!acc[rider]) {
      acc[rider] = {
        name: rider,
        totalDeliveries: 0,
        successfulDeliveries: 0,
        failedDeliveries: 0,
        totalRevenue: 0
      }
    }
    acc[rider].totalDeliveries++
    if (delivery.status === 'delivered') acc[rider].successfulDeliveries++
    if (delivery.status === 'failed') acc[rider].failedDeliveries++
    acc[rider].totalRevenue += delivery.delivery_fee || 0
    return acc
  }, {})

  const riderStats = Object.values(riderPerformance).map((rider: any) => ({
    ...rider,
    successRate: rider.totalDeliveries > 0 ? (rider.successfulDeliveries / rider.totalDeliveries) * 100 : 0
  }))

  return {
    success: true,
    reportType: 'delivery',
    generatedAt: new Date().toISOString(),
    filters,
    summary,
    statusDistribution,
    riderPerformance: riderStats,
    data: deliveries,
    totalRecords: deliveries.length
  }
}

// Merchant Report Generator
async function generateMerchantReport(supabaseClient: any, operation: string, filters: any, body: any) {
  let query = supabaseClient
    .from('merchants_be')
    .select('*')

  // Apply filters
  if (filters.status) {
    query = query.eq('status', filters.status)
  }
  if (filters.city) {
    query = query.eq('city', filters.city)
  }

  const { data: merchants, error } = await query.order('total_revenue', { ascending: false })
  
  if (error) throw error

  // Generate summary statistics
  const summary = {
    totalMerchants: merchants.length,
    activeMerchants: merchants.filter(m => m.status === 'active').length,
    inactiveMerchants: merchants.filter(m => m.status === 'inactive').length,
    pendingMerchants: merchants.filter(m => m.status === 'pending').length,
    suspendedMerchants: merchants.filter(m => m.status === 'suspended').length,
    totalRevenue: merchants.reduce((sum, m) => sum + (m.total_revenue || 0), 0),
    totalOrders: merchants.reduce((sum, m) => sum + (m.total_orders || 0), 0),
    averageOrdersPerMerchant: merchants.length > 0 ? merchants.reduce((sum, m) => sum + (m.total_orders || 0), 0) / merchants.length : 0,
    averageRevenuePerMerchant: merchants.length > 0 ? merchants.reduce((sum, m) => sum + (m.total_revenue || 0), 0) / merchants.length : 0,
    totalCreditLimit: merchants.reduce((sum, m) => sum + (m.credit_limit || 0), 0),
    totalOutstandingBalance: merchants.reduce((sum, m) => sum + (m.current_balance || 0), 0)
  }

  // Group by status for chart data
  const statusDistribution = [
    { name: 'Active', value: summary.activeMerchants, color: '#10b981' },
    { name: 'Inactive', value: summary.inactiveMerchants, color: '#6b7280' },
    { name: 'Pending', value: summary.pendingMerchants, color: '#f59e0b' },
    { name: 'Suspended', value: summary.suspendedMerchants, color: '#ef4444' }
  ]

  // Group by city for geographic analysis
  const cityDistribution = merchants.reduce((acc: any, merchant) => {
    const city = merchant.city || 'Unknown'
    if (!acc[city]) {
      acc[city] = {
        name: city,
        count: 0,
        totalRevenue: 0,
        totalOrders: 0
      }
    }
    acc[city].count++
    acc[city].totalRevenue += merchant.total_revenue || 0
    acc[city].totalOrders += merchant.total_orders || 0
    return acc
  }, {})

  // Top performing merchants
  const topMerchants = merchants
    .sort((a, b) => (b.total_revenue || 0) - (a.total_revenue || 0))
    .slice(0, 10)
    .map(merchant => ({
      id: merchant.id,
      business_name: merchant.business_name,
      total_revenue: merchant.total_revenue,
      total_orders: merchant.total_orders,
      status: merchant.status,
      city: merchant.city
    }))

  return {
    success: true,
    reportType: 'merchant',
    generatedAt: new Date().toISOString(),
    filters,
    summary,
    statusDistribution,
    cityDistribution: Object.values(cityDistribution),
    topMerchants,
    data: merchants,
    totalRecords: merchants.length
  }
}

// Financial Report Generator
async function generateFinancialReport(supabaseClient: any, operation: string, filters: any, body: any) {
  // Get delivery revenue data
  let deliveryQuery = supabaseClient
    .from('delivery_ways')
    .select('delivery_fee, cod_amount, created_at, status')

  if (filters.startDate) {
    deliveryQuery = deliveryQuery.gte('created_at', filters.startDate)
  }
  if (filters.endDate) {
    deliveryQuery = deliveryQuery.lte('created_at', filters.endDate)
  }

  const { data: deliveries, error: deliveryError } = await deliveryQuery
  if (deliveryError) throw deliveryError

  // Calculate financial metrics
  const totalDeliveryRevenue = deliveries.reduce((sum, d) => sum + (d.delivery_fee || 0), 0)
  const totalCODAmount = deliveries.reduce((sum, d) => sum + (d.cod_amount || 0), 0)
  const completedDeliveries = deliveries.filter(d => d.status === 'delivered')
  const actualRevenue = completedDeliveries.reduce((sum, d) => sum + (d.delivery_fee || 0), 0)

  // Group by month for trend analysis
  const monthlyRevenue = deliveries.reduce((acc: any, delivery) => {
    const month = new Date(delivery.created_at).toISOString().substring(0, 7) // YYYY-MM
    if (!acc[month]) {
      acc[month] = {
        month,
        revenue: 0,
        codAmount: 0,
        deliveryCount: 0,
        completedDeliveries: 0
      }
    }
    acc[month].revenue += delivery.delivery_fee || 0
    acc[month].codAmount += delivery.cod_amount || 0
    acc[month].deliveryCount++
    if (delivery.status === 'delivered') {
      acc[month].completedDeliveries++
    }
    return acc
  }, {})

  const monthlyTrends = Object.values(monthlyRevenue).sort((a: any, b: any) => a.month.localeCompare(b.month))

  // Calculate growth rates
  const currentMonth = monthlyTrends[monthlyTrends.length - 1] as any
  const previousMonth = monthlyTrends[monthlyTrends.length - 2] as any
  const revenueGrowth = previousMonth ? ((currentMonth?.revenue - previousMonth.revenue) / previousMonth.revenue) * 100 : 0

  const summary = {
    totalDeliveryRevenue,
    actualRevenue,
    totalCODAmount,
    pendingRevenue: totalDeliveryRevenue - actualRevenue,
    totalDeliveries: deliveries.length,
    completedDeliveries: completedDeliveries.length,
    averageOrderValue: deliveries.length > 0 ? totalDeliveryRevenue / deliveries.length : 0,
    revenueGrowthRate: revenueGrowth,
    collectionRate: totalDeliveryRevenue > 0 ? (actualRevenue / totalDeliveryRevenue) * 100 : 0
  }

  return {
    success: true,
    reportType: 'financial',
    generatedAt: new Date().toISOString(),
    filters,
    summary,
    monthlyTrends,
    data: deliveries,
    totalRecords: deliveries.length
  }
}

// Performance Report Generator
async function generatePerformanceReport(supabaseClient: any, operation: string, filters: any, body: any) {
  // Get deliverymen performance data
  const { data: deliverymen, error: deliverymenError } = await supabaseClient
    .from('deliverymen_be')
    .select('*')
    .eq('employment_status', 'active')

  if (deliverymenError) throw deliverymenError

  // Get delivery data for performance calculation
  let deliveryQuery = supabaseClient
    .from('delivery_ways')
    .select('*')

  if (filters.startDate) {
    deliveryQuery = deliveryQuery.gte('created_at', filters.startDate)
  }
  if (filters.endDate) {
    deliveryQuery = deliveryQuery.lte('created_at', filters.endDate)
  }

  const { data: deliveries, error: deliveryError } = await deliveryQuery
  if (deliveryError) throw deliveryError

  // Calculate system-wide KPIs
  const totalDeliveries = deliveries.length
  const successfulDeliveries = deliveries.filter(d => d.status === 'delivered').length
  const failedDeliveries = deliveries.filter(d => d.status === 'failed').length
  const systemSuccessRate = totalDeliveries > 0 ? (successfulDeliveries / totalDeliveries) * 100 : 0

  // Calculate average delivery time (mock data for now)
  const averageDeliveryTime = 24 // hours

  // Top performing deliverymen
  const topPerformers = deliverymen
    .sort((a, b) => (b.performance_rating || 0) - (a.performance_rating || 0))
    .slice(0, 10)
    .map(d => ({
      id: d.id,
      employee_id: d.employee_id,
      full_name: d.full_name,
      performance_rating: d.performance_rating,
      total_deliveries: d.total_deliveries,
      successful_deliveries: d.successful_deliveries,
      success_rate: d.total_deliveries > 0 ? (d.successful_deliveries / d.total_deliveries) * 100 : 0,
      total_earnings: d.total_earnings,
      zone_assignment: d.zone_assignment
    }))

  // Performance by zone
  const zonePerformance = deliverymen.reduce((acc: any, deliveryman) => {
    const zone = deliveryman.zone_assignment || 'Unassigned'
    if (!acc[zone]) {
      acc[zone] = {
        zone,
        deliverymenCount: 0,
        totalDeliveries: 0,
        successfulDeliveries: 0,
        totalEarnings: 0,
        averageRating: 0
      }
    }
    acc[zone].deliverymenCount++
    acc[zone].totalDeliveries += deliveryman.total_deliveries || 0
    acc[zone].successfulDeliveries += deliveryman.successful_deliveries || 0
    acc[zone].totalEarnings += deliveryman.total_earnings || 0
    acc[zone].averageRating += deliveryman.performance_rating || 0
    return acc
  }, {})

  // Calculate zone averages
  const zoneStats = Object.values(zonePerformance).map((zone: any) => ({
    ...zone,
    successRate: zone.totalDeliveries > 0 ? (zone.successfulDeliveries / zone.totalDeliveries) * 100 : 0,
    averageRating: zone.deliverymenCount > 0 ? zone.averageRating / zone.deliverymenCount : 0,
    averageEarnings: zone.deliverymenCount > 0 ? zone.totalEarnings / zone.deliverymenCount : 0
  }))

  const summary = {
    totalActiveDeliverymen: deliverymen.length,
    systemSuccessRate,
    averageDeliveryTime,
    totalSystemDeliveries: totalDeliveries,
    totalSuccessfulDeliveries: successfulDeliveries,
    totalFailedDeliveries: failedDeliveries,
    averagePerformanceRating: deliverymen.length > 0 ? deliverymen.reduce((sum, d) => sum + (d.performance_rating || 0), 0) / deliverymen.length : 0,
    totalSystemEarnings: deliverymen.reduce((sum, d) => sum + (d.total_earnings || 0), 0)
  }

  return {
    success: true,
    reportType: 'performance',
    generatedAt: new Date().toISOString(),
    filters,
    summary,
    topPerformers,
    zonePerformance: zoneStats,
    data: deliverymen,
    totalRecords: deliverymen.length
  }
}

// Custom Report Generator
async function generateCustomReport(supabaseClient: any, operation: string, filters: any, body: any) {
  if (!body || !body.reportConfig) {
    throw new Error('Report configuration is required for custom reports')
  }

  const { reportConfig } = body
  const { dataSource, columns, groupBy, aggregations, filters: customFilters } = reportConfig

  // This is a simplified custom report generator
  // In a real implementation, you would build dynamic queries based on the configuration
  
  let query = supabaseClient.from(dataSource).select('*')

  // Apply custom filters
  if (customFilters) {
    for (const filter of customFilters) {
      if (filter.operator === 'eq') {
        query = query.eq(filter.field, filter.value)
      } else if (filter.operator === 'gte') {
        query = query.gte(filter.field, filter.value)
      } else if (filter.operator === 'lte') {
        query = query.lte(filter.field, filter.value)
      }
    }
  }

  const { data, error } = await query
  if (error) throw error

  return {
    success: true,
    reportType: 'custom',
    generatedAt: new Date().toISOString(),
    reportConfig,
    data,
    totalRecords: data.length
  }
}

// Dashboard Data Generator
async function generateDashboardData(supabaseClient: any, filters: any) {
  // Get recent delivery ways
  const { data: recentDeliveries, error: deliveryError } = await supabaseClient
    .from('delivery_ways')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(10)

  if (deliveryError) throw deliveryError

  // Get merchant count
  const { count: merchantCount, error: merchantError } = await supabaseClient
    .from('merchants_be')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'active')

  if (merchantError) throw merchantError

  // Get deliveryman count
  const { count: deliverymanCount, error: deliverymanError } = await supabaseClient
    .from('deliverymen_be')
    .select('*', { count: 'exact', head: true })
    .eq('employment_status', 'active')

  if (deliverymanError) throw deliverymanError

  // Get recent broadcast messages
  const { data: recentMessages, error: messageError } = await supabaseClient
    .from('broadcast_messages')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5)

  if (messageError) throw messageError

  return {
    success: true,
    dashboardData: {
      recentDeliveries,
      merchantCount: merchantCount || 0,
      deliverymanCount: deliverymanCount || 0,
      recentMessages,
      generatedAt: new Date().toISOString()
    }
  }
}