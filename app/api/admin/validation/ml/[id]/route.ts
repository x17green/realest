import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

// Request body schema for ML validation update
const mlValidationUpdateSchema = z.object({
  action: z.enum(['approve', 'reject', 'flag_duplicate']),
  ml_confidence_score: z.number().min(0).max(1).optional(),
  ml_validation_notes: z.string().optional(),
  admin_notes: z.string().optional(),
})

type RouteParams = {
  params: Promise<{
    id: string
  }>
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const supabase = await createClient()
    const { id: propertyId } = await params

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

    // Parse request body
    const body = await request.json()
    const validation = mlValidationUpdateSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request body', details: validation.error.issues },
        { status: 400 }
      )
    }

    const { action, ml_confidence_score, ml_validation_notes, admin_notes } = validation.data

    // Verify property exists and is in correct status
    const { data: property, error: propertyError } = await supabase
      .from('properties')
      .select('*')
      .eq('id', propertyId)
      .eq('status', 'pending_ml_validation')
      .single()

    if (propertyError || !property) {
      return NextResponse.json(
        { error: 'Property not found or not in ML validation status' },
        { status: 404 }
      )
    }

    // Update property based on action
    let newStatus: string
    let updateData: any = {
      updated_at: new Date().toISOString(),
    }

    switch (action) {
      case 'approve':
        newStatus = 'pending_vetting'
        updateData.status = newStatus
        updateData.ml_validation_status = 'passed'
        updateData.ml_confidence_score = ml_confidence_score || 0.8
        updateData.ml_validation_notes = ml_validation_notes
        updateData.ml_validated_at = new Date().toISOString()
        break

      case 'reject':
        newStatus = 'rejected'
        updateData.status = newStatus
        updateData.ml_validation_status = 'failed'
        updateData.ml_confidence_score = ml_confidence_score || 0
        updateData.ml_validation_notes = ml_validation_notes
        updateData.rejected_at = new Date().toISOString()
        updateData.rejection_reason = admin_notes || 'Failed ML validation'
        break

      case 'flag_duplicate':
        newStatus = 'pending_duplicate_review'
        updateData.status = newStatus
        updateData.ml_validation_status = 'review_required'
        updateData.ml_confidence_score = ml_confidence_score || 0.5
        updateData.ml_validation_notes = ml_validation_notes
        updateData.flagged_as_duplicate = true
        updateData.duplicate_review_notes = admin_notes
        break

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }

    // Update property status
    const { data: updatedProperty, error: updateError } = await supabase
      .from('properties')
      .update(updateData)
      .eq('id', propertyId)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating property:', updateError)
      return NextResponse.json(
        { error: 'Failed to update property status' },
        { status: 500 }
      )
    }

    // Log admin action for audit trail
    const { error: logError } = await supabase
      .from('admin_actions')
      .insert({
        admin_id: user.id,
        action_type: 'ml_validation_update',
        target_type: 'property',
        target_id: propertyId,
        action_details: {
          action,
          previous_status: property.status,
          new_status: newStatus,
          ml_confidence_score,
          ml_validation_notes,
          admin_notes,
        },
        created_at: new Date().toISOString(),
      })

    if (logError) {
      console.error('Error logging admin action:', logError)
      // Don't fail the request for logging errors
    }

    // Send notification to property owner
    try {
      const { data: owner } = await supabase
        .from('profiles')
        .select('email, full_name')
        .eq('id', property.owner_id)
        .single()

      if (owner?.email) {
        // TODO: Send email notification using email service
        // await sendPropertyStatusNotification({
        //   to: owner.email,
        //   ownerName: owner.full_name,
        //   propertyTitle: property.title,
        //   status: newStatus,
        //   notes: admin_notes,
        // })
      }
    } catch (emailError) {
      console.error('Error sending notification email:', emailError)
      // Don't fail the request for email errors
    }

    return NextResponse.json({
      success: true,
      data: {
        property: updatedProperty,
        action_taken: action,
        new_status: newStatus,
        message: `Property ${action}d successfully`,
      }
    })

  } catch (error) {
    console.error('Unexpected error in ML validation update:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}