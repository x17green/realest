import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET /api/admin/reports/vetting - Admin vetting reports
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Get authenticated user and verify admin role
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Verify user is admin
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('user_type')
      .eq('id', user.id)
      .single()

    if (profileError || profile?.user_type !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    // Parse query parameters
    const url = new URL(request.url)
    const period = url.searchParams.get('period') || '30d' // 7d, 30d, 90d
    const status = url.searchParams.get('status') // pending_vetting, live, rejected

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
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    }

    // Build base query for properties in the period
    let propertiesQuery = supabase
      .from('properties')
      .select(`
        id,
        title,
        status,
        created_at,
        vetted_at,
        verified_at,
        rejection_reason,
        vetted_by,
        owner:profiles!inner(
          id,
          full_name,
          email
        ),
        vetter:profiles!vetted_by(
          id,
          full_name
        )
      `)
      .gte('created_at', startDate.toISOString())

    // Filter by status if specified
    if (status) {
      propertiesQuery = propertiesQuery.eq('status', status)
    }

    const { data: properties, error: propertiesError } = await propertiesQuery
      .order('created_at', { ascending: false })

    if (propertiesError) {
      console.error('Database error:', propertiesError)
      return NextResponse.json(
        { error: 'Failed to fetch vetting reports' },
        { status: 500 }
      )
    }

    // Calculate statistics
    const stats = {
      total_properties: properties?.length || 0,
      pending_vetting: properties?.filter((p: any) => p.status === 'pending_vetting').length || 0,
      live_properties: properties?.filter((p: any) => p.status === 'live').length || 0,
      rejected_properties: properties?.filter((p: any) => p.status === 'rejected').length || 0,
      average_vetting_time: 0,
      vetting_efficiency: 0
    }

    // Calculate average vetting time for completed properties
    const completedProperties = properties?.filter((p: any) =>
      p.status === 'live' || p.status === 'rejected'
    ) || []

    if (completedProperties.length > 0) {
      const totalVettingTime = completedProperties.reduce((sum: number, prop: any) => {
        if (prop.vetted_at && prop.created_at) {
          const created = new Date(prop.created_at)
          const vetted = new Date(prop.vetted_at)
          return sum + (vetted.getTime() - created.getTime())
        }
        return sum
      }, 0)

      stats.average_vetting_time = totalVettingTime / completedProperties.length
    }

    // Calculate vetting efficiency (properties vetted per day)
    const daysInPeriod = Math.max(1, Math.ceil((now.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000)))
    stats.vetting_efficiency = completedProperties.length / daysInPeriod

    // Get admin activity summary
    const { data: adminActivity } = await supabase
      .from('admin_audit_log')
      .select(`
        admin_id,
        action,
        created_at,
        admin:profiles!admin_id(
          id,
          full_name
        )
      `)
      .eq('action', 'property_vetting')
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: false })

    // Group admin activity
    const adminStats: Record<string, any> = {}
    adminActivity?.forEach((activity: any) => {
      const adminId = activity.admin_id
      if (!adminStats[adminId]) {
        adminStats[adminId] = {
          admin_name: activity.admin?.full_name || 'Unknown',
          vetted_count: 0,
          last_activity: activity.created_at
        }
      }
      adminStats[adminId].vetted_count++
    })

    // Get rejection reasons summary
    const rejectionReasons: Record<string, number> = {}
    properties?.filter((p: any) => p.status === 'rejected' && p.rejection_reason)
      .forEach((prop: any) => {
        const reason = prop.rejection_reason
        rejectionReasons[reason] = (rejectionReasons[reason] || 0) + 1
      })

    return NextResponse.json({
      data: {
        properties: properties || [],
        stats,
        admin_activity: Object.values(adminStats),
        rejection_reasons: rejectionReasons
      },
      period,
      date_range: {
        start: startDate.toISOString(),
        end: now.toISOString()
      }
    })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

