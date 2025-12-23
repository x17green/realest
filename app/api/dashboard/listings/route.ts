import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { propertyListingSchema } from '@/lib/supabase/types'

const querySchema = z.object({
  page: z.string().optional().transform(val => val ? parseInt(val) : 1),
  limit: z.string().optional().transform(val => val ? parseInt(val) : 10),
  status: z.enum(['draft', 'pending_ml_validation', 'pending_vetting', 'live', 'rejected', 'unlisted']).optional(),
  sort: z.enum(['newest', 'oldest', 'price_high', 'price_low', 'views']).optional().default('newest')
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

    // Build query
    let query = supabase
      .from('properties')
      .select(`
        *,
        media:property_media(*),
        inquiries:inquiries(count)
      `, { count: 'exact' })
      .eq('owner_id', user.id)
      .range(offset, offset + limit - 1)

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
      case 'price_high':
        query = query.order('price', { ascending: false })
        break
      case 'price_low':
        query = query.order('price', { ascending: true })
        break
      case 'views':
        query = query.order('views_count', { ascending: false })
        break
    }

    const { data: properties, error, count } = await query

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch properties' },
        { status: 500 }
      )
    }

    const totalPages = Math.ceil((count || 0) / limit)

    return NextResponse.json({
      data: properties,
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

export async function POST(request: Request) {
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

    // Parse and validate request body
    const body = await request.json()
    const validationResult = propertyListingSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Invalid property data',
          details: validationResult.error.issues
        },
        { status: 400 }
      )
    }

    const propertyData = validationResult.data

    // Check for potential duplicates (basic address matching)
    const { data: existingProperties } = await supabase
      .from('properties')
      .select('id, title, address')
      .eq('address', propertyData.address)
      .eq('state', propertyData.state)
      .neq('status', 'rejected') // Don't block if previous was rejected

    if (existingProperties && existingProperties.length > 0) {
      // Flag as potential duplicate for admin review
      propertyData.is_duplicate = true
    }

    // Create property
    const { data: property, error: insertError } = await supabase
      .from('properties')
      .insert({
        ...propertyData,
        owner_id: user.id,
        status: 'pending_ml_validation', // All new listings start here
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select(`
        *,
        owner:profiles(full_name, email)
      `)
      .single()

    if (insertError) {
      console.error('Database insert error:', insertError)
      return NextResponse.json(
        { error: 'Failed to create property listing' },
        { status: 500 }
      )
    }

    // If flagged as duplicate, create admin notification
    if (propertyData.is_duplicate) {
      // This would trigger an admin notification/email
      // Implementation depends on notification system
      console.log('Property flagged as potential duplicate:', property.id)
    }

    return NextResponse.json({
      data: property,
      message: 'Property listing created successfully. It will be reviewed by our team before going live.'
    }, { status: 201 })

  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
