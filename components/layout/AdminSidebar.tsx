"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@heroui/react";
import {
  Home,
  Building,
  Users,
  Shield,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";

interface AdminSidebarProps {
  currentPath: string;
}

export function AdminSidebar({ currentPath }: AdminSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const navigationItems = [
    {
      href: "/admin",
      label: "Dashboard",
      icon: Home,
      description: "System overview",
    },
    {
      href: "/admin/validation",
      label: "Property Verification",
      icon: Building,
      description: "Review property listings",
    },
    {
      href: "/admin/agents",
      label: "Agent Verification",
      icon: Users,
      description: "Verify real estate agents",
    },
    {
      href: "/admin/users",
      label: "User Management",
      icon: Shield,
      description: "Manage user accounts",
    },
    {
      href: "/admin/cms/analytics",
      label: "System Analytics",
      icon: BarChart3,
      description: "Platform statistics",
    },
  ];

  const isActive = (href: string) => {
    if (href === "/admin" && currentPath === "/admin") return true;
    return currentPath.startsWith(href) && href !== "/admin";
  };

  return (
    <aside
      className={`fixed left-0 top-16 h-[calc(100vh-4rem)] bg-background border-r border-border transition-all duration-300 z-40 ${
        isCollapsed ? "w-16" : "w-80"
      }`}
    >
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between">
            {!isCollapsed && (
              <div>
                <h2 className="text-lg font-semibold">Admin Panel</h2>
                <p className="text-xs text-muted-foreground">
                  System Management
                </p>
              </div>
            )}
            <Button
              variant="ghost"
              size="sm"
              onPress={() => setIsCollapsed(!isCollapsed)}
              className="flex items-center justify-center ml-auto"
            >
              {isCollapsed ? (
                <ChevronRight className="w-4 h-4" />
              ) : (
                <ChevronLeft className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);

            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={active ? "primary" : "ghost"}
                  className={`w-full justify-start gap-3 h-auto p-3 ${
                    isCollapsed ? "px-2" : ""
                  } ${active ? "bg-primary text-primary-foreground" : ""}`}
                >
                  <Icon
                    className={`w-5 h-5 flex-shrink-0 ${active ? "text-primary-foreground" : ""}`}
                  />
                  {!isCollapsed && (
                    <div className="flex flex-col items-start">
                      <span className="font-medium">{item.label}</span>
                      <span className="text-xs text-muted-foreground">
                        {item.description}
                      </span>
                    </div>
                  )}
                </Button>
              </Link>
            );
          })}
        </nav>

        {/* Quick Actions */}
        {!isCollapsed && (
          <div className="p-4 border-t border-border">
            <div className="space-y-2">
              <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Quick Actions
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start gap-2 text-warning hover:text-warning hover:bg-warning/10"
              >
                <AlertTriangle className="w-4 h-4" />
                System Alerts
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start gap-2 text-success hover:text-success hover:bg-success/10"
              >
                <CheckCircle className="w-4 h-4" />
                Health Check
              </Button>
            </div>
          </div>
        )}

        {/* Settings */}
        <div className="p-4 border-t border-border">
          <Link href="/settings">
            <Button
              variant="ghost"
              className={`w-full justify-start gap-3 h-10 ${
                isCollapsed ? "px-2" : "px-3"
              }`}
            >
              <Settings className="w-4 h-4 flex-shrink-0" />
              {!isCollapsed && <span>Settings</span>}
            </Button>
          </Link>
        </div>
      </div>
    </aside>
  );
}
