import { NextRequest, NextResponse } from 'next/server';
import { redeemFirstListingWaiver } from '@/lib/reward-engine';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  let listingId = '';
  try {
    const body = await request.json();
    listingId = String(body.listingId ?? '').trim();
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid JSON body' }, { status: 400 });
  }

  if (!listingId) {
    return NextResponse.json({ ok: false, error: 'Listing ID is required' }, { status: 400 });
  }

  const redemption = await redeemFirstListingWaiver(user.id, listingId);
  return NextResponse.json({ ok: true, redemption });
}