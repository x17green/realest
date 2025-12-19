"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button, Card } from "@heroui/react";
import { createClient } from "@/lib/supabase/client";
import { CheckCircle, Shield, RefreshCw, AlertTriangle } from "lucide-react";

function OTPContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [email, setEmail] = useState("");
  const [otpType] = useState<"email">("email");
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Initialize from URL params
  useEffect(() => {
    const emailParam = searchParams.get("email");
    if (emailParam) setEmail(emailParam);

    if (!emailParam) {
      router.push("/login");
    }
  }, [searchParams, router]);

  // Countdown timer
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleOtpChange = (index: number, value: string) => {
    // Only allow digits
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError("");

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all fields are filled
    if (newOtp.every((digit) => digit !== "") && newOtp.join("").length === 6) {
      handleVerifyOtp(newOtp.join(""));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, "");

    if (pastedData.length === 6) {
      const newOtp = pastedData.split("");
      setOtp(newOtp);
      setError("");
      handleVerifyOtp(pastedData);
    }
  };

  const handleVerifyOtp = async (otpCode: string) => {
    setIsLoading(true);
    setError("");

    try {
      const supabase = createClient();
      const { error: verifyError } = await supabase.auth.verifyOtp({
        email: email,
        token: otpCode,
        type: "email",
      });

      if (verifyError) {
        setError(verifyError.message);
        // Clear OTP on error
        setOtp(["", "", "", "", "", ""]);
        inputRefs.current[0]?.focus();
        return;
      }

      setIsSuccess(true);

      // Get user profile to determine redirect
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("user_type")
          .eq("id", user.id)
          .single();

        setTimeout(() => {
          if (profile?.user_type === "property_owner") {
            router.push("/owner");
          } else if (profile?.user_type === "admin") {
            router.push("/admin");
          } else {
            router.push("/profile");
          }
          router.refresh();
        }, 2000);
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setIsResending(true);
    setError("");

    try {
      const supabase = createClient();
      const { error: resendError } = await supabase.auth.signInWithOtp({
        email: email,
      });

      if (resendError) {
        setError(resendError.message);
      } else {
        setTimeLeft(300); // Reset timer
        setOtp(["", "", "", "", "", ""]);
        inputRefs.current[0]?.focus();
      }
    } catch (err) {
      setError("Failed to resend OTP. Please try again.");
    } finally {
      setIsResending(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const otpCode = otp.join("");
    if (otpCode.length === 6) {
      handleVerifyOtp(otpCode);
    } else {
      setError("Please enter the complete 6-digit code.");
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <Card.Root className="w-full max-w-md">
          <Card.Header className="text-center">
            <div className="flex justify-center mb-4">
              <CheckCircle className="w-16 h-16 text-success" />
            </div>
            <Card.Title className="text-2xl font-bold">
              Verification Complete!
            </Card.Title>
            <Card.Description>
              You have been successfully authenticated
            </Card.Description>
          </Card.Header>

          <Card.Content className="space-y-6">
            <div className="text-center space-y-4">
              <div className="bg-success-50 border border-success-200 p-4 rounded-lg">
                <p className="text-sm text-success-700">
                  Welcome to RealEST! Redirecting you to your dashboard...
                </p>
              </div>

              <div className="flex justify-center">
                <RefreshCw className="w-5 h-5 text-primary animate-spin" />
              </div>
            </div>
          </Card.Content>
        </Card.Root>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card.Root className="w-full max-w-md">
        <Card.Header className="text-center">
          <div className="flex justify-center mb-4">
            <Shield className="w-12 h-12 text-primary" />
          </div>
          <Card.Title className="text-2xl font-bold">
            Verify Your Email
          </Card.Title>
          <Card.Description>
            Enter the 6-digit code sent to{" "}
            <span className="font-medium">{email}</span>
          </Card.Description>
        </Card.Header>

        <Card.Content className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* OTP Input */}
            <div className="space-y-4">
              <div className="flex justify-center gap-3" onPaste={handlePaste}>
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => { inputRefs.current[index] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className="w-12 h-12 text-center text-lg font-bold border border-border rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    disabled={isLoading}
                  />
                ))}
              </div>

              <div className="text-center text-sm text-muted-foreground">
                {timeLeft > 0 ? (
                  <>Code expires in {formatTime(timeLeft)}</>
                ) : (
                  <span className="text-danger flex items-center justify-center gap-1">
                    <AlertTriangle className="w-4 h-4" />
                    Code expired
                  </span>
                )}
              </div>
            </div>

            {error && (
              <div className="text-sm text-danger bg-danger-50 border border-danger-200 rounded-md p-3">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              className="w-full"
              isDisabled={isLoading || otp.join("").length !== 6}
            >
              {isLoading ? "Verifying..." : "Verify Code"}
            </Button>
          </form>

          {/* Resend Section */}
          <div className="text-center space-y-3">
            <div className="text-sm text-muted-foreground">
              Didn't receive the code?
            </div>

            <Button
              onClick={handleResendOtp}
              variant="ghost"
              size="sm"
              className="text-primary hover:bg-primary/10"
              isDisabled={isResending || timeLeft > 240} // Can resend after 1 minute
            >
              {isResending ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : timeLeft > 240 ? (
                `Resend in ${formatTime(timeLeft - 240)}`
              ) : (
                "Resend Code"
              )}
            </Button>

            <div className="pt-4 border-t border-border">
              <Link
                href="/login"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Back to Sign In
              </Link>
            </div>
          </div>
        </Card.Content>
      </Card.Root>
    </div>
  );
}

function OTPFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card.Root className="w-full max-w-md">
        <Card.Header className="text-center">
          <div className="flex justify-center mb-4">
            <RefreshCw className="w-12 h-12 text-primary animate-spin" />
          </div>
          <Card.Title className="text-2xl font-bold">
            Loading Verification
          </Card.Title>
          <Card.Description>
            Please wait while we prepare your OTP verification
          </Card.Description>
        </Card.Header>
      </Card.Root>
    </div>
  );
}

export default function OTPPage() {
  return (
    <Suspense fallback={<OTPFallback />}>
      <OTPContent />
    </Suspense>
  );
}
