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
  MapPin,
  Utensils,
  Warehouse,
} from "lucide-react";

interface PropertyType {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  popular: boolean;
  features: string[];
  category: "residential" | "commercial" | "hospitality" | "land";
}

interface PropertyCategory {
  id: "residential" | "commercial" | "hospitality" | "land";
  name: string;
  title: string;
  icon: React.ReactNode;
  color: string;
  borderColor: string;
  bgColor: string;
}

export default function PropertyTypeStep() {
  const [selectedType, setSelectedType] = useState<string>("");

  const categories: Record<string, PropertyCategory> = {
    residential: {
      id: "residential",
      name: "Residential",
      title: "Residential Properties",
      icon: <Home className="w-6 h-6" />,
      color: "text-green-600",
      borderColor: "border-green-200",
      bgColor: "bg-green-50",
    },
    commercial: {
      id: "commercial",
      name: "Commercial",
      title: "Commercial Properties",
      icon: <Briefcase className="w-6 h-6" />,
      color: "text-blue-600",
      borderColor: "border-blue-200",
      bgColor: "bg-blue-50",
    },
    hospitality: {
      id: "hospitality",
      name: "Event & Hospitality",
      title: "Event & Hospitality",
      icon: <Hotel className="w-6 h-6" />,
      color: "text-purple-600",
      borderColor: "border-purple-200",
      bgColor: "bg-purple-50",
    },
    land: {
      id: "land",
      name: "Land",
      title: "Land & Plots",
      icon: <MapPin className="w-6 h-6" />,
      color: "text-amber-600",
      borderColor: "border-amber-200",
      bgColor: "bg-amber-50",
    },
  };

  const propertyTypes: PropertyType[] = [
    // RESIDENTIAL
    {
      id: "duplex",
      name: "Duplex",
      description: "2-story family homes with modern amenities",
      icon: <Home className="w-8 h-8" />,
      popular: true,
      category: "residential",
      features: [
        "Perfect for families",
        "Boys Quarters option",
        "Higher rental yields",
        "Gated community suitable",
      ],
    },
    {
      id: "flat",
      name: "Flat/Apartment",
      description: "Modern apartment units in urban areas with amenities",
      icon: <Building className="w-8 h-8" />,
      popular: true,
      category: "residential",
      features: [
        "Urban convenience",
        "24/7 backup power",
        "Professional tenants",
        "Lower maintenance",
      ],
    },
    {
      id: "detached_house",
      name: "Detached House",
      description: "Standalone family houses with exclusive land",
      icon: <Home className="w-8 h-8" />,
      popular: true,
      category: "residential",
      features: [
        "Complete privacy",
        "Large outdoor space",
        "Family-oriented",
        "Investment potential",
      ],
    },
    {
      id: "bungalow",
      name: "Bungalow",
      description: "Single-story homes ideal for comfortable living",
      icon: <Home className="w-8 h-8" />,
      popular: false,
      category: "residential",
      features: [
        "Accessible design",
        "Easy maintenance",
        "Modest footprint",
        "Great for retirees",
      ],
    },
    {
      id: "mini_flat",
      name: "Mini Flat",
      description: "1 bedroom + kitchenette compact units",
      icon: <Building className="w-8 h-8" />,
      popular: false,
      category: "residential",
      features: [
        "Affordable pricing",
        "Low maintenance",
        "Quick rental turnover",
        "Entry-level investment",
      ],
    },
    {
      id: "self_contained",
      name: "Self-Contained",
      description: "Studio apartments with private facilities",
      icon: <Building className="w-8 h-8" />,
      popular: false,
      category: "residential",
      features: [
        "Complete privacy",
        "All-in-one layout",
        "Popular with professionals",
        "Modern amenities",
      ],
    },
    {
      id: "room_and_parlor",
      name: "Room & Parlor",
      description: "1 bedroom + living room units at affordable prices",
      icon: <Building className="w-8 h-8" />,
      popular: false,
      category: "residential",
      features: [
        "Budget-friendly",
        "Separate living space",
        "Quick rental potential",
        "Growing demand",
      ],
    },
    {
      id: "penthouse",
      name: "Penthouse",
      description: "Luxury top-floor units with premium features",
      icon: <Building className="w-8 h-8" />,
      popular: false,
      category: "residential",
      features: [
        "Premium location",
        "Exclusive amenities",
        "High-end clientele",
        "Premium pricing",
      ],
    },
    {
      id: "terrace",
      name: "Terrace/Townhouse",
      description: "Connected row houses with modern design",
      icon: <Home className="w-8 h-8" />,
      popular: false,
      category: "residential",
      features: [
        "Modern architecture",
        "Compact efficiency",
        "Community feel",
        "Mid-range pricing",
      ],
    },
    {
      id: "single_room",
      name: "Single Room",
      description: "Individual rooms with shared facilities",
      icon: <Building className="w-8 h-8" />,
      popular: false,
      category: "residential",
      features: [
        "Most affordable",
        "Young professional market",
        "Quick turnovers",
        "Easy management",
      ],
    },

    // COMMERCIAL
    {
      id: "shop",
      name: "Shop",
      description: "Ground-floor retail spaces for businesses",
      icon: <Briefcase className="w-8 h-8" />,
      popular: false,
      category: "commercial",
      features: [
        "High foot traffic",
        "Prime location",
        "Business tenants",
        "Commercial lease rates",
      ],
    },
    {
      id: "office",
      name: "Office Space",
      description: "Commercial office buildings and suites",
      icon: <Briefcase className="w-8 h-8" />,
      popular: false,
      category: "commercial",
      features: [
        "Professional tenants",
        "Long-term leases",
        "Corporate rates",
        "Stable income",
      ],
    },
    {
      id: "warehouse",
      name: "Warehouse",
      description: "Industrial storage and logistics facilities",
      icon: <Warehouse className="w-8 h-8" />,
      popular: false,
      category: "commercial",
      features: [
        "Large square footage",
        "Industrial zones",
        "Logistics companies",
        "Bulk leases",
      ],
    },
    {
      id: "showroom",
      name: "Showroom",
      description: "Display spaces for products and services",
      icon: <Briefcase className="w-8 h-8" />,
      popular: false,
      category: "commercial",
      features: [
        "High visibility",
        "Display-friendly",
        "Retail brands",
        "Premium spaces",
      ],
    },

    // HOSPITALITY & EVENTS
    {
      id: "hotel",
      name: "Hotel",
      description: "Hotels, resorts, and short-term lodging facilities",
      icon: <Hotel className="w-8 h-8" />,
      popular: false,
      category: "hospitality",
      features: [
        "High nightly rates",
        "Tourism locations",
        "Seasonal peaks",
        "Premium positioning",
      ],
    },
    {
      id: "event_center",
      name: "Event Center",
      description: "Wedding venues, conference halls, and event spaces",
      icon: <Star className="w-8 h-8" />,
      popular: false,
      category: "hospitality",
      features: [
        "Wedding venue",
        "Conference spaces",
        "Event bookings",
        "Premium rates",
      ],
    },
    {
      id: "restaurant",
      name: "Restaurant",
      description: "Food & beverage establishments and dining venues",
      icon: <Utensils className="w-8 h-8" />,
      popular: false,
      category: "hospitality",
      features: [
        "Food business",
        "High traffic areas",
        "Commercial kitchen",
        "Growing sector",
      ],
    },

    // LAND
    {
      id: "residential_land",
      name: "Residential Land",
      description: "Plots and land for housing development",
      icon: <MapPin className="w-8 h-8" />,
      popular: false,
      category: "land",
      features: [
        "Development potential",
        "Long-term investment",
        "Appreciation likely",
        "Builders' target",
      ],
    },
    {
      id: "commercial_land",
      name: "Commercial Land",
      description: "Plots zoned for business and commercial use",
      icon: <MapPin className="w-8 h-8" />,
      popular: false,
      category: "land",
      features: [
        "Business zoning",
        "Premium locations",
        "High development value",
        "Investment grade",
      ],
    },
    {
      id: "mixed_use_land",
      name: "Mixed-Use Land",
      description: "Flexible zoning for residential and commercial",
      icon: <MapPin className="w-8 h-8" />,
      popular: false,
      category: "land",
      features: [
        "Flexible zoning",
        "Maximum potential",
        "Developer friendly",
        "Higher value",
      ],
    },
    {
      id: "farmland",
      name: "Farmland",
      description: "Agricultural land for farming and cultivation",
      icon: <MapPin className="w-8 h-8" />,
      popular: false,
      category: "land",
      features: [
        "Agricultural use",
        "Rural locations",
        "Farming communities",
        "Growing interest",
      ],
    },
  ];

  // Group properties by category
  const groupedTypes = propertyTypes.reduce(
    (acc, type) => {
      if (!acc[type.category]) acc[type.category] = [];
      acc[type.category].push(type);
      return acc;
    },
    {} as Record<string, PropertyType[]>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-12">
            <div className="flex items-center gap-4">
              <Link href="/owner/listings/new">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              </Link>
              <div>
                <h1 className="text-4xl font-bold text-foreground mb-2">
                  What are you listing?
                </h1>
                <p className="text-lg text-muted-foreground">
                  Select the property type that best describes your listing
                </p>
              </div>
            </div>
            <div className="text-sm font-medium bg-primary/10 text-primary px-4 py-2 rounded-full">
              Step 1 of 6
            </div>
          </div>

          {/* Category Sections */}
          <div className="space-y-12">
            {Object.entries(groupedTypes).map(([categoryId, types]) => {
              const category = categories[categoryId];
              return (
                <div key={categoryId} className="space-y-4">
                  {/* Category Header */}
                  <div className="flex items-center gap-3 mb-6">
                    <div className={`p-3 rounded-lg ${category.bgColor}`}>
                      <div className={category.color}>{category.icon}</div>
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-foreground">
                        {category.title}
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        {types.length} option{types.length !== 1 ? "s" : ""} available
                      </p>
                    </div>
                  </div>

                  {/* Property Cards Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {types.map((type) => (
                      <Card
                        key={type.id}
                        className={`cursor-pointer transition-all duration-300 hover:shadow-xl ${
                          selectedType === type.id
                            ? `border-2 ${category.borderColor} ${category.bgColor} shadow-lg scale-105`
                            : `border border-border/30 hover:border-primary/50 hover:shadow-md`
                        }`}
                        onClick={() => setSelectedType(type.id)}
                      >
                        <CardContent className="p-5">
                          {/* Popular Badge */}
                          {type.popular && (
                            <div className="flex justify-end mb-3">
                              <div className="flex items-center gap-1 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full">
                                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                                <span className="text-xs font-semibold text-amber-700">
                                  Popular
                                </span>
                              </div>
                            </div>
                          )}

                          <div className="space-y-3">
                            {/* Icon & Title */}
                            <div className="flex items-start justify-between gap-3">
                              <div
                                className={`p-3 rounded-lg transition-all shrink-0 ${
                                  selectedType === type.id
                                    ? `bg-primary text-primary-foreground`
                                    : `bg-primary/10 text-primary`
                                }`}
                              >
                                {type.icon}
                              </div>
                              {selectedType === type.id && (
                                <CheckCircle className="w-6 h-6 text-primary mt-1" />
                              )}
                            </div>

                            {/* Description */}
                            <div>
                              <h3 className="font-semibold text-foreground mb-1">
                                {type.name}
                              </h3>
                              <p className="text-xs text-muted-foreground line-clamp-2">
                                {type.description}
                              </p>
                            </div>

                            {/* Features */}
                            <div className="pt-2 space-y-2 border-t border-border/30">
                              {type.features.map((feature, index) => (
                                <div key={index} className="flex items-start gap-2">
                                  <div className="w-1 h-1 bg-primary rounded-full mt-1.5 shrink-0" />
                                  <span className="text-xs text-muted-foreground leading-tight">
                                    {feature}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* CTA Section */}
          {selectedType && (
            <div className="mt-12 p-6 bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/30 rounded-xl animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-foreground mb-1">
                    Ready to continue?
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    You selected{" "}
                    <span className="font-medium text-primary">
                      {propertyTypes.find((t) => t.id === selectedType)?.name}
                    </span>
                    . Let's add the details about your property.
                  </p>
                </div>
                <Link href={`/owner/listings/new/details?type=${selectedType}`}>
                  <Button variant="default" className="gap-2">
                    Continue
                    <ArrowLeft className="w-4 h-4 rotate-180" />
                  </Button>
                </Link>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between pt-8 mt-8 border-t border-border">
            <Link href="/owner/listings/new">
              <Button variant="ghost">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </Link>
            {!selectedType && (
              <p className="text-sm text-muted-foreground">
                Select a property type to continue →
              </p>
            )}
            {selectedType && (
              <Link href={`/owner/listings/new/details?type=${selectedType}`}>
                <Button variant="default">
                  Continue to Details
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
