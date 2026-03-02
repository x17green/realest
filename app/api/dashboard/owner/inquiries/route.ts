import { createClient } from '@/lib/supabase/server'
import { prisma, Prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const querySchema = z.object({
  page: z.string().optional().transform(val => val ? parseInt(val) : 1),
  limit: z.string().optional().transform(val => val ? parseInt(val) : 10),
  status: z.enum(['new', 'read', 'responded', 'closed']).optional(),
  sort: z.enum(['newest', 'oldest', 'property']).optional().default('newest')
})

export async function GET(request: Request) {
  try {
    const supabase = await createClient()

    // Verify authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Verify role via Prisma
    const userRow = await prisma.users.findUnique({
      where: { id: user.id },
      select: { role: true },
    })
    if (!userRow || !['owner', 'admin'].includes(userRow.role)) {
      return NextResponse.json(
        { error: 'Forbidden - Property owners only' },
        { status: 403 }
      )
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const queryResult = querySchema.safeParse({
      page: searchParams.get('page'),
      limit: searchParams.get('limit'),
      status: searchParams.get('status'),
      sort: searchParams.get('sort'),
    })

    if (!queryResult.success) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: queryResult.error.issues },
        { status: 400 }
      )
    }

    const { page, limit, status, sort } = queryResult.data

    const where: Prisma.inquiriesWhereInput = { owner_id: user.id }
    if (status) where.status = status

    let orderBy: Prisma.inquiriesOrderByWithRelationInput = { created_at: 'desc' }
    if (sort === 'oldest') orderBy = { created_at: 'asc' }
    else if (sort === 'property') orderBy = { properties: { title: 'asc' } }

    const [inquiries, total] = await Promise.all([
      prisma.inquiries.findMany({
        where,
        include: {
          profiles_inquiries_sender_idToprofiles: {
            select: { full_name: true, email: true, phone: true, avatar_url: true },
          },
          properties: {
            select: { id: true, title: true, address: true, state: true, price: true, price_frequency: true },
          },
        },
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.inquiries.count({ where }),
    ])

    const totalPages = Math.ceil(total / limit)

    return NextResponse.json({
      data: inquiries,
      pagination: {
        page,
        limit,
        total,
        total_pages: totalPages,
        has_next: page < totalPages,
        has_prev: page > 1,
      },
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
