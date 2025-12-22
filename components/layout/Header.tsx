"use client";

import Link from "next/link";
import { Button } from "@heroui/react";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  Menu,
  X,
  Home,
  Building,
  TrendingUp,
  Calendar,
  User as UserIcon,
  LogOut,
} from "lucide-react";
import { HeaderLogo } from "@/components/ui/RealEstLogo";
import { ThemeToggleCompact } from "@/components/ui/theme-toggle-wrapper";

export default function Header() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserSession = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        const { data: userRole } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id)
          .single();
        setRole(userRole?.role || null);
      } else {
        setRole(null);
      }
    };

    fetchUserSession();

    // Listen for auth state changes
    const supabase = createClient();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", session.user.id)
          .single()
          .then(({ data: userRole }) => {
            setRole(userRole?.role || null);
          });
      } else {
        setRole(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    setIsLoading(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  const getDashboardUrl = () => {
    switch (role) {
      case "owner":
        return "/owner";
      case "agent":
        return "/agent";
      case "admin":
        return "/admin";
      case "user":
      default:
        return "/profile";
    }
  };

  const navigationItems = [
    { href: "/buy", label: "Buy", icon: Home },
    { href: "/rent", label: "Rent", icon: TrendingUp },
    { href: "/sell", label: "Sell", icon: Building },
    { href: "/events", label: "Event Centers", icon: Calendar },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center group">
            <HeaderLogo />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-2">
            {navigationItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-xl transition-all duration-200 group"
              >
                <item.icon className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <ThemeToggleCompact />
            {user ? (
              <>
                <Link href={getDashboardUrl()}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex flex-wrap justify-center items-center hover:bg-primary/50 p-1 rounded-sm font-semibold gap-2 hover:shadow-sm transition-all duration-200"
                  >
                    <UserIcon className="w-4 h-4" />
                    Dashboard
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  onPress={handleLogout}
                  isDisabled={isLoading}
                  className="flex flex-wrap justify-center items-center hover:text-error/90 hover:bg-error/40 p-1 rounded-sm font-semibold gap-2 hover:shadow-sm transition-all duration-200 text-error"
                >
                  <LogOut className="w-4 h-4" />
                  {isLoading ? "Logging out..." : "Logout"}
                </Button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="hover:bg-primary/10"
                  >
                    Log In
                  </Button>
                </Link>
                <Link href="/register">
                  <Button
                    size="sm"
                    className="bg-linear-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg"
                  >
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
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
          <div className="lg:hidden border-t bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
            <div className="px-4 py-6 space-y-4">
              {/* Mobile Navigation */}
              <nav className="space-y-2">
                {navigationItems.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-xl transition-all duration-200"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <item.icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                ))}
              </nav>

              {/* Mobile Theme Toggle & Auth Buttons */}
              <div className="pt-4 border-t space-y-2">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-muted-foreground">
                    Theme
                  </span>
                  <ThemeToggleCompact />
                </div>
                {user ? (
                  <>
                    <Link
                      href={getDashboardUrl()}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Button
                        variant="ghost"
                        className="w-full justify-start gap-3 hover:bg-primary/10"
                      >
                        <UserIcon className="w-4 h-4" />
                        Dashboard
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      className="w-full justify-start gap-3 text-error hover:text-error hover:bg-error/10"
                      onPress={() => {
                        setIsMobileMenuOpen(false);
                        handleLogout();
                      }}
                      isDisabled={isLoading}
                    >
                      <LogOut className="w-4 h-4" />
                      {isLoading ? "Logging out..." : "Logout"}
                    </Button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Button
                        variant="ghost"
                        className="w-full justify-start hover:bg-primary/10"
                      >
                        Log In
                      </Button>
                    </Link>
                    <Link
                      href="/register"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Button className="w-full bg-linear-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70">
                        Sign Up
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
