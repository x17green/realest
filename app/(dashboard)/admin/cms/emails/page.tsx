import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Header, Footer } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Mail, Send, Users, Clock, CheckCircle, XCircle, Eye, Plus, Search } from "lucide-react";
import Link from "next/link";

export default async function CMSEmailsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Check if user is an admin
  const { data: profile } = await supabase
    .from("profiles")
    .select("user_type")
    .eq("id", user.id)
    .single();

  if (profile?.user_type !== "admin") {
    redirect("/");
  }

  // Mock email statistics (in a real app, this would come from email service logs)
  const emailStats = {
    totalSent: 15420,
    delivered: 14850,
    opened: 6230,
    clicked: 1246,
    bounced: 320,
    unsubscribed: 250,
    pendingCampaigns: 3,
    activeCampaigns: 1,
  };

  // Mock email campaigns
  const emailCampaigns = [
    {
      id: "1",
      name: "Welcome Email",
      subject: "Welcome to RealEST!",
      status: "sent",
      sentCount: 1250,
      openRate: 45.2,
      clickRate: 8.3,
      sentAt: "2024-01-15T10:00:00Z",
    },
    {
      id: "2",
      name: "Property Updates",
      subject: "New Properties in Your Area",
      status: "scheduled",
      sentCount: 0,
      openRate: 0,
      clickRate: 0,
      sentAt: "2024-01-20T09:00:00Z",
    },
    {
      id: "3",
      name: "Waitlist Update",
      subject: "You're #1,247 on the waitlist",
      status: "draft",
      sentCount: 0,
      openRate: 0,
      clickRate: 0,
      sentAt: null,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-8">
        <div className="mb-8">
          <Link
            href="/admin/cms"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4"
          >
            ← Back to CMS Dashboard
          </Link>
          <h1 className="text-3xl font-bold">Email Management</h1>
          <p className="text-muted-foreground">
            Create and manage email campaigns and communications
          </p>
        </div>

        {/* Email Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-4">
              <div className="text-center">
                <Send className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                <p className="text-xl font-bold">{emailStats.totalSent.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Total Sent</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <div className="text-center">
                <CheckCircle className="w-6 h-6 text-green-600 mx-auto mb-2" />
                <p className="text-xl font-bold">{emailStats.delivered.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Delivered</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <div className="text-center">
                <Eye className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                <p className="text-xl font-bold">{emailStats.opened.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Opened</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <div className="text-center">
                <Mail className="w-6 h-6 text-orange-600 mx-auto mb-2" />
                <p className="text-xl font-bold">{emailStats.clicked.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Clicked</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-4 mb-6">
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                New Campaign
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Email Campaign</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="campaignName">Campaign Name</Label>
                  <Input id="campaignName" placeholder="Enter campaign name" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="campaignSubject">Subject Line</Label>
                  <Input id="campaignSubject" placeholder="Enter email subject" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="recipientGroup">Recipient Group</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select recipients" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Users</SelectItem>
                      <SelectItem value="owners">Property Owners</SelectItem>
                      <SelectItem value="agents">Agents</SelectItem>
                      <SelectItem value="waitlist">Waitlist Subscribers</SelectItem>
                      <SelectItem value="verified">Verified Users</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="campaignContent">Email Content</Label>
                  <Textarea
                    id="campaignContent"
                    placeholder="Enter your email content..."
                    className="min-h-32"
                  />
                </div>
                <div className="flex gap-2">
                  <Button className="flex-1">Save as Draft</Button>
                  <Button className="flex-1">Send Now</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Button variant="outline">
            <Mail className="w-4 h-4 mr-2" />
            Send Test Email
          </Button>
        </div>

        {/* Email Campaigns */}
        <Tabs defaultValue="campaigns" className="space-y-6">
          <TabsList>
            <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="logs">Email Logs</TabsTrigger>
          </TabsList>

          <TabsContent value="campaigns">
            <Card>
              <CardHeader>
                <CardTitle>Email Campaigns</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Campaign</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Sent</TableHead>
                      <TableHead>Open Rate</TableHead>
                      <TableHead>Click Rate</TableHead>
                      <TableHead>Sent At</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {emailCampaigns.map((campaign) => (
                      <TableRow key={campaign.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{campaign.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {campaign.subject}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              campaign.status === "sent"
                                ? "default"
                                : campaign.status === "scheduled"
                                ? "secondary"
                                : "outline"
                            }
                          >
                            {campaign.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{campaign.sentCount.toLocaleString()}</TableCell>
                        <TableCell>{campaign.openRate}%</TableCell>
                        <TableCell>{campaign.clickRate}%</TableCell>
                        <TableCell>
                          {campaign.sentAt
                            ? new Date(campaign.sentAt).toLocaleDateString()
                            : "Not sent"}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline">
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="outline">
                              Edit
                            </Button>
                            {campaign.status === "draft" && (
                              <Button size="sm">
                                <Send className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="templates">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-12">
                  <Mail className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">
                    Email templates feature coming soon
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Create reusable email templates for common communications
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="logs">
            <Card>
              <CardHeader>
                <CardTitle>Email Logs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <Input
                      placeholder="Search emails..."
                      className="max-w-sm"
                    />
                    <Select>
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="delivered">Delivered</SelectItem>
                        <SelectItem value="bounced">Bounced</SelectItem>
                        <SelectItem value="opened">Opened</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button variant="outline">
                      <Search className="w-4 h-4 mr-2" />
                      Search
                    </Button>
                  </div>

                  <div className="text-center py-12">
                    <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      Email logs will be displayed here
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Track delivery status, opens, clicks, and bounces
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  );
}
