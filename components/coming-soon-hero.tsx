/**
 * Coming Soon Hero Component with Email Subscription Modal
 *
 * Enhanced with a modern, responsive modal for waitlist subscription featuring:
 * - Beautiful animations with custom easing functions
 * - Real-time email validation with visual feedback
 * - Keyboard navigation support (Enter to submit)
 * - Mobile-optimized responsive design
 * - API integration with rate limiting and error handling
 * - Success state with confirmation messaging
 * - Accessible design following ARIA best practices
 *
 * The modal uses HeroUI v3's Modal component with custom animations
 * and integrates with /api/waitlist for email subscription functionality.
 */
"use client";

import React, { useState, useEffect } from 'react';
import { useEmailValidation, formatWaitlistMessage } from '@/hooks/useEmailValidation';
import { Button, Chip, Modal, TextField, Label, Input } from "@heroui/react";
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
  Shield,
  Mail,
  CheckCircle,
  X,
  AlertCircle,
  Info,
  Users
} from "lucide-react";
import Header from "./header";
import Footer from "./footer";
import { HeroLogo } from "@/components/ui/real-est-logo";

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

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedData, setSubmittedData] = useState<{
    firstName: string;
    lastName?: string;
    position?: number;
    totalCount?: number;
  } | null>(null);
  const [submitError, setSubmitError] = useState("");
  const [waitlistCount, setWaitlistCount] = useState<number>(0);

  // Real-time email validation
  const emailValidation = useEmailValidation(email, {
    debounceMs: 800,
    minLength: 5
  });

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

  // Email validation function
  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Handle keyboard events
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isSubmitting && email.trim() && firstName.trim() && isValidEmail(email.trim())) {
      e.preventDefault();
      handleEmailSubmit();
    }
  };

  // Handle email submission
  const handleEmailSubmit = async () => {
    if (!email.trim()) {
      setSubmitError("Please enter your email address");
      return;
    }

    if (!isValidEmail(email)) {
      setSubmitError("Please enter a valid email address");
      return;
    }

    if (!firstName.trim()) {
      setSubmitError("Please enter your first name");
      return;
    }

    setIsSubmitting(true);
    setSubmitError("");

    try {
      // Make API call to waitlist endpoint
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim(),
          firstName: firstName.trim(),
          lastName: lastName.trim() || undefined,
          phone: phone.trim() || undefined
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setSubmitError(data.error || 'Something went wrong. Please try again.');
        return;
      }

      setIsSubmitted(true);
      setSubmittedData({
        firstName: data.firstName,
        lastName: data.lastName,
        position: data.position,
        totalCount: data.totalCount
      });
      // Update local waitlist count
      if (data.totalCount) {
        setWaitlistCount(data.totalCount);
      }
      setEmail("");
      setFirstName("");
      setLastName("");
      setPhone("");
    } catch (error) {
      console.error('Waitlist subscription error:', error);
      setSubmitError("Network error. Please check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle modal close
  const handleModalClose = () => {
    setIsModalOpen(false);
    setTimeout(() => {
      setIsSubmitted(false);
      setSubmitError("");
      setSubmittedData(null);
      setEmail("");
      setFirstName("");
      setLastName("");
      setPhone("");
    }, 300);
  };

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

  // Fetch waitlist count on mount
  useEffect(() => {
    const fetchWaitlistCount = async () => {
      try {
        const response = await fetch('/api/waitlist?stats=true');
        if (response.ok) {
          const data = await response.json();
          setWaitlistCount(data.active || 0);
        }
      } catch (error) {
        console.error('Failed to fetch waitlist count:', error);
      }
    };

    fetchWaitlistCount();
  }, []);

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
        <Header />
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

        {/* Logo at top */}
        <div className="relative z-10 flex justify-center pt-8">
          <HeroLogo animated className="animate-fade-in" />
        </div>

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
              Nigeria's Most Trusted
              <br />
              <span className="bg-linear-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                Real Estate Platform
              </span>
            </h1>

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
                      <div className="bg-linear-to-br from-primary/20 to-accent/20 border border-primary/30 rounded-xl py-4 px-0">
                        <div className="text-4xl font-bold bg-linear-to-r from-primary to-accent bg-clip-text text-transparent p-1">
                          {timeLeft.days.toString().padStart(2, '0')}
                        </div>
                        <div className="text-body-s text-muted-foreground mt-1">Days</div>
                      </div>
                    </div>

                    <div className="text-center">
                      <div className="bg-linear-to-br from-primary/20 to-accent/20 border border-primary/30 rounded-xl py-4 px-0">
                        <div className="text-4xl font-bold bg-linear-to-r from-primary to-accent bg-clip-text p-1 text-transparent">
                          {timeLeft.hours.toString().padStart(2, '0')}
                        </div>
                        <div className="text-body-s text-muted-foreground mt-1">Hours</div>
                      </div>
                    </div>

                    <div className="text-center">
                      <div className="bg-linear-to-br from-primary/20 to-accent/20 border border-primary/30 rounded-xl py-4 px-0">
                        <div className="text-4xl font-bold bg-linear-to-r from-primary to-accent bg-clip-text p-1 text-transparent">
                          {timeLeft.minutes.toString().padStart(2, '0')}
                        </div>
                        <div className="text-body-s text-muted-foreground mt-1">Minutes</div>
                      </div>
                    </div>

                    <div className="text-center">
                      <div className="bg-linear-to-br from-primary/20 to-accent/20 border border-primary/30 rounded-xl py-4 px-0">
                        <div className="text-4xl font-bold bg-linear-to-r from-primary to-accent bg-clip-text p-1 text-transparent">
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
                    Nigeria's first verified property marketplace,
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

            {/* CTA - Updated to open modal */}
            <div className="space-y-4 flex flex-col gap-2 justify-center mb-8">
              <Button
                variant='ghost'
                size="lg"
                className="flex justify-center items-center bg-linear-to-r from-primary/20 to-accent/20 hover:from-primary/30 hover:to-accent/30 border border-primary/30 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 gap-2 py-3 px-6 max-w-2xs mx-auto backdrop-blur-sm"
                onPress={() => setIsModalOpen(true)}
              >
                <MailCheck className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium bg-linear-to-r from-primary to-accent bg-clip-text text-transparent">
                  {hasReleaseDate ? 'Get Notified at Launch' : 'Join Waitlist'}
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
                  {waitlistCount > 0 ? waitlistCount.toLocaleString() : '50+'}
                </div>
                <div className="text-body-s text-muted-foreground">
                  {waitlistCount > 1 ? 'People on Waitlist' : waitlistCount === 1 ? 'Person on Waitlist' : 'Users Waiting to Join'}
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

        {/* Logo at bottom */}
        <div className="animate-pulse hover:animate-none relative z-10 flex justify-center pb-8">
          <HeroLogo animated className="animate-fade-in opacity-60 hover:opacity-100 transition-opacity duration-300" />
        </div>

        {/* Bottom Wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" className="w-full h-20 fill-background">
            <path d="M0,32L48,37.3C96,43,192,53,288,58.7C384,64,480,64,576,58.7C672,53,768,43,864,48C960,53,1056,75,1152,80C1248,85,1344,75,1392,69.3L1440,64L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z" />
          </svg>
        </div>
      </main>

      {/* Email Subscription Modal */}
      <Modal.Container
        isOpen={isModalOpen}
        onOpenChange={setIsModalOpen}
        variant="blur"
        placement="center"
        className="data-entering:animate-in data-entering:zoom-in-95 data-entering:fade-in-0 data-entering:duration-300 data-entering:ease-[cubic-bezier(0.16,1,0.3,1)] data-exiting:animate-out data-exiting:zoom-out-95 data-exiting:fade-out-0 data-exiting:duration-200 data-exiting:ease-out"
        backdropClassName="data-entering:animate-in data-entering:fade-in-0 data-entering:duration-300 data-exiting:animate-out data-exiting:fade-out-0 data-exiting:duration-200"
      >
        <Modal.Dialog className="w-full max-w-[90vw] mx-4 sm:max-w-md lg:max-w-lg max-h-[85vh] sm:max-h-[90vh] overflow-y-auto">
          {({ close }) => (
            <>
              <Modal.CloseTrigger className="absolute top-3 right-3 sm:top-4 sm:right-4 z-10 w-8 h-8 rounded-full bg-surface/80 backdrop-blur-sm border border-border/30 flex items-center justify-center hover:bg-surface transition-colors duration-200">
                <X className="w-4 h-4 text-muted-foreground" />
              </Modal.CloseTrigger>

              {!isSubmitted ? (
                <>
                  <Modal.Header className="text-center pb-4 sm:pb-6 px-4 sm:px-6 pt-4 sm:pt-6">
                    <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-linear-to-br from-primary/20 to-accent/20 border border-primary/30 rounded-full mb-4 sm:mb-6 mx-auto">
                      <Mail className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
                    </div>
                    <Modal.Heading className="text-xl sm:text-h3 font-bold bg-linear-to-r from-primary to-accent bg-clip-text text-transparent mb-3">
                      Join the Waitlist
                    </Modal.Heading>
                    <p className="text-sm sm:text-body-m text-muted-foreground leading-relaxed px-2 sm:px-0">
                      {hasReleaseDate
                        ? "Get exclusive early access and be notified the moment we launch Nigeria's most trusted property marketplace."
                        : "Be the first to know when we announce our launch date and get exclusive early access to verified properties."
                      }
                    </p>
                  </Modal.Header>

                  <Modal.Body className="px-4 sm:px-6 pb-4 sm:pb-6">
                    <div className="space-y-4 sm:space-y-6">
                      <TextField className="w-full">
                        <Label className="text-sm font-medium text-foreground mb-2 block">
                          First Name
                        </Label>
                        <Input
                          type="text"
                          placeholder="Enter your first name"
                          value={firstName}
                          onChange={(e) => {
                            setFirstName(e.target.value);
                            if (submitError) setSubmitError("");
                          }}
                          className="w-full px-3 py-2.5 sm:px-4 sm:py-3 bg-surface border border-border/50 rounded-xl focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all duration-200 text-base"
                          disabled={isSubmitting}
                          onKeyDown={handleKeyDown}
                          autoFocus
                        />
                      </TextField>

                      <TextField className="w-full">
                        <Label className="text-sm font-medium text-foreground mb-2 block">
                          Last Name (Optional)
                        </Label>
                        <Input
                          type="text"
                          placeholder="Enter your last name"
                          value={lastName}
                          onChange={(e) => {
                            setLastName(e.target.value);
                            if (submitError) setSubmitError("");
                          }}
                          className="w-full px-3 py-2.5 sm:px-4 sm:py-3 bg-surface border border-border/50 rounded-xl focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all duration-200 text-base"
                          disabled={isSubmitting}
                          onKeyDown={handleKeyDown}
                        />
                      </TextField>

                      <TextField className="w-full">
                        <Label className="text-sm font-medium text-foreground mb-2 block">
                          Phone Number (Optional)
                        </Label>
                        <Input
                          type="tel"
                          placeholder="Enter your phone number"
                          value={phone}
                          onChange={(e) => {
                            setPhone(e.target.value);
                            if (submitError) setSubmitError("");
                          }}
                          className="w-full px-3 py-2.5 sm:px-4 sm:py-3 bg-surface border border-border/50 rounded-xl focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all duration-200 text-base"
                          disabled={isSubmitting}
                          onKeyDown={handleKeyDown}
                        />
                      </TextField>

                      <TextField className="w-full">
                        <Label className="text-sm font-medium text-foreground mb-2 block">
                          Email Address
                        </Label>
                        <Input
                          type="email"
                          placeholder="Enter your email address"
                          value={email}
                          onChange={(e) => {
                            setEmail(e.target.value);
                            if (submitError) setSubmitError("");
                          }}
                          className={`w-full px-3 py-2.5 sm:px-4 sm:py-3 bg-surface rounded-xl focus:ring-2 transition-all duration-200 text-base ${
                            email && !emailValidation.isValid && !emailValidation.isLoading
                              ? 'border-red-300 focus:border-red-500 focus:ring-red-200/20'
                              : email && emailValidation.isValid && emailValidation.isAvailable
                              ? 'border-green-300 focus:border-green-500 focus:ring-green-200/20'
                              : email && emailValidation.isValid && !emailValidation.isAvailable
                              ? 'border-orange-300 focus:border-orange-500 focus:ring-orange-200/20'
                              : 'border-border/50 focus:border-primary/50 focus:ring-primary/20'
                          }`}
                          disabled={isSubmitting}
                          onKeyDown={handleKeyDown}
                          required
                        />

                        {/* Email validation feedback */}
                        {emailValidation.isLoading && email.length > 3 && (
                          <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                            <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                            <span>Checking availability...</span>
                          </div>
                        )}

                        {/* Email format invalid */}
                        {email && !emailValidation.isValid && !emailValidation.isLoading && (
                          <div className="flex items-center gap-2 mt-2 text-sm text-red-600 dark:text-red-400">
                            <AlertCircle className="w-4 h-4" />
                            <span>Please enter a valid email address</span>
                          </div>
                        )}

                        {/* Email available */}
                        {emailValidation.isValid && emailValidation.isAvailable && !emailValidation.isLoading && (
                          <div className="flex items-center gap-2 mt-2 text-sm text-green-600 dark:text-green-400">
                            <CheckCircle className="w-4 h-4" />
                            <span>Email available!</span>
                          </div>
                        )}

                        {/* User already in waitlist */}
                        {emailValidation.isValid && !emailValidation.isAvailable && emailValidation.userInfo && !emailValidation.isLoading && (
                          <div className="mt-3 p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
                            <div className="flex items-start gap-2">
                              <Info className="w-4 h-4 text-orange-600 dark:text-orange-400 mt-0.5 shrink-0" />
                              <div className="text-sm">
                                <div className="font-medium text-orange-800 dark:text-orange-200">
                                  {formatWaitlistMessage(emailValidation.userInfo).title}
                                </div>
                                <div className="text-orange-700 dark:text-orange-300 mt-1">
                                  {formatWaitlistMessage(emailValidation.userInfo).description}
                                </div>
                                {emailValidation.userInfo.status === 'active' && emailValidation.userInfo.position && (
                                  <div className="flex items-center gap-1 mt-2 text-xs text-orange-600 dark:text-orange-400">
                                    <Users className="w-3 h-3" />
                                    <span>Position #{emailValidation.userInfo.position} of {emailValidation.userInfo.totalCount?.toLocaleString()}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </TextField>

                      {submitError && (
                        <div className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg px-3 py-2 animate-fade-in-up">
                          {submitError}
                        </div>
                      )}

                      {email && !isValidEmail(email) && !submitError && (
                        <div className="text-sm text-amber-600 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg px-3 py-2 animate-fade-in-up">
                          Please enter a valid email address
                        </div>
                      )}

                      <div className="bg-surface/50 border border-border/30 rounded-xl p-4">
                        <div className="flex items-start gap-3">
                          <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 shrink-0" />
                          <div className="space-y-2 text-sm text-muted-foreground">
                            <p className="font-medium text-foreground">What you'll get:</p>
                            <ul className="space-y-1">
                              <li className="flex items-center gap-2">
                                <div className="w-1 h-1 bg-primary rounded-full"></div>
                                Early access to verified properties
                              </li>
                              <li className="flex items-center gap-2">
                                <div className="w-1 h-1 bg-primary rounded-full"></div>
                                Launch notifications & exclusive updates
                              </li>
                              <li className="flex items-center gap-2">
                                <div className="w-1 h-1 bg-primary rounded-full"></div>
                                No spam, unsubscribe anytime
                              </li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Modal.Body>

                  <Modal.Footer className="px-4 sm:px-6 pb-4 sm:pb-6 pt-0">
                    <div className="flex flex-col sm:flex-row gap-3 w-full">
                      <Button
                        variant="secondary"
                        onPress={close}
                        className="flex-1 py-3 order-2 sm:order-1"
                        isDisabled={isSubmitting}
                      >
                        Maybe Later
                      </Button>
                      <Button
                        variant="primary"
                        onPress={handleEmailSubmit}
                        className="flex-1 py-2.5 sm:py-3 bg-linear-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 transition-all duration-200 order-1 sm:order-2"
                        isDisabled={isSubmitting || !email.trim() || !firstName.trim() || !emailValidation.isValid || !emailValidation.isAvailable || emailValidation.isLoading}
                        isPending={isSubmitting}
                      >
                        {isSubmitting ? "Joining..." : "Join Waitlist"}
                      </Button>
                    </div>
                  </Modal.Footer>
                </>
              ) : (
                <>
                  <Modal.Header className="text-center pb-4 sm:pb-6 px-4 sm:px-6 pt-4 sm:pt-6">
                    <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-linear-to-br from-green-500/20 to-green-600/20 border border-green-500/30 rounded-full mb-4 sm:mb-6 mx-auto animate-bounce-gentle">
                      <CheckCircle className="w-6 h-6 sm:w-8 sm:h-8 text-green-500" />
                    </div>
                    <Modal.Heading className="text-xl sm:text-h3 font-bold text-green-600 dark:text-green-400 mb-3">
                      {submittedData?.firstName && submittedData?.lastName
                        ? `Welcome ${submittedData.firstName} ${submittedData.lastName}!`
                        : submittedData?.firstName
                        ? `Welcome ${submittedData.firstName}!`
                        : "You're On The List!"}
                    </Modal.Heading>
                    <p className="text-sm sm:text-body-m text-muted-foreground leading-relaxed px-2 sm:px-0">
                      Thank you for joining our waitlist{submittedData?.firstName ? `, ${submittedData.firstName}` : ""}. We'll notify you as soon as we launch with exclusive early access to Nigeria's most trusted property marketplace.
                    </p>

                    {/* Show user's position in waitlist */}
                    {submittedData?.position && submittedData?.totalCount && (
                      <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-green-600 dark:text-green-400" />
                          <div className="text-sm">
                            <span className="font-medium text-green-800 dark:text-green-200">
                              You're #{submittedData.position} out of {submittedData.totalCount.toLocaleString()} people!
                            </span>
                            <p className="text-green-700 dark:text-green-300 text-xs mt-1">
                              The earlier you joined, the sooner you'll get access.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </Modal.Header>

                  <Modal.Body className="px-4 sm:px-6 pb-4 sm:pb-6">
                    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4">
                      <div className="text-center space-y-3">
                        <div className="text-sm font-medium text-green-700 dark:text-green-300">
                          What happens next?
                        </div>
                        <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-green-600 dark:text-green-400">
                          <p>✅ Confirmation email sent to your inbox</p>
                          <p>🚀 Early access when we launch</p>
                          <p>📧 Exclusive updates and property previews</p>
                        </div>
                      </div>
                    </div>
                  </Modal.Body>

                  <Modal.Footer className="px-4 sm:px-6 pb-4 sm:pb-6 pt-0">
                    <Button
                      variant="primary"
                      onPress={handleModalClose}
                      className="w-full py-2.5 sm:py-3 bg-linear-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 transition-all duration-200"
                    >
                      Perfect, Thanks!
                    </Button>
                  </Modal.Footer>
                </>
              )}
            </>
          )}
        </Modal.Dialog>
      </Modal.Container>
    </div>
  );
};

export default ComingSoonHero;
