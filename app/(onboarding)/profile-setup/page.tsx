"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Avatar } from "@heroui/react";
import {
  Card,
  CardContent,
  Button, Input,
  Textarea,
} from "@/components/ui";
import {
  User,
  MapPin,
  Phone,
  FileText,
  CheckCircle,
  ArrowRight,
} from "lucide-react";
import { ProfileUpload } from "@/components/realest/ProfileUpload";

export default function ProfileSetupPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    bio: "",
    location: "",
    userType: "",
    companyName: "",
    licenseNumber: "",
    experience: "",
    profilePhotoUrl: "",
  });

  useEffect(() => {
    const getUser = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        // Pre-fill form with existing data if available
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (profile) {
          setProfile(profile);
          setFormData({
            fullName: profile.full_name || "",
            phone: profile.phone || "",
            bio: profile.bio || "",
            location: "",
            userType: profile.user_type,
            companyName: "",
            licenseNumber: "",
            experience: "",
            profilePhotoUrl: profile.avatar_url || "",
          });
        }
      }
    };

    getUser();
  }, []);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleProfilePhotoSuccess = (avatarUrl: string) => {
    setFormData((prev) => ({ ...prev, profilePhotoUrl: avatarUrl }));
  };

  const handleProfilePhotoError = (error: string) => {
    console.error("Profile photo upload error:", error);
    // Could add toast notification here
  };

  const handleNext = () => {
    if (currentStep < 2) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      const supabase = createClient();

      // Get current user type from profile
      const { data: profile } = await supabase
        .from("profiles")
        .select("user_type")
        .eq("id", user.id)
        .single();

      if (!profile) throw new Error("Profile not found");

      // Update profile
      const { error } = await supabase.from("profiles").upsert({
        id: user.id,
        email: user.email,
        full_name: formData.fullName,
        phone: formData.phone,
        bio: formData.bio,
        avatar_url: formData.profilePhotoUrl || null,
        user_type: profile.user_type,
        updated_at: new Date().toISOString(),
      });

      if (error) throw error;

      // Insert into owners table if user is an owner
      if (profile.user_type === "owner") {
        const { error: ownerError } = await supabase.from("owners").insert({
          profile_id: user.id,
          business_name: formData.companyName || null,
          years_experience: formData.experience
            ? parseInt(formData.experience)
            : null,
          phone: formData.phone || null,
          verified: false,
        });

        if (ownerError) throw ownerError;
      }

      // Redirect based on user type
      if (profile.user_type === "owner") {
        router.push("/owner");
      } else if (profile.user_type === "admin") {
        router.push("/admin");
      } else {
        router.push("/profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const steps = [
    {
      number: 1,
      title: "Basic Information",
      description: "Tell us about yourself",
    },
    {
      number: 2,
      title: "Additional Details",
      description: "Complete your profile",
    },
  ];

  return (
    <div className="min-h-screen bg-background px-4 py-8">
      <div className="container mx-auto max-w-2xl">
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-center mb-4">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step.number <= currentStep
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {step.number}
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`w-12 h-0.5 mx-2 ${
                      step.number < currentStep ? "bg-primary" : "bg-muted"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-1">
              {steps[currentStep - 1].title}
            </h2>
            <p className="text-muted-foreground">
              {steps[currentStep - 1].description}
            </p>
          </div>
        </div>

        <Card>
          <CardContent className="p-8">
            {/* Step 1: Basic Information */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <ProfileUpload
                    size="xl"
                    onUploadSuccess={handleProfilePhotoSuccess}
                    onUploadError={handleProfilePhotoError}
                    className="mx-auto mb-4"
                  />
                  <p className="text-sm text-muted-foreground">
                    Upload a profile photo to personalize your account
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="fullName" className="text-sm font-medium">
                      Full Name *
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
                    <label htmlFor="phone" className="text-sm font-medium">
                      Phone Number
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="Enter your phone number"
                        value={formData.phone}
                        onChange={(e) =>
                          handleInputChange("phone", e.target.value)
                        }
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="location" className="text-sm font-medium">
                      Location
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="location"
                        type="text"
                        placeholder="City, Country"
                        value={formData.location}
                        onChange={(e) =>
                          handleInputChange("location", e.target.value)
                        }
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="bio" className="text-sm font-medium">
                      Bio
                    </label>
                    <Textarea
                      id="bio"
                      placeholder="Tell us a bit about yourself..."
                      value={formData.bio}
                      onChange={(e) => handleInputChange("bio", e.target.value)}
                      rows={3}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Additional Details */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <CheckCircle className="w-12 h-12 text-success mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">Almost there!</h3>
                  <p className="text-muted-foreground">
                    Complete your profile to get started
                  </p>
                </div>

                {profile?.user_type === "owner" && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label
                        htmlFor="companyName"
                        className="text-sm font-medium"
                      >
                        Company Name (Optional)
                      </label>
                      <Input
                        id="companyName"
                        type="text"
                        placeholder="Your real estate company"
                        value={formData.companyName}
                        onChange={(e) =>
                          handleInputChange("companyName", e.target.value)
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <label
                        htmlFor="experience"
                        className="text-sm font-medium"
                      >
                        Years of Experience
                      </label>
                      <Input
                        id="experience"
                        type="number"
                        placeholder="How many years in real estate?"
                        value={formData.experience}
                        onChange={(e) =>
                          handleInputChange("experience", e.target.value)
                        }
                        min="0"
                        max="50"
                      />
                    </div>
                  </div>
                )}

                <div className="bg-muted p-4 rounded-lg">
                  <h4 className="font-medium mb-2">What happens next?</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Your profile will be created and verified</li>
                    <li>• You'll get access to your personalized dashboard</li>
                    <li>• Start exploring properties or listing your own</li>
                  </ul>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex gap-3 mt-8">
              {currentStep > 1 && (
                <Button
                  variant="secondary"
                  onClick={handleBack}
                  className="flex-1"
                >
                  Back
                </Button>
              )}

              {currentStep < 2 ? (
                <Button
                  variant="default"
                  onClick={handleNext}
                  className="flex-1"
                  disabled={currentStep === 1 && !formData.fullName}
                >
                  Next
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button
                  variant="default"
                  onClick={handleSubmit}
                  className="flex-1"
                  disabled={isLoading}
                >
                  {isLoading ? "Setting up..." : "Complete Setup"}
                </Button>
              )}
            </div>

            <div className="text-center mt-4">
              <Link href="/" className="text-sm text-muted-foreground">
                Skip for now
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
