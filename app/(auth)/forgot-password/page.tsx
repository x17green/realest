"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
import { Mail, ArrowLeft } from "lucide-react";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

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

      // Redirect to OTP page for code entry
      router.push(`/otp?email=${encodeURIComponent(email)}&type=reset`);
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">
            Forgot Password?
          </CardTitle>
          <CardDescription>
            Enter your email address and we'll send you secure password reset
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
