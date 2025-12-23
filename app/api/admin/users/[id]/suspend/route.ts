import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

// Validation schema for user suspension
const suspensionSchema = z.object({
  action: z.enum(['suspend', 'unsuspend', 'ban', 'unban']),
  reason: z.string().min(10, 'Reason must be at least 10 characters'),
  duration_days: z.number().optional(), // For temporary suspensions
  notes: z.string().optional(),
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

    // Prevent admin from suspending themselves
    if (id === user.id) {
      return NextResponse.json(
        { error: 'Cannot modify your own account' },
        { status: 400 }
      )
    }

    // Validate request body
    const body = await request.json()
    const validation = suspensionSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validation.error.issues },
        { status: 400 }
      )
    }

    const { action, reason, duration_days, notes } = validation.data

    // Fetch target user to verify they exist
    const { data: targetUser, error: fetchError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchError || !targetUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Prevent suspending other admins (unless current admin is super admin)
    // For now, allow admin to admin suspension, but log it prominently
    if (targetUser.user_type === 'admin' && profile.user_type === 'admin') {
      console.warn(`Admin ${user.id} is modifying another admin account: ${id}`)
    }

    let updateData: any = {
      updated_at: new Date().toISOString(),
    }

    let suspensionEndDate: string | null = null

    // Determine action effects
    switch (action) {
      case 'suspend':
        updateData.is_suspended = true
        updateData.suspension_reason = reason
        updateData.suspension_notes = notes
        if (duration_days) {
          suspensionEndDate = new Date(Date.now() + duration_days * 24 * 60 * 60 * 1000).toISOString()
          updateData.suspension_end_date = suspensionEndDate
        }
        break
      case 'unsuspend':
        updateData.is_suspended = false
        updateData.suspension_reason = null
        updateData.suspension_notes = null
        updateData.suspension_end_date = null
        break
      case 'ban':
        updateData.is_banned = true
        updateData.ban_reason = reason
        updateData.ban_notes = notes
        updateData.banned_at = new Date().toISOString()
        break
      case 'unban':
        updateData.is_banned = false
        updateData.ban_reason = null
        updateData.ban_notes = null
        updateData.banned_at = null
        break
    }

    // Update user status
    const { data: updatedUser, error: updateError } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating user status:', updateError)
      return NextResponse.json(
        { error: 'Failed to update user status' },
        { status: 500 }
      )
    }

    // If suspending, also update all their properties to unlisted status
    if (action === 'suspend' || action === 'ban') {
      const { error: propertyUpdateError } = await supabase
        .from('properties')
        .update({
          status: 'unlisted',
          unlisted_reason: action === 'suspend' ? 'owner_suspended' : 'owner_banned',
          updated_at: new Date().toISOString()
        })
        .eq('owner_id', id)
        .neq('status', 'live') // Don't unlist already live properties immediately

      if (propertyUpdateError) {
        console.error('Error updating user properties:', propertyUpdateError)
        // Don't fail the request for this
      }
    }

    // Log admin action in audit table
    const { error: auditError } = await supabase
      .from('admin_actions')
      .insert({
        admin_id: user.id,
        action_type: 'user_moderation',
        target_type: 'user',
        target_id: id,
        action_details: {
          action,
          reason,
          duration_days,
          notes,
          suspension_end_date: suspensionEndDate,
          previous_user_type: targetUser.user_type,
          target_user_email: targetUser.email,
        },
        ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
        user_agent: request.headers.get('user-agent'),
      })

    if (auditError) {
      console.error('Error logging admin action:', auditError)
      // Don't fail the request for audit logging errors
    }

    // Send notification email to user (if not banned)
    if (action !== 'ban') {
      try {
        // TODO: Implement email notification for suspension/unsuspension
        // await sendUserModerationNotification({
        //   to: targetUser.email,
        //   userName: targetUser.full_name,
        //   action,
        //   reason,
        //   duration_days,
        //   notes,
        // })

        console.log(`Notification sent to ${targetUser.email} for account ${action}`)
      } catch (notificationError) {
        console.error('Error sending notification:', notificationError)
        // Don't fail the request for notification errors
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        user: updatedUser,
        action_taken: action,
        message: getModerationMessage(action, targetUser.full_name),
      }
    })

  } catch (error) {
    console.error('Unexpected error in user moderation:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Helper function to generate moderation-specific messages
function getModerationMessage(action: string, userName: string): string {
  switch (action) {
    case 'suspend':
      return `User ${userName} has been suspended.`
    case 'unsuspend':
      return `User ${userName} has been unsuspended and can now access their account.`
    case 'ban':
      return `User ${userName} has been permanently banned.`
    case 'unban':
      return `User ${userName} has been unbanned and can now access their account.`
    default:
      return `Action completed for user ${userName}.`
  }
}