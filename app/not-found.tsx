import Link from "next/link";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { Home, Search, MapPin, AlertTriangle, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full bg-background flex items-center justify-center relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-linear-to-br from-primary/5 via-background to-accent/5" />
      <div className="absolute top-20 left-10 w-32 h-32 bg-primary/10 rounded-full blur-xl animate-pulse" />
      <div className="absolute bottom-20 right-20 w-24 h-24 bg-accent/10 rounded-full blur-xl animate-pulse delay-1000" />

      <div className="relative z-10 max-w-2xl mx-auto text-center p-6 ">
        
        {/* Status Badge for Error Type */}
        <div className="flex justify-center pb-8">
          <StatusBadge variant="rejected" size="md">
            Page Not Found
          </StatusBadge>
        </div>
        
        {/* Error Icon & Number */}
        <div className="space-y-8 mb-12">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-linear-to-br from-primary/20 to-accent/20 border-2 border-accent/30 rounded-xl">
            <AlertTriangle className="w-12 h-12 text-accent" />
          </div>

          {/* 404 Number with brand typography */}
          <h1 className="text-display text-8xl lg:text-9xl font-bold bg-linear-to-br from-primary via-accent to-primary bg-clip-text text-transparent">
            404
          </h1>
        </div>

        {/* Error Message */}
        <div className="space-y-6 mb-12">
          <h2 className="font-heading text-3xl lg:text-4xl font-bold text-foreground">
            Page Not Found
          </h2>
          <p className="font-body text-lg text-muted-foreground max-w-lg mx-auto leading-relaxed">
            Oops! The page you're looking for doesn't exist. It might have been moved,
            deleted, or you entered the wrong URL.
          </p>
        </div>

        {/* Primary Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
          <Link href="/">
            <Button
              variant="neon"
              size="lg"
              className="w-full sm:w-auto min-w-48"
            >
              <Home className="w-5 h-5" />
              Back to Home
            </Button>
          </Link>

          <Link href="/search">
            <Button
              variant="violet"
              size="lg"
              className="w-full sm:w-auto min-w-48"
            >
              <Search className="w-5 h-5" />
              Search Properties
            </Button>
          </Link>
        </div>

        {/* Quick Navigation Card */}
        <div className="bg-card/50 backdrop-blur-sm border border-border rounded-xl p-8 space-y-6">
          <div className="space-y-2">
            <h3 className="font-heading text-xl font-semibold text-foreground">
              Looking for something specific?
            </h3>
            <p className="font-body text-sm text-muted-foreground">
              Explore popular sections of RealEST
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Link
              href="/buy"
              className="group flex items-center gap-4 p-4 rounded-lg hover:bg-primary/5 border border-transparent hover:border-primary/20 transition-all duration-200"
            >
              <div className="flex items-center justify-center w-10 h-10 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                <MapPin className="w-5 h-5 text-primary" />
              </div>
              <div className="text-left">
                <div className="font-body font-medium text-foreground group-hover:text-primary transition-colors">
                  Buy Properties
                </div>
                <div className="font-body text-xs text-muted-foreground">
                  Explore verified listings
                </div>
              </div>
            </Link>

            <Link
              href="/rent"
              className="group flex items-center gap-4 p-4 rounded-lg hover:bg-primary/5 border border-transparent hover:border-primary/20 transition-all duration-200"
            >
              <div className="flex items-center justify-center w-10 h-10 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                <MapPin className="w-5 h-5 text-primary" />
              </div>
              <div className="text-left">
                <div className="font-body font-medium text-foreground group-hover:text-primary transition-colors">
                  Rent Properties
                </div>
                <div className="font-body text-xs text-muted-foreground">
                  Find your next home
                </div>
              </div>
            </Link>

            <Link
              href="/sell"
              className="group flex items-center gap-4 p-4 rounded-lg hover:bg-primary/5 border border-transparent hover:border-primary/20 transition-all duration-200"
            >
              <div className="flex items-center justify-center w-10 h-10 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                <MapPin className="w-5 h-5 text-primary" />
              </div>
              <div className="text-left">
                <div className="font-body font-medium text-foreground group-hover:text-primary transition-colors">
                  List Property
                </div>
                <div className="font-body text-xs text-muted-foreground">
                  Sell or rent your property
                </div>
              </div>
            </Link>

            <Link
              href="/about"
              className="group flex items-center gap-4 p-4 rounded-lg hover:bg-primary/5 border border-transparent hover:border-primary/20 transition-all duration-200"
            >
              <div className="flex items-center justify-center w-10 h-10 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                <MapPin className="w-5 h-5 text-primary" />
              </div>
              <div className="text-left">
                <div className="font-body font-medium text-foreground group-hover:text-primary transition-colors">
                  About RealEST
                </div>
                <div className="font-body text-xs text-muted-foreground">
                  Learn about our platform
                </div>
              </div>
            </Link>
          </div>

        </div>

        {/* Support Contact */}
        <div className="mt-8 pt-6 border-t border-border/50">
          <p className="font-body text-sm text-muted-foreground">
            If you believe this is an error, please{" "}
            <Link
              href="/contact"
              className="text-primary hover:text-accent transition-colors duration-200 underline underline-offset-4 font-medium"
            >
              contact our support team
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
