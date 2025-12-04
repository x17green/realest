"use client";

import React, { useState, useEffect } from 'react';
import { Button, Chip } from "@heroui/react";
import {
  Calendar,
  MapPin,
  TrendingUp,
  Building,
  Sparkles,
  Clock,
  Star,
  Shield
} from "lucide-react";
import Header from "./header";
import Footer from "./footer";

// Import the full website components for dynamic reveal
import HeroSection from "./hero-section";
import FeaturedProperties from "./featured-properties";

const ComingSoonHero = () => {
  const releaseDateStr = process.env.NEXT_PUBLIC_RELEASE_DATE || '2026-03-01T00:00:00Z';
  const releaseDate = new Date(releaseDateStr).getTime();

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());
  const [showFullSite, setShowFullSite] = useState(false);
  const [mounted, setMounted] = useState(false);

  function calculateTimeLeft() {
    const now = new Date().getTime();
    const difference = releaseDate - now;

    if (difference <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
    }

    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
      minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
      seconds: Math.floor((difference % (1000 * 60)) / 1000),
      expired: false,
    };
  }

  useEffect(() => {
    setMounted(true);
    const timer = setInterval(() => {
      const newTimeLeft = calculateTimeLeft();
      setTimeLeft(newTimeLeft);

      if (newTimeLeft.expired) {
        setShowFullSite(true);
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [releaseDate]);

  // Don't render until mounted to prevent hydration issues
  if (!mounted) {
    return (
      <div className="min-h-screen w-full bg-background flex items-center justify-center">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  // If countdown expired or manual override, show full site
  if (showFullSite || timeLeft.expired) {
    return (
      <div className="min-h-screen w-full bg-background">
        <Header user={null} />
        <HeroSection />
        <FeaturedProperties />
        <Footer />
      </div>
    );
  }

  const features = [
    {
      icon: Shield,
      title: "Geo-Verified Properties",
      description: "Every property verified with precise location data"
    },
    {
      icon: Star,
      title: "Zero Duplicates",
      description: "Our proof-first approach eliminates fake listings"
    },
    {
      icon: TrendingUp,
      title: "Real-Time Market Data",
      description: "Access live property insights and market trends"
    },
  ];

  return (
    <div className="min-h-screen w-full bg-background">
      {/*<Header user={null} />*/}

      <main className="relative w-full overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-linear-to-br from-primary/20 via-primary/10 to-secondary/20" />
        <div className="absolute inset-0 bg-linear-to-t from-background via-background/50 to-transparent" />

        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-primary/10 rounded-full blur-xl animate-pulse" />
        <div className="absolute top-40 right-20 w-32 h-32 bg-secondary/10 rounded-full blur-xl animate-pulse delay-1000" />
        <div className="absolute bottom-20 left-1/4 w-24 h-24 bg-primary/5 rounded-full blur-xl animate-pulse delay-500" />

        {/* Main Content */}
        <div className="relative z-10 container mx-auto px-4 py-20 min-h-screen flex items-center">
          <div className="max-w-4xl mx-auto text-center">
            {/* Status Badge */}
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 rounded-full px-4 py-2 mb-6 backdrop-blur-sm">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Nigeria's First Geo-Verified Marketplace
              </span>
            </div>

            {/* Main Heading */}
            <h1 className="text-display-1 font-bold mb-6 gradient-text-slanted leading-tight animate-fade-in">
              Something Amazing
              <br />
              <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                Is Coming Soon
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-body-l text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed animate-slide-up">
              We're building Nigeria's most trusted property marketplace with cutting-edge geo-verification technology.
              Get ready for a revolutionary real estate experience.
            </p>

            {/* Countdown Timer */}
            <div className="max-w-2xl mx-auto mb-12 animate-scale-in">
              <div className="bg-surface/90 backdrop-blur-lg border border-border/50 rounded-2xl p-6 shadow-2xl">
                <div className="flex items-center gap-2 mb-4 justify-center">
                  <Clock className="w-5 h-5 text-primary" />
                  <span className="text-body-m font-medium text-muted-foreground">
                    Launching in
                  </span>
                </div>

                <div className="grid grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/30 rounded-xl p-4">
                      <div className="text-h1 font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                        {timeLeft.days.toString().padStart(2, '0')}
                      </div>
                      <div className="text-body-s text-muted-foreground mt-1">Days</div>
                    </div>
                  </div>

                  <div className="text-center">
                    <div className="bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/30 rounded-xl p-4">
                      <div className="text-h1 font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                        {timeLeft.hours.toString().padStart(2, '0')}
                      </div>
                      <div className="text-body-s text-muted-foreground mt-1">Hours</div>
                    </div>
                  </div>

                  <div className="text-center">
                    <div className="bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/30 rounded-xl p-4">
                      <div className="text-h1 font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                        {timeLeft.minutes.toString().padStart(2, '0')}
                      </div>
                      <div className="text-body-s text-muted-foreground mt-1">Minutes</div>
                    </div>
                  </div>

                  <div className="text-center">
                    <div className="bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/30 rounded-xl p-4">
                      <div className="text-h1 font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                        {timeLeft.seconds.toString().padStart(2, '0')}
                      </div>
                      <div className="text-body-s text-muted-foreground mt-1">Seconds</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Feature Highlights */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              {features.map((feature, index) => (
                <div
                  key={feature.title}
                  className="bg-surface/50 backdrop-blur-sm border border-border/30 rounded-xl p-6 hover:bg-surface/70 transition-all duration-300 hover:scale-105"
                  style={{ animationDelay: `${index * 200}ms` }}
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full flex items-center justify-center mb-4 mx-auto">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-h4 font-semibold mb-2">{feature.title}</h3>
                  <p className="text-body-s text-muted-foreground">{feature.description}</p>
                </div>
              ))}
            </div>

            {/* Quick Previews */}
            <div className="flex flex-wrap gap-2 justify-center mb-8">
              <Chip
                variant="secondary"
                className="cursor-default bg-primary/10 border-primary/30 hover:bg-primary/15 transition-all duration-200 gap-2"
              >
                <Building className="w-4 h-4" />
                Modern Apartments
              </Chip>
              <Chip
                variant="secondary"
                className="cursor-default bg-primary/10 border-primary/30 hover:bg-primary/15 transition-all duration-200 gap-2"
              >
                <TrendingUp className="w-4 h-4" />
                Luxury Villas
              </Chip>
              <Chip
                variant="secondary"
                className="cursor-default bg-primary/10 border-primary/30 hover:bg-primary/15 transition-all duration-200 gap-2"
              >
                <Calendar className="w-4 h-4" />
                Event Spaces
              </Chip>
              <Chip
                variant="secondary"
                className="cursor-default bg-primary/10 border-primary/30 hover:bg-primary/15 transition-all duration-200 gap-2"
              >
                <MapPin className="w-4 h-4" />
                Lagos • Abuja • PH
              </Chip>
            </div>

            {/* CTA */}
            <div className="space-y-4">
              <Button
                size="lg"
                className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 px-8 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                isDisabled
              >
                Get Notified at Launch
              </Button>
              <p className="text-body-xs text-muted-foreground">
                Be the first to explore verified properties when we go live
              </p>
            </div>

            {/* Stats Preview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-2xl mx-auto mt-16 animate-fade-in">
              <div className="text-center group hover:scale-105 transition-transform duration-200">
                <div className="text-h2 font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-1">
                  10K+
                </div>
                <div className="text-body-s text-muted-foreground">
                  Properties Ready to Verify
                </div>
              </div>
              <div className="text-center group hover:scale-105 transition-transform duration-200">
                <div className="text-h2 font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-1">
                  50K+
                </div>
                <div className="text-body-s text-muted-foreground">
                  Users Waiting to Join
                </div>
              </div>
              <div className="text-center group hover:scale-105 transition-transform duration-200">
                <div className="text-h2 font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-1">
                  99.9%
                </div>
                <div className="text-body-s text-muted-foreground">
                  Location Accuracy Goal
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
      </main>

      {/*<Footer />*/}
    </div>
  );
};

export default ComingSoonHero;
