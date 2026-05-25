import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { detectDuplicateCandidates } from '@/lib/validation/ml-validation'
import type { DuplicateCheckResult } from '@/lib/types/validation'

const duplicateCheckSchema = z.object({
  propertyId: z.string().uuid('Invalid property ID'),
  images: z.array(z.string().url()).optional().default([]),
  location: z.object({
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180),
  }),
  description: z.string().min(10, 'Description too short'),
  address: z.string().min(5, 'Address too short'),
  propertyType: z.string().optional().default('house'),
})

type RouteParams = {
  params: Promise<{}>
}

export async function POST(request: NextRequest, { params }: RouteParams) {
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
    const adminRow = await prisma.users.findUnique({
      where: { id: user.id },
      select: { role: true }
    })
    
    if (!adminRow || adminRow.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    // Parse request body
    const body = await request.json()
    const validation = duplicateCheckSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: validation.error.issues },
        { status: 400 }
      )
    }

    const { propertyId, images, location, description, address, propertyType } = validation.data

    // Verify property exists
    const property = await prisma.properties.findUnique({
      where: { id: propertyId },
      select: { id: true, title: true }
    })

    if (!property) {
      return NextResponse.json(
        { error: 'Property not found' },
        { status: 404 }
      )
    }

    const candidateProperties = await prisma.properties.findMany({
      where: {
        id: { not: propertyId },
        status: { in: ['live', 'pending_vetting', 'pending_ml_validation'] },
      },
      select: {
        id: true,
        title: true,
        address: true,
        property_type: true,
        description: true,
        latitude: true,
        longitude: true,
        price: true,
      },
      take: 50,
    })

    // Perform duplicate check
    const duplicateResult = detectDuplicateCandidates(
      {
        images,
        location,
        description,
        address,
        propertyType,
      },
      candidateProperties.map(p => ({
        ...p,
        latitude: p.latitude ? Number(p.latitude) : null,
        longitude: p.longitude ? Number(p.longitude) : null,
        price: Number(p.price),
      })),
    )

    // Log check
    await prisma.admin_audit_log.create({
      data: {
        actor_id: user.id,
        action: 'duplicate_check',
        target_id: propertyId,
        metadata: {
          isDuplicate: duplicateResult.isDuplicate,
          confidence: duplicateResult.confidence,
          matchCount: duplicateResult.matchedProperties.length,
          matchTypes: duplicateResult.matchedProperties.map(m => m.matchType),
        },
      },
    })

    return NextResponse.json(duplicateResult)

  } catch (error) {
    console.error('[validation] Duplicate check error:', error)
    return NextResponse.json(
      {
        error: 'Duplicate check failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export const openApiPOST = {
  method: 'post',
  summary: 'Duplicate detection',
  description: 'Admin endpoint to run duplicate detection for a property using images, location and description.',
  tags: ['admin','validation','duplicates'],
  requestBody: { required: true, content: { 'application/json': { schema: { type: 'object' } } } },
  responses: {
    200: { description: 'Duplicate check result' },
    400: { description: 'Invalid request' },
    401: { description: 'Unauthorized' },
    403: { description: 'Forbidden' },
    404: { description: 'Property not found' },
  },
} as const;
