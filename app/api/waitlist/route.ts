import { NextRequest, NextResponse, after } from 'next/server';
import { subscribeToWaitlist, checkEmailInWaitlist, getWaitlistStats, unsubscribeFromWaitlist, checkEmailWithPosition, getWaitlistPosition } from '@/lib/waitlist';
import type { WaitlistSubscriptionData } from '@/lib/waitlist';
import { sendWaitlistConfirmationEmail, sendWaitlistAdminNotification } from '@/lib/emailService';
import { syncWaitlistJoin, syncWaitlistUnsubscribe } from '@/lib/resend-audiences';
import { createServiceClient } from '@/lib/supabase/service';


// Rate limiting store (in production, use Redis or database)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// Rate limiting function
function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const limit = rateLimitStore.get(ip);

  if (!limit || now > limit.resetTime) {
    rateLimitStore.set(ip, { count: 1, resetTime: now + 60000 }); // 1 minute window
    return false;
  }

  if (limit.count >= 5) { // Max 5 requests per minute
    return true;
  }

  limit.count += 1;
  return false;
}

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Waitlist API POST called');

    // Get client IP for rate limiting
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';

    // Check rate limiting
    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { email, firstName, lastName, phone, source, ref } = body;

    console.log('📧 Received subscription data:', { email, firstName, lastName, phone, source });

    // Basic validation
    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    if (!firstName || typeof firstName !== 'string') {
      return NextResponse.json(
        { error: 'First name is required' },
        { status: 400 }
      );
    }

    // Prepare subscription data
    const subscriptionData: WaitlistSubscriptionData = {
      email: email.trim(),
      firstName: firstName.trim(),
      lastName: lastName?.trim() || undefined,
      phone: phone?.trim() || undefined,
      source: source || 'coming_soon_modal',
      referrerUrl: request.headers.get('referer') || undefined,
    };

    console.log('🔄 Attempting to subscribe:', subscriptionData.email);

    // Attempt to subscribe to waitlist using Supabase
    const result = await subscribeToWaitlist(subscriptionData);

    if (!result.success) {
      console.error('❌ Subscription failed:', result.error);
      return NextResponse.json(
        { error: result.error },
        { status: result.isExistingUser ? 200 : 400 }
      );
    }

    // Log successful subscription
    console.log(`New waitlist subscriber: ${subscriptionData.email} (${subscriptionData.firstName} ${subscriptionData.lastName || ''})`);

    // Get the user's position in the waitlist
    const positionData = await getWaitlistPosition(subscriptionData.email);

    console.log(`📊 Position data for ${subscriptionData.email}:`, positionData);

    // Add this after successful subscription in the POST function:
    if (result.success && result.data) {
      // Referral attribution — best-effort, never blocks the response
      const refCode = (typeof ref === 'string' ? ref.trim().toUpperCase() : '') || null;
      if (refCode && result.data.id) {
        after(async () => {
          try {
            const svc = createServiceClient();
            const { data: referrer } = await svc
              .from('waitlist')
              .select('id')
              .eq('referral_code', refCode)
              .neq('id', result.data!.id) // can't refer yourself
              .single();
            if (referrer) {
              await svc.from('waitlist').update({ referred_by: referrer.id }).eq('id', result.data!.id);
              await svc.rpc('increment_waitlist_referral_count', { p_id: referrer.id });
              console.log(`✅ Referral attributed: ${result.data!.id} ← ${referrer.id}`);
            }
          } catch (err) {
            console.error('❌ Referral attribution failed:', err);
          }
        });
      }

      // Use after() so email sending continues even after the response is returned.
      // In Vercel's serverless runtime, a fire-and-forget IIFE is killed as soon as
      // the response is sent — after() guarantees the work completes.
      after(async () => {
        try {
          await sendWaitlistConfirmationEmail({
            email: subscriptionData.email,
            firstName: subscriptionData.firstName,
            lastName: subscriptionData.lastName,
            position: positionData.position,
          });
        } catch (error) {
          console.error('❌ Email confirmation failed:', error);
        }

        // 600 ms gap — safely under the 2 req/sec Resend limit
        await new Promise(resolve => setTimeout(resolve, 600));

        try {
          await sendWaitlistAdminNotification({
            email: subscriptionData.email,
            firstName: subscriptionData.firstName,
            lastName: subscriptionData.lastName,
            position: positionData.position,
          });
        } catch (error) {
          console.error('❌ Admin notification failed:', error);
        }
      });

      // Sync contact to Resend Waitlist audience (fire-and-forget)
      syncWaitlistJoin(
        subscriptionData.email,
        subscriptionData.firstName,
        subscriptionData.lastName,
      ).catch(error => console.error('❌ Resend audience sync failed:', error));
    }

    return NextResponse.json(
      {
        message: 'Successfully added to waitlist!',
        email: subscriptionData.email,
        firstName: subscriptionData.firstName,
        lastName: subscriptionData.lastName,
        position: positionData.position || null,
        totalCount: positionData.totalCount || 0,
        ...(positionData.error && { positionError: positionData.error })
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('❌ Waitlist API error:', error);

    return NextResponse.json(
      {
        error: 'Internal server error. Please try again.',
        details: process.env.NODE_ENV === 'development' && error instanceof Error ? error.message : undefined
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    console.log('📋 Waitlist API GET called');

    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    const stats = searchParams.get('stats');

    // If email is provided, check if it exists in waitlist
    if (email) {
      const emailCheck = await checkEmailWithPosition(email);
      console.log(`🔍 Email check for ${email}: ${emailCheck.exists} ${emailCheck.position ? `(#${emailCheck.position})` : ''}`);

      return NextResponse.json({
        exists: emailCheck.exists,
        status: emailCheck.status,
        firstName: emailCheck.firstName,
        position: emailCheck.position,
        totalCount: emailCheck.totalCount
      });
    }

    // If stats requested, return waitlist statistics
    if (stats === 'true') {
      const waitlistStats = await getWaitlistStats();
      console.log('📊 Waitlist stats requested:', waitlistStats);

      return NextResponse.json({
        ...waitlistStats,
        message: 'Waitlist statistics from database'
      });
    }

    // Default response
    return NextResponse.json({
      message: 'Waitlist API is working!',
      mode: 'Supabase Database',
      timestamp: new Date().toISOString(),
      endpoints: {
        'POST /': 'Subscribe to waitlist',
        'GET /?email=user@example.com': 'Check if email exists',
        'GET /?stats=true': 'Get waitlist statistics',
        'DELETE /': 'Unsubscribe from waitlist'
      }
    });

  } catch (error) {
    console.error('❌ Waitlist GET API error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: process.env.NODE_ENV === 'development' && error instanceof Error ? error.message : undefined
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    console.log('🗑️  Waitlist API DELETE called');

    const body = await request.json();
    const { email } = body;

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Attempt to unsubscribe using Supabase
    const result = await unsubscribeFromWaitlist(email.trim());

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 404 }
      );
    }

    console.log(`✅ User unsubscribed from waitlist: ${email}`);

    // Sync unsubscribe to Resend Waitlist audience (fire-and-forget)
    syncWaitlistUnsubscribe(email.trim())
      .catch(error => console.error('❌ Resend audience unsubscribe sync failed:', error));

    return NextResponse.json(
      { message: 'Successfully unsubscribed from waitlist' },
      { status: 200 }
    );

  } catch (error) {
    console.error('❌ Waitlist DELETE error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: process.env.NODE_ENV === 'development' && error instanceof Error ? error.message : undefined
      },
      { status: 500 }
    );
  }
}
