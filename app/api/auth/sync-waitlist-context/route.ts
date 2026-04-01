import { NextRequest, NextResponse } from 'next/server';
import { syncWaitlistContextToProfile } from '@/lib/reward-engine';
import { createServiceClient } from '@/lib/supabase/service';

export async function POST(request: NextRequest) {
  let email = '';

  try {
    const body = await request.json();
    email = String(body.email ?? '').trim().toLowerCase();
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid JSON body' }, { status: 400 });
  }

  if (!email) {
    return NextResponse.json({ ok: false, error: 'Email is required' }, { status: 400 });
  }

  const svc = createServiceClient();
  const cutoff = new Date(Date.now() - 15 * 60_000).toISOString();
  const { data: profile } = await svc
    .from('profiles')
    .select('id, email, created_at')
    .eq('email', email)
    .gte('created_at', cutoff)
    .maybeSingle();

  if (!profile) {
    return NextResponse.json(
      { ok: false, error: 'Profile not found or sync window expired' },
      { status: 404 },
    );
  }

  const context = await syncWaitlistContextToProfile(email, profile.id, svc);

  return NextResponse.json({
    ok: true,
    context,
  });
}