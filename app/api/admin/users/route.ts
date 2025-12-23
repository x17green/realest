import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

// Query parameters schema
const userQuerySchema = z.object({
  page: z.string().optional().default('1'),
  per_page: z.string().optional().default('20'),
  sort: z.enum(['newest', 'oldest', 'name', 'type']).optional().default('newest'),
  user_type: z.enum(['user', 'owner', 'agent', 'admin']).optional(),
  search: z.string().optional(), // Search by name or email
  status: z.enum(['active', 'suspended', 'banned']).optional(),
})

type RouteParams = {
  params: Promise<{}>
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const supabase = await createClient()

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

    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const queryValidation = userQuerySchema.safeParse({
      page: searchParams.get('page'),
      per_page: searchParams.get('per_page'),
      sort: searchParams.get('sort'),
      user_type: searchParams.get('user_type'),
      search: searchParams.get('search'),
      status: searchParams.get('status'),
    })

    if (!queryValidation.success) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: queryValidation.error.issues },
        { status: 400 }
      )
    }

    const { page, per_page, sort, user_type, search, status } = queryValidation.data
    const pageNum = parseInt(page)
    const perPageNum = parseInt(per_page)
    const offset = (pageNum - 1) * perPageNum

    // Build query for user profiles
    let query = supabase
      .from('profiles')
      .select(`
        *,
        property_count:properties(count),
        inquiry_count:inquiries(count)
      `)

    // Apply user type filter
    if (user_type) {
      query = query.eq('user_type', user_type)
    }

    // Apply search filter (name or email)
    if (search) {
      query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`)
    }

    // Apply status filter (if we add a status field later)
    // For now, all users are considered active unless suspended
    if (status) {
      // This would require adding a status field to profiles table
      // query = query.eq('status', status)
    }

    // Apply sorting
    switch (sort) {
      case 'newest':
        query = query.order('created_at', { ascending: false })
        break
      case 'oldest':
        query = query.order('created_at', { ascending: true })
        break
      case 'name':
        query = query.order('full_name', { ascending: true })
        break
      case 'type':
        query = query.order('user_type', { ascending: true })
        break
    }

    // Apply pagination
    query = query.range(offset, offset + perPageNum - 1)

    const { data: users, error: usersError } = await query

    if (usersError) {
      console.error('Error fetching users:', usersError)
      return NextResponse.json(
        { error: 'Failed to fetch users' },
        { status: 500 }
      )
    }

    // Get total count for pagination
    let countQuery = supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })

    if (user_type) {
      countQuery = countQuery.eq('user_type', user_type)
    }

    if (search) {
      countQuery = countQuery.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`)
    }

    const { count, error: countError } = await countQuery

    if (countError) {
      console.error('Error getting total count:', countError)
    }

    const totalCount = count || 0
    const totalPages = Math.ceil(totalCount / perPageNum)

    // Format response with user statistics
    const formattedUsers = users?.map(user => ({
      id: user.id,
      full_name: user.full_name,
      email: user.email,
      phone: user.phone,
      user_type: user.user_type,
      avatar_url: user.avatar_url,
      created_at: user.created_at,
      updated_at: user.updated_at,
      // Aggregated data
      property_count: user.property_count?.[0]?.count || 0,
      inquiry_count: user.inquiry_count?.[0]?.count || 0,
      // Status indicators
      is_active: true, // All users are active unless we add suspension logic
      last_activity: user.updated_at,
      account_age_days: Math.floor(
        (Date.now() - new Date(user.created_at).getTime()) / (1000 * 60 * 60 * 24)
      ),
    })) || []

    // Calculate user type distribution
    const userTypeStats = formattedUsers.reduce((acc, user) => {
      acc[user.user_type] = (acc[user.user_type] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return NextResponse.json({
      data: formattedUsers,
      pagination: {
        page: pageNum,
        per_page: perPageNum,
        total: totalCount,
        total_pages: totalPages,
        has_next: pageNum < totalPages,
        has_prev: pageNum > 1,
      },
      summary: {
        total_users: totalCount,
        user_type_distribution: userTypeStats,
        active_users: formattedUsers.filter(u => u.is_active).length,
        new_users_last_30_days: formattedUsers.filter(u =>
          new Date(u.created_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        ).length,
        average_account_age_days: formattedUsers.reduce((acc, u) => acc + u.account_age_days, 0) / formattedUsers.length || 0,
      },
      filters: {
        applied_user_type: user_type,
        applied_search: search,
        applied_status: status,
        available_user_types: ['user', 'owner', 'agent', 'admin'],
      }
    })

  } catch (error) {
    console.error('Unexpected error in user management:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}