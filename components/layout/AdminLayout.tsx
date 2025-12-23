"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { AdminHeader } from "./AdminHeader";
import { AdminSidebar } from "./AdminSidebar";
import { AdminFooter } from "./AdminFooter";
import { Card, Button } from "@heroui/react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  Users,
  Building,
  BarChart3,
  Shield,
  Settings,
} from "lucide-react";
import { useUser } from "@/lib/hooks/useUser";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();
  const { role: userRole, isLoading } = useUser();
  const [systemStats] = useState({
    totalUsers: 1250,
    pendingVerifications: 23,
    activeProperties: 456,
    systemHealth: "healthy" as "healthy" | "warning" | "critical",
  });

  // Generate breadcrumbs based on current path
  const generateBreadcrumbs = () => {
    const pathSegments = pathname.split("/").filter(Boolean);
    const breadcrumbs = [{ label: "Admin Dashboard", href: "/admin" }];

    if (pathSegments.length > 1) {
      const currentPath = `/${pathSegments.join("/")}`;

      // Map paths to breadcrumb labels
      const pathMap: Record<string, string> = {
        "/admin/validation": "Property Verification",
        "/admin/agents": "Agent Verification",
        "/admin/users": "User Management",
        "/admin/cms/analytics": "System Analytics",
        "/admin/settings": "Settings",
        "/admin/subadmins": "Sub-Admin Management",
        "/admin/support": "Support Center",
        "/admin/content": "Content Management",
      };

      const label = pathMap[currentPath];
      if (label) {
        breadcrumbs.push({ label, href: currentPath });
      } else {
        // For unknown paths, create a generic breadcrumb
        const lastSegment = pathSegments[pathSegments.length - 1];
        breadcrumbs.push({
          label:
            lastSegment.charAt(0).toUpperCase() +
            lastSegment.slice(1).replace(/-/g, " "),
          href: currentPath,
        });
      }
    }

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-12 h-12 text-primary mx-auto mb-4 animate-pulse" />
          <div className="text-muted-foreground">Loading admin panel...</div>
        </div>
      </div>
    );
  }

  if (!isLoading && userRole !== "admin") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <Shield className="w-16 h-16 text-danger mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Access Denied</h2>
          <p className="text-muted-foreground mb-4">
            You don't have permission to access the admin panel.
          </p>
          <Button asChild>
            <a href="/profile">Return to Dashboard</a>
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <AdminHeader />

      <div className="flex">
        <AdminSidebar currentPath={pathname} />

        {/* Main content */}
        <main className="flex-1 ml-80">
          <div className="min-h-screen">
            {/* Breadcrumbs */}
            <div className="bg-background border-b border-border px-6 py-3">
              <Breadcrumb>
                <BreadcrumbList>
                  {breadcrumbs.map((item, index) => (
                    <div key={index} className="flex items-center">
                      {index > 0 && <BreadcrumbSeparator />}
                      <BreadcrumbItem>
                        {index === breadcrumbs.length - 1 ? (
                          <BreadcrumbPage>{item.label}</BreadcrumbPage>
                        ) : (
                          <BreadcrumbLink href={item.href}>
                            {item.label}
                          </BreadcrumbLink>
                        )}
                      </BreadcrumbItem>
                    </div>
                  ))}
                </BreadcrumbList>
              </Breadcrumb>
            </div>

            {/* System Status Bar */}
            <div className="bg-background border-b border-border px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        systemStats.systemHealth === "healthy"
                          ? "bg-success"
                          : systemStats.systemHealth === "warning"
                            ? "bg-warning"
                            : "bg-danger"
                      }`}
                    />
                    <span className="text-sm font-medium">
                      System {systemStats.systemHealth}
                    </span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {systemStats.totalUsers} Users
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {systemStats.pendingVerifications} Pending
                  </span>
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  Last updated: {new Date().toLocaleTimeString()}
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="px-6 py-4 border-b border-border bg-muted/20">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="flex items-center gap-3 p-3 bg-background rounded-lg border">
                  <Users className="w-8 h-8 text-primary" />
                  <div>
                    <div className="text-2xl font-bold">
                      {systemStats.totalUsers}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Total Users
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-background rounded-lg border">
                  <Building className="w-8 h-8 text-primary" />
                  <div>
                    <div className="text-2xl font-bold">
                      {systemStats.activeProperties}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Active Properties
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-background rounded-lg border">
                  <AlertTriangle className="w-8 h-8 text-warning" />
                  <div>
                    <div className="text-2xl font-bold">
                      {systemStats.pendingVerifications}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Pending Reviews
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-background rounded-lg border">
                  <BarChart3 className="w-8 h-8 text-success" />
                  <div>
                    <div className="text-2xl font-bold">98.5%</div>
                    <div className="text-xs text-muted-foreground">Uptime</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Page Content */}
            <div className="p-6">{children}</div>
          </div>
        </main>
      </div>

      <AdminFooter />
    </div>
  );
}
