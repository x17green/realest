"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  Button, 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent 
} from "@/components/ui";
import { Input } from "@/components/ui/input";
import { sendHybridPasswordReset } from "@/lib/auth";
import { Mail, ArrowLeft, CheckCircle } from "lucide-react";

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await sendHybridPasswordReset(email);

      if (!response.success) {
        setError(response.error || "Failed to send reset email");
        return;
      }

      setIsSuccess(true);
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <CheckCircle className="w-16 h-16 text-success" />
            </div>
            <CardTitle className="text-2xl font-bold">
              Check Your Email
            </CardTitle>
            <CardDescription>
              We've sent you password reset options
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center gap-2 text-muted-foreground">
                <Mail className="w-4 h-4" />
                <span className="text-sm">Password reset email sent to</span>
              </div>

              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm font-medium">{email}</p>
              </div>

              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm">
                  You have two options to reset your password:
                </p>
                <ul className="text-sm mt-2 space-y-1">
                  <li>• Enter the 6-digit code on our website</li>
                  <li>• Click the direct reset link in your email</li>
                </ul>
                <p className="text-sm mt-2 text-muted-foreground">
                  Both options expire in 15 minutes.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <Button asChild variant="default" className="w-full">
                <Link href="/login">Back to Sign In</Link>
              </Button>

              <button
                onClick={() => {
                  setIsSuccess(false);
                  setEmail("");
                }}
                className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Try a different email address
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">
            Forgot Password?
          </CardTitle>
          <CardDescription>
            Enter your email address and we'll send you secure password reset
            options
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError("");
                  }}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="text-sm text-danger bg-danger-50 border border-danger-200 rounded-md p-3">
                {error}
              </div>
            )}

            <Button
              type="submit"
              variant="default"
              className="w-full"
              disabled={isLoading || !email.trim()}
            >
              {isLoading ? "Sending Reset Options..." : "Send Reset Options"}
            </Button>
          </form>

          <div className="flex items-center gap-2 text-center">
            <ArrowLeft className="w-4 h-4" />
            <Link href="/login" className="text-sm font-medium hover:underline">
              Back to Sign In
            </Link>
          </div>

          <div className="text-center">
            <div className="text-sm">
              Don't have an account?{" "}
              <Link href="/register" className="font-medium hover:underline">
                Sign up
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
