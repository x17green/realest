"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
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
  Lock,
  AlertTriangle,
  CheckCircle,
  MenuSquare,
} from "lucide-react";

interface AdminSidebarProps {
  currentPath: string;
}

export function AdminSidebar({ currentPath }: AdminSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isButtonHovered, setIsButtonHovered] = useState(false);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

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

  // Handle mouse enter - expand immediately
  const handleMouseEnter = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    setIsHovered(true);
  };

  // Handle mouse leave - collapse after delay if manually collapsed
  const handleMouseLeave = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setIsHovered(false);
    }, 150); // 300ms delay to prevent flickering
  };

  // Determine if sidebar should be collapsed (manual collapse + not hovered)
  const shouldCollapse = isCollapsed && !isHovered;

  return (
    <aside
      className={`fixed left-0 top-16 h-[calc(100vh-4rem)] bg-background border-r border-accent/20 transition-all duration-300 z-40 ${
        shouldCollapse ? "w-15" : "w-65"
      }`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="p-4 -mb-2 border-b border-accent/20">
          <div className="flex px-0 items-center justify-between">
            {!shouldCollapse && (
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
              onMouseEnter={() => setIsButtonHovered(true)}
              onMouseLeave={() => setIsButtonHovered(false)}
              className="flex items-center justify-center ml-auto"
            >
              {isCollapsed && !isHovered ? (
                <MenuSquare className="w-5 h-5" />
              ) : isButtonHovered ? (
                <ChevronLeft className="w-5 h-5" />
              ) : (
                <Lock className="w-5 h-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-2 my-4 space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);

            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={active ? "primary" : "ghost"}
                  className={`w-full flex items-center justify-start gap-3 h-auto p-3 ${
                    shouldCollapse ? "p-3" : ""
                  } ${active ? "bg-primary text-primary-foreground" : ""} ${
                    shouldCollapse ? "rounded-sm" : "rounded-md"
                  } `}
                >
                  <Icon
                    className={`w-5 h-5 shrink-0 ${
                      active ? "text-primary-foreground" : ""
                    }`}
                  />
                  {!shouldCollapse && (
                    <div className="flex flex-col items-start">
                      <span className="font-medium">{item.label}</span>
                      <span
                        className={`text-xs ${
                          active
                            ? "text-primary-foreground"
                            : "text-muted-foreground"
                        }`}
                      >
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
        {!shouldCollapse && (
          <div className="p-4 border-t border-accent/20">
            <div className="flex flex-col justify-start space-y-2">
              <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Quick Actions
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="w-full flex items-center justify-start gap-2 text-warning hover:text-warning hover:bg-warning/10"
              >
                <AlertTriangle className="w-4 h-4" />
                System Alerts
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="w-full flex items-center justify-start gap-2 text-success hover:text-success hover:bg-success/10"
              >
                <CheckCircle className="w-4 h-4" />
                Health Check
              </Button>
            </div>
          </div>
        )}

        {/* Settings */}
        <div className="py-4 border-t border-accent/20">
          <Link href="/settings">
            <Button
              variant="ghost"
              className={`w-full flex items-center justify-start gap-3 h-10 ${
                shouldCollapse ? "p-6" : "px-3"
              }`}
            >
              <Settings className="w-4 h-4 shrink-0" />
              {!shouldCollapse && <span>Settings</span>}
            </Button>
          </Link>
        </div>
      </div>
    </aside>
  );
}
