import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

// Query parameters schema
const mlValidationQuerySchema = z.object({
  page: z.string().optional().default('1'),
  per_page: z.string().optional().default('20'),
  sort: z.enum(['newest', 'oldest', 'priority']).optional().default('newest'),
  status: z.enum(['pending', 'processing', 'completed']).optional(),
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
    const queryValidation = mlValidationQuerySchema.safeParse({
      page: searchParams.get('page'),
      per_page: searchParams.get('per_page'),
      sort: searchParams.get('sort'),
      status: searchParams.get('status'),
    })

    if (!queryValidation.success) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: queryValidation.error.issues },
        { status: 400 }
      )
    }

    const { page, per_page, sort, status } = queryValidation.data
    const pageNum = parseInt(page)
    const perPageNum = parseInt(per_page)
    const offset = (pageNum - 1) * perPageNum

    // Build query for properties pending ML validation
    let query = supabase
      .from('properties')
      .select(`
        *,
        owner:profiles(full_name, email, phone),
        documents:property_documents(*),
        media:property_media(*)
      `)
      .eq('status', 'pending_ml_validation')

    // Apply status filter if provided
    if (status) {
      // For ML validation, we might want to filter by ML processing status
      // This would require additional fields in the database
    }

    // Apply sorting
    switch (sort) {
      case 'newest':
        query = query.order('created_at', { ascending: false })
        break
      case 'oldest':
        query = query.order('created_at', { ascending: true })
        break
      case 'priority':
        // Priority could be based on document count, property value, etc.
        query = query.order('created_at', { ascending: false })
        break
    }

    // Apply pagination
    query = query.range(offset, offset + perPageNum - 1)

    const { data: properties, error: propertiesError } = await query

    if (propertiesError) {
      console.error('Error fetching ML validation queue:', propertiesError)
      return NextResponse.json(
        { error: 'Failed to fetch validation queue' },
        { status: 500 }
      )
    }

    // Get total count for pagination
    const { count, error: countError } = await supabase
      .from('properties')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending_ml_validation')

    if (countError) {
      console.error('Error getting total count:', countError)
    }

    const totalCount = count || 0
    const totalPages = Math.ceil(totalCount / perPageNum)

    // Format response with ML validation specific data
    const formattedProperties = properties?.map(property => ({
      id: property.id,
      title: property.title,
      property_type: property.property_type,
      address: property.address,
      state: property.state,
      lga: property.lga,
      price: property.price,
      price_frequency: property.price_frequency,
      created_at: property.created_at,
      owner: property.owner,
      document_count: property.documents?.length || 0,
      media_count: property.media?.length || 0,
      // ML validation specific fields (would come from ML service)
      ml_status: 'pending', // pending, processing, completed
      ml_confidence_score: null,
      ml_validation_notes: null,
      ml_processed_at: null,
      // Priority indicators
      has_multiple_documents: (property.documents?.length || 0) > 3,
      is_high_value: property.price > 5000000, // ₦5M threshold
    })) || []

    return NextResponse.json({
      data: formattedProperties,
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
        high_priority: formattedProperties.filter(p => p.has_multiple_documents || p.is_high_value).length,
        average_documents: formattedProperties.reduce((acc, p) => acc + p.document_count, 0) / formattedProperties.length || 0,
      }
    })

  } catch (error) {
    console.error('Unexpected error in ML validation queue:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}