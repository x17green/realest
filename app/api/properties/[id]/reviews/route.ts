import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

// Schema for creating a review
const createReviewSchema = z.object({
  rating: z.number().min(1).max(5),
  comment: z.string().min(10).max(1000),
  target_type: z.enum(['owner', 'agent']).default('owner'), // Review target
})

type CreateReviewInput = z.infer<typeof createReviewSchema>

// GET /api/properties/[id]/reviews - Get reviews for a property
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const propertyId = params.id

    // Parse query parameters
    const url = new URL(request.url)
    const page = parseInt(url.searchParams.get('page') || '1')
    const perPage = Math.min(parseInt(url.searchParams.get('per_page') || '10'), 50)
    const targetType = url.searchParams.get('target_type') // 'owner' or 'agent'

    // Verify property exists and is live
    const { data: property, error: propertyError } = await supabase
      .from('properties')
      .select('id, owner_id')
      .eq('id', propertyId)
      .eq('status', 'live')
      .single()

    if (propertyError || !property) {
      return NextResponse.json(
        { error: 'Property not found' },
        { status: 404 }
      )
    }

    // Build reviews query
    let reviewsQuery = supabase
      .from('reviews')
      .select(`
        id,
        rating,
        comment,
        target_type,
        created_at,
        reviewer:profiles!inner(
          id,
          full_name,
          avatar_url
        )
      `, { count: 'exact' })
      .eq('target_id', propertyId)
      .eq('target_type', 'property')

    // Filter by review target if specified
    if (targetType) {
      reviewsQuery = reviewsQuery.eq('review_target', targetType)
    }

    // Apply pagination
    const from = (page - 1) * perPage
    const to = from + perPage - 1
    reviewsQuery = reviewsQuery
      .order('created_at', { ascending: false })
      .range(from, to)

    const { data: reviews, error, count } = await reviewsQuery

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch reviews' },
        { status: 500 }
      )
    }

    // Calculate average rating
    const { data: ratingStats } = await supabase
      .from('reviews')
      .select('rating')
      .eq('target_id', propertyId)
      .eq('target_type', 'property')

    const averageRating = ratingStats && ratingStats.length > 0
      ? ratingStats.reduce((sum: number, review: any) => sum + review.rating, 0) / ratingStats.length
      : 0

    const totalPages = Math.ceil((count || 0) / perPage)

    return NextResponse.json({
      data: reviews || [],
      pagination: {
        page,
        per_page: perPage,
        total: count || 0,
        total_pages: totalPages,
        has_next: page < totalPages,
        has_prev: page > 1,
      },
      stats: {
        average_rating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
        total_reviews: count || 0
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

// POST /api/properties/[id]/reviews - Create a review for a property
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const propertyId = params.id

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Parse and validate request body
    const body = await request.json()
    const validatedData = createReviewSchema.parse(body)

    // Verify property exists and is live
    const { data: property, error: propertyError } = await supabase
      .from('properties')
      .select('id, owner_id')
      .eq('id', propertyId)
      .eq('status', 'live')
      .single()

    if (propertyError || !property) {
      return NextResponse.json(
        { error: 'Property not found' },
        { status: 404 }
      )
    }

    // Check if user has already reviewed this property
    const { data: existingReview } = await supabase
      .from('reviews')
      .select('id')
      .eq('reviewer_id', user.id)
      .eq('target_id', propertyId)
      .eq('target_type', 'property')
      .single()

    if (existingReview) {
      return NextResponse.json(
        { error: 'You have already reviewed this property' },
        { status: 409 }
      )
    }

    // Check if user has interacted with this property (inquiry, saved, etc.)
    const { data: hasInteraction } = await supabase
      .from('inquiries')
      .select('id')
      .eq('sender_id', user.id)
      .eq('property_id', propertyId)
      .limit(1)
      .single()

    const { data: hasSaved } = await supabase
      .from('saved_properties')
      .select('id')
      .eq('user_id', user.id)
      .eq('property_id', propertyId)
      .limit(1)
      .single()

    if (!hasInteraction && !hasSaved) {
      return NextResponse.json(
        { error: 'You must have interacted with this property (inquiry or saved) to leave a review' },
        { status: 403 }
      )
    }

    // Create the review
    const { data: review, error: insertError } = await supabase
      .from('reviews')
      .insert({
        reviewer_id: user.id,
        target_id: propertyId,
        target_type: 'property',
        review_target: validatedData.target_type, // 'owner' or 'agent'
        rating: validatedData.rating,
        comment: validatedData.comment
      })
      .select(`
        id,
        rating,
        comment,
        review_target,
        created_at,
        reviewer:profiles!inner(
          id,
          full_name,
          avatar_url
        )
      `)
      .single()

    if (insertError) {
      console.error('Database error:', insertError)
      return NextResponse.json(
        { error: 'Failed to create review' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { data: review, message: 'Review created successfully' },
      { status: 201 }
    )

  } catch (error) {
    console.error('API error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}