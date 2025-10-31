"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import {
  Card,
  Button,
  Chip,
  Avatar,
  Separator,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@heroui/react";
import {
  Home,
  MessageSquare,
  TrendingUp,
  Plus,
  Eye,
  Calendar,
  MapPin,
  DollarSign,
  Users,
  Building,
  CheckCircle,
  Clock,
  AlertCircle,
} from "lucide-react";

interface DashboardStats {
  totalProperties: number;
  activeProperties: number;
  totalInquiries: number;
  unreadInquiries: number;
  totalViews: number;
  monthlyRevenue: number;
}

interface RecentProperty {
  id: string;
  title: string;
  status: string;
  verification_status: string;
  price: number;
  created_at: string;
  inquiry_count: number;
}

interface RecentInquiry {
  id: string;
  property_title: string;
  buyer_name: string;
  buyer_email: string;
  message: string;
  status: string;
  created_at: string;
}

export default function OwnerDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentProperties, setRecentProperties] = useState<RecentProperty[]>([]);
  const [recentInquiries, setRecentInquiries] = useState<RecentInquiry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      const supabase = createClient();

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch stats
      const [propertiesRes, inquiriesRes] = await Promise.all([
        supabase
          .from("properties")
          .select("id, status, verification_status, price, created_at")
          .eq("owner_id", user.id),
        supabase
          .from("inquiries")
          .select(`
            id,
            status,
            created_at,
            property:properties(title)
          `)
          .eq("property.owner_id", user.id)
      ]);

      if (propertiesRes.data) {
        const properties = propertiesRes.data;
        const activeProperties = properties.filter(p => p.status === "active").length;
        const totalValue = properties.reduce((sum, p) => sum + p.price, 0);

        setStats({
          totalProperties: properties.length,
          activeProperties,
          totalInquiries: inquiriesRes.data?.length || 0,
          unreadInquiries: inquiriesRes.data?.filter(i => i.status === "pending").length || 0,
          totalViews: Math.floor(Math.random() * 1000), // Mock data
          monthlyRevenue: Math.floor(totalValue * 0.01), // Mock monthly revenue
        });

        // Get recent properties with inquiry counts
        const recentProps = properties
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          .slice(0, 5)
          .map(prop => ({
            ...prop,
            inquiry_count: inquiriesRes.data?.filter(i => i.property?.id === prop.id).length || 0
          }));

        setRecentProperties(recentProps as RecentProperty[]);
      }

      // Get recent inquiries
      if (inquiriesRes.data) {
        const recentInqs = inquiriesRes.data
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          .slice(0, 5)
          .map(inq => ({
            id: inq.id,
            property_title: inq.property?.title || "Unknown Property",
            buyer_name: "Anonymous", // Would need to join with profiles
            buyer_email: "buyer@example.com", // Would need to join with profiles
            message: "Interested in this property", // Would need actual message field
            status: inq.status,
            created_at: inq.created_at,
          }));

        setRecentInquiries(recentInqs);
      }

      setIsLoading(false);
    };

    fetchDashboardData();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-muted rounded w-1/3" />
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-muted rounded-lg" />
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="h-96 bg-muted rounded-lg" />
              <div className="h-96 bg-muted rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back! Here's an overview of your properties.
            </p>
          </div>
          <Button as={Link} href="/owner/list-property" variant="primary">
            <Plus className="w-4 h-4 mr-2" />
            List New Property
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card.Root>
            <Card.Content className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Properties</p>
                  <p className="text-2xl font-bold">{stats?.totalProperties || 0}</p>
                </div>
                <Building className="w-8 h-8 text-primary" />
              </div>
            </Card.Content>
          </Card.Root>

          <Card.Root>
            <Card.Content className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active Listings</p>
                  <p className="text-2xl font-bold">{stats?.activeProperties || 0}</p>
                </div>
                <Home className="w-8 h-8 text-success" />
              </div>
            </Card.Content>
          </Card.Root>

          <Card.Root>
            <Card.Content className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Inquiries</p>
                  <p className="text-2xl font-bold">{stats?.totalInquiries || 0}</p>
                  {stats?.unreadInquiries > 0 && (
                    <p className="text-xs text-warning">{stats.unreadInquiries} unread</p>
                  )}
                </div>
                <MessageSquare className="w-8 h-8 text-warning" />
              </div>
            </Card.Content>
          </Card.Root>

          <Card.Root>
            <Card.Content className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Monthly Revenue</p>
                  <p className="text-2xl font-bold">£{stats?.monthlyRevenue?.toLocaleString() || 0}</p>
                </div>
                <DollarSign className="w-8 h-8 text-success" />
              </div>
            </Card.Content>
          </Card.Root>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Properties */}
          <Card.Root>
            <Card.Header>
              <Card.Title className="flex items-center gap-2">
                <Building className="w-5 h-5" />
                Recent Properties
              </Card.Title>
              <Card.Description>
                Your recently listed properties
              </Card.Description>
            </Card.Header>
            <Card.Content>
              {recentProperties.length === 0 ? (
                <div className="text-center py-8">
                  <Building className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">No properties listed yet</p>
                  <Button as={Link} href="/owner/list-property" variant="primary" size="sm">
                    List Your First Property
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentProperties.map((property) => (
                    <div key={property.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <h3 className="font-medium mb-1">{property.title}</h3>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>£{property.price.toLocaleString()}</span>
                          <span>{property.inquiry_count} inquiries</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Chip
                          type={
                            property.verification_status === "verified"
                              ? "success"
                              : property.verification_status === "rejected"
                              ? "danger"
                              : "warning"
                          }
                          variant="secondary"
                          size="sm"
                        >
                          {property.verification_status}
                        </Chip>
                        <Button as={Link} href={`/property/${property.id}`} variant="ghost" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  <div className="pt-4">
                    <Button as={Link} href="/owner/properties" variant="secondary" className="w-full">
                      View All Properties
                    </Button>
                  </div>
                </div>
              )}
            </Card.Content>
          </Card.Root>

          {/* Recent Inquiries */}
          <Card.Root>
            <Card.Header>
              <Card.Title className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Recent Inquiries
              </Card.Title>
              <Card.Description>
                Latest messages from potential buyers
              </Card.Description>
            </Card.Header>
            <Card.Content>
              {recentInquiries.length === 0 ? (
                <div className="text-center py-8">
                  <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No inquiries yet</p>
                  <p className="text-sm text-muted-foreground">
                    Inquiries will appear here when buyers contact you
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentInquiries.map((inquiry) => (
                    <div key={inquiry.id} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-medium text-sm">{inquiry.property_title}</h4>
                          <p className="text-xs text-muted-foreground">
                            {new Date(inquiry.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <Chip
                          type={inquiry.status === "pending" ? "warning" : "success"}
                          variant="secondary"
                          size="sm"
                        >
                          {inquiry.status}
                        </Chip>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        {inquiry.message}
                      </p>
                      <div className="flex gap-2">
                        <Button variant="secondary" size="sm">
                          Reply
                        </Button>
                        <Button variant="ghost" size="sm">
                          View Details
                        </Button>
                      </div>
                    </div>
                  ))}
                  <div className="pt-4">
                    <Button as={Link} href="/owner/inquiries" variant="secondary" className="w-full">
                      View All Inquiries
                    </Button>
                  </div>
                </div>
              )}
            </Card.Content>
          </Card.Root>
        </div>

        {/* Quick Actions */}
        <Card.Root className="mt-8">
          <Card.Header>
            <Card.Title>Quick Actions</Card.Title>
            <Card.Description>
              Common tasks to manage your properties
            </Card.Description>
          </Card.Header>
          <Card.Content>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button as={Link} href="/owner/list-property" variant="secondary" className="h-20 flex-col">
                <Plus className="w-6 h-6 mb-2" />
                List New Property
              </Button>
              <Button as={Link} href="/owner/properties" variant="secondary" className="h-20 flex-col">
                <Building className="w-6 h-6 mb-2" />
                Manage Properties
              </Button>
              <Button as={Link} href="/owner/inquiries" variant="secondary" className="h-20 flex-col">
                <MessageSquare className="w-6 h-6 mb-2" />
                View Inquiries
              </Button>
            </div>
          </Card.Content>
        </Card.Root>
      </div>
    </div>
  );
}
