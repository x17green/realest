/**
 * POST /api/auth/forgot-password
 *
 * Server-side password reset handler.
 * - Uses service role to look up the profile (avoids anon RLS block)
 * - Uses Supabase Admin generateLink for a real, signed recovery URL
 * - Always returns success to prevent user enumeration
 */
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createServiceClient } from "@/lib/supabase/service";

const schema = z.object({
  email: z.string().email("Invalid email address"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = schema.parse(body);

    const supabase = createServiceClient();

    // Look up profile for personalisation — service role bypasses RLS
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("email", email)
      .single();

    // If no profile exists, return success anyway (no user enumeration)
    if (!profile) {
      return NextResponse.json({ success: true });
    }

    const firstName = profile.full_name?.split(" ")[0] || "there";

    // Generate a real signed recovery link via the admin API
    const { data: linkData, error: linkError } =
      await supabase.auth.admin.generateLink({
        type: "recovery",
        email,
        options: {
          redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/reset-password`,
        },
      });

    if (linkError || !linkData?.properties?.action_link) {
      console.error("[ForgotPassword] generateLink error:", linkError);
      return NextResponse.json(
        { success: false, error: "Failed to generate reset link" },
        { status: 500 },
      );
    }

    const resetLink = linkData.properties.action_link;

    // Use last 6 chars of the hashed token as the display OTP code
    const hashed = linkData.properties.hashed_token ?? "";
    const otpCode = hashed.slice(-6).toUpperCase() || Math.floor(100000 + Math.random() * 900000).toString();

    // Send the branded password reset email
    const { sendHybridPasswordResetEmail } = await import("@/lib/emailService");
    const emailResult = await sendHybridPasswordResetEmail({
      email,
      firstName,
      otpCode,
      resetLink,
      expiryMinutes: 60,
    });

    if (!emailResult.success) {
      console.error("[ForgotPassword] Email send error:", emailResult.error);

      if (emailResult.quotaExceeded) {
        return NextResponse.json(
          { success: false, error: "Our email service is temporarily at capacity. Please try again in a few hours." },
          { status: 503 },
        );
      }

      return NextResponse.json(
        { success: false, error: "Failed to send reset email" },
        { status: 502 },
      );
    }

    console.log("[ForgotPassword] Reset email sent to", email, "— id:", emailResult.messageId);
    return NextResponse.json({ success: true });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: err.errors[0].message },
        { status: 400 },
      );
    }
    console.error("[ForgotPassword] Unexpected error:", err);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
