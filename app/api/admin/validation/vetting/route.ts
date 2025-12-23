import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

// Query parameters schema
const vettingQuerySchema = z.object({
  page: z.string().optional().default('1'),
  per_page: z.string().optional().default('20'),
  sort: z.enum(['newest', 'oldest', 'urgent', 'location']).optional().default('newest'),
  state: z.string().optional(), // Filter by state
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
})

type RouteParams = {
  params: Promise<{}>
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const supabase = await createClient()

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
    const queryValidation = vettingQuerySchema.safeParse({
      page: searchParams.get('page'),
      per_page: searchParams.get('per_page'),
      sort: searchParams.get('sort'),
      state: searchParams.get('state'),
      priority: searchParams.get('priority'),
    })

    if (!queryValidation.success) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: queryValidation.error.issues },
        { status: 400 }
      )
    }

    const { page, per_page, sort, state, priority } = queryValidation.data
    const pageNum = parseInt(page)
    const perPageNum = parseInt(per_page)
    const offset = (pageNum - 1) * perPageNum

    // Build query for properties pending physical vetting
    let query = supabase
      .from('properties')
      .select(`
        *,
        owner:profiles(full_name, email, phone, avatar_url),
        documents:property_documents(*),
        media:property_media(*)
      `)
      .eq('status', 'pending_vetting')

    // Apply state filter if provided
    if (state) {
      query = query.eq('state', state)
    }

    // Apply sorting
    switch (sort) {
      case 'newest':
        query = query.order('created_at', { ascending: false })
        break
      case 'oldest':
        query = query.order('created_at', { ascending: true })
        break
      case 'urgent':
        // Urgent could be based on time since ML validation, property value, etc.
        query = query.order('ml_validated_at', { ascending: true })
        break
      case 'location':
        query = query.order('state', { ascending: true }).order('lga', { ascending: true })
        break
    }

    // Apply pagination
    query = query.range(offset, offset + perPageNum - 1)

    const { data: properties, error: propertiesError } = await query

    if (propertiesError) {
      console.error('Error fetching vetting queue:', propertiesError)
      return NextResponse.json(
        { error: 'Failed to fetch vetting queue' },
        { status: 500 }
      )
    }

    // Get total count for pagination
    let countQuery = supabase
      .from('properties')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending_vetting')

    if (state) {
      countQuery = countQuery.eq('state', state)
    }

    const { count, error: countError } = await countQuery

    if (countError) {
      console.error('Error getting total count:', countError)
    }

    const totalCount = count || 0
    const totalPages = Math.ceil(totalCount / perPageNum)

    // Format response with vetting specific data
    const formattedProperties = properties?.map(property => ({
      id: property.id,
      title: property.title,
      property_type: property.property_type,
      address: property.address,
      state: property.state,
      lga: property.lga,
      landmark: property.landmark,
      latitude: property.latitude,
      longitude: property.longitude,
      price: property.price,
      price_frequency: property.price_frequency,
      created_at: property.created_at,
      ml_validated_at: property.ml_validated_at,
      owner: property.owner,
      document_count: property.documents?.length || 0,
      media_count: property.media?.length || 0,
      // Vetting specific fields
      vetting_status: 'pending', // pending, scheduled, in_progress, completed
      scheduled_date: null,
      assigned_vetter: null,
      vetting_notes: null,
      // Priority indicators
      days_since_ml_validation: Math.floor(
        (Date.now() - new Date(property.ml_validated_at || property.created_at).getTime()) / (1000 * 60 * 60 * 24)
      ),
      is_high_value: property.price > 10000000, // ₦10M threshold
      has_complete_documents: (property.documents?.length || 0) >= 3,
      urgency_level: property.price > 50000000 ? 'urgent' :
                    property.price > 10000000 ? 'high' :
                    (property.documents?.length || 0) >= 5 ? 'medium' : 'low',
    })) || []

    // Apply priority filter if specified
    let filteredProperties = formattedProperties
    if (priority) {
      filteredProperties = formattedProperties.filter(p => p.urgency_level === priority)
    }

    return NextResponse.json({
      data: filteredProperties,
      pagination: {
        page: pageNum,
        per_page: perPageNum,
        total: totalCount,
        total_pages: totalPages,
        has_next: pageNum < totalPages,
        has_prev: pageNum > 1,
      },
      summary: {
        total_pending: totalCount,
        urgent_properties: formattedProperties.filter(p => p.urgency_level === 'urgent').length,
        high_value_properties: formattedProperties.filter(p => p.is_high_value).length,
        average_wait_days: formattedProperties.reduce((acc, p) => acc + p.days_since_ml_validation, 0) / formattedProperties.length || 0,
        states_represented: [...new Set(formattedProperties.map(p => p.state))].length,
      },
      filters: {
        applied_state: state,
        applied_priority: priority,
        available_states: [...new Set(properties?.map(p => p.state) || [])].sort(),
      }
    })

  } catch (error) {
    console.error('Unexpected error in vetting queue:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}