import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const propertyId = params.id

    // Fetch property with full details - only live properties
    const { data: property, error } = await supabase
      .from('properties')
      .select(`
        id,
        owner_id,
        property_type,
        title,
        description,
        address,
        state,
        lga,
        landmark,
        latitude,
        longitude,
        price,
        price_frequency,
        bedrooms,
        bathrooms,
        size_sqm,
        has_bq,
        bq_type,
        bq_bathrooms,
        bq_kitchen,
        bq_separate_entrance,
        bq_condition,
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
        owner:profiles!inner(
          id,
          full_name,
          avatar_url,
          user_type,
          phone
        ),
        media:property_media(
          id,
          media_type,
          file_url,
          thumbnail_url,
          alt_text,
          display_order,
          is_primary
        ),
        documents:property_documents(
          id,
          document_type,
          file_name,
          ml_validation_status,
          uploaded_at
        )
      `)
      .eq('id', propertyId)
      .eq('status', 'live')
      .single()

    if (error) {
      console.error('Database error:', error)
      if (error.code === 'PGRST116') { // No rows returned
        return NextResponse.json(
          { error: 'Property not found' },
          { status: 404 }
        )
      }
      return NextResponse.json(
        { error: 'Failed to fetch property' },
        { status: 500 }
      )
    }

    if (!property) {
      return NextResponse.json(
        { error: 'Property not found' },
        { status: 404 }
      )
    }

    // Increment view count (fire and forget)
    ;(async () => {
      try {
        await supabase
          .from('properties')
          .update({
            views_count: (property.views_count || 0) + 1,
            updated_at: new Date().toISOString()
          })
          .eq('id', propertyId)
      } catch (err: any) {
        console.error('Failed to update view count:', err)
      }
    })()

    // Format the response
    const formattedProperty = {
      id: property.id,
      property_type: property.property_type,
      title: property.title,
      description: property.description,
      address: property.address,
      state: property.state,
      lga: property.lga,
      landmark: property.landmark,
      coordinates: {
        latitude: property.latitude,
        longitude: property.longitude
      },
      pricing: {
        amount: property.price,
        frequency: property.price_frequency
      },
      details: {
        bedrooms: property.bedrooms,
        bathrooms: property.bathrooms,
        size_sqm: property.size_sqm,
        has_bq: property.has_bq,
        bq_details: property.has_bq ? {
          type: property.bq_type,
          bathrooms: property.bq_bathrooms,
          kitchen: property.bq_kitchen,
          separate_entrance: property.bq_separate_entrance,
          condition: property.bq_condition
        } : null
      },
      infrastructure: {
        nepa_status: property.nepa_status,
        water_source: property.water_source,
        internet_type: property.internet_type,
        security_type: property.security_type
      },
      verification: {
        is_verified: !!property.verified_at,
        verified_at: property.verified_at,
        is_featured: property.is_featured
      },
      listing_info: {
        created_at: property.created_at,
        updated_at: property.updated_at,
        views_count: property.views_count
      },
      owner: {
        id: (property.owner as any).id,
        name: (property.owner as any).full_name,
        avatar_url: (property.owner as any).avatar_url,
        user_type: (property.owner as any).user_type,
        phone: (property.owner as any).phone
      },
      media: property.media?.sort((a: any, b: any) => (a.display_order || 0) - (b.display_order || 0)) || [],
      documents: property.documents?.map((doc: any) => ({
        id: doc.id,
        type: doc.document_type,
        file_name: doc.file_name,
        validation_status: doc.ml_validation_status,
        uploaded_at: doc.uploaded_at
      })) || []
    }

    return NextResponse.json({ data: formattedProperty })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}