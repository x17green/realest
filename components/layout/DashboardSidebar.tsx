"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@heroui/react";
import {
  Home,
  Heart,
  Search,
  MessageSquare,
  Building,
  BarChart3,
  Users,
  Shield,
  Settings,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface DashboardSidebarProps {
  userRole: string | null;
  currentPath: string;
}

export function DashboardSidebar({
  userRole,
  currentPath,
}: DashboardSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const getNavigationItems = (role: string | null) => {
    const baseItems = [
      {
        href: "/profile",
        label: "Dashboard",
        icon: Home,
        roles: ["user", "owner", "agent"],
      },
    ];

    const roleSpecificItems = {
      user: [
        {
          href: "/profile",
          label: "Saved Properties",
          icon: Heart,
          roles: ["user"],
        },
        {
          href: "/profile",
          label: "Recent Searches",
          icon: Search,
          roles: ["user"],
        },
        {
          href: "/profile",
          label: "My Inquiries",
          icon: MessageSquare,
          roles: ["user"],
        },
      ],
      owner: [
        {
          href: "/owner",
          label: "My Listings",
          icon: Building,
          roles: ["owner"],
        },
        {
          href: "/owner/inquiries",
          label: "Inquiries",
          icon: MessageSquare,
          roles: ["owner"],
        },
        {
          href: "/owner/analytics",
          label: "Analytics",
          icon: BarChart3,
          roles: ["owner"],
        },
      ],
      agent: [
        {
          href: "/agent",
          label: "My Listings",
          icon: Building,
          roles: ["agent"],
        },
        {
          href: "/agent/clients",
          label: "Client Properties",
          icon: Users,
          roles: ["agent"],
        },
        {
          href: "/agent/inquiries",
          label: "Inquiries",
          icon: MessageSquare,
          roles: ["agent"],
        },
        {
          href: "/agent/analytics",
          label: "Analytics",
          icon: BarChart3,
          roles: ["agent"],
        },
      ],
      admin: [
        {
          href: "/admin",
          label: "Dashboard",
          icon: Home,
          roles: ["admin"],
        },
        {
          href: "/admin/properties",
          label: "Property Verification",
          icon: Building,
          roles: ["admin"],
        },
        {
          href: "/admin/agents",
          label: "Agent Verification",
          icon: Users,
          roles: ["admin"],
        },
        {
          href: "/admin/users",
          label: "User Management",
          icon: Shield,
          roles: ["admin"],
        },
        {
          href: "/admin/analytics",
          label: "System Analytics",
          icon: BarChart3,
          roles: ["admin"],
        },
      ],
    };

    const items = [
      ...baseItems,
      ...(roleSpecificItems[role as keyof typeof roleSpecificItems] || []),
    ];

    return items.filter((item) => item.roles.includes(role || "user"));
  };

  const navigationItems = getNavigationItems(userRole);

  const isActive = (href: string) => {
    if (href === "/profile" && currentPath === "/profile") return true;
    if (href === "/owner" && currentPath.startsWith("/owner")) return true;
    if (href === "/agent" && currentPath.startsWith("/agent"))
      return true;
    if (href === "/admin" && currentPath.startsWith("/admin")) return true;
    return currentPath === href;
  };

  return (
    <aside
      className={`fixed left-0 top-16 h-[calc(100vh-4rem)] bg-background border-r border-border transition-all duration-300 z-40 ${
        isCollapsed ? "w-16" : "w-64"
      }`}
    >
      <div className="flex flex-col h-full">
        {/* Collapse Toggle */}
        <div className="p-4 border-b border-border">
          <Button
            variant="ghost"
            size="sm"
            onPress={() => setIsCollapsed(!isCollapsed)}
            className="w-full flex items-center justify-center"
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </Button>
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
                  className={`w-full justify-start gap-3 h-10 ${
                    isCollapsed ? "px-2" : "px-3"
                  } ${active ? "bg-primary text-primary-foreground" : ""}`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  {!isCollapsed && (
                    <span className="truncate">{item.label}</span>
                  )}
                </Button>
              </Link>
            );
          })}
        </nav>

        {/* Settings */}
        <div className="p-4 border-t border-border">
          <Link href="/settings">
            <Button
              variant="ghost"
              className={`w-full justify-start gap-3 h-10 ${
                isCollapsed ? "px-2" : "px-3"
              }`}
            >
              <Settings className="w-4 h-4 shrink-0" />
              {!isCollapsed && <span>Settings</span>}
            </Button>
          </Link>
        </div>
      </div>
    </aside>
  );
}
