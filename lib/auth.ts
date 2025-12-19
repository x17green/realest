"use client";

import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

// Auth utility types
export interface AuthResponse {
  success: boolean;
  user?: User;
  error?: string;
}

export interface PasswordValidation {
  minLength: boolean;
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasNumber: boolean;
  hasSpecialChar: boolean;
}

export interface UserProfile {
  id: string;
  user_type: "buyer" | "property_owner" | "admin" | "agent";
  full_name: string;
  email: string;
  phone?: string;
  avatar_url?: string;
}

/**
 * Validate password strength
 */
export function validatePassword(password: string): PasswordValidation {
  return {
    minLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /\d/.test(password),
    hasSpecialChar: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
  };
}

/**
 * Check if password meets all requirements
 */
export function isPasswordValid(password: string): boolean {
  const validation = validatePassword(password);
  return Object.values(validation).every(Boolean);
}

/**
 * Get current authenticated user
 */
export async function getCurrentUser(): Promise<AuthResponse> {
  try {
    const supabase = createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, user: user || undefined };
  } catch (err) {
    return { success: false, error: "Failed to get current user" };
  }
}

/**
 * Get user profile with type information
 */
export async function getUserProfile(userId: string): Promise<{ success: boolean; profile?: UserProfile; error?: string }> {
  try {
    const supabase = createClient();
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, profile };
  } catch (err) {
    return { success: false, error: "Failed to get user profile" };
  }
}

/**
 * Sign in with email and password
 */
export async function signInWithPassword(email: string, password: string): Promise<AuthResponse> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, user: data.user };
  } catch (err) {
    return { success: false, error: "An unexpected error occurred" };
  }
}

/**
 * Sign up with email and password
 */
export async function signUpWithPassword(
  email: string,
  password: string,
  fullName: string,
  userType: "buyer" | "property_owner" | "agent"
): Promise<AuthResponse> {
  try {
    if (!isPasswordValid(password)) {
      return { success: false, error: "Password does not meet security requirements" };
    }

    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          user_type: userType,
        },
      },
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, user: data.user || undefined };
  } catch (err) {
    return { success: false, error: "An unexpected error occurred" };
  }
}

/**
 * Sign up as a real estate agent
 */
export async function signUpWithAgent(
  email: string,
  password: string,
  fullName: string,
  licenseNumber: string,
  agencyName: string,
  specialization: string[]
): Promise<AuthResponse> {
  try {
    if (!isPasswordValid(password)) {
      return { success: false, error: "Password does not meet security requirements" };
    }

    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          user_type: "agent",
        },
      },
    });

    if (error) {
      return { success: false, error: error.message };
    }

    if (data.user) {
      try {
        // Create agents table record after profile is auto-created
        const { error: agentError } = await supabase.from("agents").insert({
          profile_id: data.user.id,
          license_number: licenseNumber,
          agency_name: agencyName,
          specialization: specialization,
          verified: false,
          rating: null,
        });

        if (agentError) {
          console.error("Failed to create agent record:", agentError);
          // Don't return error here - user account is already created
          // Admin can fix this later
        }
      } catch (err) {
        console.error("Error creating agent record:", err);
        // Continue - user can still onboard
      }
    }

    return { success: true, user: data.user || undefined };
  } catch (err) {
    return { success: false, error: "An unexpected error occurred" };
  }
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(email: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    return { success: false, error: "Failed to send reset email" };
  }
}

/**
 * Reset password with new password
 */
export async function resetPassword(newPassword: string): Promise<{ success: boolean; error?: string }> {
  try {
    if (!isPasswordValid(newPassword)) {
      return { success: false, error: "Password does not meet security requirements" };
    }

    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    return { success: false, error: "Failed to reset password" };
  }
}

/**
 * Sign out current user
 */
export async function signOut(): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createClient();
    const { error } = await supabase.auth.signOut();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    return { success: false, error: "Failed to sign out" };
  }
}

/**
 * Send OTP for email verification
 */
export async function sendOTP(email: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: false,
      },
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    return { success: false, error: "Failed to send OTP" };
  }
}

/**
 * Verify OTP code
 */
export async function verifyOTP(email: string, token: string): Promise<AuthResponse> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: "email",
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, user: data.user || undefined };
  } catch (err) {
    return { success: false, error: "Failed to verify OTP" };
  }
}

/**
 * Resend email verification
 */
export async function resendEmailVerification(email: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createClient();
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    return { success: false, error: "Failed to resend verification email" };
  }
}

/**
 * Get redirect URL based on user type
 */
export function getRedirectUrl(userType?: string): string {
  switch (userType) {
    case "property_owner":
      return "/owner";
    case "admin":
      return "/admin";
    case "buyer":
    default:
      return "/profile";
  }
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const { success, user } = await getCurrentUser();
  return success && !!user;
}

/**
 * Check if user has specific role
 */
export async function hasRole(requiredRole: "buyer" | "property_owner" | "admin"): Promise<boolean> {
  try {
    const { success, user } = await getCurrentUser();
    if (!success || !user) return false;

    const { success: profileSuccess, profile } = await getUserProfile(user.id);
    if (!profileSuccess || !profile) return false;

    return profile.user_type === requiredRole;
  } catch {
    return false;
  }
}

/**
 * Format auth error messages for better UX
 */
export function formatAuthError(error: string): string {
  const errorMappings: Record<string, string> = {
    "Invalid login credentials": "The email or password you entered is incorrect. Please try again.",
    "Email not confirmed": "Please check your email and click the verification link before signing in.",
    "Too many requests": "Too many login attempts. Please wait a few minutes before trying again.",
    "User not found": "No account found with this email address. Please check your email or sign up.",
    "Invalid email": "Please enter a valid email address.",
    "Password is too short": "Password must be at least 8 characters long.",
    "Signup is disabled": "New user registration is currently disabled. Please contact support.",
    "Email already registered": "An account with this email already exists. Please sign in instead.",
  };

  return errorMappings[error] || error;
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Generate secure session timeout
 */
export function getSessionTimeout(): number {
  // 24 hours in seconds
  return 24 * 60 * 60;
}
