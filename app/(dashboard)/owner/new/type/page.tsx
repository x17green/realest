"use client";

import { useState } from "react";
import Link from "next/link";
import { Chip } from "@heroui/react";
import { 
  Card, 
  CardContent,
  Button,
  StatusBadge, 
} from "@/components/ui";
import {
  ArrowLeft,
  Home,
  Building,
  Hotel,
  Briefcase,
  CheckCircle,
  Star,
} from "lucide-react";

interface PropertyType {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  popular: boolean;
  features: string[];
}

export default function PropertyTypeStep() {
  const [selectedType, setSelectedType] = useState<string>("");

  const propertyTypes: PropertyType[] = [
    {
      id: "house",
      name: "House",
      description: "Single-family homes, duplexes, townhouses, and villas",
      icon: <Home className="w-8 h-8" />,
      popular: true,
      features: [
        "Perfect for families",
        "Private outdoor spaces",
        "Long-term rentals",
        "Higher rental yields",
      ],
    },
    {
      id: "apartment",
      name: "Apartment",
      description: "Modern flats, condos, and high-rise apartments",
      icon: <Building className="w-8 h-8" />,
      popular: true,
      features: [
        "Urban convenience",
        "Amenities included",
        "Lower maintenance",
        "Professional tenants",
      ],
    },
    {
      id: "hotel",
      name: "Hotel/Short-term",
      description: "Hotels, resorts, vacation rentals, and short-term stays",
      icon: <Hotel className="w-8 h-8" />,
      popular: false,
      features: [
        "Higher nightly rates",
        "Tourist locations",
        "Flexible bookings",
        "Seasonal income",
      ],
    },
    {
      id: "office",
      name: "Commercial/Office",
      description: "Office spaces, retail shops, and commercial properties",
      icon: <Briefcase className="w-8 h-8" />,
      popular: false,
      features: [
        "Business tenants",
        "Long-term leases",
        "Commercial zoning",
        "Professional spaces",
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Link href="/owner/new">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-foreground mb-2">
                  Property Type
                </h1>
                <p className="text-muted-foreground">
                  Choose the type of property you want to list
                </p>
              </div>
            </div>
            <div className="text-sm text-muted-foreground">
              Step 1 of 6
            </div>
          </div>

          {/* Property Types Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {propertyTypes.map((type) => (
              <Card
                key={type.id}
                className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                  selectedType === type.id
                    ? "border-primary bg-primary/5"
                    : "border-border/50 hover:border-primary/30"
                }`}
                onClick={() => setSelectedType(type.id)}
              >
                <CardContent className="p-4">
                  <div className="items-start">
                    {type.popular && (
                      <div className="flex relative left-4 -top-4 justify-end mx-4">
                          <StatusBadge variant="popular">
                            Popular
                          </StatusBadge>
                      </div>
                    )}
                    <div className={`flex justify-between ${type.popular ? "-mt-10" : "" } items-start gap-4`}>
                      <div
                        className={`w-12 h-12 rounded-lg flex items-center justify-center shrink-0 ${
                          selectedType === type.id
                            ? "bg-primary text-primary-foreground"
                            : "bg-primary/10 text-primary"
                        }`}
                      >
                        {type.icon}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-semibold">{type.name}</h3>
                          
                          {selectedType === type.id && (
                            <CheckCircle className="w-5 h-5 text-primary" />
                          )}
                        </div>
                        <p className="text-muted-foreground mb-4">
                          {type.description}
                        </p>
                        <div className="space-y-2">
                          {type.features.map((feature, index) => (
                            <div key={index} className="flex items-center gap-2 text-sm">
                              <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                              <span>{feature}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between pt-6 border-t border-border">
            <Link href="/owner/new">
              <Button variant="ghost">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </Link>
            <Link href={`/owner/new/details?type=${selectedType}`}>
              <Button
                variant="default"
                disabled={!selectedType}
              >
                Continue to Details
              </Button>
            </Link>
          </div>

          {/* Help Text */}
          <div className="mt-8 p-4 bg-primary/5 border border-primary/20 rounded-lg">
            <h4 className="font-medium mb-2">💡 Choosing the Right Property Type</h4>
            <p className="text-sm text-muted-foreground">
              The property type you select will determine which fields are shown in the next steps
              and how your listing appears to potential buyers or renters. Choose the option that
              best describes your property.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
