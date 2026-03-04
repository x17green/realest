"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui";
import { Input } from "@/components/ui/input";
import { sendHybridPasswordReset } from "@/lib/auth";
import { Mail, ArrowLeft, AlertCircle, CheckCircle, Loader2 } from "lucide-react";

// ── Email validation state ─────────────────────────────────────────────────────

type EmailStatus = "idle" | "checking" | "found" | "not_found" | "invalid";

function useEmailExists(email: string): EmailStatus {
  const [status, setStatus] = useState<EmailStatus>("idle");

  useEffect(() => {
    const trimmed = email.trim();

    // Reset when field is empty
    if (!trimmed) {
      setStatus("idle");
      return;
    }

    // Basic format check first — no fetch yet
    const isFormatValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
    if (!isFormatValid) {
      setStatus("invalid");
      return;
    }

    setStatus("checking");

    const controller = new AbortController();
    const timeoutId = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/auth/forgot-password?email=${encodeURIComponent(trimmed)}`,
          { signal: controller.signal },
        );
        const data = await res.json();
        setStatus(data.exists ? "found" : "not_found");
      } catch {
        // AbortError or network glitch — don't block the user
        setStatus("found");
      }
    }, 500);

    return () => {
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, [email]);

  return status;
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [submitError, setSubmitError] = useState("");

  const emailStatus = useEmailExists(email);

  const canSubmit =
    emailStatus === "found" && !isLoading;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    setIsLoading(true);
    setSubmitError("");

    try {
      const response = await sendHybridPasswordReset(email);

      if (!response.success) {
        setSubmitError(response.error || "Failed to send reset email");
        return;
      }

      // Redirect to OTP page for code entry
      router.push(`/otp?email=${encodeURIComponent(email)}&type=reset`);
    } catch {
      setSubmitError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // ── Inline feedback below the input ──────────────────────────────────────

  const inputFeedback = () => {
    switch (emailStatus) {
      case "checking":
        return (
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1.5">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            Checking…
          </p>
        );
      case "found":
        return (
          <p className="flex items-center gap-1.5 text-xs text-green-600 dark:text-green-400 mt-1.5">
            <CheckCircle className="w-3.5 h-3.5" />
            Account found — you can continue
          </p>
        );
      case "not_found":
        return (
          <div className="flex items-start gap-2 mt-2 p-3 rounded-lg bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800">
            <AlertCircle className="w-4 h-4 text-orange-600 dark:text-orange-400 mt-0.5 shrink-0" />
            <div className="text-xs text-orange-800 dark:text-orange-200">
              <p className="font-medium">No account found</p>
              <p className="text-orange-700 dark:text-orange-300 mt-0.5">
                This email isn't registered.{" "}
                <Link href="/register" className="underline font-medium">
                  Sign up instead?
                </Link>
              </p>
            </div>
          </div>
        );
      case "invalid":
        return (
          <p className="flex items-center gap-1.5 text-xs text-destructive mt-1.5">
            <AlertCircle className="w-3.5 h-3.5" />
            Enter a valid email address
          </p>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Forgot Password?</CardTitle>
          <CardDescription>
            Enter your email address and we'll send you a secure password reset
            code
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (submitError) setSubmitError("");
                  }}
                  className="pl-10"
                  required
                  autoFocus
                />
              </div>
              {inputFeedback()}
            </div>

            {submitError && (
              <div className="text-sm text-danger bg-danger-50 border border-danger-200 rounded-md p-3 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {submitError}
              </div>
            )}

            <Button
              type="submit"
              variant="default"
              className="w-full"
              disabled={!canSubmit}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sending Reset Code…
                </>
              ) : (
                "Send Reset Code"
              )}
            </Button>
          </form>

          <div className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            <Link href="/login" className="text-sm font-medium hover:underline">
              Back to Sign In
            </Link>
          </div>

          <div className="text-center text-sm">
            Don't have an account?{" "}
            <Link href="/register" className="font-medium hover:underline">
              Sign up
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}