import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

// Schema for vetting a property
const vetPropertySchema = z.object({
  status: z.enum(['live', 'rejected']),
  rejection_reason: z.string().optional(),
  admin_notes: z.string().optional(),
  verified_at: z.string().datetime().optional(), // ISO datetime string
})

type VetPropertyInput = z.infer<typeof vetPropertySchema>

// PUT /api/admin/properties/[id]/vet - Admin property vetting
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const propertyId = params.id

    // Get authenticated user and verify admin role
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Verify user is admin
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('user_type')
      .eq('id', user.id)
      .single()

    if (profileError || profile?.user_type !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    // Parse and validate request body
    const body = await request.json()
    const validatedData = vetPropertySchema.parse(body)

    // Verify property exists and is in vetting status
    const { data: property, error: propertyError } = await supabase
      .from('properties')
      .select('id, status, owner_id, title')
      .eq('id', propertyId)
      .eq('status', 'pending_vetting')
      .single()

    if (propertyError || !property) {
      return NextResponse.json(
        { error: 'Property not found or not pending vetting' },
        { status: 404 }
      )
    }

    // Prepare update data
    const updateData: any = {
      status: validatedData.status,
      vetted_by: user.id,
      vetted_at: new Date().toISOString()
    }

    if (validatedData.status === 'live') {
      updateData.verified_at = validatedData.verified_at || new Date().toISOString()
    } else if (validatedData.status === 'rejected') {
      if (!validatedData.rejection_reason) {
        return NextResponse.json(
          { error: 'Rejection reason required for rejected properties' },
          { status: 400 }
        )
      }
      updateData.rejection_reason = validatedData.rejection_reason
    }

    if (validatedData.admin_notes) {
      updateData.admin_notes = validatedData.admin_notes
    }

    // Update property status
    const { data: updatedProperty, error: updateError } = await supabase
      .from('properties')
      .update(updateData)
      .eq('id', propertyId)
      .select(`
        id,
        status,
        vetted_by,
        vetted_at,
        verified_at,
        rejection_reason,
        admin_notes,
        owner:profiles!inner(
          id,
          full_name,
          email
        )
      `)
      .single()

    if (updateError) {
      console.error('Database error:', updateError)
      return NextResponse.json(
        { error: 'Failed to update property status' },
        { status: 500 }
      )
    }

    // Create notification for property owner
    const notificationMessage = validatedData.status === 'live'
      ? `Your property "${property.title}" has been verified and is now live on RealEST!`
      : `Your property "${property.title}" has been rejected. Reason: ${validatedData.rejection_reason}`

    await supabase
      .from('notifications')
      .insert({
        user_id: property.owner_id,
        type: 'property_status',
        title: validatedData.status === 'live' ? 'Property Verified' : 'Property Rejected',
        message: notificationMessage,
        data: {
          property_id: propertyId,
          status: validatedData.status,
          rejection_reason: validatedData.rejection_reason
        }
      })

    // Log admin action
    await supabase
      .from('admin_audit_log')
      .insert({
        admin_id: user.id,
        action: 'property_vetting',
        target_type: 'property',
        target_id: propertyId,
        details: {
          old_status: 'pending_vetting',
          new_status: validatedData.status,
          rejection_reason: validatedData.rejection_reason,
          admin_notes: validatedData.admin_notes
        }
      })

    return NextResponse.json({
      data: updatedProperty,
      message: `Property ${validatedData.status === 'live' ? 'approved' : 'rejected'} successfully`
    })

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