import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

type RouteParams = {
  params: Promise<{ id: string }>
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const supabase = await createClient()
    const { id } = await params

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Admin role check
    const adminRow = await prisma.users.findUnique({ where: { id: user.id }, select: { role: true } })
    if (!adminRow || adminRow.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    // Fetch target user
    const targetUser = await prisma.users.findUnique({
      where: { id },
      include: {
        profiles: {
          select: {
            full_name: true,
            email: true,
            phone: true,
            avatar_url: true,
            bio: true,
            created_at: true,
            updated_at: true,
          },
        },
      },
    })

    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Count properties and inquiries separately (no Prisma relation on users)
    const [propCountResult, sentInqCount, receivedInqCount] = await Promise.all([
      prisma.properties.count({ where: { owner_id: id } }),
      prisma.inquiries.count({ where: { sender_id: id } }),
      prisma.inquiries.count({ where: { owner_id: id } }),
    ])

    // Fetch user's properties
    const properties = await prisma.properties.findMany({
      where: { owner_id: id },
      select: {
        id: true,
        title: true,
        property_type: true,
        status: true,
        price: true,
        price_frequency: true,
        state: true,
        city: true,
        created_at: true,
      },
      orderBy: { created_at: 'desc' },
    })
    const sentInquiries = await prisma.inquiries.findMany({
      where: { sender_id: id },
      select: {
        id: true,
        property_id: true,
        message: true,
        status: true,
        created_at: true,
        properties: { select: { title: true, status: true } },
      },
      orderBy: { created_at: 'desc' },
      take: 10,
    })

    // Fetch received inquiries (latest 10)
    const receivedInquiries = await prisma.inquiries.findMany({
      where: { owner_id: id },
      select: {
        id: true,
        property_id: true,
        sender_id: true,
        message: true,
        status: true,
        created_at: true,
        properties: { select: { title: true } },
        profiles_inquiries_sender_idToprofiles: { select: { full_name: true, email: true } },
      },
      orderBy: { created_at: 'desc' },
      take: 10,
    })

    const liveProps = properties.filter((p: any) => p.status === 'live').length
    const pendingProps = properties.filter((p: any) =>
      p.status === 'pending_ml_validation' || p.status === 'pending_vetting'
    ).length
    const rejectedProps = properties.filter((p: any) => p.status === 'rejected').length
    const accountCreated = targetUser.created_at ?? targetUser.profiles?.created_at
    const accountAgeDays = accountCreated
      ? Math.floor((Date.now() - new Date(accountCreated).getTime()) / (1000 * 60 * 60 * 24))
      : 0

    return NextResponse.json({
      data: {
        id: targetUser.id,
        role: targetUser.role,
        created_at: targetUser.created_at,
        updated_at: targetUser.updated_at,
        profile: targetUser.profiles,
        stats: {
          total_properties: properties.length,
          live_properties: liveProps,
          pending_properties: pendingProps,
          rejected_properties: rejectedProps,
          total_inquiries_sent: sentInqCount,
          total_inquiries_received: receivedInqCount,
          account_age_days: accountAgeDays,
          last_activity: targetUser.updated_at,
        },
        properties,
        recent_inquiries_sent: sentInquiries,
        recent_inquiries_received: receivedInquiries,
        risk_factors: {
          has_rejected_properties: rejectedProps > 0,
          high_rejection_rate: properties.length > 0 && (rejectedProps / properties.length) > 0.5,
          inactive_account: accountAgeDays > 30 && properties.length === 0,
        },
      },
    })
  } catch (error) {
    console.error('Unexpected error in user details:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}