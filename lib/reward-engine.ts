import { createServiceClient } from '@/lib/supabase/service';
import {
  WAITLIST_REWARD_KEY,
  buildReferralShareUrl,
  computeQueueScore,
  getCandidateRoleFromPersona,
  getCurrentMilestone,
  getLaunchRewardWindowEnd,
  getNextMilestone,
  getReachedMilestones,
  getWaitlistRewardCopy,
  isSupplySidePersona,
  isWaitlistPersona,
  type WaitlistPersona,
} from '@/lib/referral-system';

type ServiceClient = ReturnType<typeof createServiceClient>;

export interface WaitlistLikeRecord {
  id: string;
  email: string;
  first_name: string;
  referral_code: string | null;
  referral_count: number | null;
  persona: string | null;
  poll_completion_count: number | null;
  subscribed_at: string | null;
}

function getClient(client?: ServiceClient) {
  return client ?? createServiceClient();
}

export async function recordReferralEvent(
  event: {
    referrerWaitlistId?: string | null;
    referrerProfileId?: string | null;
    referredWaitlistId?: string | null;
    referredProfileId?: string | null;
    referralCode?: string | null;
    eventType: string;
    metadata?: Record<string, unknown>;
  },
  client?: ServiceClient,
) {
  const svc = getClient(client);
  await svc.from('referral_events').insert({
    referrer_waitlist_id: event.referrerWaitlistId ?? null,
    referrer_profile_id: event.referrerProfileId ?? null,
    referred_waitlist_id: event.referredWaitlistId ?? null,
    referred_profile_id: event.referredProfileId ?? null,
    referral_code: event.referralCode ?? null,
    event_type: event.eventType,
    metadata: event.metadata ?? {},
  });
}

export async function ensureWaitlistCohortReward(
  waitlistRecord: WaitlistLikeRecord,
  client?: ServiceClient,
) {
  const svc = getClient(client);
  if (!isWaitlistPersona(waitlistRecord.persona) || !isSupplySidePersona(waitlistRecord.persona)) {
    return;
  }

  const { data: existing } = await svc
    .from('reward_entitlements')
    .select('id')
    .eq('waitlist_id', waitlistRecord.id)
    .eq('reward_key', WAITLIST_REWARD_KEY)
    .maybeSingle();

  if (existing) {
    return;
  }

  await svc.from('reward_entitlements').insert({
    user_email: waitlistRecord.email,
    waitlist_id: waitlistRecord.id,
    reward_key: WAITLIST_REWARD_KEY,
    source_event: 'waitlist_joined',
    status: 'active',
    granted_at: new Date().toISOString(),
    expires_at: getLaunchRewardWindowEnd().toISOString(),
    metadata: {
      persona: waitlistRecord.persona,
      reward_copy: getWaitlistRewardCopy(waitlistRecord.persona),
      referral_code: waitlistRecord.referral_code,
    },
  });

  await recordReferralEvent(
    {
      referrerWaitlistId: waitlistRecord.id,
      referralCode: waitlistRecord.referral_code,
      eventType: 'reward_entitlement_granted',
      metadata: { reward_key: WAITLIST_REWARD_KEY },
    },
    svc,
  );
}

export async function ensureReferralMilestoneRewards(
  params: {
    userEmail: string;
    referralCount: number;
    referralCode?: string | null;
    waitlistId?: string | null;
    profileId?: string | null;
  },
  client?: ServiceClient,
) {
  const svc = getClient(client);
  const reachedMilestones = getReachedMilestones(params.referralCount);

  for (const milestone of reachedMilestones) {
    const existingQuery = svc
      .from('reward_entitlements')
      .select('id')
      .eq('reward_key', milestone.key)
      .eq('user_email', params.userEmail)
      .limit(1);

    const { data: existingRows } = await existingQuery;
    if (existingRows && existingRows.length > 0) {
      continue;
    }

    await svc.from('reward_entitlements').insert({
      user_email: params.userEmail,
      waitlist_id: params.waitlistId ?? null,
      profile_id: params.profileId ?? null,
      reward_key: milestone.key,
      source_event: 'referral_count_incremented',
      source_referral_count: milestone.count,
      status: 'active',
      granted_at: new Date().toISOString(),
      metadata: {
        reward_label: milestone.label,
        reward_description: milestone.description,
        referral_code: params.referralCode ?? null,
      },
    });
  }
}

export async function recomputeWaitlistRankings(client?: ServiceClient) {
  const svc = getClient(client);
  const { data: rows, error } = await svc
    .from('waitlist')
    .select('id, email, first_name, referral_code, referral_count, persona, poll_completion_count, subscribed_at')
    .eq('status', 'active');

  if (error || !rows) {
    throw error ?? new Error('Unable to load waitlist rows');
  }

  const rankedRows = rows
    .map((row) => {
      const persona = isWaitlistPersona(row.persona) ? row.persona : 'buyer_renter';
      return {
        ...row,
        persona,
        queue_score: computeQueueScore({
          persona,
          referralCount: row.referral_count ?? 0,
          pollCompletionCount: row.poll_completion_count ?? 0,
        }),
        candidate_role: getCandidateRoleFromPersona(persona),
        waitlist_reward_eligible: isSupplySidePersona(persona),
      };
    })
    .sort((left, right) => {
      if (right.queue_score !== left.queue_score) {
        return right.queue_score - left.queue_score;
      }
      const leftDate = left.subscribed_at ? new Date(left.subscribed_at).getTime() : 0;
      const rightDate = right.subscribed_at ? new Date(right.subscribed_at).getTime() : 0;
      return leftDate - rightDate;
    });

  for (const [index, row] of rankedRows.entries()) {
    const rank = index + 1;
    await svc
      .from('waitlist')
      .update({
        queue_score: row.queue_score,
        queue_rank: rank,
        candidate_role: row.candidate_role,
        waitlist_reward_eligible: row.waitlist_reward_eligible,
      })
      .eq('id', row.id);

    await svc.from('waitlist_rank_history').insert({
      waitlist_id: row.id,
      rank,
      score: row.queue_score,
      reason: 'recompute',
    });

    await ensureReferralMilestoneRewards(
      {
        userEmail: row.email,
        referralCount: row.referral_count ?? 0,
        referralCode: row.referral_code,
        waitlistId: row.id,
      },
      svc,
    );

    await ensureWaitlistCohortReward(
      {
        id: row.id,
        email: row.email,
        first_name: row.first_name,
        referral_code: row.referral_code,
        referral_count: row.referral_count,
        persona: row.persona,
        poll_completion_count: row.poll_completion_count,
        subscribed_at: row.subscribed_at,
      },
      svc,
    );
  }
}

export async function syncWaitlistContextToProfile(email: string, profileId: string, client?: ServiceClient) {
  const svc = getClient(client);
  const normalizedEmail = email.trim().toLowerCase();
  const { data: waitlistRow } = await svc
    .from('waitlist')
    .select('id, email, persona, referral_code, referral_count, queue_rank, queue_score, candidate_role, waitlist_reward_eligible')
    .eq('email', normalizedEmail)
    .maybeSingle();

  if (!waitlistRow) {
    return null;
  }

  const persona = isWaitlistPersona(waitlistRow.persona) ? waitlistRow.persona : 'buyer_renter';
  const candidateRole = getCandidateRoleFromPersona(persona);
  const launchRewardWindowEnd = isSupplySidePersona(persona)
    ? getLaunchRewardWindowEnd().toISOString()
    : null;

  await svc.from('profiles').update({
    waitlist_persona: persona,
    candidate_role: candidateRole,
    launch_reward_window_ends_at: launchRewardWindowEnd,
  }).eq('id', profileId);

  if (candidateRole !== 'user') {
    await svc.from('users').update({ role: candidateRole }).eq('id', profileId);
  }

  await svc
    .from('reward_entitlements')
    .update({ profile_id: profileId })
    .eq('user_email', normalizedEmail)
    .is('profile_id', null);

  await recordReferralEvent(
    {
      referredWaitlistId: waitlistRow.id,
      referredProfileId: profileId,
      referralCode: waitlistRow.referral_code,
      eventType: 'account_created_from_waitlist',
      metadata: {
        persona,
        candidate_role: candidateRole,
      },
    },
    svc,
  );

  return {
    persona,
    candidateRole,
    queueRank: waitlistRow.queue_rank,
    queueScore: waitlistRow.queue_score,
    referralCount: waitlistRow.referral_count,
    referralCode: waitlistRow.referral_code,
    shareUrl: waitlistRow.referral_code ? buildReferralShareUrl(waitlistRow.referral_code) : null,
  };
}

export async function getReferralSummaryForEmail(email: string, client?: ServiceClient) {
  const svc = getClient(client);
  const normalizedEmail = email.trim().toLowerCase();
  const { data: waitlistRow } = await svc
    .from('waitlist')
    .select('id, email, first_name, referral_code, referral_count, queue_rank, queue_score, persona')
    .eq('email', normalizedEmail)
    .maybeSingle();

  const { data: profileRow } = await svc
    .from('profiles')
    .select('id, full_name, referral_code, referral_count, waitlist_persona, candidate_role, launch_reward_window_ends_at')
    .eq('email', normalizedEmail)
    .maybeSingle();

  const referralCount = Math.max(waitlistRow?.referral_count ?? 0, profileRow?.referral_count ?? 0);
  const referralCode = profileRow?.referral_code ?? waitlistRow?.referral_code ?? null;
  const currentMilestone = getCurrentMilestone(referralCount);
  const nextMilestone = getNextMilestone(referralCount);
  const persona = isWaitlistPersona(profileRow?.waitlist_persona)
    ? profileRow.waitlist_persona
    : isWaitlistPersona(waitlistRow?.persona)
      ? waitlistRow.persona
      : null;

  const { data: entitlements } = await svc
    .from('reward_entitlements')
    .select('id, reward_key, status, granted_at, expires_at, metadata')
    .eq('user_email', normalizedEmail)
    .order('granted_at', { ascending: false });

  return {
    email: normalizedEmail,
    firstName: profileRow?.full_name?.split(' ')[0] ?? waitlistRow?.first_name ?? 'there',
    referralCode,
    referralCount,
    currentMilestone,
    nextMilestone,
    queueRank: waitlistRow?.queue_rank ?? null,
    queueScore: waitlistRow?.queue_score ?? null,
    persona,
    candidateRole: profileRow?.candidate_role ?? (persona ? getCandidateRoleFromPersona(persona) : 'user'),
    entitlements: entitlements ?? [],
    launchRewardWindowEndsAt: profileRow?.launch_reward_window_ends_at ?? null,
    shareUrl: referralCode ? buildReferralShareUrl(referralCode) : null,
  };
}

export async function redeemFirstListingWaiver(profileId: string, listingId: string, client?: ServiceClient) {
  const svc = getClient(client);
  const now = new Date().toISOString();
  const { data: entitlement } = await svc
    .from('reward_entitlements')
    .select('id, expires_at, status, profile_id')
    .eq('profile_id', profileId)
    .eq('reward_key', WAITLIST_REWARD_KEY)
    .eq('status', 'active')
    .order('granted_at', { ascending: true })
    .limit(1)
    .maybeSingle();

  if (!entitlement) {
    return { redeemed: false, reason: 'No active first-listing fee waiver found.' };
  }

  if (entitlement.expires_at && entitlement.expires_at < now) {
    await svc.from('reward_entitlements').update({ status: 'expired' }).eq('id', entitlement.id);
    return { redeemed: false, reason: 'The first-listing fee waiver has expired.' };
  }

  await svc.from('reward_entitlements').update({ status: 'redeemed' }).eq('id', entitlement.id);
  await svc.from('reward_redemptions').insert({
    entitlement_id: entitlement.id,
    profile_id: profileId,
    redemption_context: 'first_listing_fee_waiver',
    redemption_reference_id: listingId,
    redeemed_at: now,
    metadata: { listing_id: listingId },
  });

  await recordReferralEvent(
    {
      referredProfileId: profileId,
      eventType: 'first_listing_fee_waiver_redeemed',
      metadata: { listing_id: listingId, entitlement_id: entitlement.id },
    },
    svc,
  );

  return { redeemed: true, entitlementId: entitlement.id };
}