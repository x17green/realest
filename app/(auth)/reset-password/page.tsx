"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button, Input, Card } from "@heroui/react";
import { createClient } from "@/lib/supabase/client";
import { Eye, EyeOff, Lock, CheckCircle, Shield, RefreshCw } from "lucide-react";

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [passwordValidation, setPasswordValidation] = useState({
    minLength: false,
    hasUppercase: false,
    hasLowercase: false,
    hasNumber: false,
    hasSpecialChar: false,
  });

  // Check for auth parameters in URL and handle session
  useEffect(() => {
    const initializeSession = async () => {
      const accessToken = searchParams.get('access_token');
      const refreshToken = searchParams.get('refresh_token');
      const code = searchParams.get('code');
      const error = searchParams.get('error');
      const errorDescription = searchParams.get('error_description');

      console.log('Reset password params:', { accessToken, refreshToken, code, error });

      // Handle error responses from Supabase
      if (error) {
        console.error('Auth error:', error, errorDescription);
        setError(errorDescription || 'Invalid reset link. Please request a new password reset.');
        setTimeout(() => {
          router.push('/forgot-password');
        }, 5000);
        return;
      }

      // Check for PKCE code parameter (modern Supabase flow)
      if (code) {
        try {
          const supabase = createClient();
          const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

          if (exchangeError) {
            console.error('Code exchange error:', exchangeError);
            setError('Invalid or expired reset link. Please request a new password reset.');
            setTimeout(() => {
              router.push('/forgot-password');
            }, 5000);
          } else if (data.session) {
            console.log('Successfully exchanged code for session');
            setError(''); // Clear any previous errors
          }
        } catch (err) {
          console.error('Error exchanging code:', err);
          setError('Failed to initialize password reset. Please try again.');
          setTimeout(() => {
            router.push('/forgot-password');
          }, 3000);
        }
        return;
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
            console.error('Session error:', sessionError);
            setError('Invalid or expired reset link. Please request a new password reset.');
            setTimeout(() => {
              router.push('/forgot-password');
            }, 5000);
          } else {
            // Successfully set session, clear any previous errors
            setError('');
          }
        } catch (err) {
          console.error('Error setting session:', err);
          setError('Failed to initialize password reset. Please try again.');
          setTimeout(() => {
            router.push('/forgot-password');
          }, 3000);
        }
        return;
      }

      // If no tokens or code, redirect to forgot password
      setError('No reset token found. Please check your email link or request a new password reset.');
      setTimeout(() => {
        router.push('/forgot-password');
      }, 3000);
    };

    initializeSession();
  }, [searchParams, router]);

  const validatePassword = (password: string) => {
    const validation = {
      minLength: password.length >= 8,
      hasUppercase: /[A-Z]/.test(password),
      hasLowercase: /[a-z]/.test(password),
      hasNumber: /\d/.test(password),
      hasSpecialChar: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
    };
    setPasswordValidation(validation);
    return Object.values(validation).every(Boolean);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (field === "password") {
      validatePassword(value);
    }
    if (error) setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    if (!validatePassword(formData.password)) {
      setError("Password does not meet security requirements");
      setIsLoading(false);
      return;
    }

    try {
      const supabase = createClient();

      // Get current session to verify user is authenticated
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError || !session) {
        setError('Your session has expired. Please request a new password reset link.');
        setTimeout(() => {
          router.push('/forgot-password');
        }, 3000);
        return;
      }

      // Verify user is still authenticated before updating password
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError || !user) {
        setError('Session expired. Please request a new password reset link.');
        setTimeout(() => {
          router.push('/forgot-password');
        }, 3000);
        return;
      }

      // Update password
      const { error: updateError } = await supabase.auth.updateUser({
        password: formData.password
      });

      if (updateError) {
        console.error('Password update error:', updateError);
        // Handle specific error types
        if (updateError.message.includes('session') || updateError.message.includes('expired') || updateError.message.includes('unauthorized')) {
          setError('Your reset session has expired. Please request a new password reset link.');
          setTimeout(() => {
            router.push('/forgot-password');
          }, 3000);
        } else if (updateError.message.includes('same_password') || updateError.message.includes('password')) {
          setError('New password must be different from your current password or does not meet requirements.');
        } else {
          setError(updateError.message || 'Failed to update password. Please try again.');
        }
        return;
      }

      console.log('Password updated successfully');
      setIsSuccess(true);

      // Sign out after password reset for security
      await supabase.auth.signOut();

      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push('/login?reset=true');
      }, 3000);

    } catch (err) {
      console.error('Password reset error:', err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const isPasswordValid = Object.values(passwordValidation).every(Boolean);
  const canSubmit =
    formData.password &&
    formData.confirmPassword &&
    isPasswordValid &&
    formData.password === formData.confirmPassword;

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <Card.Root className="w-full max-w-md">
          <Card.Header className="text-center">
            <div className="flex justify-center mb-4">
              <CheckCircle className="w-16 h-16 text-success" />
            </div>
            <Card.Title className="text-2xl font-bold">
              Password Reset Complete
            </Card.Title>
            <Card.Description>
              Your password has been successfully updated
            </Card.Description>
          </Card.Header>

          <Card.Content className="space-y-6">
            <div className="text-center space-y-4">
              <div className="bg-success-50 border border-success-200 p-4 rounded-lg">
                <p className="text-sm text-success-700">
                  Your password has been securely updated. For security, you have been signed out.
                  Please sign in with your new password.
                </p>
              </div>

              <p className="text-sm text-muted-foreground">
                Redirecting to sign in page in a few seconds...
              </p>
            </div>

            <div className="space-y-3">
              <Button asChild variant="primary" className="w-full">
                <Link href="/login">Sign In Now</Link>
              </Button>
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
            Reset Your Password
          </Card.Title>
          <Card.Description>
            Create a new secure password for your RealEST account
          </Card.Description>
        </Card.Header>

        <Card.Content className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a new password"
                  value={formData.password}
                  onChange={(e) => handleInputChange("password", e.target.value)}
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

              {/* Password Validation */}
              {formData.password && (
                <div className="bg-muted p-3 rounded-lg space-y-2">
                  <p className="text-xs font-medium text-muted-foreground">Password Requirements:</p>
                  <div className="grid grid-cols-1 gap-1 text-xs">
                    <div className={`flex items-center gap-2 ${passwordValidation.minLength ? 'text-success' : 'text-muted-foreground'}`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${passwordValidation.minLength ? 'bg-success' : 'bg-muted-foreground'}`} />
                      At least 8 characters
                    </div>
                    <div className={`flex items-center gap-2 ${passwordValidation.hasUppercase ? 'text-success' : 'text-muted-foreground'}`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${passwordValidation.hasUppercase ? 'bg-success' : 'bg-muted-foreground'}`} />
                      One uppercase letter
                    </div>
                    <div className={`flex items-center gap-2 ${passwordValidation.hasLowercase ? 'text-success' : 'text-muted-foreground'}`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${passwordValidation.hasLowercase ? 'bg-success' : 'bg-muted-foreground'}`} />
                      One lowercase letter
                    </div>
                    <div className={`flex items-center gap-2 ${passwordValidation.hasNumber ? 'text-success' : 'text-muted-foreground'}`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${passwordValidation.hasNumber ? 'bg-success' : 'bg-muted-foreground'}`} />
                      One number
                    </div>
                    <div className={`flex items-center gap-2 ${passwordValidation.hasSpecialChar ? 'text-success' : 'text-muted-foreground'}`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${passwordValidation.hasSpecialChar ? 'bg-success' : 'bg-muted-foreground'}`} />
                      One special character
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-sm font-medium">
                Confirm New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm your new password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                  className="pl-10 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>

              {/* Password Match Indicator */}
              {formData.confirmPassword && (
                <div className={`text-xs flex items-center gap-2 ${
                  formData.password === formData.confirmPassword
                    ? 'text-success'
                    : 'text-danger'
                }`}>
                  <div className={`w-1.5 h-1.5 rounded-full ${
                    formData.password === formData.confirmPassword
                      ? 'bg-success'
                      : 'bg-danger'
                  }`} />
                  {formData.password === formData.confirmPassword
                    ? 'Passwords match'
                    : 'Passwords do not match'
                  }
                </div>
              )}
            </div>

            {error && (
              <div className="text-sm text-danger bg-danger-50 border border-danger-200 rounded-md p-3">
                {error}
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              className="w-full"
              isDisabled={isLoading || !canSubmit}
            >
              {isLoading ? "Updating Password..." : "Update Password"}
            </Button>
          </form>

          <div className="text-center">
            <div className="text-sm">
              Remember your password?{" "}
              <Link href="/login" className="font-medium hover:underline">
                Sign in
              </Link>
            </div>
          </div>
        </Card.Content>
      </Card.Root>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-background px-4">
          <Card.Root className="w-full max-w-md">
            <Card.Header className="text-center">
              <div className="flex justify-center mb-4">
                <RefreshCw className="w-12 h-12 text-primary animate-spin" />
              </div>
              <Card.Title className="text-2xl font-bold">
                Loading Reset Form
              </Card.Title>
              <Card.Description>
                Please wait while we prepare your password reset form
              </Card.Description>
            </Card.Header>
          </Card.Root>
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}
