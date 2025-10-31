"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Card, Button, Chip, Avatar, Separator, Tabs } from "@heroui/react";
import {
  Heart,
  Search,
  MessageSquare,
  Calendar,
  MapPin,
  DollarSign,
  Eye,
  Star,
  Home,
  Building,
  TrendingUp,
} from "lucide-react";

interface BuyerDashboardStats {
  savedProperties: number;
  activeSearches: number;
  sentInquiries: number;
  viewedProperties: number;
  favoriteLocations: string[];
}

interface SavedProperty {
  id: string;
  title: string;
  price: number;
  address: string;
  city: string;
  property_type: string;
  listing_type: string;
  saved_at: string;
  image_url?: string;
}

interface RecentSearch {
  id: string;
  query: string;
  location: string;
  property_type: string;
  price_range: string;
  created_at: string;
  results_count: number;
}

interface SentInquiry {
  id: string;
  property_title: string;
  property_id: string;
  message: string;
  status: string;
  sent_at: string;
  owner_response?: string;
}

export default function BuyerDashboardPage() {
  const [stats, setStats] = useState<BuyerDashboardStats | null>(null);
  const [savedProperties, setSavedProperties] = useState<SavedProperty[]>([]);
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>([]);
  const [sentInquiries, setSentInquiries] = useState<SentInquiry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      const supabase = createClient();

      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      // Mock data for now - in real app, these would come from database
      setStats({
        savedProperties: 12,
        activeSearches: 3,
        sentInquiries: 8,
        viewedProperties: 45,
        favoriteLocations: ["London", "Manchester", "Birmingham"],
      });

      // Mock saved properties
      setSavedProperties([
        {
          id: "1",
          title: "Modern 3-Bed Apartment",
          price: 2500,
          address: "123 High Street",
          city: "London",
          property_type: "apartment",
          listing_type: "rent",
          saved_at: new Date().toISOString(),
        },
        {
          id: "2",
          title: "Victorian Terrace House",
          price: 450000,
          address: "456 Oak Avenue",
          city: "Manchester",
          property_type: "house",
          listing_type: "sale",
          saved_at: new Date(Date.now() - 86400000).toISOString(),
        },
      ]);

      // Mock recent searches
      setRecentSearches([
        {
          id: "1",
          query: "3 bedroom apartment",
          location: "London",
          property_type: "apartment",
          price_range: "£2000-£3000",
          created_at: new Date().toISOString(),
          results_count: 24,
        },
        {
          id: "2",
          query: "family house",
          location: "Manchester",
          property_type: "house",
          price_range: "£300000-£500000",
          created_at: new Date(Date.now() - 86400000).toISOString(),
          results_count: 18,
        },
      ]);

      // Mock sent inquiries
      setSentInquiries([
        {
          id: "1",
          property_title: "Luxury Penthouse",
          property_id: "prop1",
          message:
            "I'm interested in viewing this property. Could we schedule a viewing for next week?",
          status: "pending",
          sent_at: new Date().toISOString(),
        },
        {
          id: "2",
          property_title: "Garden Apartment",
          property_id: "prop2",
          message:
            "Is this property still available? I'd like to make an offer.",
          status: "responded",
          sent_at: new Date(Date.now() - 86400000).toISOString(),
          owner_response:
            "Yes, it's still available. Would you like to schedule a viewing?",
        },
      ]);

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
            <h1 className="text-3xl font-bold">My Dashboard</h1>
            <p className="text-muted-foreground">
              Track your property searches and saved listings.
            </p>
          </div>
          <Button asChild variant="primary">
            <Link href="/search">
              <Search className="w-4 h-4 mr-2" />
              Search Properties
            </Link>
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card.Root>
            <Card.Content className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Saved Properties
                  </p>
                  <p className="text-2xl font-bold">
                    {stats?.savedProperties || 0}
                  </p>
                </div>
                <Heart className="w-8 h-8 text-danger" />
              </div>
            </Card.Content>
          </Card.Root>

          <Card.Root>
            <Card.Content className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Active Searches
                  </p>
                  <p className="text-2xl font-bold">
                    {stats?.activeSearches || 0}
                  </p>
                </div>
                <Search className="w-8 h-8 text-primary" />
              </div>
            </Card.Content>
          </Card.Root>

          <Card.Root>
            <Card.Content className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Sent Inquiries
                  </p>
                  <p className="text-2xl font-bold">
                    {stats?.sentInquiries || 0}
                  </p>
                </div>
                <MessageSquare className="w-8 h-8 text-warning" />
              </div>
            </Card.Content>
          </Card.Root>

          <Card.Root>
            <Card.Content className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Properties Viewed
                  </p>
                  <p className="text-2xl font-bold">
                    {stats?.viewedProperties || 0}
                  </p>
                </div>
                <Eye className="w-8 h-8 text-info" />
              </div>
            </Card.Content>
          </Card.Root>
        </div>

        {/* Main Content */}
        <Tabs.Root defaultSelectedKey="saved" className="space-y-6">
          <Tabs.ListWrapper>
            <Tabs.List
              aria-label="Dashboard sections"
              className="grid w-full grid-cols-3"
            >
              <Tabs.Tab id="saved">Saved Properties</Tabs.Tab>
              <Tabs.Tab id="searches">Recent Searches</Tabs.Tab>
              <Tabs.Tab id="inquiries">My Inquiries</Tabs.Tab>
            </Tabs.List>
          </Tabs.ListWrapper>

          {/* Saved Properties Tab */}
          <Tabs.Panel id="saved" className="space-y-6">
            <Card.Root>
              <Card.Header>
                <Card.Title className="flex items-center gap-2">
                  <Heart className="w-5 h-5" />
                  Saved Properties
                </Card.Title>
                <Card.Description>
                  Properties you've saved for later
                </Card.Description>
              </Card.Header>
              <Card.Content>
                {savedProperties.length === 0 ? (
                  <div className="text-center py-8">
                    <Heart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground mb-4">
                      No saved properties yet
                    </p>
                    <Button asChild variant="primary" size="sm">
                      <Link href="/search">Start Searching</Link>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {savedProperties.map((property) => (
                      <div
                        key={property.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center">
                            <Home className="w-8 h-8 text-muted-foreground" />
                          </div>
                          <div>
                            <h3 className="font-medium">{property.title}</h3>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                              <MapPin className="w-4 h-4" />
                              <span>
                                {property.address}, {property.city}
                              </span>
                            </div>
                            <div className="flex items-center gap-4 text-sm">
                              <Chip variant="secondary">
                                {property.property_type}
                              </Chip>
                              <span className="font-medium text-primary">
                                £{property.price.toLocaleString()}
                                {property.listing_type === "rent" && "/month"}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button asChild variant="secondary" size="sm">
                            <Link href={`/property/${property.id}`}>
                              <Eye className="w-4 h-4 mr-1" />
                              View
                            </Link>
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Heart className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    <div className="pt-4">
                      <Button asChild variant="secondary" className="w-full">
                        <Link href="/buyer/saved">
                          View All Saved Properties
                        </Link>
                      </Button>
                    </div>
                  </div>
                )}
              </Card.Content>
            </Card.Root>
          </Tabs.Panel>

          {/* Recent Searches Tab */}
          <Tabs.Panel id="searches" className="space-y-6">
            <Card.Root>
              <Card.Header>
                <Card.Title className="flex items-center gap-2">
                  <Search className="w-5 h-5" />
                  Recent Searches
                </Card.Title>
                <Card.Description>
                  Your recent property searches
                </Card.Description>
              </Card.Header>
              <Card.Content>
                {recentSearches.length === 0 ? (
                  <div className="text-center py-8">
                    <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground mb-4">
                      No recent searches
                    </p>
                    <Button asChild variant="primary" size="sm">
                      <Link href="/search">Start Searching</Link>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentSearches.map((search) => (
                      <div key={search.id} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-medium">
                            "{search.query}" in {search.location}
                          </h3>
                          <Chip variant="secondary">
                            {search.results_count} results
                          </Chip>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                          <span>{search.property_type}</span>
                          <span>{search.price_range}</span>
                          <span>
                            {new Date(search.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <Button variant="secondary" size="sm">
                          <Search className="w-4 h-4 mr-1" />
                          Search Again
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </Card.Content>
            </Card.Root>
          </Tabs.Panel>

          {/* Inquiries Tab */}
          <Tabs.Panel id="inquiries" className="space-y-6">
            <Card.Root>
              <Card.Header>
                <Card.Title className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  My Inquiries
                </Card.Title>
                <Card.Description>
                  Messages you've sent to property owners
                </Card.Description>
              </Card.Header>
              <Card.Content>
                {sentInquiries.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      No inquiries sent yet
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Inquiries will appear here when you contact property
                      owners
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {sentInquiries.map((inquiry) => (
                      <div key={inquiry.id} className="p-4 border rounded-lg">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="font-medium mb-1">
                              {inquiry.property_title}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              Sent{" "}
                              {new Date(inquiry.sent_at).toLocaleDateString()}
                            </p>
                          </div>
                          <Chip
                            type={
                              inquiry.status === "pending"
                                ? "warning"
                                : "success"
                            }
                            variant="secondary"
                          >
                            {inquiry.status}
                          </Chip>
                        </div>
                        <div className="bg-muted p-3 rounded-lg mb-3">
                          <p className="text-sm italic">"{inquiry.message}"</p>
                        </div>
                        {inquiry.owner_response && (
                          <div className="bg-primary-50 border border-primary-200 p-3 rounded-lg mb-3">
                            <p className="text-sm font-medium text-primary-900 mb-1">
                              Owner Response:
                            </p>
                            <p className="text-sm text-primary-800">
                              "{inquiry.owner_response}"
                            </p>
                          </div>
                        )}
                        <div className="flex gap-2">
                          <Button asChild variant="secondary" size="sm">
                            <Link href={`/property/${inquiry.property_id}`}>
                              View Property
                            </Link>
                          </Button>
                          {inquiry.status === "responded" && (
                            <Button variant="primary" size="sm">
                              Reply
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card.Content>
            </Card.Root>
          </Tabs.Panel>
        </Tabs.Root>

        {/* Favorite Locations */}
        {stats?.favoriteLocations && stats.favoriteLocations.length > 0 && (
          <Card.Root className="mt-8">
            <Card.Header>
              <Card.Title className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Favorite Locations
              </Card.Title>
              <Card.Description>
                Locations you search most frequently
              </Card.Description>
            </Card.Header>
            <Card.Content>
              <div className="flex flex-wrap gap-2">
                {stats.favoriteLocations.map((location, index) => (
                  <Button key={index} asChild variant="secondary" size="sm">
                    <Link
                      href={`/search?q=&location=${encodeURIComponent(location)}`}
                    >
                      <MapPin className="w-4 h-4 mr-1" />
                      {location}
                    </Link>
                  </Button>
                ))}
              </div>
            </Card.Content>
          </Card.Root>
        )}
      </div>
    </div>
  );
}
