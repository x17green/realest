"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button, Input, Card, RadioGroup, Radio } from "@heroui/react";
import { createClient } from "@/lib/supabase/client";
import { Eye, EyeOff, Mail, Lock, User, Building, Users } from "lucide-react";

export default function SignUpPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState(1); // 1: Role selection, 2: Account details
  const [formData, setFormData] = useState({
    userType: "",
    email: "",
    password: "",
    confirmPassword: "",
    fullName: "",
  });
  const [error, setError] = useState("");

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (error) setError("");
  };

  const handleRoleSelect = (userType: string) => {
    setFormData((prev) => ({ ...prev, userType }));
    setStep(2);
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

    try {
      const supabase = createClient();
      const { data, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
            user_type: formData.userType,
          },
        },
      });

      if (authError) {
        setError(authError.message);
        return;
      }

      if (data.user) {
        router.push("/auth/sign-up-success");
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  if (step === 1) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <Card.Root className="w-full max-w-md">
          <Card.Header className="text-center">
            <Card.Title className="text-2xl font-bold">
              Join RealProof
            </Card.Title>
            <Card.Description>
              Choose your account type to get started
            </Card.Description>
          </Card.Header>

          <Card.Content className="space-y-6">
            <div className="space-y-4">
              <button
                onClick={() => handleRoleSelect("buyer")}
                className="w-full p-4 border rounded-lg hover:bg-muted transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  <Users className="w-6 h-6 text-primary" />
                  <div>
                    <div className="font-medium">Buyer or Renter</div>
                    <div className="text-sm text-muted-foreground">
                      Find and inquire about properties
                    </div>
                  </div>
                </div>
              </button>

              <button
                onClick={() => handleRoleSelect("property_owner")}
                className="w-full p-4 border rounded-lg hover:bg-muted transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  <Building className="w-6 h-6 text-primary" />
                  <div>
                    <div className="font-medium">Property Owner</div>
                    <div className="text-sm text-muted-foreground">
                      List and manage your properties
                    </div>
                  </div>
                </div>
              </button>
            </div>

            <div className="text-center">
              <div className="text-sm">
                Already have an account?{" "}
                <Link href="/login" className="font-medium">
                  Sign in
                </Link>
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
          <Card.Title className="text-2xl font-bold">Create Account</Card.Title>
          <Card.Description>
            Fill in your details to complete registration
          </Card.Description>
        </Card.Header>

        <Card.Content className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="fullName" className="text-sm font-medium">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Enter your full name"
                  value={formData.fullName}
                  onChange={(e) =>
                    handleInputChange("fullName", e.target.value)
                  }
                  className="pl-10"
                  required
                />
              </div>
            </div>

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
                  placeholder="Create a password"
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

            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-sm font-medium">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    handleInputChange("confirmPassword", e.target.value)
                  }
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

            <div className="flex gap-2">
              <Button
                type="button"
                variant="tertiary"
                onPress={() => setStep(1)}
                className="flex-1"
              >
                Back
              </Button>
              <Button
                type="submit"
                variant="primary"
                className="flex-1"
                isDisabled={isLoading}
              >
                {isLoading ? "Creating Account..." : "Create Account"}
              </Button>
            </div>
          </form>

          <div className="text-center">
            <div className="text-sm">
              Already have an account?{" "}
              <Link href="/login" className="font-medium">
                Sign in
              </Link>
            </div>
          </div>
        </Card.Content>
      </Card.Root>
    </div>
  );
}
