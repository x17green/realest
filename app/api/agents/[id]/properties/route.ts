import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET /api/agents/[id]/properties - Get properties listed by agent
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const agentId = params.id

    // Verify agent exists and is verified
    const { data: agent, error: agentError } = await supabase
      .from('profiles')
      .select('id, full_name, agent_verification_status')
      .eq('id', agentId)
      .eq('user_type', 'agent')
      .single()

    if (agentError || !agent) {
      return NextResponse.json(
        { error: 'Agent not found' },
        { status: 404 }
      )
    }

    if (agent.agent_verification_status !== 'verified') {
      return NextResponse.json(
        { error: 'Agent profile not available' },
        { status: 404 }
      )
    }

    // Parse query parameters
    const url = new URL(request.url)
    const page = parseInt(url.searchParams.get('page') || '1')
    const perPage = Math.min(parseInt(url.searchParams.get('per_page') || '12'), 50)
    const status = url.searchParams.get('status') || 'live' // live, all
    const sortBy = url.searchParams.get('sort_by') || 'created_at' // created_at, price, title
    const sortOrder = url.searchParams.get('sort_order') || 'desc'

    // Build properties query
    let propertiesQuery = supabase
      .from('properties')
      .select(`
        id,
        title,
        description,
        price,
        price_frequency,
        address,
        state,
        lga,
        landmark,
        latitude,
        longitude,
        bedrooms,
        bathrooms,
        size_sqm,
        has_bq,
        property_type,
        nepa_status,
        water_source,
        internet_type,
        security_type,
        status,
        verified_at,
        created_at,
        updated_at,
        views_count,
        inquiries_count,
        media:property_media(
          id,
          file_url,
          alt_text,
          is_primary,
          display_order
        )
      `, { count: 'exact' })
      .eq('owner_id', agentId)

    // Filter by status
    if (status !== 'all') {
      propertiesQuery = propertiesQuery.eq('status', status)
    }

    // Apply sorting
    const validSortFields = ['created_at', 'price', 'title', 'views_count']
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'created_at'

    propertiesQuery = propertiesQuery.order(sortField, {
      ascending: sortOrder === 'asc',
      nullsFirst: false
    })

    // Apply pagination
    const from = (page - 1) * perPage
    const to = from + perPage - 1
    propertiesQuery = propertiesQuery.range(from, to)

    const { data: properties, error: propertiesError, count } = await propertiesQuery

    if (propertiesError) {
      console.error('Database error:', propertiesError)
      return NextResponse.json(
        { error: 'Failed to fetch agent properties' },
        { status: 500 }
      )
    }

    // Process properties to include primary image
    const processedProperties = properties?.map((property: any) => ({
      ...property,
      primary_image: property.media?.find((m: any) => m.is_primary)?.file_url ||
                    property.media?.[0]?.file_url || null,
      images_count: property.media?.length || 0
    })) || []

    // Get property statistics for this agent
    const { data: stats } = await supabase
      .from('properties')
      .select('status')
      .eq('owner_id', agentId)

    const propertyStats = {
      total: stats?.length || 0,
      live: stats?.filter((p: any) => p.status === 'live').length || 0,
      pending: stats?.filter((p: any) => ['pending_ml_validation', 'pending_vetting'].includes(p.status)).length || 0,
      sold: stats?.filter((p: any) => p.status === 'sold').length || 0
    }

    const totalPages = Math.ceil((count || 0) / perPage)

    return NextResponse.json({
      data: processedProperties,
      agent: {
        id: agent.id,
        name: agent.full_name
      },
      pagination: {
        page,
        per_page: perPage,
        total: count || 0,
        total_pages: totalPages,
        has_next: page < totalPages,
        has_prev: page > 1,
      },
      stats: propertyStats,
      filters: {
        status,
        sort_by: sortBy,
        sort_order: sortOrder
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