"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button, Input, Card, TextArea, Checkbox } from "@heroui/react";
import { createClient } from "@/lib/supabase/client";
import { Upload, AlertCircle, CheckCircle } from "lucide-react";

export default function AgentOnboardingPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [step, setStep] = useState(1);
  const [userId, setUserId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
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

      // Get existing agent profile data
      const { data: agent } = await supabase
        .from("agents")
        .select("*")
        .eq("profile_id", user.id)
        .single();

      if (agent) {
        setFormData((prev) => ({
          ...prev,
          phone: agent.phone || "",
          whatsapp: agent.whatsapp || "",
          bio: agent.bio || "",
          specializations: agent.specialization || [],
        }));
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

    const supabase = createClient();
    const fileExt = formData.profilePhoto.name.split(".").pop();
    const fileName = `${userId}-${Date.now()}.${fileExt}`;

    const { data, error: uploadError } = await supabase.storage
      .from("agent-profiles")
      .upload(fileName, formData.profilePhoto);

    if (uploadError) {
      console.error("Upload error:", uploadError);
      return null;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("agent-profiles").getPublicUrl(fileName);

    return publicUrl;
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

      // Update agent profile
      const updateData: any = {
        phone: formData.phone,
        whatsapp: formData.whatsapp || null,
        bio: formData.bio || null,
        specialization: formData.specializations,
      };

      if (profilePhotoUrl) {
        updateData.profile_photo_url = profilePhotoUrl;
      }

      const { error: updateError } = await supabase
        .from("agents")
        .update(updateData)
        .eq("profile_id", userId);

      if (updateError) {
        setError(updateError.message);
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/agent/dashboard");
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
        <Card.Root className="w-full max-w-md text-center">
          <Card.Content className="py-12">
            <CheckCircle className="w-16 h-16 text-success mx-auto mb-6" />
            <h1 className="text-2xl font-bold mb-4">Welcome to RealEST!</h1>
            <p className="text-muted-foreground mb-8">
              Your agent profile is complete. Redirecting to your dashboard...
            </p>
          </Card.Content>
        </Card.Root>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-8">
      <Card.Root className="w-full max-w-2xl">
        <Card.Header className="text-center border-b">
          <Card.Title className="text-3xl font-bold">
            Complete Your Agent Profile
          </Card.Title>
          <Card.Description>
            Help clients get to know you better • Step {step} of 2
          </Card.Description>
        </Card.Header>

        <Card.Content className="py-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Step 1: Basic Info */}
            {step === 1 && (
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

                <div className="space-y-2">
                  <label className="text-sm font-medium block">
                    Professional Bio (Optional)
                  </label>
                  <TextArea
                    placeholder="Tell clients about your experience and expertise..."
                    value={formData.bio}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleInputChange("bio", e.target.value)}
                    rows={4}
                  />
                  <div className="text-xs text-muted-foreground">
                    Max 500 characters
                  </div>
                </div>

                {error && (
                  <div className="flex gap-3 p-4 bg-danger-50 border border-danger-200 rounded-lg">
                    <AlertCircle className="w-5 h-5 text-danger flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-danger">{error}</p>
                  </div>
                )}

                <div className="flex gap-2 pt-4">
                  <Button
                    type="button"
                    variant="tertiary"
                    className="flex-1"
                    onPress={() => router.push("/login")}
                  >
                    Skip for now
                  </Button>
                  <Button
                    type="button"
                    variant="primary"
                    className="flex-1"
                    onPress={() => setStep(2)}
                  >
                    Continue
                  </Button>
                </div>
              </div>
            )}

            {/* Step 2: Specializations */}
            {step === 2 && (
              <div className="space-y-6">
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
                          onChange={() =>
                            handleSpecializationChange(spec)
                          }
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
                    <AlertCircle className="w-5 h-5 text-danger flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-danger">{error}</p>
                  </div>
                )}

                <div className="flex gap-2 pt-4">
                  <Button
                    type="button"
                    variant="tertiary"
                    className="flex-1"
                    onPress={() => setStep(1)}
                  >
                    Back
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    className="flex-1"
                    isDisabled={isLoading}
                  >
                    {isLoading ? "Completing Setup..." : "Complete Setup"}
                  </Button>
                </div>
              </div>
            )}
          </form>
        </Card.Content>
      </Card.Root>
    </div>
  );
}
