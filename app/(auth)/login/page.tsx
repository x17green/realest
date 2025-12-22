"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button, Input, Card } from "@heroui/react";
import { createClient } from "@/lib/supabase/client";
import { Eye, EyeOff, Mail, Lock, CheckCircle } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    const verified = searchParams.get("verified");
    const reset = searchParams.get("reset");

    if (verified === "true") {
      setSuccessMessage("Your email has been verified! You can now sign in.");
    } else if (reset === "true") {
      setSuccessMessage(
        "Your password has been reset successfully. Please sign in with your new password.",
      );
    }
  }, [searchParams]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (error) setError("");
    if (successMessage) setSuccessMessage("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const supabase = createClient();
      const { data, error: authError } = await supabase.auth.signInWithPassword(
        {
          email: formData.email,
          password: formData.password,
        },
      );

      if (authError) {
        setError(authError.message);
        return;
      }

      if (data.user) {
        // Get user profile to determine redirect
        const { data: profile } = await supabase
          .from("profiles")
          .select("user_type")
          .eq("id", data.user.id)
          .single();

        if (profile?.user_type === "owner") {
          router.push("/owner");
        } else if (profile?.user_type === "admin") {
          router.push("/admin");
        } else if (profile?.user_type === "agent") {
          router.push("/agent");
        } else {
          router.push("/profile");
        }
        router.refresh();
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card.Root className="w-full max-w-md">
        <Card.Header className="text-center">
          <Card.Title className="text-2xl font-bold">Welcome Back</Card.Title>
          <Card.Description>Sign in to your RealEST account</Card.Description>
        </Card.Header>

        <Card.Content className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(e) =>
                    handleInputChange("password", e.target.value)
                  }
                  className="pl-10 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {successMessage && (
              <div className="text-sm text-success bg-success-50 border border-success-200 rounded-md p-3 flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                {successMessage}
              </div>
            )}

            {error && (
              <div className="text-sm text-danger bg-danger-50 border border-danger-200 rounded-md p-3">
                {error}
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              className="w-full"
              isDisabled={isLoading}
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <div className="text-center space-y-2">
            <div className="text-sm text-muted-foreground">
              <Link href="/forgot-password" className="hover:underline">
                Forgot your password?
              </Link>
            </div>
            <div className="text-sm">
              Don't have an account?{" "}
              <Link href="/register" className="font-medium">
                Sign up
              </Link>
            </div>
          </div>
        </Card.Content>
      </Card.Root>
    </div>
  );
}

function LoginPageFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card.Root className="w-full max-w-md">
        <Card.Header className="text-center">
          <Card.Title className="text-2xl font-bold">Welcome Back</Card.Title>
          <Card.Description>Sign in to your RealEST account</Card.Description>
        </Card.Header>
        <Card.Content className="flex items-center justify-center py-8">
          <div className="text-muted-foreground">Loading...</div>
        </Card.Content>
      </Card.Root>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginPageFallback />}>
      <LoginForm />
    </Suspense>
  );
}
