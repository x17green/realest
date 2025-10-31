"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, Chip } from "@heroui/react";
import Link from "next/link";
import { MapPin, Bed, Bath, Ruler, Sparkles, TrendingUp } from "lucide-react";

interface Property {
  id: string;
  title: string;
  price: number;
  address: string;
  city: string;
  bedrooms: number;
  bathrooms: number;
  square_feet: number;
  listing_type: string;
  property_type: string;
}

export default function FeaturedProperties() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProperties = async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("properties")
        .select("*")
        .eq("status", "active")
        .eq("verification_status", "verified")
        .limit(4);

      if (!error && data) {
        setProperties(data as Property[]);
      }
      setIsLoading(false);
    };

    fetchProperties();
  }, []);

  if (isLoading) {
    return (
      <section className="relative py-20 overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-linear-to-br from-secondary/10 via-primary/5 to-secondary/20" />
        <div className="absolute inset-0 bg-linear-to-t from-background via-background/50 to-transparent" />

        {/* Floating Elements */}
        <div className="absolute top-10 right-10 w-16 h-16 bg-primary/10 rounded-full blur-xl animate-pulse" />
        <div className="absolute bottom-10 left-10 w-20 h-20 bg-secondary/10 rounded-full blur-xl animate-pulse delay-500" />

        <div className="relative z-10 container mx-auto px-4">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-secondary/10 border border-secondary/20 rounded-full px-4 py-2 mb-6">
              <Sparkles className="w-4 h-4 text-secondary" />
              <span className="text-sm font-medium text-secondary">
                Premium Properties
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-linear-to-r from-foreground via-foreground to-primary bg-clip-text text-transparent">
              Featured Properties
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="h-80 bg-muted rounded-2xl animate-pulse shadow-lg"
              />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative py-20 overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-linear-to-br from-secondary/10 via-primary/5 to-secondary/20" />
      <div className="absolute inset-0 bg-linear-to-t from-background via-background/50 to-transparent" />

      {/* Floating Elements */}
      <div className="absolute top-10 right-10 w-16 h-16 bg-primary/10 rounded-full blur-xl animate-pulse" />
      <div className="absolute bottom-10 left-10 w-20 h-20 bg-secondary/10 rounded-full blur-xl animate-pulse delay-500" />

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-4">
        <div className="text-center mb-12">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-secondary/10 border border-secondary/20 rounded-full px-4 py-2 mb-6">
            <Sparkles className="w-4 h-4 text-secondary" />
            <span className="text-sm font-medium text-secondary">
              Premium Properties
            </span>
          </div>

          {/* Main Heading */}
          <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-linear-to-r from-foreground via-foreground to-primary bg-clip-text text-transparent">
            Featured Properties
          </h2>

          {/* Subtitle */}
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Discover handpicked, verified properties that stand out from the
            crowd.
          </p>
        </div>

        {properties.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-background/80 backdrop-blur-lg border border-border/50 rounded-2xl p-8 max-w-md mx-auto">
              <TrendingUp className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                No verified properties available yet. Check back soon!
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {properties.map((property) => (
              <Link key={property.id} href={`/property/${property.id}`}>
                <Card.Root className="group h-full bg-background/80 backdrop-blur-lg border border-border/50 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 cursor-pointer overflow-hidden">
                  {/* Property Image */}
                  <div className="relative h-48 bg-muted rounded-t-2xl overflow-hidden">
                    <div className="absolute inset-0 bg-linear-to-br from-slate-400 to-slate-600" />
                    {/* Overlay on hover */}
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    {/* Badge */}
                    <Chip
                      variant="primary"
                      className="absolute top-3 right-3 bg-primary text-primary-foreground font-semibold text-xs"
                    >
                      {property.listing_type.replace("_", " ").toUpperCase()}
                    </Chip>
                    {/* Property Type Badge */}
                    <Chip
                      variant="secondary"
                      className="absolute bottom-3 left-3 bg-background/90 backdrop-blur-sm border-border/50 text-xs"
                    >
                      {property.property_type}
                    </Chip>
                  </div>

                  <Card.Content className="p-6">
                    <h3 className="font-bold text-lg line-clamp-2 mb-2 group-hover:text-primary transition-colors">
                      {property.title}
                    </h3>
                    <p className="text-2xl font-bold text-primary mb-3">
                      £{property.price.toLocaleString()}
                    </p>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground mb-4">
                      <MapPin className="w-4 h-4 shrink-0" />
                      <span className="line-clamp-1">
                        {property.address}, {property.city}
                      </span>
                    </div>
                    <div className="flex gap-4 text-sm text-muted-foreground">
                      {property.bedrooms > 0 && (
                        <div className="flex items-center gap-1">
                          <Bed className="w-4 h-4" />
                          <span>{property.bedrooms}</span>
                        </div>
                      )}
                      {property.bathrooms > 0 && (
                        <div className="flex items-center gap-1">
                          <Bath className="w-4 h-4" />
                          <span>{property.bathrooms}</span>
                        </div>
                      )}
                      {property.square_feet > 0 && (
                        <div className="flex items-center gap-1">
                          <Ruler className="w-4 h-4" />
                          <span>
                            {property.square_feet.toLocaleString()} sqft
                          </span>
                        </div>
                      )}
                    </div>
                  </Card.Content>
                </Card.Root>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
