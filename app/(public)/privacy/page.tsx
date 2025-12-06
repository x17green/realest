"use client";

import { Card, Button, Chip } from "@heroui/react";
import Link from "next/link";
import Header from "@/components/header";
import Footer from "@/components/footer";
import {
  Shield,
  Eye,
  Lock,
  FileText,
  Mail,
  Sparkles,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";

export default function PrivacyPage() {
  const sections = [
    {
      title: "Information We Collect",
      icon: Eye,
      content: [
        {
          subtitle: "Personal Information",
          text: "We collect information you provide directly to us, such as when you create an account, list a property, or contact us for support. This includes your name, email address, phone number, and payment information.",
        },
        {
          subtitle: "Property Information",
          text: "When you list a property, we collect details about the property including address, specifications, photos, and ownership documents for verification purposes.",
        },
        {
          subtitle: "Usage Information",
          text: "We automatically collect certain information when you use our platform, including IP address, browser type, device information, and usage patterns.",
        },
        {
          subtitle: "Communication Data",
          text: "We collect information from your communications with other users through our platform, including messages, inquiries, and transaction details.",
        },
      ],
    },
    {
      title: "How We Use Your Information",
      icon: FileText,
      content: [
        {
          subtitle: "Platform Operation",
          text: "To operate and maintain our platform, process transactions, verify properties, and provide customer support.",
        },
        {
          subtitle: "Verification Services",
          text: "To verify property authenticity, conduct background checks, and ensure compliance with our verification standards.",
        },
        {
          subtitle: "Communication",
          text: "To send you important updates, respond to your inquiries, and provide information about our services.",
        },
        {
          subtitle: "Legal Compliance",
          text: "To comply with legal obligations, prevent fraud, and protect the rights and safety of our users.",
        },
      ],
    },
    {
      title: "Information Sharing",
      icon: Lock,
      content: [
        {
          subtitle: "With Your Consent",
          text: "We share your information when you explicitly consent to such sharing.",
        },
        {
          subtitle: "Service Providers",
          text: "We share information with trusted third-party service providers who help us operate our platform, including payment processors and verification services.",
        },
        {
          subtitle: "Legal Requirements",
          text: "We may disclose information if required by law, court order, or to protect our rights and safety.",
        },
        {
          subtitle: "Business Transfers",
          text: "In the event of a merger, acquisition, or sale of assets, your information may be transferred to the new entity.",
        },
      ],
    },
    {
      title: "Data Security",
      icon: Shield,
      content: [
        {
          subtitle: "Encryption",
          text: "We use industry-standard encryption to protect your data both in transit and at rest.",
        },
        {
          subtitle: "Access Controls",
          text: "We implement strict access controls and regularly audit our systems for security vulnerabilities.",
        },
        {
          subtitle: "Regular Updates",
          text: "We regularly update our security measures and conduct security assessments.",
        },
        {
          subtitle: "Incident Response",
          text: "We have incident response procedures in place to address any potential security breaches.",
        },
      ],
    },
  ];

  const rights = [
    {
      title: "Access Your Data",
      description:
        "Request a copy of the personal information we hold about you.",
      icon: Eye,
    },
    {
      title: "Correct Your Data",
      description:
        "Request correction of inaccurate or incomplete personal information.",
      icon: CheckCircle,
    },
    {
      title: "Delete Your Data",
      description:
        "Request deletion of your personal information under certain circumstances.",
      icon: AlertTriangle,
    },
    {
      title: "Data Portability",
      description: "Request transfer of your data to another service provider.",
      icon: FileText,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
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
              <Shield className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">
                Privacy Policy
              </span>
            </div>

            {/* Main Heading */}
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-linear-to-r from-foreground via-foreground to-primary bg-clip-text text-transparent leading-tight">
              Your Privacy
              <br />
              <span className="text-primary">Our Priority</span>
            </h1>

            {/* Subtitle */}
            <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed">
              We are committed to protecting your privacy and ensuring the
              security of your personal information.
            </p>

            {/* Last Updated */}
            <div className="text-sm text-muted-foreground">
              Last updated: December 15, 2024
            </div>
          </div>
        </div>
      </section>

      {/* Privacy Policy Content */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto space-y-12">
            {/* Introduction */}
            <Card.Root className="bg-background/80 backdrop-blur-lg border border-border/50 rounded-2xl p-8">
              <Card.Content className="space-y-4">
                <h2 className="text-2xl font-bold">Introduction</h2>
                <p className="text-muted-foreground leading-relaxed">
                  This Privacy Policy explains how RealEST ("we," "us," or
                  "our") collects, uses, discloses, and safeguards your
                  information when you visit our website, use our services, or
                  interact with our platform. We respect your privacy and are
                  committed to protecting your personal information.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  By using our services, you agree to the collection and use of
                  information in accordance with this policy. If you do not
                  agree with our policies and practices, please do not use our
                  services.
                </p>
              </Card.Content>
            </Card.Root>

            {/* Policy Sections */}
            {sections.map((section, sectionIndex) => (
              <Card.Root
                key={sectionIndex}
                className="bg-background/80 backdrop-blur-lg border border-border/50 rounded-2xl p-8"
              >
                <Card.Content className="space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                      <section.icon className="w-5 h-5 text-primary" />
                    </div>
                    <h2 className="text-2xl font-bold">{section.title}</h2>
                  </div>

                  <div className="space-y-6">
                    {section.content.map((item, itemIndex) => (
                      <div key={itemIndex} className="space-y-2">
                        <h3 className="text-lg font-semibold text-primary">
                          {item.subtitle}
                        </h3>
                        <p className="text-muted-foreground leading-relaxed">
                          {item.text}
                        </p>
                      </div>
                    ))}
                  </div>
                </Card.Content>
              </Card.Root>
            ))}

            {/* Your Rights */}
            <Card.Root className="bg-background/80 backdrop-blur-lg border border-border/50 rounded-2xl p-8">
              <Card.Content className="space-y-6">
                <h2 className="text-2xl font-bold">Your Rights</h2>
                <p className="text-muted-foreground leading-relaxed">
                  You have certain rights regarding your personal information.
                  You can exercise these rights by contacting us using the
                  information provided below.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {rights.map((right, index) => (
                    <Card.Root
                      key={index}
                      className="bg-muted/30 border border-border/30 rounded-xl p-4"
                    >
                      <Card.Content className="space-y-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                            <right.icon className="w-4 h-4 text-primary" />
                          </div>
                          <h3 className="font-semibold">{right.title}</h3>
                        </div>
                        <p className="text-muted-foreground text-sm">
                          {right.description}
                        </p>
                      </Card.Content>
                    </Card.Root>
                  ))}
                </div>
              </Card.Content>
            </Card.Root>

            {/* Cookies */}
            <Card.Root className="bg-background/80 backdrop-blur-lg border border-border/50 rounded-2xl p-8">
              <Card.Content className="space-y-6">
                <h2 className="text-2xl font-bold">Cookies and Tracking</h2>
                <p className="text-muted-foreground leading-relaxed">
                  We use cookies and similar tracking technologies to enhance
                  your experience on our platform. You can control cookie
                  preferences through your browser settings.
                </p>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-primary mb-2">
                      Essential Cookies
                    </h3>
                    <p className="text-muted-foreground">
                      Required for basic platform functionality and security.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-primary mb-2">
                      Analytics Cookies
                    </h3>
                    <p className="text-muted-foreground">
                      Help us understand how you use our platform to improve our
                      services.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-primary mb-2">
                      Marketing Cookies
                    </h3>
                    <p className="text-muted-foreground">
                      Used to deliver relevant advertisements and track campaign
                      effectiveness.
                    </p>
                  </div>
                </div>
              </Card.Content>
            </Card.Root>

            {/* Contact Information */}
            <Card.Root className="bg-background/80 backdrop-blur-lg border border-border/50 rounded-2xl p-8">
              <Card.Content className="space-y-6">
                <h2 className="text-2xl font-bold">Contact Us</h2>
                <p className="text-muted-foreground leading-relaxed">
                  If you have any questions about this Privacy Policy or our
                  data practices, please contact us:
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-primary" />
                      <div>
                        <p className="font-semibold">Email</p>
                        <p className="text-muted-foreground">
                          privacy@realest.ng
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-primary" />
                      <div>
                        <p className="font-semibold">Data Protection Officer</p>
                        <p className="text-muted-foreground">
                          dpo@realest.ng
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Shield className="w-5 h-5 text-primary" />
                      <div>
                        <p className="font-semibold">Address</p>
                        <p className="text-muted-foreground">
                          123 Property Street
                          <br />
                          Real Estate City, RC 12345
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </Card.Content>
            </Card.Root>

            {/* Changes to Policy */}
            <Card.Root className="bg-background/80 backdrop-blur-lg border border-border/50 rounded-2xl p-8">
              <Card.Content className="space-y-4">
                <h2 className="text-2xl font-bold">Changes to This Policy</h2>
                <p className="text-muted-foreground leading-relaxed">
                  We may update this Privacy Policy from time to time. We will
                  notify you of any changes by posting the new Privacy Policy on
                  this page and updating the "Last updated" date.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  We encourage you to review this Privacy Policy periodically to
                  stay informed about how we are protecting your information.
                </p>
              </Card.Content>
            </Card.Root>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <Card.Root className="bg-linear-to-r from-primary/5 to-secondary/5 border border-primary/20 rounded-2xl p-8 md:p-12 text-center">
            <Card.Content className="max-w-2xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Questions About Privacy?
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Our privacy team is here to help answer any questions you may
                have about your data and our practices.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  className="bg-primary hover:bg-primary/90 px-8 rounded-xl font-semibold gap-2"
                >
                  <Mail className="w-5 h-5" />
                  Contact Privacy Team
                </Button>
                <Link href="/help">
                  <Button
                    size="lg"
                    variant="secondary"
                    className="px-8 rounded-xl font-semibold gap-2"
                  >
                    <FileText className="w-5 h-5" />
                    View Help Center
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
