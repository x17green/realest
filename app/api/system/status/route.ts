import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET /api/system/status - System status information
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Get current app mode from environment
    const appMode = process.env.NEXT_PUBLIC_APP_MODE || 'development'

    // Get system information
    const systemInfo = {
      app_mode: appMode,
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    }

    // Get database statistics
    const stats: any = {}

    try {
      // Property statistics
      const { count: totalProperties } = await supabase
        .from('properties')
        .select('*', { count: 'exact', head: true })

      const { count: liveProperties } = await supabase
        .from('properties')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'live')

      const { count: pendingProperties } = await supabase
        .from('properties')
        .select('*', { count: 'exact', head: true })
        .in('status', ['pending_ml_validation', 'pending_vetting'])

      // User statistics
      const { count: totalUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })

      const { count: owners } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('user_type', 'owner')

      const { count: agents } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('user_type', 'agent')

      const { count: admins } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('user_type', 'admin')

      // Activity statistics (last 30 days)
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

      const { count: recentProperties } = await supabase
        .from('properties')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', thirtyDaysAgo.toISOString())

      const { count: recentInquiries } = await supabase
        .from('inquiries')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', thirtyDaysAgo.toISOString())

      stats.database = {
        properties: {
          total: totalProperties || 0,
          live: liveProperties || 0,
          pending: pendingProperties || 0,
          recent: recentProperties || 0
        },
        users: {
          total: totalUsers || 0,
          owners: owners || 0,
          agents: agents || 0,
          admins: admins || 0
        },
        activity: {
          recent_inquiries: recentInquiries || 0,
          inquiries_last_30_days: recentInquiries || 0
        }
      }
    } catch (statsError: any) {
      stats.database = {
        error: 'Failed to fetch database statistics',
        details: statsError.message
      }
    }

    // Get feature flags based on app mode
    const features = {
      authentication: true,
      property_listing: appMode !== 'coming-soon',
      property_search: appMode !== 'coming-soon',
      admin_dashboard: appMode === 'development' || appMode === 'full-site',
      agent_dashboard: appMode === 'development' || appMode === 'full-site',
      owner_dashboard: appMode === 'development' || appMode === 'full-site',
      waitlist: appMode === 'coming-soon',
      ml_validation: true,
      physical_vetting: true,
      geospatial_search: true,
      email_notifications: true
    }

    // Get Nigerian market specific status
    const nigerianStatus = {
      supported_states: [
        'Lagos', 'Abuja (FCT)', 'Rivers', 'Ogun', 'Oyo', 'Kano',
        'Kaduna', 'Edo', 'Delta', 'Enugu', 'Anambra', 'Imo'
      ],
      currency: 'NGN (₦)',
      phone_format: '+234',
      property_types: [
        'House', 'Apartment', 'Land', 'Commercial', 'Boys Quarters',
        'Self-Contained', 'Room and Parlor', 'Duplex', 'Bungalow'
      ],
      infrastructure_focus: [
        'NEPA Power Status', 'Water Sources', 'Internet Types',
        'Security Features', 'Road Conditions'
      ]
    }

    return NextResponse.json({
      system: systemInfo,
      stats,
      features,
      nigerian_market: nigerianStatus,
      status: 'operational'
    })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      {
        status: 'error',
        error: 'Failed to retrieve system status',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}

