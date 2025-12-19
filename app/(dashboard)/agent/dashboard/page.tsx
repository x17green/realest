"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, Button, Spinner } from "@heroui/react";
import { createClient } from "@/lib/supabase/client";
import { BarChart3, Home, MessageSquare, TrendingUp, Eye, Plus } from "lucide-react";

interface AgentStats {
  totalProperties: number;
  activeListings: number;
  totalViews: number;
  totalInquiries: number;
  avgResponseTime: string;
}

interface PropertyPreview {
  id: string;
  title: string;
  price: number;
  status: string;
  views_count: number;
  inquiries_count: number;
}

interface InquiryData {
  id: string;
  message: string;
  created_at: string;
  sender?: {
    full_name: string;
  };
  property?: {
    title: string;
  };
}

export default function AgentDashboardPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [agent, setAgent] = useState<any>(null);
  const [stats, setStats] = useState<AgentStats | null>(null);
  const [recentProperties, setRecentProperties] = useState<PropertyPreview[]>([]);
  const [recentInquiries, setRecentInquiries] = useState<InquiryData[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const supabase = createClient();

        // Get current user
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          router.push("/login?redirect=/agent/dashboard");
          return;
        }

        // Get agent profile
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (!profile || profile.user_type !== "agent") {
          router.push("/");
          return;
        }

        // Get agent details
        const { data: agentData } = await supabase
          .from("agents")
          .select("*")
          .eq("profile_id", user.id)
          .single();

        setAgent({ ...profile, ...agentData });

        // Get agent's properties
        const { data: properties } = await supabase
          .from("properties")
          .select("id, title, price, status, views_count, inquiries_count")
          .eq("owner_id", user.id)
          .order("created_at", { ascending: false })
          .limit(5);

        setRecentProperties(properties || []);

        // Calculate stats
        const { count: totalProperties } = await supabase
          .from("properties")
          .select("*", { count: "exact", head: true })
          .eq("owner_id", user.id);

        const { count: activeListings } = await supabase
          .from("properties")
          .select("*", { count: "exact", head: true })
          .eq("owner_id", user.id)
          .eq("status", "live");

        const { count: totalInquiries } = await supabase
          .from("inquiries")
          .select("*", { count: "exact", head: true })
          .eq("receiver_id", user.id);

        let totalViews = 0;
        if (properties) {
          totalViews = properties.reduce((sum, prop) => sum + (prop.views_count || 0), 0);
        }

        setStats({
          totalProperties: totalProperties || 0,
          activeListings: activeListings || 0,
          totalViews,
          totalInquiries: totalInquiries || 0,
          avgResponseTime: "2.5 hrs",
        });

        // Get recent inquiries
        const { data: inquiries } = await supabase
          .from("inquiries")
          .select(
            `
            id,
            message,
            created_at,
            sender:sender_id(full_name),
            property:property_id(title)
          `
          )
          .eq("receiver_id", user.id)
          .order("created_at", { ascending: false })
          .limit(5);

        if (inquiries) {
          const formattedInquiries: InquiryData[] = inquiries.map((inq) => ({
            id: inq.id,
            message: inq.message,
            created_at: inq.created_at,
            sender: Array.isArray(inq.sender) ? inq.sender[0] : inq.sender,
            property: Array.isArray(inq.property) ? inq.property[0] : inq.property,
          }));
          setRecentInquiries(formattedInquiries);
        }
      } catch (err) {
        console.error("Error loading dashboard:", err);
        setError("Failed to load dashboard");
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboard();
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Spinner />
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card.Root className="w-full max-w-md">
          <Card.Content className="py-8">
            <p className="text-center text-red-500">{error}</p>
          </Card.Content>
        </Card.Root>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-primary-dark text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">Welcome, {agent?.full_name}!</h1>
              <p className="text-blue-100">
                {agent?.agency_name} • License: {agent?.license_number}
              </p>
            </div>
            <Link href="/agent/list-property">
              <Button className="bg-primary-accent text-black font-semibold">
                <Plus className="w-5 h-5" />
                List Property
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Stats Grid */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Total Properties */}
            <Card.Root className="rounded-xl shadow-md">
              <Card.Content className="py-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm font-medium">
                      Total Properties
                    </p>
                    <h3 className="text-3xl font-bold mt-2">{stats.totalProperties}</h3>
                    <p className="text-xs text-success mt-2">
                      {stats.activeListings} active
                    </p>
                  </div>
                  <Home className="w-10 h-10 text-primary-accent opacity-50" />
                </div>
              </Card.Content>
            </Card.Root>

            {/* Total Views */}
            <Card.Root className="rounded-xl shadow-md">
              <Card.Content className="py-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm font-medium">
                      Total Views
                    </p>
                    <h3 className="text-3xl font-bold mt-2">{stats.totalViews}</h3>
                    <p className="text-xs text-muted-foreground mt-2">
                      This month
                    </p>
                  </div>
                  <Eye className="w-10 h-10 text-primary-accent opacity-50" />
                </div>
              </Card.Content>
            </Card.Root>

            {/* Inquiries */}
            <Card.Root className="rounded-xl shadow-md">
              <Card.Content className="py-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm font-medium">
                      Inquiries
                    </p>
                    <h3 className="text-3xl font-bold mt-2">{stats.totalInquiries}</h3>
                    <p className="text-xs text-muted-foreground mt-2">
                      This month
                    </p>
                  </div>
                  <MessageSquare className="w-10 h-10 text-primary-accent opacity-50" />
                </div>
              </Card.Content>
            </Card.Root>

            {/* Response Time */}
            <Card.Root className="rounded-xl shadow-md">
              <Card.Content className="py-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm font-medium">
                      Avg Response
                    </p>
                    <h3 className="text-3xl font-bold mt-2">{stats.avgResponseTime}</h3>
                    <p className="text-xs text-success mt-2">
                      Great response time!
                    </p>
                  </div>
                  <TrendingUp className="w-10 h-10 text-primary-accent opacity-50" />
                </div>
              </Card.Content>
            </Card.Root>
          </div>
        )}

        {/* Tabs for Properties and Inquiries */}
        <div className="mb-8">
          <div className="flex gap-4 mb-6 border-b">
            <button className="pb-2 border-b-2 border-primary-accent font-semibold">
              Recent Properties
            </button>
            <button className="pb-2 text-muted-foreground hover:text-foreground">
              Recent Inquiries
            </button>
          </div>

          {/* Properties Section */}
          <Card.Root className="rounded-xl shadow-md">
            <Card.Content className="py-6">
              {recentProperties.length === 0 ? (
                <div className="text-center py-12">
                  <Home className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <p className="text-muted-foreground mb-4">
                    No properties listed yet
                  </p>
                  <Link href="/agent/list-property">
                    <Button className="bg-primary-accent text-black">
                      List Your First Property
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentProperties.map((property) => (
                    <div
                      key={property.id}
                      className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-lg">{property.title}</h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            Property ID: {property.id.substring(0, 8)}...
                          </p>
                          <div className="flex gap-6 mt-3">
                            <div>
                              <span className="text-xs text-muted-foreground">
                                Views
                              </span>
                              <p className="text-lg font-bold">
                                {property.views_count || 0}
                              </p>
                            </div>
                            <div>
                              <span className="text-xs text-muted-foreground">
                                Inquiries
                              </span>
                              <p className="text-lg font-bold">
                                {property.inquiries_count || 0}
                              </p>
                            </div>
                            <div>
                              <span className="text-xs text-muted-foreground">
                                Status
                              </span>
                              <p className="text-sm font-bold capitalize">
                                {property.status}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Link href={`/agent/properties/${property.id}/edit`}>
                            <Button size="sm" variant="secondary">
                              Edit
                            </Button>
                          </Link>
                          <Button size="sm" variant="danger">
                            Delete
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card.Content>
          </Card.Root>
        </div>

        {/* Quick Actions */}
        <Card.Root className="rounded-xl shadow-md">
          <Card.Header>
            <Card.Title>Quick Actions</Card.Title>
          </Card.Header>
          <Card.Content className="py-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link href="/agent/list-property" className="block">
                <Button className="w-full bg-primary-accent text-black font-semibold">
                  List New Property
                </Button>
              </Link>
              <Link href="/agent/properties" className="block">
                <Button className="w-full bg-primary-dark text-white font-semibold">
                  View All Properties
                </Button>
              </Link>
              <Link href="/agent/profile" className="block">
                <Button className="w-full variant-secondary font-semibold">
                  Edit Profile
                </Button>
              </Link>
            </div>
          </Card.Content>
        </Card.Root>
      </div>
    </div>
  );
}
