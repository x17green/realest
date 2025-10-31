"use client";

import { Button, Input, Chip } from "@heroui/react";
import { useState } from "react";
import {
  Search,
  MapPin,
  TrendingUp,
  Building,
  Calendar,
  Sparkles,
} from "lucide-react";

export default function HeroSection() {
  const [searchQuery, setSearchQuery] = useState("");

  const popularSearches = [
    { label: "Modern Apartments", icon: Building },
    { label: "Luxury Villas", icon: TrendingUp },
    { label: "Event Spaces", icon: Calendar },
  ];

  return (
    <section className="relative w-full min-h-[600px] overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-linear-to-br from-primary/20 via-primary/10 to-secondary/20" />
      <div className="absolute inset-0 bg-linear-to-t from-background via-background/50 to-transparent" />

      {/* Floating Elements */}
      <div className="absolute top-20 left-10 w-20 h-20 bg-primary/10 rounded-full blur-xl animate-pulse" />
      <div className="absolute top-40 right-20 w-32 h-32 bg-secondary/10 rounded-full blur-xl animate-pulse delay-1000" />
      <div className="absolute bottom-20 left-1/4 w-24 h-24 bg-primary/5 rounded-full blur-xl animate-pulse delay-500" />

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-2 mb-6">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">
              Verified Properties Only
            </span>
          </div>

          {/* Main Heading */}
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-linear-to-r from-foreground via-foreground to-primary bg-clip-text text-transparent leading-tight">
            Find Your
            <br />
            <span className="text-primary">Dream Property</span>
          </h1>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed">
            Discover unique, verified properties with no duplicates. Your
            perfect home or investment awaits.
          </p>

          {/* Enhanced Search */}
          <div className="max-w-2xl mx-auto mb-8">
            <div className="bg-background/80 backdrop-blur-lg border border-border/50 rounded-2xl p-2 shadow-2xl">
              <div className="flex gap-2">
                <div className="flex-1 flex items-center gap-3 px-4 py-3">
                  <MapPin className="w-5 h-5 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Search by location, property type, or keywords..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full border-none outline-none bg-transparent text-base placeholder:text-muted-foreground/70"
                  />
                </div>
                <Button
                  size="lg"
                  className="bg-primary hover:bg-primary/90 px-8 rounded-xl font-semibold gap-2 shadow-lg"
                >
                  <Search className="w-5 h-5" />
                  Search
                </Button>
              </div>
            </div>

            {/* Popular Searches */}
            <div className="flex flex-wrap gap-2 mt-4 justify-center">
              {popularSearches.map((search) => (
                <Chip
                  key={search.label}
                  variant="secondary"
                  className="cursor-pointer hover:bg-primary/10 hover:border-primary/30 transition-colors gap-2"
                  onClick={() => setSearchQuery(search.label)}
                >
                  <search.icon className="w-4 h-4" />
                  {search.label}
                </Chip>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-1">10K+</div>
              <div className="text-sm text-muted-foreground">
                Verified Properties
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-1">50K+</div>
              <div className="text-sm text-muted-foreground">
                Happy Customers
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-1">99%</div>
              <div className="text-sm text-muted-foreground">
                Satisfaction Rate
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" className="w-full h-20 fill-background">
          <path d="M0,32L48,37.3C96,43,192,53,288,58.7C384,64,480,64,576,58.7C672,53,768,43,864,48C960,53,1056,75,1152,80C1248,85,1344,75,1392,69.3L1440,64L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z" />
        </svg>
      </div>
    </section>
  );
}
