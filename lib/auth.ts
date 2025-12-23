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
  user_type: "user" | "owner" | "agent" | "admin";
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
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

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
export async function getUserProfile(
  userId: string,
): Promise<{ success: boolean; profile?: UserProfile; error?: string }> {
  try {
    const supabase = createClient();
    // Get role from user_roles
    const { data: userRole, error: roleError } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .single();

    if (roleError) {
      return { success: false, error: roleError.message };
    }

    // Get profile data if exists
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    const profileData: UserProfile = {
      id: userId,
      user_type: userRole.role,
      full_name: profile?.full_name || "",
      email: profile?.email || "",
      phone: profile?.phone,
      avatar_url: profile?.avatar_url,
    };

    return { success: true, profile: profileData };
  } catch (err) {
    return { success: false, error: "Failed to get user profile" };
  }
}

/**
 * Sign in with email and password
 */
export async function signInWithPassword(
  email: string,
  password: string,
): Promise<AuthResponse> {
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
  fullName?: string,
  userType?: "user" | "owner" | "agent",
): Promise<AuthResponse> {
  try {
    if (!isPasswordValid(password)) {
      return {
        success: false,
        error: `Weak password: \n
        Use at least 8 characters, including uppercase, lowercase, number, and special character.`,
      };
    }

    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName || "",
          user_type: userType || "user",
        },
      },
    });

    if (error) {
      return { success: false, error: error.message };
    }

    // Insert into user_roles table
    if (data.user) {
      const { error: roleError } = await supabase.from("user_roles").insert({
        user_id: data.user.id,
        role: userType || "user",
      });

      if (roleError) {
        console.error("Failed to create user role:", roleError);
        // Don't fail signup, but log error
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
export async function sendPasswordResetEmail(
  email: string,
): Promise<{ success: boolean; error?: string }> {
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
export async function resetPassword(
  newPassword: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!isPasswordValid(newPassword)) {
      return {
        success: false,
        error: "Password does not meet security requirements",
      };
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
export async function sendOTP(
  email: string,
): Promise<{ success: boolean; error?: string }> {
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
export async function verifyOTP(
  email: string,
  token: string,
): Promise<AuthResponse> {
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
export async function resendEmailVerification(
  email: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createClient();
    const { error } = await supabase.auth.resend({
      type: "signup",
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
    case "owner":
      return "/profile-setup";
    case "agent":
      return "/agent-onboarding";
    case "admin":
      return "/admin";
    case "user":
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
export async function hasRole(
  requiredRole: "user" | "owner" | "agent" | "admin",
): Promise<boolean> {
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
    "Invalid login credentials":
      "The email or password you entered is incorrect. Please try again.",
    "Email not confirmed":
      "Please check your email and click the verification link before signing in.",
    "Too many requests":
      "Too many login attempts. Please wait a few minutes before trying again.",
    "User not found":
      "No account found with this email address. Please check your email or sign up.",
    "Invalid email": "Please enter a valid email address.",
    "Password is too short": "Password must be at least 8 characters long.",
    "Signup is disabled":
      "New user registration is currently disabled. Please contact support.",
    "Email already registered":
      "An account with this email already exists. Please sign in instead.",
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
 * Handle password reset session initialization from URL parameters
 */
export async function handlePasswordResetSession(
  searchParams: URLSearchParams,
): Promise<{
  success: boolean;
  error?: string;
  redirectTo?: string;
  redirectDelay?: number;
}> {
  try {
    const accessToken = searchParams.get("access_token");
    const refreshToken = searchParams.get("refresh_token");
    const code = searchParams.get("code");
    const error = searchParams.get("error");
    const errorDescription = searchParams.get("error_description");

    console.log("Reset password params:", {
      accessToken,
      refreshToken,
      code,
      error,
    });

    // Handle error responses from Supabase
    if (error) {
      console.error("Auth error:", error, errorDescription);
      return {
        success: false,
        error:
          errorDescription ||
          "Invalid reset link. Please request a new password reset.",
        redirectTo: "/forgot-password",
        redirectDelay: 5000,
      };
    }

    // Check for PKCE code parameter (modern Supabase flow)
    if (code) {
      try {
        const supabase = createClient();
        const { data, error: exchangeError } =
          await supabase.auth.exchangeCodeForSession(code);

        if (exchangeError) {
          console.error("Code exchange error:", exchangeError);
          return {
            success: false,
            error:
              "Invalid or expired reset link. Please request a new password reset.",
            redirectTo: "/forgot-password",
            redirectDelay: 5000,
          };
        } else if (data.session) {
          console.log("Successfully exchanged code for session");
          return { success: true };
        }
      } catch (err) {
        console.error("Error exchanging code:", err);
        return {
          success: false,
          error: "Failed to initialize password reset. Please try again.",
          redirectTo: "/forgot-password",
          redirectDelay: 3000,
        };
      }
      return { success: false };
    }

    // Legacy flow: If we have access token and refresh token, set the session
    if (accessToken && refreshToken) {
      try {
        const supabase = createClient();
        const { error: sessionError } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });

        if (sessionError) {
          console.error("Session error:", sessionError);
          return {
            success: false,
            error:
              "Invalid or expired reset link. Please request a new password reset.",
            redirectTo: "/forgot-password",
            redirectDelay: 5000,
          };
        } else {
          // Successfully set session
          return { success: true };
        }
      } catch (err) {
        console.error("Error setting session:", err);
        return {
          success: false,
          error: "Failed to initialize password reset. Please try again.",
          redirectTo: "/forgot-password",
          redirectDelay: 3000,
        };
      }
    }

    // If no tokens or code, redirect to forgot password
    return {
      success: false,
      error:
        "No reset token found. Please check your email link or request a new password reset.",
      redirectTo: "/forgot-password",
      redirectDelay: 3000,
    };
  } catch (err) {
    console.error("Unexpected error in handlePasswordResetSession:", err);
    return {
      success: false,
      error: "An unexpected error occurred. Please try again.",
      redirectTo: "/forgot-password",
      redirectDelay: 3000,
    };
  }
}

/**
 * Generate secure session timeout
 */
export function getSessionTimeout(): number {
  // 24 hours in seconds
  return 24 * 60 * 60;
}
