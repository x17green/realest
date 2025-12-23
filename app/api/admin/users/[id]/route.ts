import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

type RouteParams = {
  params: Promise<{
    id: string
  }>
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const supabase = await createClient()
    const { id } = await params

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

    // Fetch detailed user information
    const { data: userProfile, error: userError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single()

    if (userError || !userProfile) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Fetch user's properties
    const { data: properties, error: propertiesError } = await supabase
      .from('properties')
      .select(`
        id,
        title,
        property_type,
        status,
        price,
        price_frequency,
        state,
        lga,
        created_at,
        verified_at,
        views_count,
        inquiries_count
      `)
      .eq('owner_id', id)
      .order('created_at', { ascending: false })

    if (propertiesError) {
      console.error('Error fetching user properties:', propertiesError)
    }

    // Fetch user's inquiries (both sent and received)
    const { data: sentInquiries, error: sentError } = await supabase
      .from('inquiries')
      .select(`
        id,
        property_id,
        message,
        status,
        created_at,
        property:properties(title, status)
      `)
      .eq('sender_id', id)
      .order('created_at', { ascending: false })
      .limit(10)

    if (sentError) {
      console.error('Error fetching sent inquiries:', sentError)
    }

    const { data: receivedInquiries, error: receivedError } = await supabase
      .from('inquiries')
      .select(`
        id,
        property_id,
        sender_id,
        message,
        status,
        created_at,
        property:properties(title),
        sender:profiles(full_name, email)
      `)
      .eq('receiver_id', id)
      .order('created_at', { ascending: false })
      .limit(10)

    if (receivedError) {
      console.error('Error fetching received inquiries:', receivedError)
    }

    // Fetch admin actions on this user (if any)
    const { data: adminActions, error: actionsError } = await supabase
      .from('admin_actions')
      .select(`
        id,
        action_type,
        action_details,
        created_at,
        admin:profiles(full_name)
      `)
      .eq('target_type', 'user')
      .eq('target_id', id)
      .order('created_at', { ascending: false })
      .limit(20)

    if (actionsError) {
      console.error('Error fetching admin actions:', actionsError)
    }

    // Calculate user statistics
    const userStats = {
      total_properties: properties?.length || 0,
      live_properties: properties?.filter(p => p.status === 'live').length || 0,
      pending_properties: properties?.filter(p => p.status === 'pending_ml_validation' || p.status === 'pending_vetting').length || 0,
      rejected_properties: properties?.filter(p => p.status === 'rejected').length || 0,
      total_inquiries_sent: sentInquiries?.length || 0,
      total_inquiries_received: receivedInquiries?.length || 0,
      total_property_views: properties?.reduce((sum, p) => sum + (p.views_count || 0), 0) || 0,
      total_property_inquiries: properties?.reduce((sum, p) => sum + (p.inquiries_count || 0), 0) || 0,
      account_age_days: Math.floor(
        (Date.now() - new Date(userProfile.created_at).getTime()) / (1000 * 60 * 60 * 24)
      ),
      last_activity: userProfile.updated_at,
      is_active: true, // All users are active unless we implement suspension
    }

    // Format response
    const userDetails = {
      ...userProfile,
      stats: userStats,
      properties: properties || [],
      recent_inquiries_sent: sentInquiries || [],
      recent_inquiries_received: receivedInquiries || [],
      admin_actions: adminActions || [],
      // Risk indicators
      risk_factors: {
        has_rejected_properties: userStats.rejected_properties > 0,
        high_rejection_rate: userStats.total_properties > 0 &&
          (userStats.rejected_properties / userStats.total_properties) > 0.5,
        inactive_account: userStats.account_age_days > 30 &&
          userStats.total_properties === 0,
        suspicious_activity: false, // Could be based on admin actions or patterns
      }
    }

    return NextResponse.json({
      data: userDetails
    })

  } catch (error) {
    console.error('Unexpected error in user details:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}