/**
 * GET    /api/admin/emails/campaigns/[id]  — get single campaign
 * PATCH  /api/admin/emails/campaigns/[id]  — update draft campaign
 * DELETE /api/admin/emails/campaigns/[id]  — delete draft campaign
 *
 * Admin-only.
 */
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import prisma from '@/lib/prisma';

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { user: null, error: 'Unauthorized', status: 401 };

  const { data: userRow } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();

  if (userRow?.role !== 'admin') return { user: null, error: 'Forbidden', status: 403 };

  return { user, error: null, status: 200 };
}

// ── GET ───────────────────────────────────────────────────────────────────────
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { error, status } = await requireAdmin();
  if (error) return NextResponse.json({ error }, { status });

  const { id } = await params;

  const campaign = await prisma.email_campaigns.findUnique({
    where: { id },
    include: { profiles: { select: { full_name: true, email: true } } },
  });

  if (!campaign) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  return NextResponse.json({ campaign });
}

// ── PATCH ─────────────────────────────────────────────────────────────────────
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { error, status } = await requireAdmin();
  if (error) return NextResponse.json({ error }, { status });

  const { id } = await params;

  const existing = await prisma.email_campaigns.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  if (existing.status !== 'draft') {
    return NextResponse.json({ error: 'Only draft campaigns can be updated' }, { status: 409 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const allowedFields = [
    'name', 'template_name', 'subject', 'audience_type',
    'audience_id', 'audience_filter', 'send_mode',
    'template_props', 'scheduled_at',
  ];

  const updateData: Record<string, unknown> = {};
  for (const field of allowedFields) {
    if (field in body) {
      updateData[field] = body[field];
    }
  }

  if (updateData.scheduled_at) {
    updateData.scheduled_at = new Date(updateData.scheduled_at as string);
  }

  const updated = await prisma.email_campaigns.update({
    where: { id },
    data: { ...updateData, updated_at: new Date() },
  });

  return NextResponse.json({ campaign: updated });
}

// ── DELETE ────────────────────────────────────────────────────────────────────
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { error, status } = await requireAdmin();
  if (error) return NextResponse.json({ error }, { status });

  const { id } = await params;

  const existing = await prisma.email_campaigns.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  if (existing.status !== 'draft') {
    return NextResponse.json(
      { error: 'Only draft campaigns can be deleted' },
      { status: 409 },
    );
  }

  await prisma.email_campaigns.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
