"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui";
import { CheckCircle, Mail } from "lucide-react";
import { getCurrentUser, getUserProfile } from "@/lib/auth";

export default function SignUpSuccessPage() {
  const router = useRouter();
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    const checkUserAndRedirect = async () => {
      const userResponse = await getCurrentUser();

      if (userResponse.success && userResponse.user) {
        const profileResponse = await getUserProfile(userResponse.user.id);

        if (profileResponse.success && profileResponse.profile) {
          const userType = profileResponse.profile.user_type;
          setIsRedirecting(true);

          // Get email from URL params
          const urlParams = new URLSearchParams(window.location.search);
          const email = urlParams.get("email");

          setTimeout(() => {
            switch (userType) {
              case "agent":
              case "owner":
                router.push("/onboarding");
                break;
              case "user":
              default:
                router.push("/profile");
                break;
            }
          }, 3000); // Redirect after 3 seconds
        }
      }
    };

    checkUserAndRedirect();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <CheckCircle className="w-16 h-16 text-success" />
          </div>
          <CardTitle className="text-2xl font-bold">Account Created!</CardTitle>
          <CardDescription>
            Welcome to RealEST - where every property is verified
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <Mail className="w-4 h-4" />
              <span className="text-sm">
                Check your email to verify your account
              </span>
            </div>

            <div className="bg-muted p-4 rounded-lg">
              <p className="text-sm">
                We've sent you a verification link. Please check your email and
                click the link to activate your account.
              </p>
              {isRedirecting && (
                <p className="text-sm mt-2 text-primary">
                  Redirecting you to complete your profile setup...
                </p>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <Button asChild variant="default" className="w-full">
              <Link href="/login">Go to Sign In</Link>
            </Button>

            <div className="text-center">
              <Link href="/" className="text-sm">
                Back to Homepage
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
