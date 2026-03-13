import { NextResponse } from 'next/server';
import { getReferralSummaryForEmail } from '@/lib/reward-engine';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user?.email) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  const summary = await getReferralSummaryForEmail(user.email);
  return NextResponse.json({ ok: true, summary });
}