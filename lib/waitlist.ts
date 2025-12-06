import { createClient } from '@/lib/supabase/client';
import type { Database } from '@/lib/supabase/types';

type WaitlistEntry = Database['public']['Tables']['waitlist']['Row'];
type WaitlistInsert = Database['public']['Tables']['waitlist']['Insert'];
type WaitlistUpdate = Database['public']['Tables']['waitlist']['Update'];

export interface WaitlistSubscriptionData {
  email: string;
  firstName: string;
  lastName?: string;
  phone?: string;
  source?: string;
  interests?: string[];
  locationPreference?: string;
  propertyTypePreference?: string;
  budgetRange?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  referrerUrl?: string;
}

export interface WaitlistSubscriptionResult {
  success: boolean;
  data?: WaitlistEntry;
  error?: string;
  isExistingUser?: boolean;
}

/**
 * Subscribe a user to the waitlist
 */
export async function subscribeToWaitlist(
  data: WaitlistSubscriptionData
): Promise<WaitlistSubscriptionResult> {
  try {
    const supabase = createClient();

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      return {
        success: false,
        error: 'Please enter a valid email address'
      };
    }

    // Check if email already exists
    const { data: existingEntry, error: checkError } = await supabase
      .from('waitlist')
      .select('email, status, first_name')
      .eq('email', data.email.toLowerCase())
      .maybeSingle() as { data: any | null; error: any };

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Error checking existing waitlist entry:', checkError);
      return {
        success: false,
        error: 'Unable to process your request. Please try again.'
      };
    }

    if (existingEntry) {
      if (existingEntry.status === 'active') {
        return {
          success: false,
          error: `${existingEntry.first_name || 'You'} are already on our waitlist! We'll notify you when we launch.`,
          isExistingUser: true
        };
      } else if (existingEntry.status === 'unsubscribed') {
        // Reactivate unsubscribed user
        const updateData: WaitlistUpdate = {
          status: 'active',
          first_name: data.firstName,
          last_name: data.lastName || null,
          phone: data.phone || null,
          subscribed_at: new Date().toISOString(),
          unsubscribed_at: null,
          updated_at: new Date().toISOString()
        };

        const { data: reactivatedUser, error: reactivateError } = await supabase
          .from('waitlist')
          .update(updateData as any)
          .eq('email', data.email.toLowerCase())
          .select()
          .single();

        if (reactivateError) {
          console.error('Error reactivating user:', reactivateError);
          return {
            success: false,
            error: 'Unable to process your request. Please try again.'
          };
        }

        return {
          success: true,
          data: reactivatedUser
        };
      }
    }

    // Get browser info for tracking (if available)
    const userAgent = typeof window !== 'undefined' ? navigator.userAgent : null;
    const referrerUrl = typeof window !== 'undefined' ? document.referrer : null;

    // Create new waitlist entry
    const insertData: WaitlistInsert = {
      email: data.email.toLowerCase(),
      first_name: data.firstName,
      last_name: data.lastName || null,
      phone: data.phone || null,
      source: data.source || 'website',
      status: 'active',
      interests: data.interests || null,
      location_preference: data.locationPreference || null,
      property_type_preference: data.propertyTypePreference || null,
      budget_range: data.budgetRange || null,
      subscribed_at: new Date().toISOString(),
      utm_source: data.utmSource || null,
      utm_medium: data.utmMedium || null,
      utm_campaign: data.utmCampaign || null,
      referrer_url: data.referrerUrl || referrerUrl,
      user_agent: userAgent,
      contact_count: 0
    };

    const { data: newEntry, error: insertError } = await supabase
      .from('waitlist')
      .insert(insertData as any)
      .select()
      .single();

    if (insertError) {
      console.error('Error inserting waitlist entry:', insertError);
      return {
        success: false,
        error: 'Unable to add you to the waitlist. Please try again.'
      };
    }

    return {
      success: true,
      data: newEntry
    };

  } catch (error) {
    console.error('Unexpected error in subscribeToWaitlist:', error);
    return {
      success: false,
      error: 'An unexpected error occurred. Please try again.'
    };
  }
}

/**
 * Unsubscribe a user from the waitlist
 */
export async function unsubscribeFromWaitlist(email: string): Promise<WaitlistSubscriptionResult> {
  try {
    const supabase = createClient();

    const { data, error } = await supabase.rpc('unsubscribe_from_waitlist', {
      user_email: email.toLowerCase()
    });

    if (error) {
      console.error('Error unsubscribing from waitlist:', error);
      return {
        success: false,
        error: 'Unable to unsubscribe. Please try again or contact support.'
      };
    }

    if (!data) {
      return {
        success: false,
        error: 'Email not found in our waitlist.'
      };
    }

    return {
      success: true
    };

  } catch (error) {
    console.error('Unexpected error in unsubscribeFromWaitlist:', error);
    return {
      success: false,
      error: 'An unexpected error occurred. Please try again.'
    };
  }
}

/**
 * Get waitlist statistics (for admin use)
 */
export async function getWaitlistStats() {
  try {
    const supabase = createClient();

    const [
      { count: totalCount },
      { count: activeCount },
      { count: todayCount }
    ] = await Promise.all([
      supabase.from('waitlist').select('*', { count: 'exact', head: true }),
      supabase.from('waitlist').select('*', { count: 'exact', head: true }).eq('status', 'active'),
      supabase
        .from('waitlist')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', new Date().toISOString().split('T')[0]) // Today
    ]);

    return {
      total: totalCount || 0,
      active: activeCount || 0,
      todaySignups: todayCount || 0
    };

  } catch (error) {
    console.error('Error fetching waitlist stats:', error);
    return {
      total: 0,
      active: 0,
      todaySignups: 0
    };
  }
}

/**
 * Get recent waitlist entries (for admin use)
 */
export async function getRecentWaitlistEntries(limit: number = 10) {
  try {
    const supabase = createClient();

    const { data, error } = await supabase
      .from('active_waitlist')
      .select('*')
      .limit(limit);

    if (error) {
      console.error('Error fetching recent waitlist entries:', error);
      return [];
    }

    return data || [];

  } catch (error) {
    console.error('Unexpected error in getRecentWaitlistEntries:', error);
    return [];
  }
}

/**
 * Check if an email is already in the waitlist
 */
export async function checkEmailInWaitlist(email: string): Promise<{
  exists: boolean;
  status?: 'active' | 'unsubscribed' | 'bounced';
  firstName?: string;
}> {
  try {
    const supabase = createClient();

    const { data, error } = await supabase
      .from('waitlist')
      .select('status, first_name')
      .eq('email', email.toLowerCase())
      .maybeSingle() as { data: any | null; error: any };

    if (error && error.code !== 'PGRST116') {
      console.error('Error checking email in waitlist:', error);
      return { exists: false };
    }

    if (!data) {
      return { exists: false };
    }

    return {
      exists: true,
      status: data.status as 'active' | 'unsubscribed' | 'bounced',
      firstName: data.first_name
    };

  } catch (error) {
    console.error('Unexpected error in checkEmailInWaitlist:', error);
    return { exists: false };
  }
}

/**
 * Get user's position in the waitlist
 */
export async function getWaitlistPosition(email: string): Promise<{
  position?: number;
  totalCount: number;
  error?: string;
}> {
  try {
    const supabase = createClient();

    // Get all active waitlist entries ordered by subscription date
    const { data: allEntries, error } = await supabase
      .from('waitlist')
      .select('email, subscribed_at')
      .eq('status', 'active')
      .order('subscribed_at', { ascending: true });

    if (error) {
      console.error('Error fetching waitlist positions:', error);
      return { totalCount: 0, error: 'Unable to fetch position data' };
    }

    const totalCount = allEntries?.length || 0;
    const userIndex = allEntries?.findIndex(entry => entry.email.toLowerCase() === email.toLowerCase());

    if (userIndex === -1 || userIndex === undefined) {
      return { totalCount, error: 'User not found in waitlist' };
    }

    return {
      position: userIndex + 1, // Convert 0-based index to 1-based position
      totalCount
    };

  } catch (error) {
    console.error('Unexpected error in getWaitlistPosition:', error);
    return { totalCount: 0, error: 'Unexpected error occurred' };
  }
}

/**
 * Enhanced email check with position data
 */
export async function checkEmailWithPosition(email: string): Promise<{
  exists: boolean;
  status?: 'active' | 'unsubscribed' | 'bounced';
  firstName?: string;
  position?: number;
  totalCount?: number;
}> {
  try {
    const supabase = createClient();

    const { data, error } = await supabase
      .from('waitlist')
      .select('status, first_name, subscribed_at')
      .eq('email', email.toLowerCase())
      .maybeSingle() as { data: any | null; error: any };

    if (error && error.code !== 'PGRST116') {
      console.error('Error checking email in waitlist:', error);
      return { exists: false };
    }

    if (!data) {
      return { exists: false };
    }

    // If user exists and is active, get their position
    let position, totalCount;
    if (data.status === 'active') {
      const positionData = await getWaitlistPosition(email);
      position = positionData.position;
      totalCount = positionData.totalCount;
    }

    return {
      exists: true,
      status: data.status as 'active' | 'unsubscribed' | 'bounced',
      firstName: data.first_name,
      position,
      totalCount
    };

  } catch (error) {
    console.error('Unexpected error in checkEmailWithPosition:', error);
    return { exists: false };
  }
}

/**
 * Extract UTM parameters from URL (client-side only)
 */
export function extractUtmParams(): {
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
} {
  if (typeof window === 'undefined') {
    return {};
  }

  const urlParams = new URLSearchParams(window.location.search);

  return {
    utmSource: urlParams.get('utm_source') || undefined,
    utmMedium: urlParams.get('utm_medium') || undefined,
    utmCampaign: urlParams.get('utm_campaign') || undefined
  };
}
