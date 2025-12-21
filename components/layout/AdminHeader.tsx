"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Avatar, Dropdown } from "@heroui/react";
import {
  Menu,
  X,
  Bell,
  Settings,
  LogOut,
  User,
  Shield,
  BarChart3,
  Users,
  Building,
} from "lucide-react";
import { HeaderLogo } from "@/components/ui/RealEstLogo";
import { ThemeToggleCompact } from "@/components/ui/theme-toggle-wrapper";
import { useUser } from "@/lib/hooks/useUser";
import { ProfileDropdown } from "@/components/realest";

export function AdminHeader() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, profile, logout } = useUser();
  const router = useRouter();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo and Admin Badge */}
          <div className="flex items-center gap-4">
            <Link href="/admin" className="flex items-center group">
              <HeaderLogo />
            </Link>

            {/* Admin Badge */}
            <div className="flex items-center gap-2 px-3 py-1 bg-danger/10 text-danger rounded-full text-sm font-medium">
              <Shield className="w-4 h-4" />
              Administrator
            </div>
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3">
            <ThemeToggleCompact />

            {/* System Alerts */}
            <Button variant="ghost" size="sm" className="relative">
              <Bell className="w-4 h-4" />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-danger rounded-full"></span>
            </Button>

            {/* Quick Admin Actions */}
            <Dropdown>
              <Dropdown.Trigger>
                <Button variant="ghost" size="sm">
                  <BarChart3 className="w-4 h-4" />
                </Button>
              </Dropdown.Trigger>
              <Dropdown.Menu>
                <Dropdown.Item
                  id="properties"
                  textValue="Property Verification"
                  onPress={() => router.push("/admin/properties")}
                >
                  <div className="flex w-full items-center gap-2">
                    <Building className="w-4 h-4" />
                    <span>Property Verification</span>
                  </div>
                </Dropdown.Item>
                <Dropdown.Item
                  id="agents"
                  textValue="Agent Verification"
                  onPress={() => router.push("/admin/agents")}
                >
                  <div className="flex w-full items-center gap-2">
                    <Users className="w-4 h-4" />
                    <span>Agent Verification</span>
                  </div>
                </Dropdown.Item>
                <Dropdown.Item
                  id="analytics"
                  textValue="System Analytics"
                  onPress={() => router.push("/admin/analytics")}
                >
                  <div className="flex w-full items-center gap-2">
                    <BarChart3 className="w-4 h-4" />
                    <span>System Analytics</span>
                  </div>
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>

            {/* User Menu */}
            <ProfileDropdown />
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
            onPress={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </Button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
            <div className="px-4 py-6 space-y-4">
              {/* Admin Badge Mobile */}
              <div className="flex items-center gap-2 px-3 py-2 bg-danger/10 text-danger rounded-lg">
                <Shield className="w-4 h-4" />
                <span className="text-sm font-medium">Administrator</span>
              </div>

              {/* Mobile User Info */}
              <div className="flex items-center gap-3 p-3 border rounded-lg">
                <Avatar.Root size="sm">
                  <Avatar.Fallback>
                    {profile?.full_name?.charAt(0) ||
                      user?.email?.charAt(0) ||
                      "A"}
                  </Avatar.Fallback>
                </Avatar.Root>
                <div>
                  <div className="font-medium text-sm">
                    {profile?.full_name || "Admin"}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {user?.email}
                  </div>
                </div>
              </div>

              {/* Mobile Quick Actions */}
              <div className="space-y-2">
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-3"
                  onPress={() => {
                    setIsMobileMenuOpen(false);
                    router.push("/admin/properties");
                  }}
                >
                  <Building className="w-4 h-4" />
                  Property Verification
                </Button>

                <Button
                  variant="ghost"
                  className="w-full justify-start gap-3"
                  onPress={() => {
                    setIsMobileMenuOpen(false);
                    router.push("/admin/agents");
                  }}
                >
                  <Users className="w-4 h-4" />
                  Agent Verification
                </Button>

                <Button
                  variant="ghost"
                  className="w-full justify-start gap-3"
                  onPress={() => {
                    setIsMobileMenuOpen(false);
                    router.push("/admin/analytics");
                  }}
                >
                  <BarChart3 className="w-4 h-4" />
                  System Analytics
                </Button>
              </div>

              {/* Mobile Actions */}
              <div className="space-y-2">
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-3"
                  onPress={() => {
                    setIsMobileMenuOpen(false);
                    window.location.href = "/profile";
                  }}
                >
                  <User className="w-4 h-4" />
                  My Profile
                </Button>

                <Button
                  variant="ghost"
                  className="w-full justify-start gap-3"
                  onPress={() => {
                    setIsMobileMenuOpen(false);
                    window.location.href = "/settings";
                  }}
                >
                  <Settings className="w-4 h-4" />
                  Settings
                </Button>

                <Button
                  variant="ghost"
                  className="w-full justify-start gap-3 relative"
                  onPress={() => setIsMobileMenuOpen(false)}
                >
                  <Bell className="w-4 h-4" />
                  Notifications
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 w-2 h-2 bg-danger rounded-full"></span>
                </Button>
              </div>

              {/* Mobile Theme Toggle & Logout */}
              <div className="pt-4 border-t space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">
                    Theme
                  </span>
                  <ThemeToggleCompact />
                </div>

                <Button
                  variant="ghost"
                  className="w-full justify-start gap-3 text-danger hover:text-danger hover:bg-error/10"
                  onPress={() => {
                    setIsMobileMenuOpen(false);
                    logout();
                  }}
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
