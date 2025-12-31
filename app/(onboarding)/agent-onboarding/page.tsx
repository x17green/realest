"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Avatar, Chip } from "@heroui/react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader, CardTitle,
  Button, Input,
  Textarea,
} from "@/components/ui";
import { createClient } from "@/lib/supabase/client";
import { createServiceClient } from "@/lib/supabase/service";
import { Upload, AlertCircle, CheckCircle } from "lucide-react";

export default function AgentOnboardingPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [step, setStep] = useState(1);
  const [userId, setUserId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    fullName: "",
    licenseNumber: "",
    agencyName: "",
    phone: "",
    whatsapp: "",
    bio: "",
    profilePhoto: null as File | null,
    specializations: [] as string[],
    agreeTerms: false,
  });

  const SPECIALIZATIONS = [
    "Residential Sales",
    "Residential Rentals",
    "Commercial Properties",
    "Land & Development",
    "Luxury Properties",
    "Investment Properties",
    "Property Management",
  ];

  useEffect(() => {
    // Check if user is authenticated
    const checkAuth = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      setUserId(user.id);

      // Check if agent profile already exists
      const { data: agent } = await supabase
        .from("agents")
        .select("*")
        .eq("profile_id", user.id)
        .single();

      if (agent) {
        // If exists, redirect to dashboard
        router.push("/agent");
        return;
      }
    };

    checkAuth();
  }, [router]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSpecializationChange = (spec: string) => {
    setFormData((prev) => ({
      ...prev,
      specializations: prev.specializations.includes(spec)
        ? prev.specializations.filter((s) => s !== spec)
        : [...prev.specializations, spec],
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.size <= 5 * 1024 * 1024) {
      setFormData((prev) => ({ ...prev, profilePhoto: file }));
    } else {
      setError("File size must be less than 5MB");
    }
  };

  const handleProfilePhotoUpload = async (): Promise<string | null> => {
    if (!formData.profilePhoto || !userId) return null;

    try {
      // Get signed URL from API
      const response = await fetch('/api/upload/signed-url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          file_name: formData.profilePhoto.name,
          file_type: formData.profilePhoto.type,
          file_size: formData.profilePhoto.size,
          bucket: 'avatars',
        }),
      });

      if (!response.ok) {
        console.error('Failed to get signed URL');
        return null;
      }

      const { signed_url, public_url } = await response.json();

      // Upload file to signed URL
      const uploadResponse = await fetch(signed_url, {
        method: 'PUT',
        body: formData.profilePhoto,
        headers: {
          'Content-Type': formData.profilePhoto.type,
        },
      });

      if (!uploadResponse.ok) {
        console.error('Upload failed');
        return null;
      }

      return public_url;
    } catch (error) {
      console.error('Upload error:', error);
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (!userId) {
      setError("User not found");
      setIsLoading(false);
      return;
    }

    if (!formData.licenseNumber) {
      setError("License number is required");
      setIsLoading(false);
      return;
    }

    if (!formData.agencyName) {
      setError("Agency name is required");
      setIsLoading(false);
      return;
    }

    if (!formData.phone) {
      setError("Phone number is required");
      setIsLoading(false);
      return;
    }

    if (formData.specializations.length === 0) {
      setError("Please select at least one specialization");
      setIsLoading(false);
      return;
    }

    if (!formData.agreeTerms) {
      setError("You must agree to the terms and conditions");
      setIsLoading(false);
      return;
    }

    try {
      let profilePhotoUrl = null;

      // Upload profile photo if provided
      if (formData.profilePhoto) {
        profilePhotoUrl = await handleProfilePhotoUpload();
      }

      const supabase = createClient();

      // Insert agent profile
      const insertData = {
        profile_id: userId,
        license_number: formData.licenseNumber,
        agency_name: formData.agencyName,
        phone: formData.phone,
        whatsapp: formData.whatsapp || null,
        bio: formData.bio || null,
        specialization: formData.specializations,
        photo_url: profilePhotoUrl || null,
        verified: false,
      };

      const { error: insertError } = await supabase
        .from("agents")
        .insert(insertData);

      if (insertError) {
        setError(insertError.message);
        return;
      }

      // Update profiles with full_name and user_type
      const { error: profileError } = await supabase.from("profiles").upsert({
        id: userId,
        full_name: formData.fullName,
        user_type: "agent",
      });

      if (profileError) {
        setError("Profile update failed");
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/agent");
      }, 2000);
    } catch (err) {
      setError("An unexpected error occurred");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="py-12">
            <CheckCircle className="w-16 h-16 text-success mx-auto mb-6" />
            <h1 className="text-2xl font-bold mb-4">Welcome to RealEST!</h1>
            <p className="text-muted-foreground mb-8">
              Your agent profile is complete. Redirecting to your dashboard...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-8">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center border-b">
          <CardTitle className="text-3xl font-bold">
            Complete Your Agent Profile
          </CardTitle>
          <CardDescription>
            Help clients get to know you better • Step {step} of 2
          </CardDescription>
        </CardHeader>

        <CardContent className="py-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Step 1: License & Agency */}
            {step === 1 && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium block">
                    Full Name (Required)
                  </label>
                  <Input
                    type="text"
                    placeholder="Enter your full name"
                    value={formData.fullName}
                    onChange={(e) =>
                      handleInputChange("fullName", e.target.value)
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium block">
                    License Number (Required)
                  </label>
                  <Input
                    type="text"
                    placeholder="e.g., LICENSE-12345"
                    value={formData.licenseNumber}
                    onChange={(e) =>
                      handleInputChange("licenseNumber", e.target.value)
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium block">
                    Agency Name (Required)
                  </label>
                  <Input
                    type="text"
                    placeholder="Your real estate agency"
                    value={formData.agencyName}
                    onChange={(e) =>
                      handleInputChange("agencyName", e.target.value)
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium block">
                    Phone Number (Required)
                  </label>
                  <Input
                    type="tel"
                    placeholder="+234 801 234 5678"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium block">
                    WhatsApp Number (Optional)
                  </label>
                  <Input
                    type="tel"
                    placeholder="+234 801 234 5678"
                    value={formData.whatsapp}
                    onChange={(e) =>
                      handleInputChange("whatsapp", e.target.value)
                    }
                  />
                </div>

                {error && (
                  <div className="flex gap-3 p-4 bg-danger-50 border border-danger-200 rounded-lg">
                    <AlertCircle className="w-5 h-5 text-danger shrink-0 mt-0.5" />
                    <p className="text-sm text-danger">{error}</p>
                  </div>
                )}

                <div className="flex gap-2 pt-4">
                  <Button
                    type="button"
                    variant="secondary"
                    className="flex-1"
                    onClick={() => router.push("/profile")}
                  >
                    Skip for now
                  </Button>
                  <Button
                    type="button"
                    variant="default"
                    className="flex-1"
                    onClick={() => setStep(2)}
                  >
                    Continue
                  </Button>
                </div>
              </div>
            )}

            {/* Step 2: Profile & Specializations */}
            {step === 2 && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium block">
                    Profile Photo
                  </label>
                  <div className="border-2 border-dashed rounded-lg p-8 text-center hover:bg-muted/50 transition-colors cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                      id="profilePhoto"
                    />
                    <label htmlFor="profilePhoto" className="cursor-pointer">
                      <Upload className="w-8 h-8 mx-auto mb-3 text-muted-foreground" />
                      <div className="font-medium">
                        {formData.profilePhoto
                          ? formData.profilePhoto.name
                          : "Click to upload or drag and drop"}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        PNG, JPG up to 5MB
                      </div>
                    </label>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium block">
                    Professional Bio (Optional)
                  </label>
                  <Textarea
                    placeholder="Tell clients about your experience and expertise..."
                    value={formData.bio}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                      handleInputChange("bio", e.target.value)
                    }
                    rows={4}
                  />
                  <div className="text-xs text-muted-foreground">
                    Max 500 characters
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium block mb-4">
                    Select Your Specializations (Required)
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {SPECIALIZATIONS.map((spec) => (
                      <label
                        key={spec}
                        className="flex items-center gap-3 p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={formData.specializations.includes(spec)}
                          onChange={() => handleSpecializationChange(spec)}
                          className="w-4 h-4 rounded border-muted-foreground"
                        />
                        <span className="text-sm">{spec}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="flex items-start gap-3 cursor-pointer p-4 border rounded-lg hover:bg-muted/50">
                    <input
                      type="checkbox"
                      checked={formData.agreeTerms}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          agreeTerms: e.target.checked,
                        }))
                      }
                      className="w-4 h-4 rounded border-muted-foreground mt-1"
                    />
                    <div>
                      <div className="text-sm font-medium">
                        I agree to RealEST Agent Terms
                      </div>
                      <div className="text-xs text-muted-foreground">
                        I certify that I am a licensed real estate professional
                        and agree to maintain professional standards
                      </div>
                    </div>
                  </label>
                </div>

                {error && (
                  <div className="flex gap-3 p-4 bg-danger-50 border border-danger-200 rounded-lg">
                    <AlertCircle className="w-5 h-5 text-danger shrink-0 mt-0.5" />
                    <p className="text-sm text-danger">{error}</p>
                  </div>
                )}

                <div className="flex gap-2 pt-4">
                  <Button
                    type="button"
                    variant="secondary"
                    className="flex-1"
                    onClick={() => setStep(1)}
                  >
                    Back
                  </Button>
                  <Button
                    type="submit"
                    variant="default"
                    className="flex-1"
                    disabled={isLoading}
                  >
                    {isLoading ? "Completing Setup..." : "Complete Setup"}
                  </Button>
                </div>
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
