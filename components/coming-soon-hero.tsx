"use client";

import React, { useState, useEffect } from 'react';
import { Button, Chip } from "@heroui/react";
import {
  Calendar,
  MapPin,
  MailCheck,
  TrendingUp,
  Building,
  Sparkles,
  MapPinCheck,
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
  // Check if release date is actually set (not empty or just whitespace)
  const releaseDateStr = process.env.NEXT_PUBLIC_RELEASE_DATE;
  const hasReleaseDate = releaseDateStr && releaseDateStr.trim() !== '';
  const releaseDate = hasReleaseDate ? new Date(releaseDateStr).getTime() : null;

  const [timeLeft, setTimeLeft] = useState(() => hasReleaseDate ? calculateTimeLeft() : null);
  const [showFullSite, setShowFullSite] = useState(false);
  const [mounted, setMounted] = useState(false);

  function calculateTimeLeft() {
    if (!hasReleaseDate || !releaseDate) {
      return null;
    }

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

    // Only set up timer if release date is configured
    if (!hasReleaseDate) {
      return;
    }

    const timer = setInterval(() => {
      const newTimeLeft = calculateTimeLeft();
      setTimeLeft(newTimeLeft);

      if (newTimeLeft && newTimeLeft.expired) {
        setShowFullSite(true);
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [hasReleaseDate, releaseDate]);

  // Don't render until mounted to prevent hydration issues
  if (!mounted) {
    return (
      <div className="min-h-screen w-full bg-background flex items-center justify-center">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  // If countdown expired or manual override, show full site
  if (showFullSite || (timeLeft && timeLeft.expired)) {
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
      description: "Every property is verified with precise location and on-site expert verification."
    },
    {
      icon: Star,
      title: "Zero Duplicates",
      description: "Every listing is uniquely verified, ensuring you never encounter fake or duplicate properties."
    },
    {
      icon: TrendingUp,
      title: "Real-Time Market Data",
      description: "Access live property insights, market trends, data-driven updates on pricing and availability."
    },
  ];

  return (
    <div className="min-h-screen w-full bg-background">

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
            <div className="inline-flex items-center gap-2 animate-pulse bg-linear-to-l from-primary/10 to-accent/10 border border-primary/20 rounded-full px-4 py-2 mb-6 backdrop-blur-md">
              <MapPinCheck className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium bg-linear-to-bl from-primary to-accent bg-clip-text text-transparent">
                Geo-Tagged & Verified Property Marketplace
              </span>
            </div>

            {/* Main Heading */}
            <h1 className="text-display-1 font-bold mb-6 linear-text-slanted leading-tight animate-fade-in">
              Nigeria’s Most Trusted
              <br />
              <span className="bg-linear-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                Real Estate Platform
              </span>
            </h1>

            {/* Subtitle */}
            {/*<p className="text-body-l text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed animate-slide-up">
              We're building Nigeria's most trusted property marketplace with cutting-edge geo-verification technology.
              Get ready for a revolutionary real estate experience.
            </p>*/}

            {/* Countdown Timer - Only show if release date is set */}
            {hasReleaseDate && timeLeft ? (
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
                      <div className="bg-linear-to-br from-primary/20 to-accent/20 border border-primary/30 rounded-xl p-4">
                        <div className="text-h1 font-bold bg-linear-to-r from-primary to-accent bg-clip-text text-transparent">
                          {timeLeft.days.toString().padStart(2, '0')}
                        </div>
                        <div className="text-body-s text-muted-foreground mt-1">Days</div>
                      </div>
                    </div>

                    <div className="text-center">
                      <div className="bg-linear-to-br from-primary/20 to-accent/20 border border-primary/30 rounded-xl p-4">
                        <div className="text-h1 font-bold bg-linear-to-r from-primary to-accent bg-clip-text text-transparent">
                          {timeLeft.hours.toString().padStart(2, '0')}
                        </div>
                        <div className="text-body-s text-muted-foreground mt-1">Hours</div>
                      </div>
                    </div>

                    <div className="text-center">
                      <div className="bg-linear-to-br from-primary/20 to-accent/20 border border-primary/30 rounded-xl py-4 px-0">
                        <div className="text-h1 font-bold bg-linear-to-r from-primary to-accent bg-clip-text text-transparent">
                          {timeLeft.minutes.toString().padStart(2, '0')}
                        </div>
                        <div className="text-body-s text-muted-foreground mt-1">Minutes</div>
                      </div>
                    </div>

                    <div className="text-center">
                      <div className="bg-linear-to-br from-primary/20 to-accent/20 border border-primary/30 rounded-xl py-4 px-0">
                        <div className="text-h1 font-bold bg-linear-to-r from-primary to-accent bg-clip-text text-transparent">
                          {timeLeft.seconds.toString().padStart(2, '0')}
                        </div>
                        <div className="text-body-s text-muted-foreground mt-1">Seconds</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              // No release date set - show simple coming soon message
              <div className="max-w-2xl mx-auto mb-12 animate-scale-in">
                <div className="bg-surface/90 backdrop-blur-lg border border-border/50 rounded-2xl p-6 shadow-2xl text-center animate-slide-up">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-linear-to-br from-primary/20 to-accent/20 border border-primary/30 rounded-full mb-6">
                    <Sparkles className="w-8 h-8 text-accent bg-linear-to-r from-primary to-accent bg-clip-text" />
                  </div>
                  <h3 className="text-h3 font-bold mb-3 bg-linear-to-r from-primary to-accent bg-clip-text text-transparent">
                    Get Ready for Launch
                  </h3>
                  <p className="text-body-m text-muted-foreground gap-2 flex flex-col">
                    Nigeria’s first verified property marketplace, 
                    no fake listings, no duplicates, only real properties. 
                    Prepare for transparency, confidence, and pinpoint accuracy across every listing. 
                    <br />
                    <span>
                      Launch date coming soon!
                    </span>
                  </p>
                </div>
              </div>
            )}

            {/* Feature Highlights */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              {features.map((feature, index) => (
                <div
                  key={feature.title}
                  className="bg-surface/50 backdrop-blur-sm border border-border/30 rounded-xl p-6 hover:bg-surface/70 transition-all duration-300 hover:scale-105 shadow-sm hover:shadow-2xl animate-fade-in-up"
                  style={{ animationDelay: `${index * 200}ms` }}
                >
                  <div className="w-12 h-12 bg-linear-to-br from-primary/20 to-accent/20 rounded-full flex items-center justify-center mb-4 mx-auto">
                    <feature.icon className="w-6 h-6 text-accent" />
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
                className="flex justify-center items-center cursor-default bg-primary/10 hover:bg-primary/15 transition-all duration-200 gap-2 p-2 border border-primary/20 rounded-xs"
              >
                <Building className="w-4 h-4" />
                Modern Apartments
              </Chip>
              <Chip
                variant="secondary"
                className="flex justify-center items-center cursor-default bg-primary/10 hover:bg-primary/15 transition-all duration-200 gap-2 p-2 border border-primary/20 rounded-xs"
              >
                <TrendingUp className="w-4 h-4" />
                Exclusive Luxury Villas
              </Chip>
              <Chip
                variant="secondary"
                className="flex justify-center items-center cursor-default bg-primary/10 hover:bg-primary/15 transition-all duration-200 gap-2 p-2 border border-primary/20 rounded-xs"
              >
                <Calendar className="w-4 h-4" />
                Event Spaces
              </Chip>
              <Chip
                variant="secondary"
                className="flex justify-center items-center cursor-default bg-primary/10 hover:bg-primary/15 transition-all duration-200 gap-2 p-2 border border-primary/20 rounded-xs"
              >
                <MapPin className="w-4 h-4" />
                Lagos • Abuja • PH
              </Chip>
            </div>

            {/* CTA */}
            <div className="space-y-4 flex flex-col gap-2 justify-center mb-8">
              <Button
                variant='ghost'
                size="lg"
                className="flex justify-center items-center cursor-pointer bg-linear-to-tl from-primary/20 to-accent/20 hover:from-primary/40 hover:to-accent/40 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 gap-2 py-3 px-6 max-w-2xs mx-auto"
                // isDisabled
              >
                <MailCheck className="w-4 h-4 text-accent" />
                <span className="text-sm font-medium bg-linear-to-bl from-primary to-accent bg-clip-text text-transparent">
                  {hasReleaseDate ? 'Get Notified at Launch' : 'Notify Me When Ready'}
                </span>
              </Button>
              <p className="text-body-xs text-muted-foreground">
                {hasReleaseDate
                  ? 'Be the first to explore verified properties when we go live'
                  : 'Join our waitlist to be notified when we announce our launch date'
                }
              </p>
            </div>

            {/* Stats Preview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-2xl mx-auto mt-16 animate-fade-in">
              <div className="text-center group hover:scale-105 transition-transform duration-200">
                <div className="text-h2 font-bold bg-linear-to-r from-primary to-accent bg-clip-text text-transparent mb-1">
                  10K+
                </div>
                <div className="text-body-s text-muted-foreground">
                  Properties Ready to Verify
                </div>
              </div>
              <div className="text-center group hover:scale-105 transition-transform duration-200">
                <div className="text-h2 font-bold bg-linear-to-r from-primary to-accent bg-clip-text text-transparent mb-1">
                  50K+
                </div>
                <div className="text-body-s text-muted-foreground">
                  Users Waiting to Join
                </div>
              </div>
              <div className="text-center group hover:scale-105 transition-transform duration-200">
                <div className="text-h2 font-bold bg-linear-to-r from-primary to-accent bg-clip-text text-transparent mb-1">
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

    </div>
  );
};

export default ComingSoonHero;
