import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
omponents/layout";/d
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Users, Search, UserCheck, UserX, Edit } from "lucide-react";
import Link from "next/link";

export default async function UsersPage() {
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

  // Fetch all users
  const { data: users } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  // Mock user stats
  const userStats = {
    totalUsers: users?.length || 0,
    verifiedUsers: users?.filter(u => u.is_verified).length || 0,
    activeUsers: users?.filter(u => u.user_type !== 'banned').length || 0,
    bannedUsers: users?.filter(u => u.user_type === 'banned').length || 0,
  };

  return (
    <>
        <div className="mb-8">
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-muted-foreground">
            Manage user accounts, verification status, and permissions
          </p>

        {/* User Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <Users className="w-8 h-8 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold">{userStats.totalUsers}</p>
                  <p className="text-sm text-muted-foreground">Total Users</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <UserCheck className="w-8 h-8 text-green-600" />
                <div>
                  <p className="text-2xl font-bold">{userStats.verifiedUsers}</p>
                  <p className="text-sm text-muted-foreground">Verified</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <UserCheck className="w-8 h-8 text-purple-600" />
                <div>
                  <p className="text-2xl font-bold">{userStats.activeUsers}</p>
                  <p className="text-sm text-muted-foreground">Active</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <UserX className="w-8 h-8 text-red-600" />
                <div>
                  <p className="text-2xl font-bold">{userStats.bannedUsers}</p>
                  <p className="text-sm text-muted-foreground">Banned</p>
            </CardContent>
          </Card>

        {/* Search and Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Search users by name or email..."
                  className="max-w-sm"
                />
              <Button variant="outline">
                <Search className="w-4 h-4 mr-2" />
                Search
              </Button>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Users</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users?.map((userProfile) => (
                  <TableRow key={userProfile.id}>
                    <TableCell className="font-medium">
                      {userProfile.full_name || "N/A"}
                    </TableCell>
                    <TableCell>{userProfile.email || "N/A"}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{userProfile.user_type}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={userProfile.is_verified ? "default" : "secondary"}>
                        {userProfile.is_verified ? "Verified" : "Unverified"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(userProfile.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button asChild size="sm" variant="outline">
                          <Link href={`/admin/users/${userProfile.id}`}>
                            <Edit className="w-4 h-4 mr-1" />
                            Edit
                          </Link>
                        </Button>
                        <Button size="sm" variant="outline">
                          {userProfile.user_type === 'banned' ? 'Unban' : 'Ban'}
                        </Button>
                    </TableCell>
                  </TableRow>
                )) || (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                      No users found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
  );
}
