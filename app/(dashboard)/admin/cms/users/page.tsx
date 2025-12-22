import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
omponents/layout";/d
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Users,
  UserCheck,
  UserX,
  Search,
  Filter,
  Eye,
  Edit,
  Ban,
  CheckCircle,
  Home,
  MessageSquare,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";

export default async function CMSUsersPage() {
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

  // Fetch all users with their activity data
  const { data: users } = await supabase
    .from("profiles")
    .select(`
      *,
      properties:properties(count),
      inquiries:inquiries(count),
      reviews:reviews(count)
    `)
    .order("created_at", { ascending: false });

  // Mock user statistics (in a real app, this would be calculated from the data)
  const userStats = {
    totalUsers: users?.length || 0,
    activeUsers: users?.filter(u => u.last_login_at && new Date(u.last_login_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length || 0,
    verifiedUsers: users?.filter(u => u.is_verified).length || 0,
    bannedUsers: users?.filter(u => u.user_type === 'banned').length || 0,
    owners: users?.filter(u => u.user_type === 'owner').length || 0,
    agents: users?.filter(u => u.user_type === 'agent').length || 0,
    regularUsers: users?.filter(u => u.user_type === 'user').length || 0,
  };

  return (
    <>
        <div className="mb-8">
          <Link
            href="/admin/cms"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4"
          >
            ← Back to CMS Dashboard
          </Link>
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-muted-foreground">
            Comprehensive user overview and management
          </p>

        {/* Statistics Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-8">
          <Card>
            <CardContent className="pt-4">
              <div className="text-center">
                <Users className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                <p className="text-xl font-bold">{userStats.totalUsers}</p>
                <p className="text-xs text-muted-foreground">Total</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <div className="text-center">
                <UserCheck className="w-6 h-6 text-green-600 mx-auto mb-2" />
                <p className="text-xl font-bold">{userStats.activeUsers}</p>
                <p className="text-xs text-muted-foreground">Active</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <div className="text-center">
                <CheckCircle className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                <p className="text-xl font-bold">{userStats.verifiedUsers}</p>
                <p className="text-xs text-muted-foreground">Verified</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <div className="text-center">
                <Home className="w-6 h-6 text-orange-600 mx-auto mb-2" />
                <p className="text-xl font-bold">{userStats.owners}</p>
                <p className="text-xs text-muted-foreground">Owners</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <div className="text-center">
                <MessageSquare className="w-6 h-6 text-indigo-600 mx-auto mb-2" />
                <p className="text-xl font-bold">{userStats.agents}</p>
                <p className="text-xs text-muted-foreground">Agents</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <div className="text-center">
                <Users className="w-6 h-6 text-gray-600 mx-auto mb-2" />
                <p className="text-xl font-bold">{userStats.regularUsers}</p>
                <p className="text-xs text-muted-foreground">Users</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <div className="text-center">
                <UserX className="w-6 h-6 text-red-600 mx-auto mb-2" />
                <p className="text-xl font-bold">{userStats.bannedUsers}</p>
                <p className="text-xs text-muted-foreground">Banned</p>
            </CardContent>
          </Card>

        {/* Filters and Search */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Search users by name, email, or phone..."
                  className="max-w-md"
                />
              <div className="flex gap-2">
                <Select>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="owner">Owner</SelectItem>
                    <SelectItem value="agent">Agent</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="banned">Banned</SelectItem>
                  </SelectContent>
                </Select>
                <Select>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="verified">Verified</SelectItem>
                    <SelectItem value="unverified">Unverified</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline">
                  <Filter className="w-4 h-4 mr-2" />
                  Apply
                </Button>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Tabs defaultValue="all" className="space-y-6">
          <TabsList>
            <TabsTrigger value="all">All Users ({userStats.totalUsers})</TabsTrigger>
            <TabsTrigger value="owners">Owners ({userStats.owners})</TabsTrigger>
            <TabsTrigger value="agents">Agents ({userStats.agents})</TabsTrigger>
            <TabsTrigger value="banned">Banned ({userStats.bannedUsers})</TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            <Card>
              <CardHeader>
                <CardTitle>All Users</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Activity</TableHead>
                      <TableHead>Properties</TableHead>
                      <TableHead>Inquiries</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users?.map((userProfile) => (
                      <TableRow key={userProfile.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">
                              {userProfile.full_name || "N/A"}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {userProfile.email}
                            </p>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{userProfile.user_type}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            {userProfile.is_verified && (
                              <Badge variant="default" className="text-xs">
                                Verified
                              </Badge>
                            )}
                            {userProfile.user_type === 'banned' && (
                              <Badge variant="destructive" className="text-xs">
                                Banned
                              </Badge>
                            )}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <p>Last login: {userProfile.last_login_at ? new Date(userProfile.last_login_at).toLocaleDateString() : 'Never'}</p>
                        </TableCell>
                        <TableCell className="text-center">
                          {userProfile.properties?.[0]?.count || 0}
                        </TableCell>
                        <TableCell className="text-center">
                          {userProfile.inquiries?.[0]?.count || 0}
                        </TableCell>
                        <TableCell>
                          {new Date(userProfile.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button asChild size="sm" variant="outline">
                              <Link href={`/admin/cms/users/${userProfile.id}`}>
                                <Eye className="w-4 h-4" />
                              </Link>
                            </Button>
                            <Button size="sm" variant="outline">
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant={userProfile.user_type === 'banned' ? 'default' : 'destructive'}
                            >
                              {userProfile.user_type === 'banned' ? 'Unban' : 'Ban'}
                            </Button>
                        </TableCell>
                      </TableRow>
                    )) || (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center text-muted-foreground">
                          No users found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Similar tabs for owners, agents, banned - would filter the data */}
          <TabsContent value="owners">
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">
                  Filtered view for property owners - implementation similar to "All Users" tab
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="agents">
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">
                  Filtered view for agents - implementation similar to "All Users" tab
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="banned">
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">
                  Banned users view - implementation similar to "All Users" tab
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
  );
}
