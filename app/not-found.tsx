import { Button } from "@heroui/react";
import { Home, Search, ArrowLeft, MapPin, AlertTriangle } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full bg-background flex items-center justify-center">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-linear-to-br from-primary/5 via-background to-secondary/5" />
      <div className="absolute top-20 left-10 w-32 h-32 bg-primary/10 rounded-full blur-xl animate-pulse" />
      <div className="absolute bottom-20 right-20 w-24 h-24 bg-secondary/10 rounded-full blur-xl animate-pulse delay-1000" />

      <div className="relative z-10 max-w-2xl mx-auto text-center px-4">
        {/* 404 Icon */}
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/30 rounded-full mb-6">
            <AlertTriangle className="w-12 h-12 text-primary" />
          </div>

          {/* 404 Number */}
          <h1 className="text-9xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent mb-4">
            404
          </h1>
        </div>

        {/* Error Message */}
        <h2 className="text-h1 font-bold mb-4 text-foreground">
          Page Not Found
        </h2>

        <p className="text-body-l text-muted-foreground mb-8 max-w-lg mx-auto leading-relaxed">
          Oops! The page you're looking for doesn't exist. It might have been moved,
          deleted, or you entered the wrong URL.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Link href="/">
            <Button
              size="lg"
              className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 px-8 rounded-xl font-semibold gap-2 shadow-lg hover:shadow-xl transition-all duration-200 w-full"
            >
              <Home className="w-5 h-5" />
              Back to Home
            </Button>
          </Link>

          <Link href="/search">
            <Button
              variant="primary"
              size="lg"
              className="border-primary/30 hover:bg-primary/10 px-8 rounded-xl font-semibold gap-2 transition-all duration-200 w-full"
            >
              <Search className="w-5 h-5" />
              Search Properties
            </Button>
          </Link>
        </div>

        {/* Quick Links */}
        <div className="bg-surface/50 backdrop-blur-sm border border-border/30 rounded-xl p-6">
          <h3 className="text-h4 font-semibold mb-4 text-foreground">
            Looking for something specific?
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Link
              href="/buy"
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-surface/70 transition-colors duration-200 group"
            >
              <MapPin className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
              <span className="text-body-m text-foreground group-hover:text-primary transition-colors">
                Buy Properties
              </span>
            </Link>

            <Link
              href="/rent"
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-surface/70 transition-colors duration-200 group"
            >
              <MapPin className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
              <span className="text-body-m text-foreground group-hover:text-primary transition-colors">
                Rent Properties
              </span>
            </Link>

            <Link
              href="/sell"
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-surface/70 transition-colors duration-200 group"
            >
              <MapPin className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
              <span className="text-body-m text-foreground group-hover:text-primary transition-colors">
                Sell Property
              </span>
            </Link>

            <Link
              href="/about"
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-surface/70 transition-colors duration-200 group"
            >
              <MapPin className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
              <span className="text-body-m text-foreground group-hover:text-primary transition-colors">
                About RealEST
              </span>
            </Link>
          </div>
        </div>

        {/* Help Text */}
        <p className="text-body-s text-muted-foreground mt-8">
          If you believe this is an error, please{" "}
          <Link
            href="/contact"
            className="text-primary hover:text-accent transition-colors underline"
          >
            contact our support team
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
