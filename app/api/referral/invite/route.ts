import { NextRequest, NextResponse } from 'next/server';
import { sendReferralInviteEmail } from '@/lib/emailService';
import { recordReferralEvent } from '@/lib/reward-engine';
import { buildReferralShareUrl, getCurrentMilestone, getNextMilestone } from '@/lib/referral-system';
import { createServiceClient } from '@/lib/supabase/service';

const inviteRateLimitStore = new Map<string, { count: number; resetTime: number }>();

function isInviteRateLimited(ip: string): boolean {
  const now = Date.now();
  const current = inviteRateLimitStore.get(ip);

  if (!current || now > current.resetTime) {
    inviteRateLimitStore.set(ip, { count: 1, resetTime: now + 60_000 });
    return false;
  }

  if (current.count >= 5) {
    return true;
  }

  current.count += 1;
  return false;
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
  if (isInviteRateLimited(ip)) {
    return NextResponse.json({ ok: false, error: 'Too many invites. Try again later.' }, { status: 429 });
  }

  let inviteeEmail = '';
  let inviteeName = '';
  let referralCode = '';

  try {
    const body = await request.json();
    inviteeEmail = String(body.inviteeEmail ?? '').trim().toLowerCase();
    inviteeName = String(body.inviteeName ?? '').trim();
    referralCode = String(body.referralCode ?? '').trim().toUpperCase();
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid JSON body' }, { status: 400 });
  }

  if (!inviteeEmail || !referralCode) {
    return NextResponse.json({ ok: false, error: 'Invitee email and referral code are required' }, { status: 400 });
  }

  const svc = createServiceClient();
  const { data: profileReferrer } = await svc
    .from('profiles')
    .select('id, email, full_name, referral_code, referral_count')
    .eq('referral_code', referralCode)
    .maybeSingle();

  const { data: waitlistReferrer } = profileReferrer
    ? { data: null }
    : await svc
        .from('waitlist')
        .select('id, email, first_name, referral_code, referral_count')
        .eq('referral_code', referralCode)
        .maybeSingle();

  const inviter = profileReferrer
    ? {
        profileId: profileReferrer.id,
        waitlistId: null,
        email: profileReferrer.email,
        firstName: profileReferrer.full_name?.split(' ')[0] ?? 'RealEST member',
        referralCode: profileReferrer.referral_code ?? referralCode,
        referralCount: profileReferrer.referral_count ?? 0,
      }
    : waitlistReferrer
      ? {
          profileId: null,
          waitlistId: waitlistReferrer.id,
          email: waitlistReferrer.email,
          firstName: waitlistReferrer.first_name ?? 'RealEST member',
          referralCode: waitlistReferrer.referral_code ?? referralCode,
          referralCount: waitlistReferrer.referral_count ?? 0,
        }
      : null;

  if (!inviter) {
    return NextResponse.json({ ok: false, error: 'Referral code not found' }, { status: 404 });
  }

  const nextMilestone = getNextMilestone(inviter.referralCount);
  const currentMilestone = getCurrentMilestone(inviter.referralCount);
  const result = await sendReferralInviteEmail(inviteeEmail, {
    firstName: inviteeName || 'there',
    referralCode: inviter.referralCode,
    referralUrl: buildReferralShareUrl(inviter.referralCode),
    rewardDescription: currentMilestone?.label ?? 'priority verification on your first listing',
    rewardForReferee: nextMilestone?.label ?? '1 month of premium visibility',
  });

  if (!result.success) {
    return NextResponse.json({ ok: false, error: result.error ?? 'Unable to send invite' }, { status: 500 });
  }

  await recordReferralEvent({
    referrerWaitlistId: inviter.waitlistId,
    referrerProfileId: inviter.profileId,
    referralCode: inviter.referralCode,
    eventType: 'invite_email_sent',
    metadata: {
      invitee_email: inviteeEmail,
      invitee_name: inviteeName || null,
    },
  }, svc);

  return NextResponse.json({ ok: true });
}