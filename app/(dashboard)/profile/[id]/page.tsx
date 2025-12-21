// realest\app\(dashboard)\profile\[id]\page.tsx
"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Card, Avatar, Button, Chip } from "@heroui/react";
import { Header, Footer } from "@/components/layout";
import {
  User,
  Phone,
  MapPin,
  FileText,
  Calendar,
  Home,
  MessageSquare,
  Star,
} from "lucide-react";

interface UserProfile {
  id: string;
  full_name: string;
  phone: string;
  bio: string;
  email: string;
  user_type: string;
  created_at: string;
  avatar_url?: string;
}

export default function PublicProfilePage() {
  const params = useParams();
  const userId = params.id as string;

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState({
    totalListings: 0,
    activeListings: 0,
    totalInquiries: 0,
  });

  useEffect(() => {
    const fetchProfile = async () => {
      if (!userId) return;

      setIsLoading(true);
      try {
        const supabase = createClient();

        // Fetch profile data
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", userId)
          .single();

        if (profileError) {
          setError("Profile not found");
          setIsLoading(false);
          return;
        }

        setProfile(profileData);

        // Fetch stats (mock for now - replace with real queries)
        // Total listings by this user
        const { count: totalListings } = await supabase
          .from("properties")
          .select("*", { count: "exact", head: true })
          .eq("owner_id", userId);

        // Active listings
        const { count: activeListings } = await supabase
          .from("properties")
          .select("*", { count: "exact", head: true })
          .eq("owner_id", userId)
          .eq("status", "active");

        // Total inquiries received (mock)
        const { count: totalInquiries } = await supabase
          .from("inquiries")
          .select("*", { count: "exact", head: true })
          .eq("property_owner_id", userId);

        setStats({
          totalListings: totalListings || 0,
          activeListings: activeListings || 0,
          totalInquiries: totalInquiries || 0,
        });

        setIsLoading(false);
      } catch (err) {
        setError("Failed to load profile");
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [userId]);

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

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <Card.Root className="max-w-2xl mx-auto">
            <Card.Content className="py-12 text-center">
              <div className="text-muted-foreground">
                {error || "Profile not found"}
              </div>
            </Card.Content>
          </Card.Root>
        </div>
        <Footer />
      </div>
    );
  }

  const getUserTypeLabel = (type: string) => {
    switch (type) {
      case "property_owner":
        return "Property Owner";
      case "buyer":
        return "Property Buyer";
      case "admin":
        return "Administrator";
      default:
        return "User";
    }
  };

  const getUserTypeColor = (type: string) => {
    switch (type) {
      case "property_owner":
        return "primary";
      case "buyer":
        return "secondary";
      case "admin":
        return "warning";
      default:
        return "default";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Profile Header */}
          <Card.Root className="mb-8">
            <Card.Content className="p-8">
              <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                <Avatar.Root size="xl">
                  <Avatar.Fallback className="text-2xl">
                    {profile.full_name?.charAt(0) || profile.email?.charAt(0) || "U"}
                  </Avatar.Fallback>
                </Avatar.Root>

                <div className="flex-1 text-center md:text-left">
                  <h1 className="text-3xl font-bold mb-2">{profile.full_name}</h1>
                  <div className="flex items-center justify-center md:justify-start gap-2 mb-4">
                    <Chip
                      variant={getUserTypeColor(profile.user_type)}
                      size="sm"
                    >
                      {getUserTypeLabel(profile.user_type)}
                    </Chip>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      Joined {new Date(profile.created_at).toLocaleDateString()}
                    </div>
                  </div>

                  {profile.bio && (
                    <p className="text-muted-foreground mb-4">{profile.bio}</p>
                  )}

                  <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <Home className="w-4 h-4" />
                      <span>{stats.totalListings} Total Listings</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4" />
                      <span>{stats.activeListings} Active Listings</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageSquare className="w-4 h-4" />
                      <span>{stats.totalInquiries} Inquiries</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card.Content>
          </Card.Root>

          {/* Contact Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card.Root>
              <Card.Header>
                <Card.Title>Contact Information</Card.Title>
              </Card.Header>
              <Card.Content className="space-y-4">
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{profile.email}</p>
                  </div>
                </div>

                {profile.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Phone</p>
                      <p className="font-medium">{profile.phone}</p>
                    </div>
                  </div>
                )}
              </Card.Content>
            </Card.Root>

            {/* Quick Actions */}
            <Card.Root>
              <Card.Header>
                <Card.Title>Actions</Card.Title>
              </Card.Header>
              <Card.Content className="space-y-3">
                <Button variant="primary" className="w-full">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Send Message
                </Button>
                <Button variant="secondary" className="w-full">
                  <Home className="w-4 h-4 mr-2" />
                  View Listings
                </Button>
              </Card.Content>
            </Card.Root>
          </div>

          {/* Additional Information */}
          {profile.bio && (
            <Card.Root className="mt-6">
              <Card.Header>
                <Card.Title>About</Card.Title>
              </Card.Header>
              <Card.Content>
                <div className="flex gap-3">
                  <FileText className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <p className="text-muted-foreground">{profile.bio}</p>
                </div>
              </Card.Content>
            </Card.Root>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
