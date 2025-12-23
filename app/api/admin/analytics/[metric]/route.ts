import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

// Query parameters schema
const metricQuerySchema = z.object({
  period: z.enum(['7d', '30d', '90d', '1y', 'all']).optional().default('30d'),
  group_by: z.enum(['day', 'week', 'month']).optional().default('day'),
  include_comparison: z.string().optional().default('true'),
})

type RouteParams = {
  params: Promise<{
    metric: string
  }>
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const supabase = await createClient()
    const { metric } = await params

    // Verify admin authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Verify user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('user_type')
      .eq('id', user.id)
      .single()

    if (!profile || profile.user_type !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const queryValidation = metricQuerySchema.safeParse({
      period: searchParams.get('period'),
      group_by: searchParams.get('group_by'),
      include_comparison: searchParams.get('include_comparison'),
    })

    if (!queryValidation.success) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: queryValidation.error.issues },
        { status: 400 }
      )
    }

    const { period, group_by, include_comparison } = queryValidation.data
    const includeComparison = include_comparison === 'true'

    // Calculate date range
    const now = new Date()
    let startDate: Date

    switch (period) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        break
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
        break
      case '1y':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
        break
      case 'all':
        startDate = new Date('2024-01-01')
        break
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    }

    const startDateStr = startDate.toISOString()

    // Generate metric data based on requested metric
    let metricData: any = null
    let comparisonData: any = null

    switch (metric) {
      case 'users':
        metricData = await getUserMetrics(supabase, startDateStr, group_by)
        if (includeComparison) {
          comparisonData = await getUserMetricsComparison(supabase, startDate, period, group_by)
        }
        break

      case 'properties':
        metricData = await getPropertyMetrics(supabase, startDateStr, group_by)
        if (includeComparison) {
          comparisonData = await getPropertyMetricsComparison(supabase, startDate, period, group_by)
        }
        break

      case 'inquiries':
        metricData = await getInquiryMetrics(supabase, startDateStr, group_by)
        if (includeComparison) {
          comparisonData = await getInquiryMetricsComparison(supabase, startDate, period, group_by)
        }
        break

      case 'revenue':
        metricData = await getRevenueMetrics(supabase, startDateStr, group_by)
        if (includeComparison) {
          comparisonData = await getRevenueMetricsComparison(supabase, startDate, period, group_by)
        }
        break

      case 'performance':
        metricData = await getPerformanceMetrics(supabase, startDateStr, group_by)
        if (includeComparison) {
          comparisonData = await getPerformanceMetricsComparison(supabase, startDate, period, group_by)
        }
        break

      default:
        return NextResponse.json(
          { error: 'Invalid metric. Supported metrics: users, properties, inquiries, revenue, performance' },
          { status: 400 }
        )
    }

    return NextResponse.json({
      metric,
      period: {
        start_date: startDateStr,
        end_date: now.toISOString(),
        period_type: period,
        group_by,
      },
      data: metricData,
      comparison: includeComparison ? comparisonData : null,
      metadata: {
        total_period: Math.ceil((now.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000)),
        data_points: metricData?.length || 0,
        has_comparison: includeComparison && comparisonData !== null,
      }
    })

  } catch (error) {
    console.error('Unexpected error in metric analytics:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// User metrics functions
async function getUserMetrics(supabase: any, startDateStr: string, groupBy: string) {
  // For now, return mock data since we need to implement proper date grouping
  // In production, this would use a more complex query with date truncation
  const { data, error } = await supabase
    .from('profiles')
    .select('user_type, created_at')
    .gte('created_at', startDateStr)
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Error fetching user metrics:', error)
    return []
  }

  // Group by date periods (simplified implementation)
  const groupedData: { [key: string]: any } = {}

  data.forEach((user: any) => {
    const date = new Date(user.created_at)
    let period: string

    switch (groupBy) {
      case 'day':
        period = date.toISOString().split('T')[0]
        break
      case 'week':
        const weekStart = new Date(date)
        weekStart.setDate(date.getDate() - date.getDay())
        period = weekStart.toISOString().split('T')[0]
        break
      case 'month':
        period = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
        break
      default:
        period = date.toISOString().split('T')[0]
    }

    if (!groupedData[period]) {
      groupedData[period] = {
        period,
        total_users: 0,
        regular_users: 0,
        property_owners: 0,
        admins: 0
      }
    }

    groupedData[period].total_users++
    if (user.user_type === 'user') groupedData[period].regular_users++
    if (user.user_type === 'owner') groupedData[period].property_owners++
    if (user.user_type === 'admin') groupedData[period].admins++
  })

  return Object.values(groupedData).sort((a: any, b: any) => a.period.localeCompare(b.period))
}

async function getUserMetricsComparison(supabase: any, startDate: Date, period: string, groupBy: string) {
  // Calculate previous period
  const periodLength = getPeriodLength(period)
  const previousStartDate = new Date(startDate.getTime() - periodLength)

  const { data, error } = await supabase
    .from('profiles')
    .select('user_type, created_at')
    .gte('created_at', previousStartDate.toISOString())
    .lt('created_at', startDate.toISOString())
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Error fetching user metrics comparison:', error)
    return []
  }

  // Group by date periods (simplified implementation)
  const groupedData: { [key: string]: any } = {}

  data.forEach((user: any) => {
    const date = new Date(user.created_at)
    let period: string

    switch (groupBy) {
      case 'day':
        period = date.toISOString().split('T')[0]
        break
      case 'week':
        const weekStart = new Date(date)
        weekStart.setDate(date.getDate() - date.getDay())
        period = weekStart.toISOString().split('T')[0]
        break
      case 'month':
        period = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
        break
      default:
        period = date.toISOString().split('T')[0]
    }

    if (!groupedData[period]) {
      groupedData[period] = {
        period,
        total_users: 0,
        regular_users: 0,
        property_owners: 0,
        admins: 0
      }
    }

    groupedData[period].total_users++
    if (user.user_type === 'user') groupedData[period].regular_users++
    if (user.user_type === 'owner') groupedData[period].property_owners++
    if (user.user_type === 'admin') groupedData[period].admins++
  })

  return Object.values(groupedData).sort((a: any, b: any) => a.period.localeCompare(b.period))
}

// Property metrics functions
async function getPropertyMetrics(supabase: any, startDateStr: string, groupBy: string) {
  const { data, error } = await supabase
    .from('properties')
    .select('status, is_featured, created_at')
    .gte('created_at', startDateStr)
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Error fetching property metrics:', error)
    return []
  }

  // Group by date periods (simplified implementation)
  const groupedData: { [key: string]: any } = {}

  data.forEach((property: any) => {
    const date = new Date(property.created_at)
    let period: string

    switch (groupBy) {
      case 'day':
        period = date.toISOString().split('T')[0]
        break
      case 'week':
        const weekStart = new Date(date)
        weekStart.setDate(date.getDate() - date.getDay())
        period = weekStart.toISOString().split('T')[0]
        break
      case 'month':
        period = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
        break
      default:
        period = date.toISOString().split('T')[0]
    }

    if (!groupedData[period]) {
      groupedData[period] = {
        period,
        total_properties: 0,
        live_properties: 0,
        pending_ml: 0,
        pending_vetting: 0,
        rejected_properties: 0,
        featured_properties: 0
      }
    }

    groupedData[period].total_properties++
    if (property.status === 'live') groupedData[period].live_properties++
    if (property.status === 'pending_ml_validation') groupedData[period].pending_ml++
    if (property.status === 'pending_vetting') groupedData[period].pending_vetting++
    if (property.status === 'rejected') groupedData[period].rejected_properties++
    if (property.is_featured) groupedData[period].featured_properties++
  })

  return Object.values(groupedData).sort((a: any, b: any) => a.period.localeCompare(b.period))
}

async function getPropertyMetricsComparison(supabase: any, startDate: Date, period: string, groupBy: string) {
  // Calculate previous period
  const periodLength = getPeriodLength(period)
  const previousStartDate = new Date(startDate.getTime() - periodLength)

  const { data, error } = await supabase
    .from('properties')
    .select('status, is_featured, created_at')
    .gte('created_at', previousStartDate.toISOString())
    .lt('created_at', startDate.toISOString())
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Error fetching property metrics comparison:', error)
    return []
  }

  // Group by date periods (simplified implementation)
  const groupedData: { [key: string]: any } = {}

  data.forEach((property: any) => {
    const date = new Date(property.created_at)
    let period: string

    switch (groupBy) {
      case 'day':
        period = date.toISOString().split('T')[0]
        break
      case 'week':
        const weekStart = new Date(date)
        weekStart.setDate(date.getDate() - date.getDay())
        period = weekStart.toISOString().split('T')[0]
        break
      case 'month':
        period = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
        break
      default:
        period = date.toISOString().split('T')[0]
    }

    if (!groupedData[period]) {
      groupedData[period] = {
        period,
        total_properties: 0,
        live_properties: 0,
        pending_ml: 0,
        pending_vetting: 0,
        rejected_properties: 0,
        featured_properties: 0
      }
    }

    groupedData[period].total_properties++
    if (property.status === 'live') groupedData[period].live_properties++
    if (property.status === 'pending_ml_validation') groupedData[period].pending_ml++
    if (property.status === 'pending_vetting') groupedData[period].pending_vetting++
    if (property.status === 'rejected') groupedData[period].rejected_properties++
    if (property.is_featured) groupedData[period].featured_properties++
  })

  return Object.values(groupedData).sort((a: any, b: any) => a.period.localeCompare(b.period))
}

// Inquiry metrics functions
async function getInquiryMetrics(supabase: any, startDateStr: string, groupBy: string) {
  const { data, error } = await supabase
    .from('inquiries')
    .select('status, created_at, responded_at')
    .gte('created_at', startDateStr)
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Error fetching inquiry metrics:', error)
    return []
  }

  // Group by date periods (simplified implementation)
  const groupedData: { [key: string]: any } = {}

  data.forEach((inquiry: any) => {
    const date = new Date(inquiry.created_at)
    let period: string

    switch (groupBy) {
      case 'day':
        period = date.toISOString().split('T')[0]
        break
      case 'week':
        const weekStart = new Date(date)
        weekStart.setDate(date.getDate() - date.getDay())
        period = weekStart.toISOString().split('T')[0]
        break
      case 'month':
        period = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
        break
      default:
        period = date.toISOString().split('T')[0]
    }

    if (!groupedData[period]) {
      groupedData[period] = {
        period,
        total_inquiries: 0,
        responded_inquiries: 0,
        closed_inquiries: 0,
        new_inquiries: 0,
        avg_response_time_hours: 0
      }
    }

    groupedData[period].total_inquiries++
    if (inquiry.status === 'responded') groupedData[period].responded_inquiries++
    if (inquiry.status === 'closed') groupedData[period].closed_inquiries++
    if (inquiry.status === 'new') groupedData[period].new_inquiries++

    // Calculate average response time
    if (inquiry.responded_at) {
      const responseTime = (new Date(inquiry.responded_at).getTime() - date.getTime()) / (1000 * 60 * 60) // hours
      groupedData[period].avg_response_time_hours = (
        (groupedData[period].avg_response_time_hours * (groupedData[period].total_inquiries - 1) + responseTime) /
        groupedData[period].total_inquiries
      )
    }
  })

  return Object.values(groupedData).sort((a: any, b: any) => a.period.localeCompare(b.period))
}

async function getInquiryMetricsComparison(supabase: any, startDate: Date, period: string, groupBy: string) {
  // Calculate previous period
  const periodLength = getPeriodLength(period)
  const previousStartDate = new Date(startDate.getTime() - periodLength)

  const { data, error } = await supabase
    .from('inquiries')
    .select('status, created_at, responded_at')
    .gte('created_at', previousStartDate.toISOString())
    .lt('created_at', startDate.toISOString())
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Error fetching inquiry metrics comparison:', error)
    return []
  }

  // Group by date periods (simplified implementation)
  const groupedData: { [key: string]: any } = {}

  data.forEach((inquiry: any) => {
    const date = new Date(inquiry.created_at)
    let period: string

    switch (groupBy) {
      case 'day':
        period = date.toISOString().split('T')[0]
        break
      case 'week':
        const weekStart = new Date(date)
        weekStart.setDate(date.getDate() - date.getDay())
        period = weekStart.toISOString().split('T')[0]
        break
      case 'month':
        period = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
        break
      default:
        period = date.toISOString().split('T')[0]
    }

    if (!groupedData[period]) {
      groupedData[period] = {
        period,
        total_inquiries: 0,
        responded_inquiries: 0,
        closed_inquiries: 0,
        new_inquiries: 0,
        avg_response_time_hours: 0
      }
    }

    groupedData[period].total_inquiries++
    if (inquiry.status === 'responded') groupedData[period].responded_inquiries++
    if (inquiry.status === 'closed') groupedData[period].closed_inquiries++
    if (inquiry.status === 'new') groupedData[period].new_inquiries++

    // Calculate average response time
    if (inquiry.responded_at) {
      const responseTime = (new Date(inquiry.responded_at).getTime() - date.getTime()) / (1000 * 60 * 60) // hours
      groupedData[period].avg_response_time_hours = (
        (groupedData[period].avg_response_time_hours * (groupedData[period].total_inquiries - 1) + responseTime) /
        groupedData[period].total_inquiries
      )
    }
  })

  return Object.values(groupedData).sort((a: any, b: any) => a.period.localeCompare(b.period))
}

// Revenue metrics (placeholder - would need transaction data)
async function getRevenueMetrics(supabase: any, startDateStr: string, groupBy: string) {
  // Placeholder for revenue metrics
  // In a real implementation, this would query transaction/payment data
  return [
    {
      period: startDateStr.split('T')[0],
      revenue: 0,
      transactions: 0,
      average_transaction: 0,
    }
  ]
}

async function getRevenueMetricsComparison(supabase: any, startDate: Date, period: string, groupBy: string) {
  return []
}

// Performance metrics
async function getPerformanceMetrics(supabase: any, startDateStr: string, groupBy: string) {
  // Get combined data from properties, inquiries, and profiles
  const [propertiesData, inquiriesData, profilesData] = await Promise.all([
    supabase.from('properties').select('created_at, status').gte('created_at', startDateStr),
    supabase.from('inquiries').select('created_at, status').gte('created_at', startDateStr),
    supabase.from('profiles').select('created_at').gte('created_at', startDateStr)
  ])

  if (propertiesData.error || inquiriesData.error || profilesData.error) {
    console.error('Error fetching performance metrics:', propertiesData.error || inquiriesData.error || profilesData.error)
    return []
  }

  // Combine all operations
  const allOperations = [
    ...propertiesData.data.map((p: any) => ({ created_at: p.created_at, type: 'property', status: p.status })),
    ...inquiriesData.data.map((i: any) => ({ created_at: i.created_at, type: 'inquiry', status: i.status })),
    ...profilesData.data.map((p: any) => ({ created_at: p.created_at, type: 'user', status: 'success' }))
  ]

  // Group by date periods
  const groupedData: { [key: string]: any } = {}

  allOperations.forEach((operation: any) => {
    const date = new Date(operation.created_at)
    let period: string

    switch (groupBy) {
      case 'day':
        period = date.toISOString().split('T')[0]
        break
      case 'week':
        const weekStart = new Date(date)
        weekStart.setDate(date.getDate() - date.getDay())
        period = weekStart.toISOString().split('T')[0]
        break
      case 'month':
        period = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
        break
      default:
        period = date.toISOString().split('T')[0]
    }

    if (!groupedData[period]) {
      groupedData[period] = {
        period,
        total_requests: 0,
        avg_response_time_ms: 0, // Simplified - would need actual timing data
        successful_operations: 0,
        failed_operations: 0
      }
    }

    groupedData[period].total_requests++
    if (operation.status === 'live' || operation.status === 'success' || operation.status === 'responded' || operation.status === 'closed') {
      groupedData[period].successful_operations++
    } else if (operation.status === 'rejected' || operation.status === 'failed') {
      groupedData[period].failed_operations++
    }
  })

  return Object.values(groupedData).sort((a: any, b: any) => a.period.localeCompare(b.period))
}

async function getPerformanceMetricsComparison(supabase: any, startDate: Date, period: string, groupBy: string) {
  // Calculate previous period
  const periodLength = getPeriodLength(period)
  const previousStartDate = new Date(startDate.getTime() - periodLength)

  // Get combined data from properties, inquiries, and profiles
  const [propertiesData, inquiriesData, profilesData] = await Promise.all([
    supabase.from('properties').select('created_at, status').gte('created_at', previousStartDate.toISOString()).lt('created_at', startDate.toISOString()),
    supabase.from('inquiries').select('created_at, status').gte('created_at', previousStartDate.toISOString()).lt('created_at', startDate.toISOString()),
    supabase.from('profiles').select('created_at').gte('created_at', previousStartDate.toISOString()).lt('created_at', startDate.toISOString())
  ])

  if (propertiesData.error || inquiriesData.error || profilesData.error) {
    console.error('Error fetching performance metrics comparison:', propertiesData.error || inquiriesData.error || profilesData.error)
    return []
  }

  // Combine all operations
  const allOperations = [
    ...propertiesData.data.map((p: any) => ({ created_at: p.created_at, type: 'property', status: p.status })),
    ...inquiriesData.data.map((i: any) => ({ created_at: i.created_at, type: 'inquiry', status: i.status })),
    ...profilesData.data.map((p: any) => ({ created_at: p.created_at, type: 'user', status: 'success' }))
  ]

  // Group by date periods
  const groupedData: { [key: string]: any } = {}

  allOperations.forEach((operation: any) => {
    const date = new Date(operation.created_at)
    let period: string

    switch (groupBy) {
      case 'day':
        period = date.toISOString().split('T')[0]
        break
      case 'week':
        const weekStart = new Date(date)
        weekStart.setDate(date.getDate() - date.getDay())
        period = weekStart.toISOString().split('T')[0]
        break
      case 'month':
        period = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
        break
      default:
        period = date.toISOString().split('T')[0]
    }

    if (!groupedData[period]) {
      groupedData[period] = {
        period,
        total_requests: 0,
        avg_response_time_ms: 0, // Simplified - would need actual timing data
        successful_operations: 0,
        failed_operations: 0
      }
    }

    groupedData[period].total_requests++
    if (operation.status === 'live' || operation.status === 'success' || operation.status === 'responded' || operation.status === 'closed') {
      groupedData[period].successful_operations++
    } else if (operation.status === 'rejected' || operation.status === 'failed') {
      groupedData[period].failed_operations++
    }
  })

  return Object.values(groupedData).sort((a: any, b: any) => a.period.localeCompare(b.period))
}

// Helper function to get period length in milliseconds
function getPeriodLength(period: string): number {
  switch (period) {
    case '7d':
      return 7 * 24 * 60 * 60 * 1000
    case '30d':
      return 30 * 24 * 60 * 60 * 1000
    case '90d':
      return 90 * 24 * 60 * 60 * 1000
    case '1y':
      return 365 * 24 * 60 * 60 * 1000
    case 'all':
      return 365 * 24 * 60 * 60 * 1000 // Default to 1 year for comparison
    default:
      return 30 * 24 * 60 * 60 * 1000
  }
}