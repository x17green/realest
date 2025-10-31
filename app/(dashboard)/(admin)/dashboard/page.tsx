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
  Input,
  Select,
  SelectItem,
} from "@heroui/react";
import {
  Shield,
  Users,
  Building,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  Search,
  Filter,
  Eye,
  Ban,
  UserCheck,
  BarChart3,
  Calendar,
  MapPin,
} from "lucide-react";

interface AdminStats {
  totalUsers: number;
  totalProperties: number;
  pendingVerifications: number;
  activeProperties: number;
  totalRevenue: number;
  monthlyGrowth: number;
}

interface PendingProperty {
  id: string;
  title: string;
  owner_name: string;
  owner_email: string;
  submitted_at: string;
  ml_score: number;
  documents_count: number;
  status: string;
}

interface User {
  id: string;
  email: string;
  full_name: string;
  user_type: string;
  created_at: string;
  is_verified: boolean;
  properties_count: number;
}

interface SystemAlert {
  id: string;
  type: "warning" | "error" | "info";
  title: string;
  message: string;
  created_at: string;
  resolved: boolean;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [pendingProperties, setPendingProperties] = useState<PendingProperty[]>([]);
  const [recentUsers, setRecentUsers] = useState<User[]>([]);
  const [systemAlerts, setSystemAlerts] = useState<SystemAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      const supabase = createClient();

      // Mock data for now - in real app, these would come from database
      setStats({
        totalUsers: 1247,
        totalProperties: 892,
        pendingVerifications: 23,
        activeProperties: 756,
        totalRevenue: 45670,
        monthlyGrowth: 12.5,
      });

      // Mock pending properties
      setPendingProperties([
        {
          id: "1",
          title: "Luxury Downtown Penthouse",
          owner_name: "John Smith",
          owner_email: "john@example.com",
          submitted_at: new Date().toISOString(),
          ml_score: 0.95,
          documents_count: 5,
          status: "pending_ml",
        },
        {
          id: "2",
          title: "Suburban Family Home",
          owner_name: "Sarah Johnson",
          owner_email: "sarah@example.com",
          submitted_at: new Date(Date.now() - 86400000).toISOString(),
          ml_score: 0.87,
          documents_count: 4,
          status: "pending_vetting",
        },
        {
          id: "3",
          title: "Commercial Office Space",
          owner_name: "Mike Wilson",
          owner_email: "mike@example.com",
          submitted_at: new Date(Date.now() - 172800000).toISOString(),
          ml_score: 0.92,
          documents_count: 6,
          status: "flagged",
        },
      ]);

      // Mock recent users
      setRecentUsers([
        {
          id: "1",
          email: "alice@example.com",
          full_name: "Alice Cooper",
          user_type: "property_owner",
          created_at: new Date().toISOString(),
          is_verified: true,
          properties_count: 3,
        },
        {
          id: "2",
          email: "bob@example.com",
          full_name: "Bob Davis",
          user_type: "buyer",
          created_at: new Date(Date.now() - 86400000).toISOString(),
          is_verified: false,
          properties_count: 0,
        },
      ]);

      // Mock system alerts
      setSystemAlerts([
        {
          id: "1",
          type: "warning",
          title: "High ML Processing Queue",
          message: "ML service processing queue has exceeded 100 items",
          created_at: new Date().toISOString(),
          resolved: false,
        },
        {
          id: "2",
          type: "info",
          title: "Monthly Backup Completed",
          message: "Database backup completed successfully",
          created_at: new Date(Date.now() - 3600000).toISOString(),
          resolved: true,
        },
      ]);

      setIsLoading(false);
    };

    fetchDashboardData();
  }, []);

  const filteredProperties = pendingProperties.filter(property => {
    const matchesSearch = property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         property.owner_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === "all" || property.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

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
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground">
              Manage platform operations and oversee property verifications.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary">
              <BarChart3 className="w-4 h-4 mr-2" />
              Analytics
            </Button>
            <Button variant="secondary">
              <Shield className="w-4 h-4 mr-2" />
              System Settings
            </Button>
          </div>
        </div>

        {/* System Alerts */}
        {systemAlerts.filter(alert => !alert.resolved).length > 0 && (
          <div className="mb-8">
            {systemAlerts.filter(alert => !alert.resolved).map((alert) => (
              <Card.Root key={alert.id} className="border-l-4 border-l-warning">
                <Card.Content className="p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-warning mt-0.5" />
                    <div className="flex-1">
                      <h3 className="font-medium">{alert.title}</h3>
                      <p className="text-sm text-muted-foreground">{alert.message}</p>
                    </div>
                    <Button variant="ghost" size="sm">
                      Dismiss
                    </Button>
                  </div>
                </Card.Content>
              </Card.Root>
            ))}
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card.Root>
            <Card.Content className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                  <p className="text-2xl font-bold">{stats?.totalUsers.toLocaleString()}</p>
                  <p className="text-xs text-success">+12% this month</p>
                </div>
                <Users className="w-8 h-8 text-primary" />
              </div>
            </Card.Content>
          </Card.Root>

          <Card.Root>
            <Card.Content className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Properties</p>
                  <p className="text-2xl font-bold">{stats?.totalProperties.toLocaleString()}</p>
                  <p className="text-xs text-success">+8% this month</p>
                </div>
                <Building className="w-8 h-8 text-success" />
              </div>
            </Card.Content>
          </Card.Root>

          <Card.Root>
            <Card.Content className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Pending Verifications</p>
                  <p className="text-2xl font-bold">{stats?.pendingVerifications}</p>
                  <p className="text-xs text-warning">Requires attention</p>
                </div>
                <Clock className="w-8 h-8 text-warning" />
              </div>
            </Card.Content>
          </Card.Root>

          <Card.Root>
            <Card.Content className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Platform Revenue</p>
                  <p className="text-2xl font-bold">£{stats?.totalRevenue.toLocaleString()}</p>
                  <p className="text-xs text-success">+{stats?.monthlyGrowth}% this month</p>
                </div>
                <TrendingUp className="w-8 h-8 text-success" />
              </div>
            </Card.Content>
          </Card.Root>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="verifications" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="verifications">Property Verifications</TabsTrigger>
            <TabsTrigger value="users">User Management</TabsTrigger>
            <TabsTrigger value="system">System Overview</TabsTrigger>
          </TabsList>

          {/* Property Verifications Tab */}
          <TabsContent value="verifications" className="space-y-6">
            <Card.Root>
              <Card.Header>
                <div className="flex items-center justify-between">
                  <div>
                    <Card.Title className="flex items-center gap-2">
                      <Shield className="w-5 h-5" />
                      Property Verification Queue
                    </Card.Title>
                    <Card.Description>
                      Review and verify submitted properties
                    </Card.Description>
                  </div>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Search properties..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-64"
                      startContent={<Search className="w-4 h-4" />}
                    />
                    <Select
                      value={filterStatus}
                      onChange={(value) => setFilterStatus(value)}
                      className="w-40"
                    >
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending_ml">ML Pending</SelectItem>
                      <SelectItem value="pending_vetting">Vetting</SelectItem>
                      <SelectItem value="flagged">Flagged</SelectItem>
                    </Select>
                  </div>
                </div>
              </Card.Header>
              <Card.Content>
                <div className="space-y-4">
                  {filteredProperties.map((property) => (
                    <div key={property.id} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="font-medium mb-1">{property.title}</h3>
                          <p className="text-sm text-muted-foreground mb-2">
                            Submitted by {property.owner_name} ({property.owner_email})
                          </p>
                          <div className="flex items-center gap-4 text-sm">
                            <span>ML Score: {(property.ml_score * 100).toFixed(1)}%</span>
                            <span>{property.documents_count} documents</span>
                            <span>{new Date(property.submitted_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Chip
                            type={
                              property.status === "flagged"
                                ? "danger"
                                : property.status === "pending_vetting"
                                ? "warning"
                                : "info"
                            }
                            variant="secondary"
                            size="sm"
                          >
                            {property.status.replace("_", " ")}
                          </Chip>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="secondary" size="sm">
                          <Eye className="w-4 h-4 mr-1" />
                          Review Documents
                        </Button>
                        <Button variant="primary" size="sm">
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Approve
                        </Button>
                        <Button variant="danger" size="sm">
                          <Ban className="w-4 h-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </Card.Content>
            </Card.Root>
          </TabsContent>

          {/* User Management Tab */}
          <TabsContent value="users" className="space-y-6">
            <Card.Root>
              <Card.Header>
                <Card.Title className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  User Management
                </Card.Title>
                <Card.Description>
                  Manage platform users and their accounts
                </Card.Description>
              </Card.Header>
              <Card.Content>
                <div className="space-y-4">
                  {recentUsers.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Avatar
                          name={user.full_name}
                          size="md"
                        />
                        <div>
                          <h3 className="font-medium">{user.full_name}</h3>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Chip
                              type={
                                user.user_type === "admin"
                                  ? "primary"
                                  : user.user_type === "property_owner"
                                  ? "success"
                                  : "secondary"
                              }
                              variant="secondary"
                              size="sm"
                            >
                              {user.user_type.replace("_", " ")}
                            </Chip>
                            {user.is_verified && (
                              <Chip type="success" variant="secondary" size="sm">
                                Verified
                              </Chip>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                          {user.properties_count} properties
                        </span>
                        <Button variant="secondary" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Ban className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  <div className="pt-4">
                    <Button variant="secondary" className="w-full">
                      View All Users
                    </Button>
                  </div>
                </div>
              </Card.Content>
            </Card.Root>
          </TabsContent>

          {/* System Overview Tab */}
          <TabsContent value="system" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* System Health */}
              <Card.Root>
                <Card.Header>
                  <Card.Title>System Health</Card.Title>
                  <Card.Description>
                    Current status of platform services
                  </Card.Description>
                </Card.Header>
                <Card.Content>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Database</span>
                      <Chip type="success" variant="secondary" size="sm">
                        Healthy
                      </Chip>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">ML Service</span>
                      <Chip type="warning" variant="secondary" size="sm">
                        High Load
                      </Chip>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Storage</span>
                      <Chip type="success" variant="secondary" size="sm">
                        Healthy
                      </Chip>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Email Service</span>
                      <Chip type="success" variant="secondary" size="sm">
                        Healthy
                      </Chip>
                    </div>
                  </div>
                </Card.Content>
              </Card.Root>

              {/* Recent Activity */}
              <Card.Root>
                <Card.Header>
                  <Card.Title>Recent Activity</Card.Title>
                  <Card.Description>
                    Latest platform events and actions
                  </Card.Description>
                </Card.Header>
                <Card.Content>
                  <div className="space-y-4">
                    {systemAlerts.map((alert) => (
                      <div key={alert.id} className="flex items-start gap-3 p-3 border rounded-lg">
                        <div className={`w-2 h-2 rounded-full mt-2 ${
                          alert.type === "error" ? "bg-danger" :
                          alert.type === "warning" ? "bg-warning" : "bg-info"
                        }`} />
                        <div className="flex-1">
                          <h4 className="text-sm font-medium">{alert.title}</h4>
                          <p className="text-xs text-muted-foreground">{alert.message}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(alert.created_at).toLocaleString()}
                          </p>
                        </div>
                        {alert.resolved && (
                          <CheckCircle className="w-4 h-4 text-success" />
                        )}
                      </div>
                    ))}
                  </div>
                </Card.Content>
              </Card.Root>
            </div>

            {/* Quick Actions */}
            <Card.Root>
              <Card.Header>
                <Card.Title>Quick Actions</Card.Title>
                <Card.Description>
                  Common administrative tasks
                </Card.Description>
              </Card.Header>
              <Card.Content>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button variant="secondary" className="h-20 flex-col">
                    <Shield className="w-6 h-6 mb-2" />
                    Security Audit
                  </Button>
                  <Button variant="secondary" className="h-20 flex-col">
                    <BarChart3 className="w-6 h-6 mb-2" />
                    Generate Report
                  </Button>
                  <Button variant="secondary" className="h-20 flex-col">
                    <Calendar className="w-6 h-6 mb-2" />
                    Maintenance Mode
                  </Button>
                </div>
              </Card.Content>
            </Card.Root>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
