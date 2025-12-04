"use client";

import { Card, Button, Chip } from "@heroui/react";
import Link from "next/link";
import Header from "@/components/header";
import Footer from "@/components/footer";
import {
  Building,
  Sparkles,
  TrendingUp,
  Shield,
  CheckCircle,
  ArrowRight,
  Calculator,
  FileText,
  Users,
} from "lucide-react";

export default function SellPage() {
  const benefits = [
    {
      icon: Shield,
      title: "Verified Listings",
      description:
        "All properties undergo thorough verification for authenticity and quality.",
    },
    {
      icon: Users,
      title: "Wide Reach",
      description:
        "Connect with thousands of verified buyers actively searching for properties.",
    },
    {
      icon: TrendingUp,
      title: "Market Insights",
      description:
        "Get data-driven pricing recommendations and market analysis.",
    },
    {
      icon: Calculator,
      title: "Free Valuation",
      description: "Get a professional property valuation at no cost.",
    },
  ];

  const steps = [
    {
      step: "01",
      title: "List Your Property",
      description:
        "Create a detailed listing with photos, specifications, and pricing.",
    },
    {
      step: "02",
      title: "Verification Process",
      description: "Our team verifies your property details and documentation.",
    },
    {
      step: "03",
      title: "Reach Buyers",
      description:
        "Your verified listing reaches thousands of qualified buyers.",
    },
    {
      step: "04",
      title: "Close the Deal",
      description: "Complete the sale with our secure transaction process.",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header user={null} />
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-linear-to-br from-primary/10 via-primary/5 to-secondary/20" />
        <div className="absolute inset-0 bg-linear-to-t from-background via-background/50 to-transparent" />

        {/* Floating Elements */}
        <div className="absolute top-10 right-10 w-16 h-16 bg-primary/10 rounded-full blur-xl animate-pulse" />
        <div className="absolute bottom-10 left-10 w-20 h-20 bg-secondary/10 rounded-full blur-xl animate-pulse delay-500" />

        <div className="relative z-10 container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-2 mb-6">
              <Building className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">
                Sell Your Property
              </span>
            </div>

            {/* Main Heading */}
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-linear-to-r from-foreground via-foreground to-primary bg-clip-text text-transparent leading-tight">
              Sell Your Property
              <br />
              <span className="text-primary">with Confidence</span>
            </h1>

            {/* Subtitle */}
            <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed">
              Get the best price for your property with our verified
              marketplace. Reach thousands of qualified buyers.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link href="/owner/list-property">
                <Button
                  size="lg"
                  className="bg-primary hover:bg-primary/90 px-8 rounded-xl font-semibold gap-2 shadow-lg"
                >
                  <Building className="w-5 h-5" />
                  List Your Property
                </Button>
              </Link>
              <Button
                size="lg"
                variant="secondary"
                className="px-8 rounded-xl font-semibold gap-2"
              >
                <Calculator className="w-5 h-5" />
                Get Free Valuation
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-1">30K+</div>
                <div className="text-sm text-muted-foreground">
                  Properties Sold
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-1">
                  15 Days
                </div>
                <div className="text-sm text-muted-foreground">
                  Average Sale Time
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-1">98%</div>
                <div className="text-sm text-muted-foreground">
                  Seller Satisfaction
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Why Choose RealEST?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              We provide everything you need to sell your property quickly and
              at the best price.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, index) => (
              <Card.Root
                key={index}
                className="bg-background/80 backdrop-blur-lg border border-border/50 rounded-2xl p-6 text-center hover:shadow-lg transition-shadow"
              >
                <Card.Content className="space-y-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto">
                    <benefit.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg">{benefit.title}</h3>
                  <p className="text-muted-foreground text-sm">
                    {benefit.description}
                  </p>
                </Card.Content>
              </Card.Root>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              How It Works
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Selling your property has never been easier. Follow these simple
              steps.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step, index) => (
              <div key={index} className="text-center">
                <div className="relative">
                  <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4 text-white font-bold text-lg">
                    {step.step}
                  </div>
                  {index < steps.length - 1 && (
                    <ArrowRight className="hidden lg:block absolute top-8 -right-3 w-6 h-6 text-primary" />
                  )}
                </div>
                <h3 className="font-semibold text-lg mb-2">{step.title}</h3>
                <p className="text-muted-foreground text-sm">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <Card.Root className="bg-linear-to-r from-primary/5 to-secondary/5 border border-primary/20 rounded-2xl p-8 md:p-12 text-center">
            <Card.Content className="max-w-2xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Ready to Sell?
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Join thousands of satisfied sellers who have successfully sold
                their properties through our platform.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/owner/list-property">
                  <Button
                    size="lg"
                    className="bg-primary hover:bg-primary/90 px-8 rounded-xl font-semibold gap-2"
                  >
                    <Building className="w-5 h-5" />
                    Start Listing
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button
                    size="lg"
                    variant="secondary"
                    className="px-8 rounded-xl font-semibold gap-2"
                  >
                    <FileText className="w-5 h-5" />
                    Contact Support
                  </Button>
                </Link>
              </div>
            </Card.Content>
          </Card.Root>
        </div>
      </section>

      <Footer />
    </div>
  );
}
