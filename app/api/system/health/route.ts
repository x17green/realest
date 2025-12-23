import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET /api/system/health - System health check
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const startTime = Date.now()

    // Check database connectivity
    const { data: dbHealth, error: dbError } = await supabase
      .from('properties')
      .select('count', { count: 'exact', head: true })
      .limit(1)

    const dbResponseTime = Date.now() - startTime
    const dbStatus = dbError ? 'error' : 'healthy'

    // Get system statistics
    const stats: any = {
      database: {
        status: dbStatus,
        response_time_ms: dbResponseTime,
        error: dbError?.message || null
      }
    }

    // Get application metrics (if available)
    try {
      const { count: totalProperties } = await supabase
        .from('properties')
        .select('*', { count: 'exact', head: true })

      const { count: liveProperties } = await supabase
        .from('properties')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'live')

      const { count: totalUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })

      const { count: pendingVetting } = await supabase
        .from('properties')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending_vetting')

      const { count: pendingML } = await supabase
        .from('properties')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending_ml_validation')

      stats.metrics = {
        total_properties: totalProperties || 0,
        live_properties: liveProperties || 0,
        total_users: totalUsers || 0,
        pending_vetting: pendingVetting || 0,
        pending_ml_validation: pendingML || 0,
        vetting_queue_size: (pendingVetting || 0) + (pendingML || 0)
      }
    } catch (metricsError: any) {
      stats.metrics = {
        error: 'Failed to fetch metrics',
        details: metricsError.message
      }
    }

    // Determine overall health status
    const overallStatus = dbStatus === 'healthy' ? 'healthy' : 'unhealthy'

    // Check for critical issues
    const issues = []
    if (dbStatus !== 'healthy') {
      issues.push('Database connection failed')
    }

    if (stats.metrics && typeof stats.metrics === 'object' && 'vetting_queue_size' in stats.metrics) {
      const queueSize = stats.metrics.vetting_queue_size as number
      if (queueSize > 100) {
        issues.push(`Large vetting queue: ${queueSize} properties pending`)
      }
    }

    const response = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      uptime: process.uptime(),
      stats,
      issues: issues.length > 0 ? issues : null
    }

    // Return appropriate HTTP status
    const httpStatus = overallStatus === 'healthy' ? 200 : 503

    return NextResponse.json(response, { status: httpStatus })

  } catch (error) {
    console.error('Health check error:', error)

    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Health check failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 503 })
  }
}

