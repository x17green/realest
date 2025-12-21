"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button, Input, TextArea, Card, Avatar } from "@heroui/react";
import { Header, Footer } from "@/components/layout";
import {
  CheckCircle,
  AlertCircle,
  User,
  Phone,
  MapPin,
  FileText,
} from "lucide-react";

export default function EditProfilePage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    bio: "",
    location: "",
  });

  useEffect(() => {
    const fetchProfile = async () => {
      setIsLoading(true);
      try {
        const supabase = createClient();

        // Check if current user can edit this profile
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user || user.id !== userId) {
          setIsLoading(false);
          router.push("/profile");
          return;
        }

        setCurrentUser(user);

        // Fetch profile data
        const { data: profile, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", userId)
          .single();

        if (error) {
          setError("Failed to load profile");
          setIsLoading(false);
          return;
        }

        setFormData({
          fullName: profile.full_name || "",
          phone: profile.phone || "",
          bio: profile.bio || "",
          location: "", // Not stored in profiles currently
        });

        setIsLoading(false);
      } catch (err) {
        setError("Failed to load profile");
        setIsLoading(false);
      }
    };

    if (userId) {
      fetchProfile();
    }
  }, [userId, router]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (error) setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError("");

    try {
      const supabase = createClient();

      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          full_name: formData.fullName,
          phone: formData.phone,
          bio: formData.bio,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId);

      if (updateError) {
        setError(updateError.message);
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/profile");
      }, 2000);
    } catch (err) {
      setError("Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center py-12">
            <div className="text-muted-foreground">Loading profile...</div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <Card.Root className="max-w-2xl mx-auto">
            <Card.Content className="py-12 text-center">
              <CheckCircle className="w-16 h-16 text-success mx-auto mb-6" />
              <h1 className="text-2xl font-bold mb-4">Profile Updated!</h1>
              <p className="text-muted-foreground mb-8">
                Your profile has been successfully updated. Redirecting...
              </p>
            </Card.Content>
          </Card.Root>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Edit Profile</h1>
            <p className="text-muted-foreground">
              Update your basic profile information
            </p>
          </div>

          <Card.Root>
            <Card.Content className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Profile Avatar */}
                <div className="flex justify-center mb-6">
                  <Avatar.Root size="lg">
                    <Avatar.Fallback>
                      {formData.fullName?.charAt(0) ||
                        currentUser?.email?.charAt(0) ||
                        "U"}
                    </Avatar.Fallback>
                  </Avatar.Root>
                </div>

                {/* Full Name */}
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

                {/* Phone */}
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

                {/* Location */}
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

                {/* Bio */}
                <div className="space-y-2">
                  <label htmlFor="bio" className="text-sm font-medium">
                    Bio
                  </label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                    <TextArea
                      id="bio"
                      placeholder="Tell us a bit about yourself..."
                      value={formData.bio}
                      onChange={(e) => handleInputChange("bio", e.target.value)}
                      rows={4}
                      className="pl-10"
                    />
                  </div>
                </div>

                {error && (
                  <div className="flex gap-3 p-4 bg-danger-50 border border-danger-200 rounded-lg">
                    <AlertCircle className="w-5 h-5 text-danger shrink-0 mt-0.5" />
                    <p className="text-sm text-danger">{error}</p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="secondary"
                    onPress={() => router.push("/profile")}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    className="flex-1"
                    isDisabled={isSaving}
                  >
                    {isSaving ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </form>
            </Card.Content>
          </Card.Root>
        </div>
      </div>
      <Footer />
    </div>
  );
}
