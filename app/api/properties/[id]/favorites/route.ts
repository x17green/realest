import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// POST /api/properties/[id]/favorites - Save a property to favorites
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

    // Verify property exists and is live
    const { data: property, error: propertyError } = await supabase
      .from('properties')
      .select('id, title')
      .eq('id', propertyId)
      .eq('status', 'live')
      .single()

    if (propertyError || !property) {
      return NextResponse.json(
        { error: 'Property not found' },
        { status: 404 }
      )
    }

    // Check if already saved
    const { data: existingSave } = await supabase
      .from('saved_properties')
      .select('id')
      .eq('user_id', user.id)
      .eq('property_id', propertyId)
      .single()

    if (existingSave) {
      return NextResponse.json(
        { error: 'Property already saved to favorites' },
        { status: 409 }
      )
    }

    // Save the property
    const { data: savedProperty, error: insertError } = await supabase
      .from('saved_properties')
      .insert({
        user_id: user.id,
        property_id: propertyId
      })
      .select(`
        id,
        created_at,
        property:properties!inner(
          id,
          title,
          price,
          price_frequency,
          state,
          lga,
          bedrooms,
          bathrooms,
          size_sqm,
          has_bq,
          status
        )
      `)
      .single()

    if (insertError) {
      console.error('Database error:', insertError)
      return NextResponse.json(
        { error: 'Failed to save property' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { data: savedProperty, message: 'Property saved to favorites' },
      { status: 201 }
    )

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/properties/[id]/favorites - Remove property from favorites
export async function DELETE(
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

    // Check if property is saved
    const { data: existingSave, error: checkError } = await supabase
      .from('saved_properties')
      .select('id')
      .eq('user_id', user.id)
      .eq('property_id', propertyId)
      .single()

    if (checkError || !existingSave) {
      return NextResponse.json(
        { error: 'Property not found in favorites' },
        { status: 404 }
      )
    }

    // Remove from favorites
    const { error: deleteError } = await supabase
      .from('saved_properties')
      .delete()
      .eq('user_id', user.id)
      .eq('property_id', propertyId)

    if (deleteError) {
      console.error('Database error:', deleteError)
      return NextResponse.json(
        { error: 'Failed to remove from favorites' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { message: 'Property removed from favorites' },
      { status: 200 }
    )

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}