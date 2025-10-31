"use client";

import Link from "next/link";
import { Button } from "@heroui/react";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface HeaderProps {
  user: User | null;
}

export default function Header({ user }: HeaderProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    setIsLoading(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="font-bold text-xl">🏠 RealProof</div>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          <Link href="/" className="text-sm font-medium hover:text-primary">
            Buy
          </Link>
          <Link href="/" className="text-sm font-medium hover:text-primary">
            Rent
          </Link>
          <Link href="/" className="text-sm font-medium hover:text-primary">
            Sell
          </Link>
          <Link href="/" className="text-sm font-medium hover:text-primary">
            Event Centers
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          {user ? (
            <>
              <Link href="/owner/dashboard">
                <Button variant="tertiary" size="sm">
                  Dashboard
                </Button>
              </Link>
              <Button
                variant="ghost"
                size="sm"
                onPress={handleLogout}
                isDisabled={isLoading}
              >
                {isLoading ? "Logging out..." : "Logout"}
              </Button>
            </>
          ) : (
            <>
              <Link href="/auth/login">
                <Button variant="tertiary" size="sm">
                  Log In
                </Button>
              </Link>
              <Link href="/auth/sign-up">
                <Button size="sm">Sign Up</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
