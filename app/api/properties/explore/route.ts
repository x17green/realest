import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

// Query schema for property exploration
const exploreQuerySchema = z.object({
  // Location filters
  state: z.string().optional(),
  lga: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  radius_km: z.number().min(1).max(100).optional(),

  // Property filters
  property_type: z.enum(['house', 'apartment', 'land', 'commercial', 'event_center', 'hotel', 'shop', 'office']).optional(),
  min_price: z.number().min(0).optional(),
  max_price: z.number().min(0).optional(),
  bedrooms: z.number().min(0).optional(),
  bathrooms: z.number().min(0).optional(),
  has_bq: z.boolean().optional(),

  // Infrastructure filters (Nigerian market)
  nepa_status: z.enum(['stable', 'intermittent', 'poor', 'none', 'generator_only']).optional(),
  water_source: z.enum(['borehole', 'public_water', 'well', 'water_vendor', 'none']).optional(),
  internet_type: z.enum(['fiber', 'starlink', '4g', '3g', 'none']).optional(),
  security_type: z.array(z.enum(['gated_community', 'security_post', 'cctv', 'perimeter_fence', 'security_dogs', 'none'])).optional(),

  // Pagination
  page: z.number().min(1).default(1),
  per_page: z.number().min(1).max(50).default(20),

  // Sorting
  sort_by: z.enum(['newest', 'price_asc', 'price_desc', 'distance']).default('newest'),
})

type ExploreQuery = z.infer<typeof exploreQuerySchema>

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Parse and validate query parameters
    const url = new URL(request.url)
    const queryParams: Record<string, string | string[]> = {}

    // Handle array parameters (security_type)
    for (const [key, value] of url.searchParams.entries()) {
      if (key === 'security_type') {
        if (!queryParams[key]) queryParams[key] = []
        ;(queryParams[key] as string[]).push(value)
      } else {
        queryParams[key] = value
      }
    }

    const query = exploreQuerySchema.parse(queryParams)

    // Build the base query - only live properties
    let dbQuery = supabase
      .from('properties')
      .select(`
        id,
        title,
        property_type,
        price,
        price_frequency,
        address,
        state,
        lga,
        latitude,
        longitude,
        bedrooms,
        bathrooms,
        size_sqm,
        has_bq,
        nepa_status,
        water_source,
        internet_type,
        security_type,
        status,
        verified_at,
        is_featured,
        created_at,
        updated_at,
        views_count,
        owner:profiles!inner(full_name, avatar_url),
        media:property_media!inner(*)
      `, { count: 'exact' })
      .eq('status', 'live')

    // Apply location filters
    if (query.state) {
      dbQuery = dbQuery.eq('state', query.state)
    }

    if (query.lga) {
      dbQuery = dbQuery.eq('lga', query.lga)
    }

    // Geospatial radius search
    if (query.latitude && query.longitude && query.radius_km) {
      // Use PostGIS ST_DWithin for radius search via RPC
      const { data: radiusProperties } = await supabase
        .rpc('properties_within_radius', {
          lat: query.latitude,
          lng: query.longitude,
          radius_km: query.radius_km
        })

      if (radiusProperties && radiusProperties.length > 0) {
        const radiusIds = radiusProperties.map((p: any) => p.id)
        dbQuery = dbQuery.in('id', radiusIds)
      } else {
        // No properties in radius, return empty
        return NextResponse.json({
          properties: [],
          pagination: {
            page: query.page || 1,
            per_page: query.per_page || 20,
            total: 0,
            total_pages: 0,
            has_next: false,
            has_prev: false
          }
        })
      }
    }

    // Property type filter
    if (query.property_type) {
      dbQuery = dbQuery.eq('property_type', query.property_type)
    }

    // Price range filters
    if (query.min_price !== undefined) {
      dbQuery = dbQuery.gte('price', query.min_price)
    }

    if (query.max_price !== undefined) {
      dbQuery = dbQuery.lte('price', query.max_price)
    }

    // Bedroom/bathroom filters
    if (query.bedrooms !== undefined) {
      dbQuery = dbQuery.gte('bedrooms', query.bedrooms)
    }

    if (query.bathrooms !== undefined) {
      dbQuery = dbQuery.gte('bathrooms', query.bathrooms)
    }

    // BQ filter
    if (query.has_bq !== undefined) {
      dbQuery = dbQuery.eq('has_bq', query.has_bq)
    }

    // Infrastructure filters (Nigerian market)
    if (query.nepa_status) {
      dbQuery = dbQuery.eq('nepa_status', query.nepa_status)
    }

    if (query.water_source) {
      dbQuery = dbQuery.eq('water_source', query.water_source)
    }

    if (query.internet_type) {
      dbQuery = dbQuery.eq('internet_type', query.internet_type)
    }

    // Security type filter (array overlap)
    if (query.security_type && query.security_type.length > 0) {
      // Check if any of the requested security types are in the property's security_type array
      dbQuery = dbQuery.overlaps('security_type', query.security_type)
    }

    // Apply sorting
    switch (query.sort_by) {
      case 'newest':
        dbQuery = dbQuery.order('created_at', { ascending: false })
        break
      case 'price_asc':
        dbQuery = dbQuery.order('price', { ascending: true })
        break
      case 'price_desc':
        dbQuery = dbQuery.order('price', { ascending: false })
        break
      case 'distance':
        if (query.latitude && query.longitude) {
          // For distance sorting, we need to calculate distance in the select
          // This is a simplified approach - in production you might want to use a more complex query
          dbQuery = dbQuery.order('created_at', { ascending: false }) // Fallback to newest
        } else {
          dbQuery = dbQuery.order('created_at', { ascending: false })
        }
        break
    }

    // Apply pagination
    const from = (query.page - 1) * query.per_page
    const to = from + query.per_page - 1
    dbQuery = dbQuery.range(from, to)

    // Execute query
    const { data: properties, error, count } = await dbQuery

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch properties' },
        { status: 500 }
      )
    }

    // Calculate pagination metadata
    const totalPages = Math.ceil((count || 0) / query.per_page)

    return NextResponse.json({
      data: properties || [],
      pagination: {
        page: query.page,
        per_page: query.per_page,
        total: count || 0,
        total_pages: totalPages,
        has_next: query.page < totalPages,
        has_prev: query.page > 1,
      },
      filters: {
        applied: {
          state: query.state,
          lga: query.lga,
          property_type: query.property_type,
          price_range: query.min_price || query.max_price ? {
            min: query.min_price,
            max: query.max_price
          } : undefined,
          bedrooms: query.bedrooms,
          bathrooms: query.bathrooms,
          has_bq: query.has_bq,
          nepa_status: query.nepa_status,
          water_source: query.water_source,
          internet_type: query.internet_type,
          security_type: query.security_type,
          location: query.latitude && query.longitude ? {
            latitude: query.latitude,
            longitude: query.longitude,
            radius_km: query.radius_km
          } : undefined
        }
      }
    })

  } catch (error) {
    console.error('API error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

