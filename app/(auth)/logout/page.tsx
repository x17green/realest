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
import { signOut } from "@/lib/auth";
import { LogOut, CheckCircle, RefreshCw, AlertCircle } from "lucide-react";

function LogoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");
  const [autoLogout, setAutoLogout] = useState(false);

  // Check for auto logout parameter
  useEffect(() => {
    const auto = searchParams.get("auto") === "true";
    setAutoLogout(auto);

    if (auto) {
      handleLogout();
    }
  }, [searchParams]);

  const handleLogout = async () => {
    setIsLoading(true);
    setError("");

    try {
      const signOutResponse = await signOut();

      if (!signOutResponse.success) {
        setError(signOutResponse.error || "Failed to sign out");
        return;
      }

      setIsSuccess(true);

      // Redirect to homepage after successful logout
      setTimeout(() => {
        router.push("/");
        router.refresh();
      }, 2000);
    } catch (err) {
      setError("An unexpected error occurred during logout.");
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
              Logged Out Successfully
            </CardTitle>
            <CardDescription>
              You have been securely signed out of your account
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="text-center space-y-4">
              <div className="bg-success-50 border border-success-200 p-4 rounded-lg">
                <p className="text-sm text-success-700">
                  Your session has been terminated and all authentication data
                  has been cleared.
                </p>
              </div>

              <p className="text-sm text-muted-foreground">
                Redirecting to homepage...
              </p>

              <div className="flex justify-center">
                <RefreshCw className="w-5 h-5 text-primary animate-spin" />
              </div>
            </div>

            <div className="space-y-3">
              <Button asChild variant="default" className="w-full">
                <Link href="/">Go to Homepage</Link>
              </Button>

              <Button asChild variant="ghost" className="w-full">
                <Link href="/login">Sign In Again</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (autoLogout) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <RefreshCw className="w-12 h-12 text-primary animate-spin" />
            </div>
            <CardTitle className="text-2xl font-bold">
              Signing You Out
            </CardTitle>
            <CardDescription>
              Please wait while we securely log you out
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {error && (
              <div className="text-sm text-danger bg-danger-50 border border-danger-200 rounded-md p-3">
                {error}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <LogOut className="w-12 h-12 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">Sign Out</CardTitle>
          <CardDescription>
            Are you sure you want to sign out of your RealEST account?
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {error && (
            <div className="text-sm text-danger bg-danger-50 border border-danger-200 rounded-md p-3 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          <div className="bg-muted p-4 rounded-lg">
            <p className="text-sm text-muted-foreground">Signing out will:</p>
            <ul className="text-sm text-muted-foreground mt-2 space-y-1">
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground" />
                Clear your session data
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground" />
                Remove saved authentication
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground" />
                Require sign in to access your account
              </li>
            </ul>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button variant="ghost" className="w-full" asChild>
              <Link href="/owner">Cancel</Link>
            </Button>

            <Button
              variant="destructive"
              className="w-full"
              onClick={handleLogout}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Signing Out...
                </>
              ) : (
                <>
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </>
              )}
            </Button>
          </div>

          <div className="text-center">
            <Link
              href="/"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Back to Homepage
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function LogoutFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <RefreshCw className="w-12 h-12 text-primary animate-spin" />
          </div>
          <CardTitle className="text-2xl font-bold">
            Loading Sign Out
          </CardTitle>
          <CardDescription>
            Please wait while we prepare the sign out page
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}

export default function LogoutPage() {
  return (
    <Suspense fallback={<LogoutFallback />}>
      <LogoutContent />
    </Suspense>
  );
}
