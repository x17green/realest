import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { List, Users, Mail, Search, Trash2, Send, Download } from "lucide-react";
import Link from "next/link";

export default async function WaitlistManagementPage() {
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

  // Fetch waitlist data from Supabase
  const { data: waitlistData } = await supabase
    .from("waitlist")
    .select("*")
    .order("created_at", { ascending: false });

  // Mock waitlist stats (in a real app, this would come from the API)
  const waitlistStats = {
    totalSubscribers: waitlistData?.length || 0,
    newThisWeek: waitlistData?.filter(item => {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return new Date(item.created_at) > weekAgo;
    }).length || 0,
    conversionRate: 12.5, // percentage
    averagePosition: Math.floor((waitlistData?.length || 0) / 2),
  };

  return (
    <>
      <div className="container mx-auto p-4">
        
        {/* Page Header */}  
        <div className="mb-8">
          <Link
            href="/admin/cms"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4"
          >
            ← Back to CMS Dashboard
          </Link>
          <h1 className="text-3xl font-bold">Waitlist Management</h1>
          <p className="text-muted-foreground">
            Manage waitlist subscribers and communications
          </p>
        </div>
        
        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <Users className="w-8 h-8 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold">
                    {waitlistStats.totalSubscribers.toLocaleString()}
                  </p>
                  <p className="text-sm text-muted-foreground">Total Subscribers</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <List className="w-8 h-8 text-green-600" />
                <div>
                  <p className="text-2xl font-bold">{waitlistStats.newThisWeek}</p>
                  <p className="text-sm text-muted-foreground">New This Week</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <Mail className="w-8 h-8 text-purple-600" />
                <div>
                  <p className="text-2xl font-bold">{waitlistStats.conversionRate}%</p>
                  <p className="text-sm text-muted-foreground">Conversion Rate</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <List className="w-8 h-8 text-orange-600" />
                <div>
                  <p className="text-2xl font-bold">{waitlistStats.averagePosition}</p>
                  <p className="text-sm text-muted-foreground">Avg Position</p>
                </div>
              </div>
            </CardContent>
          </Card>
        {/*</div>*/}

        {/* Actions */}
        <div className="flex gap-4 mb-6">
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Mail className="w-4 h-4 mr-2" />
                Send Email Campaign
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Send Email Campaign</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="campaignSubject">Subject</Label>
                  <Input id="campaignSubject" placeholder="Enter email subject" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="campaignMessage">Message</Label>
                  <Textarea
                    id="campaignMessage"
                    placeholder="Enter your message..."
                    className="min-h-32"
                  />
                </div>
                <div className="flex gap-2">
                  <Button className="flex-1">
                    <Send className="w-4 h-4 mr-2" />
                    Send to All
                  </Button>
                  <Button variant="outline" className="flex-1">
                    Send Test Email
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export List
          </Button>
        </div>
        
        {/* Search */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Search subscribers by name or email..."
                  className="max-w-sm"
                />
              </div>
              <Button variant="outline">
                <Search className="w-4 h-4 mr-2" />
                Search
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Subscribers Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Subscribers</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Position</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {waitlistData?.map((subscriber, index) => (
                  <TableRow key={subscriber.id}>
                    <TableCell className="font-medium">
                      #{index + 1}
                    </TableCell>
                    <TableCell>
                      {subscriber.first_name} {subscriber.last_name || ""}
                    </TableCell>
                    <TableCell>{subscriber.email}</TableCell>
                    <TableCell>{subscriber.phone || "N/A"}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{subscriber.source || "website"}</Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(subscriber.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <Mail className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )) || (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground">
                      No waitlist subscribers found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
