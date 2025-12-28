"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { 
  Button, 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent 
} from "@/components/ui";
import {
  getCurrentUser,
  resendEmailVerification,
  verifyEmail,
} from "@/lib/auth";
import { CheckCircle, Mail, AlertCircle, RefreshCw } from "lucide-react";

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [isResending, setIsResending] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<
    "verifying" | "success" | "error" | "expired"
  >("verifying");
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    const handleEmailVerification = async () => {
      try {
        // Get current user
        const userResponse = await getCurrentUser();
        if (userResponse.success && userResponse.user?.email) {
          setEmail(userResponse.user.email);
        }

        // Check for verification tokens in URL
        const accessToken = searchParams.get("access_token");
        const refreshToken = searchParams.get("refresh_token");
        const type = searchParams.get("type");

        if (accessToken && refreshToken && type === "email") {
          // Verify the email using centralized function
          const verifyResponse = await verifyEmail(accessToken);

          if (!verifyResponse.success) {
            if (verifyResponse.error?.includes("expired")) {
              setVerificationStatus("expired");
            } else {
              setVerificationStatus("error");
              setError(verifyResponse.error || "Email verification failed");
            }
          } else {
            setVerificationStatus("success");

            // Redirect to login after successful verification
            setTimeout(() => {
              router.push("/login?verified=true");
            }, 3000);
          }
        } else {
          // No verification tokens, show manual resend option
          if (userResponse.success && userResponse.user?.email_confirmed_at) {
            setVerificationStatus("success");
          } else {
            setVerificationStatus("error");
            setError(
              "No verification token found. Please check your email or resend verification.",
            );
          }
        }
      } catch (err) {
        setVerificationStatus("error");
        setError("An unexpected error occurred during verification.");
      } finally {
        setIsLoading(false);
      }
    };

    handleEmailVerification();
  }, [searchParams, router]);

  const handleResendVerification = async () => {
    if (!email) {
      setError("No email address found. Please sign up again.");
      return;
    }

    setIsResending(true);
    setError("");

    try {
      const resendResponse = await resendEmailVerification(email);

      if (!resendResponse.success) {
        setError(resendResponse.error || "Failed to resend verification email");
      } else {
        // Show success message
        setError("");
        alert("Verification email sent! Please check your inbox.");
      }
    } catch (err) {
      setError("Failed to resend verification email. Please try again.");
    } finally {
      setIsResending(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <RefreshCw className="w-12 h-12 text-primary animate-spin" />
            </div>
            <CardTitle className="text-2xl font-bold">
              Verifying Your Email
            </CardTitle>
            <CardDescription>
              Please wait while we verify your email address
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (verificationStatus === "success") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <CheckCircle className="w-16 h-16 text-success" />
            </div>
            <CardTitle className="text-2xl font-bold">
              Email Verified!
            </CardTitle>
            <CardDescription>
              Your email has been successfully verified
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="text-center space-y-4">
              <div className="bg-success-50 border border-success-200 p-4 rounded-lg">
                <p className="text-sm text-success-700">
                  Welcome to RealEST! Your account is now active and you can
                  access all features.
                </p>
              </div>

              <p className="text-sm text-muted-foreground">
                Redirecting to sign in page...
              </p>
            </div>

            <div className="space-y-3">
              <Button asChild variant="default" className="w-full">
                <Link href="/login">Continue to Sign In</Link>
              </Button>

              <div className="text-center">
                <Link
                  href="/"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Back to Homepage
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (verificationStatus === "expired") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <AlertCircle className="w-12 h-12 text-warning" />
            </div>
            <CardTitle className="text-2xl font-bold">Link Expired</CardTitle>
            <CardDescription>
              Your verification link has expired
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="text-center space-y-4">
              <div className="bg-warning-50 border border-warning-200 p-4 rounded-lg">
                <p className="text-sm text-warning-700">
                  The verification link you clicked has expired. Please request
                  a new one to verify your email.
                </p>
              </div>

              {email && (
                <div className="bg-muted p-3 rounded-lg">
                  <p className="text-sm">
                    <span className="text-muted-foreground">Email:</span>{" "}
                    <span className="font-medium">{email}</span>
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <Button
                onClick={handleResendVerification}
                variant="default"
                className="w-full"
                disabled={isResending || !email}
              >
                {isResending ? "Sending..." : "Resend Verification Email"}
              </Button>

              <div className="text-center space-y-2">
                <Link
                  href="/register"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Sign up with different email
                </Link>
                <br />
                <Link
                  href="/login"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Back to Sign In
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <AlertCircle className="w-12 h-12 text-danger" />
          </div>
          <CardTitle className="text-2xl font-bold">
            Verification Failed
          </CardTitle>
          <CardDescription>
            There was a problem verifying your email
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {error && (
            <div className="text-sm text-danger bg-danger-50 border border-danger-200 rounded-md p-3">
              {error}
            </div>
          )}

          {email && (
            <div className="text-center space-y-4">
              <div className="bg-muted p-3 rounded-lg">
                <p className="text-sm">
                  <span className="text-muted-foreground">Email:</span>{" "}
                  <span className="font-medium">{email}</span>
                </p>
              </div>
            </div>
          )}

          <div className="space-y-3">
            {email && (
              <Button
                onClick={handleResendVerification}
                variant="default"
                className="w-full"
                disabled={isResending}
              >
                {isResending ? "Sending..." : "Resend Verification Email"}
              </Button>
            )}

            <div className="text-center space-y-2">
              <Link
                href="/register"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Sign up again
              </Link>
              <br />
              <Link
                href="/login"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Back to Sign In
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function VerifyEmailFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <RefreshCw className="w-12 h-12 text-primary animate-spin" />
          </div>
          <CardTitle className="text-2xl font-bold">
            Loading Verification
          </CardTitle>
          <CardDescription>
            Please wait while we prepare your email verification
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<VerifyEmailFallback />}>
      <VerifyEmailContent />
    </Suspense>
  );
}
