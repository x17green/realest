import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const querySchema = z.object({
  page: z.string().optional().transform(val => val ? parseInt(val) : 1),
  limit: z.string().optional().transform(val => val ? parseInt(val) : 10),
  status: z.enum(['new', 'read', 'responded', 'closed']).optional(),
  sort: z.enum(['newest', 'oldest', 'property']).optional().default('newest')
})

export async function GET(request: Request) {
  try {
    const supabase = await createClient()

    // Verify authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Verify user is property owner or admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('user_type')
      .eq('id', user.id)
      .single()

    if (!profile || !['owner', 'admin'].includes(profile.user_type)) {
      return NextResponse.json(
        { error: 'Forbidden - Property owners only' },
        { status: 403 }
      )
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const queryResult = querySchema.safeParse({
      page: searchParams.get('page'),
      limit: searchParams.get('limit'),
      status: searchParams.get('status'),
      sort: searchParams.get('sort')
    })

    if (!queryResult.success) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: queryResult.error.issues },
        { status: 400 }
      )
    }

    const { page, limit, status, sort } = queryResult.data
    const offset = (page - 1) * limit

    // Build query for inquiries on owner's properties
    let query = supabase
      .from('inquiries')
      .select(`
        *,
        sender:profiles!inquiries_sender_id_fkey(full_name, email, phone, avatar_url),
        property:properties(id, title, address, state, lga, price, price_frequency)
      `, { count: 'exact' })
      .eq('receiver_id', user.id) // Inquiries sent to this owner

    // Apply status filter if provided
    if (status) {
      query = query.eq('status', status)
    }

    // Apply sorting
    switch (sort) {
      case 'newest':
        query = query.order('created_at', { ascending: false })
        break
      case 'oldest':
        query = query.order('created_at', { ascending: true })
        break
      case 'property':
        query = query.order('property.title', { ascending: true })
        break
    }

    const { data: inquiries, error, count } = await query
      .range(offset, offset + limit - 1)

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch inquiries' },
        { status: 500 }
      )
    }

    const totalPages = Math.ceil((count || 0) / limit)

    return NextResponse.json({
      data: inquiries,
      pagination: {
        page,
        limit,
        total: count || 0,
        total_pages: totalPages,
        has_next: page < totalPages,
        has_prev: page > 1
      }
    })

  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
