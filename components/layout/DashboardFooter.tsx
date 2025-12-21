"use client";

import Link from "next/link";
import { Separator } from "@heroui/react";
import { FooterLogo } from "@/components/ui/RealEstLogo";

export function DashboardFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border/50 bg-muted/30 mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          {/* Logo and Copyright */}
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center">
              <FooterLogo />
            </Link>
            <Separator orientation="vertical" className="h-6" />
            <p className="text-sm text-muted-foreground">
              © {currentYear} RealEST. All rights reserved.
            </p>
          </div>

          {/* Quick Links */}
          <div className="flex items-center gap-6 text-sm">
            <Link
              href="/help"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              Help Center
            </Link>
            <Link
              href="/privacy"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              Privacy
            </Link>
            <Link
              href="/terms"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              Terms
            </Link>
            <Link
              href="/contact"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              Contact
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
