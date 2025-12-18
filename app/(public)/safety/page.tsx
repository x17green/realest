"use client";

import { Card, Button, Chip } from "@heroui/react";
import Link from "next/link";
import { Header, Footer } from "@/components/layout";
import {
  Shield,
  AlertTriangle,
  CheckCircle,
  Users,
  Lock,
  Eye,
  Phone,
  Mail,
  Sparkles,
  FileText,
  Home,
} from "lucide-react";

export default function SafetyPage() {
  const safetyTips = [
    {
      category: "Before Viewing",
      icon: Shield,
      tips: [
        {
          title: "Research the Property",
          description:
            "Check property details, verify ownership, and research the neighborhood.",
          icon: Eye,
        },
        {
          title: "Meet in Public First",
          description:
            "For initial meetings, choose public places like cafes before visiting properties.",
          icon: Users,
        },
        {
          title: "Bring a Friend",
          description:
            "Never visit a property alone. Bring a trusted friend or family member.",
          icon: Users,
        },
        {
          title: "Trust Your Instincts",
          description:
            "If something feels off about a property or person, trust your instincts and leave.",
          icon: AlertTriangle,
        },
      ],
    },
    {
      category: "During Transactions",
      icon: Lock,
      tips: [
        {
          title: "Use Verified Properties Only",
          description:
            "Only deal with properties that have our verification badge and seal of approval.",
          icon: CheckCircle,
        },
        {
          title: "Never Send Money First",
          description:
            "Never send money via wire transfer, cryptocurrency, or other untraceable methods.",
          icon: AlertTriangle,
        },
        {
          title: "Use Secure Payment Methods",
          description:
            "Always use traceable payment methods and consider escrow services for large transactions.",
          icon: Lock,
        },
        {
          title: "Get Everything in Writing",
          description:
            "Ensure all agreements, terms, and conditions are documented in writing.",
          icon: FileText,
        },
      ],
    },
    {
      category: "General Safety",
      icon: Home,
      tips: [
        {
          title: "Verify Identity",
          description:
            "Always verify the identity of sellers, buyers, and agents through official documents.",
          icon: Shield,
        },
        {
          title: "Report Suspicious Activity",
          description:
            "Report any suspicious listings or behavior to our support team immediately.",
          icon: AlertTriangle,
        },
        {
          title: "Keep Records",
          description:
            "Maintain detailed records of all communications, agreements, and transactions.",
          icon: FileText,
        },
        {
          title: "Stay Informed",
          description:
            "Keep up with the latest property fraud trends and safety best practices.",
          icon: Eye,
        },
      ],
    },
  ];

  const redFlags = [
    "Seller asking for money upfront for 'fees' or 'commissions'",
    "Pressure to make quick decisions without proper due diligence",
    "Requests to use untraceable payment methods",
    "Inconsistent or changing property information",
    "Seller unwilling to provide proper documentation",
    "Offers that seem too good to be true",
    "Requests for personal financial information",
    "Avoidance of professional inspections or appraisals",
  ];

  const emergencyContacts = [
    {
      title: "RealEST Support",
      description: "24/7 emergency support for verified transactions",
      contact: "Emergency: +1 (555) 911-REAL",
      icon: Phone,
      urgent: true,
    },
    {
      title: "Property Fraud Hotline",
      description: "Report property fraud and scams",
      contact: "Fraud Line: +1 (555) 123-4567",
      icon: AlertTriangle,
      urgent: true,
    },
    {
      title: "General Support",
      description: "Regular customer support during business hours",
      contact: "support@realest.ng",
      icon: Mail,
      urgent: false,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-linear-to-br from-red-50 via-primary/5 to-secondary/20" />
        <div className="absolute inset-0 bg-linear-to-t from-background via-background/50 to-transparent" />

        {/* Floating Elements */}
        <div className="absolute top-10 right-10 w-16 h-16 bg-red-100 rounded-full blur-xl animate-pulse" />
        <div className="absolute bottom-10 left-10 w-20 h-20 bg-primary/10 rounded-full blur-xl animate-pulse delay-500" />

        <div className="relative z-10 container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-red-100 border border-red-200 rounded-full px-4 py-2 mb-6">
              <Shield className="w-4 h-4 text-red-600" />
              <span className="text-sm font-medium text-red-700">
                Safety Guidelines
              </span>
            </div>

            {/* Main Heading */}
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-linear-to-r from-foreground via-foreground to-red-600 bg-clip-text text-transparent leading-tight">
              Stay Safe During
              <br />
              <span className="text-red-600">Property Transactions</span>
            </h1>

            {/* Subtitle */}
            <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed">
              Your safety is our top priority. Learn how to protect yourself
              during property transactions and avoid common scams.
            </p>

            {/* Emergency Contact */}
            <Card.Root className="bg-red-50 border border-red-200 rounded-2xl p-6 max-w-md mx-auto mb-8">
              <Card.Content className="text-center space-y-3">
                <AlertTriangle className="w-8 h-8 text-red-600 mx-auto" />
                <h3 className="font-semibold text-red-800">Emergency?</h3>
                <p className="text-red-700 text-sm">
                  If you suspect fraud or feel unsafe, contact emergency
                  services immediately.
                </p>
                <Button className="bg-red-600 hover:bg-red-700 text-white">
                  Call Emergency Services
                </Button>
              </Card.Content>
            </Card.Root>
          </div>
        </div>
      </section>

      {/* Safety Tips */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Safety Best Practices
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Follow these guidelines to protect yourself during property
              transactions
            </p>
          </div>

          <div className="space-y-12">
            {safetyTips.map((category, categoryIndex) => (
              <div key={categoryIndex} className="space-y-6">
                <div className="flex items-center gap-3 justify-center">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                    <category.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold">{category.category}</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {category.tips.map((tip, tipIndex) => (
                    <Card.Root
                      key={tipIndex}
                      className="bg-background/80 backdrop-blur-lg border border-border/50 rounded-2xl p-6 hover:shadow-lg transition-shadow"
                    >
                      <Card.Content className="space-y-4">
                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                            <tip.icon className="w-5 h-5 text-green-600" />
                          </div>
                          <div className="space-y-2">
                            <h4 className="font-semibold text-lg">
                              {tip.title}
                            </h4>
                            <p className="text-muted-foreground text-sm">
                              {tip.description}
                            </p>
                          </div>
                        </div>
                      </Card.Content>
                    </Card.Root>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Red Flags */}
      <section className="py-16 bg-red-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-red-800">
              Red Flags to Watch For
            </h2>
            <p className="text-lg text-red-700 max-w-2xl mx-auto">
              Be alert for these warning signs that may indicate potential fraud
              or unsafe situations
            </p>
          </div>

          <Card.Root className="bg-white/80 backdrop-blur-lg border border-red-200 rounded-2xl p-8 max-w-4xl mx-auto">
            <Card.Content>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {redFlags.map((flag, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <span className="text-red-700">{flag}</span>
                  </div>
                ))}
              </div>
            </Card.Content>
          </Card.Root>
        </div>
      </section>

      {/* Emergency Contacts */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Emergency Contacts
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Know who to contact if you encounter suspicious activity or feel
              unsafe
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {emergencyContacts.map((contact, index) => (
              <Card.Root
                key={index}
                className={`bg-background/80 backdrop-blur-lg border rounded-2xl p-6 text-center hover:shadow-lg transition-shadow ${
                  contact.urgent
                    ? "border-red-200 bg-red-50"
                    : "border-border/50"
                }`}
              >
                <Card.Content className="space-y-4">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center mx-auto ${
                      contact.urgent ? "bg-red-100" : "bg-primary/10"
                    }`}
                  >
                    <contact.icon
                      className={`w-6 h-6 ${
                        contact.urgent ? "text-red-600" : "text-primary"
                      }`}
                    />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{contact.title}</h3>
                    <p className="text-muted-foreground text-sm">
                      {contact.description}
                    </p>
                  </div>
                  <div className="font-medium text-primary">
                    {contact.contact}
                  </div>
                  {contact.urgent && (
                    <Chip variant="primary" className="bg-red-600 text-white">
                      24/7 Available
                    </Chip>
                  )}
                </Card.Content>
              </Card.Root>
            ))}
          </div>
        </div>
      </section>

      {/* Verification Importance */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Why Verification Matters
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Our verification process provides multiple layers of protection
              for all parties involved
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Shield,
                title: "Fraud Prevention",
                description:
                  "Verified properties eliminate fake listings and fraudulent sellers.",
              },
              {
                icon: CheckCircle,
                title: "Authenticity Guarantee",
                description:
                  "Every detail is verified, from ownership to property condition.",
              },
              {
                icon: Lock,
                title: "Secure Transactions",
                description:
                  "Verified properties come with secure transaction processes.",
              },
              {
                icon: Users,
                title: "Trusted Community",
                description:
                  "Build trust between buyers, sellers, and renters.",
              },
            ].map((benefit, index) => (
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

      {/* CTA Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <Card.Root className="bg-linear-to-r from-primary/5 to-secondary/5 border border-primary/20 rounded-2xl p-8 md:p-12 text-center">
            <Card.Content className="max-w-2xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Stay Safe, Stay Informed
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Knowledge is your best defense. Stay informed about the latest
                safety practices and property fraud trends.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/verification">
                  <Button
                    size="lg"
                    className="bg-primary hover:bg-primary/90 px-8 rounded-xl font-semibold gap-2"
                  >
                    <Shield className="w-5 h-5" />
                    Learn About Verification
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button
                    size="lg"
                    variant="secondary"
                    className="px-8 rounded-xl font-semibold gap-2"
                  >
                    <AlertTriangle className="w-5 h-5" />
                    Report Suspicious Activity
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
