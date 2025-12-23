import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET /api/agents - List verified agents
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Parse query parameters
    const url = new URL(request.url)
    const page = parseInt(url.searchParams.get('page') || '1')
    const perPage = Math.min(parseInt(url.searchParams.get('per_page') || '20'), 100)
    const state = url.searchParams.get('state') // Filter by state
    const lga = url.searchParams.get('lga') // Filter by LGA
    const verified = url.searchParams.get('verified') !== 'false' // Default to true
    const sortBy = url.searchParams.get('sort_by') || 'properties_count' // properties_count, rating, name
    const sortOrder = url.searchParams.get('sort_order') || 'desc'

    // Build base query for agents
    let agentsQuery = supabase
      .from('profiles')
      .select(`
        id,
        full_name,
        email,
        phone,
        avatar_url,
        created_at,
        user_type,
        agent_verification_status,
        agent_specialties,
        agent_experience_years,
        agent_languages,
        agent_service_areas,
        agent_rating,
        agent_total_reviews,
        agent_properties_count,
        agent_response_time_hours,
        agent_about,
        agent_verified_at
      `, { count: 'exact' })
      .eq('user_type', 'agent')

    // Filter by verification status
    if (verified) {
      agentsQuery = agentsQuery.eq('agent_verification_status', 'verified')
    }

    // Filter by service areas (state/LGA)
    if (state) {
      agentsQuery = agentsQuery.contains('agent_service_areas', [state])
    }

    if (lga) {
      agentsQuery = agentsQuery.contains('agent_service_areas', [lga])
    }

    // Apply sorting
    const validSortFields = ['properties_count', 'rating', 'name', 'created_at']
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'properties_count'

    if (sortField === 'name') {
      agentsQuery = agentsQuery.order('full_name', { ascending: sortOrder === 'asc' })
    } else if (sortField === 'properties_count') {
      agentsQuery = agentsQuery.order('agent_properties_count', {
        ascending: sortOrder === 'asc',
        nullsFirst: false
      })
    } else if (sortField === 'rating') {
      agentsQuery = agentsQuery.order('agent_rating', {
        ascending: sortOrder === 'asc',
        nullsFirst: false
      })
    } else {
      agentsQuery = agentsQuery.order('created_at', { ascending: sortOrder === 'asc' })
    }

    // Apply pagination
    const from = (page - 1) * perPage
    const to = from + perPage - 1
    agentsQuery = agentsQuery.range(from, to)

    const { data: agents, error, count } = await agentsQuery

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch agents' },
        { status: 500 }
      )
    }

    // Get additional statistics
    const stats = {
      total_verified_agents: 0,
      average_rating: 0,
      total_properties_managed: 0
    }

    if (agents && agents.length > 0) {
      const verifiedAgents = agents.filter((a: any) => a.agent_verification_status === 'verified')
      stats.total_verified_agents = verifiedAgents.length

      const agentsWithRating = agents.filter((a: any) => a.agent_rating !== null)
      if (agentsWithRating.length > 0) {
        stats.average_rating = agentsWithRating.reduce((sum: number, a: any) => sum + (a.agent_rating || 0), 0) / agentsWithRating.length
      }

      stats.total_properties_managed = agents.reduce((sum: number, a: any) => sum + (a.agent_properties_count || 0), 0)
    }

    const totalPages = Math.ceil((count || 0) / perPage)

    return NextResponse.json({
      data: agents || [],
      pagination: {
        page,
        per_page: perPage,
        total: count || 0,
        total_pages: totalPages,
        has_next: page < totalPages,
        has_prev: page > 1,
      },
      stats,
      filters: {
        state,
        lga,
        verified,
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

