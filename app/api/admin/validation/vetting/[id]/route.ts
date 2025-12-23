import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

// Validation schema for vetting actions
const vettingUpdateSchema = z.object({
  action: z.enum(['approve', 'reject', 'schedule', 'flag_issue']),
  notes: z.string().optional(),
  scheduled_date: z.string().optional(), // ISO date string for scheduling
  rejection_reason: z.enum([
    'property_not_found',
    'documents_fraudulent',
    'owner_unresponsive',
    'property_condition_poor',
    'location_inaccurate',
    'pricing_inaccurate',
    'other'
  ]).optional(),
  issue_details: z.string().optional(),
})

type RouteParams = {
  params: Promise<{
    id: string
  }>
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const supabase = await createClient()
    const { id } = await params

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

    // Validate request body
    const body = await request.json()
    const validation = vettingUpdateSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validation.error.issues },
        { status: 400 }
      )
    }

    const { action, notes, scheduled_date, rejection_reason, issue_details } = validation.data

    // Fetch current property to verify it's in pending_vetting status
    const { data: property, error: fetchError } = await supabase
      .from('properties')
      .select('*')
      .eq('id', id)
      .eq('status', 'pending_vetting')
      .single()

    if (fetchError || !property) {
      return NextResponse.json(
        { error: 'Property not found or not eligible for vetting' },
        { status: 404 }
      )
    }

    let newStatus: string
    let updateData: any = {
      updated_at: new Date().toISOString(),
    }

    // Determine new status based on action
    switch (action) {
      case 'approve':
        newStatus = 'live'
        updateData.verified_at = new Date().toISOString()
        break
      case 'reject':
        newStatus = 'rejected'
        updateData.rejection_reason = rejection_reason
        break
      case 'schedule':
        newStatus = 'pending_vetting' // Status stays the same, but we track scheduling
        if (scheduled_date) {
          updateData.scheduled_vetting_date = scheduled_date
        }
        break
      case 'flag_issue':
        newStatus = 'pending_vetting' // Status stays the same, but flagged for review
        updateData.flagged_for_review = true
        updateData.review_notes = issue_details
        break
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }

    updateData.status = newStatus

    // Update property status
    const { data: updatedProperty, error: updateError } = await supabase
      .from('properties')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating property status:', updateError)
      return NextResponse.json(
        { error: 'Failed to update property status' },
        { status: 500 }
      )
    }

    // Log admin action in audit table
    const { error: auditError } = await supabase
      .from('admin_actions')
      .insert({
        admin_id: user.id,
        action_type: 'physical_vetting',
        target_type: 'property',
        target_id: id,
        action_details: {
          action,
          previous_status: 'pending_vetting',
          new_status: newStatus,
          notes,
          scheduled_date,
          rejection_reason,
          issue_details,
        },
        ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
        user_agent: request.headers.get('user-agent'),
      })

    if (auditError) {
      console.error('Error logging admin action:', auditError)
      // Don't fail the request for audit logging errors
    }

    // Send notification to property owner
    try {
      const { data: owner } = await supabase
        .from('profiles')
        .select('email, full_name')
        .eq('id', property.owner_id)
        .single()

      if (owner?.email) {
        // TODO: Implement email notification
        // await sendPropertyVettingNotification({
        //   to: owner.email,
        //   ownerName: owner.full_name,
        //   propertyTitle: property.title,
        //   action,
        //   notes,
        //   scheduledDate: scheduled_date,
        // })

        console.log(`Notification sent to ${owner.email} for property ${property.title}`)
      }
    } catch (notificationError) {
      console.error('Error sending notification:', notificationError)
      // Don't fail the request for notification errors
    }

    return NextResponse.json({
      success: true,
      data: {
        property: updatedProperty,
        action_taken: action,
        new_status: newStatus,
        message: getActionMessage(action, property.title),
      }
    })

  } catch (error) {
    console.error('Unexpected error in vetting action:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Helper function to generate action-specific messages
function getActionMessage(action: string, propertyTitle: string): string {
  switch (action) {
    case 'approve':
      return `Property "${propertyTitle}" has been approved and is now live on the marketplace.`
    case 'reject':
      return `Property "${propertyTitle}" has been rejected and removed from the marketplace.`
    case 'schedule':
      return `Vetting visit for "${propertyTitle}" has been scheduled.`
    case 'flag_issue':
      return `Property "${propertyTitle}" has been flagged for additional review.`
    default:
      return `Action completed for property "${propertyTitle}".`
  }
}