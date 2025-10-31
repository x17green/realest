"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Card, Input, Button, Chip } from "@heroui/react";
import Link from "next/link";
import { MapPin, Bed, Bath, Ruler, Search } from "lucide-react";

interface Property {
  id: string;
  title: string;
  price: number;
  address: string;
  city: string;
  listing_type: string;
  property_type: string;
  latitude: number | null;
  longitude: number | null;
  property_details: {
    bedrooms: number | null;
    bathrooms: number | null;
    square_feet: number | null;
  }[];
}

export default function SearchPage() {
  const searchParams = useSearchParams();
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [filters, setFilters] = useState({
    propertyType: "",
    listingType: "",
    minPrice: "",
    maxPrice: "",
    bedrooms: "",
  });

  useEffect(() => {
    const fetchProperties = async () => {
      setIsLoading(true);
      const supabase = createClient();
      let query = supabase
        .from("properties")
        .select(
          `
          id,
          title,
          price,
          address,
          city,
          listing_type,
          property_type,
          latitude,
          longitude,
          property_details (
            bedrooms,
            bathrooms,
            square_feet
          )
        `,
        )
        .eq("status", "active")
        .eq("verification_status", "verified");

      if (searchQuery) {
        query = query.or(
          `title.ilike.%${searchQuery}%,address.ilike.%${searchQuery}%,city.ilike.%${searchQuery}%`,
        );
      }

      if (filters.propertyType) {
        query = query.eq("property_type", filters.propertyType);
      }

      if (filters.listingType) {
        query = query.eq("listing_type", filters.listingType);
      }

      if (filters.minPrice) {
        query = query.gte("price", parseInt(filters.minPrice));
      }

      if (filters.maxPrice) {
        query = query.lte("price", parseInt(filters.maxPrice));
      }

      if (filters.bedrooms) {
        query = query.eq(
          "property_details.bedrooms",
          parseInt(filters.bedrooms),
        );
      }

      const { data, error } = await query;

      if (!error && data) {
        setProperties(data as unknown as Property[]);
      }
      setIsLoading(false);
    };

    fetchProperties();
  }, [searchQuery, filters]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Search Properties</h1>

        {/* Search Bar */}
        <div className="flex gap-2 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search by location, address, or keyword"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="primary">Search</Button>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <select
            value={filters.propertyType}
            onChange={(e) => handleFilterChange("propertyType", e.target.value)}
            className="px-3 py-2 border rounded-md"
          >
            <option value="">All Property Types</option>
            <option value="house">House</option>
            <option value="apartment">Apartment</option>
            <option value="land">Land</option>
            <option value="commercial">Commercial</option>
          </select>

          <select
            value={filters.listingType}
            onChange={(e) => handleFilterChange("listingType", e.target.value)}
            className="px-3 py-2 border rounded-md"
          >
            <option value="">All Listing Types</option>
            <option value="sale">For Sale</option>
            <option value="rent">For Rent</option>
            <option value="lease">For Lease</option>
          </select>

          <Input
            type="number"
            placeholder="Min Price"
            value={filters.minPrice}
            onChange={(e) => handleFilterChange("minPrice", e.target.value)}
          />

          <Input
            type="number"
            placeholder="Max Price"
            value={filters.maxPrice}
            onChange={(e) => handleFilterChange("maxPrice", e.target.value)}
          />

          <select
            value={filters.bedrooms}
            onChange={(e) => handleFilterChange("bedrooms", e.target.value)}
            className="px-3 py-2 border rounded-md"
          >
            <option value="">Any Bedrooms</option>
            <option value="1">1+</option>
            <option value="2">2+</option>
            <option value="3">3+</option>
            <option value="4">4+</option>
          </select>
        </div>
      </div>

      {/* Results */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-64 bg-muted rounded-lg animate-pulse" />
          ))}
        </div>
      ) : properties.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            No properties found matching your criteria.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((property) => (
            <Link key={property.id} href={`/property/${property.id}`}>
              <Card.Root className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                <div className="relative h-48 bg-muted rounded-t-lg overflow-hidden">
                  <div className="absolute inset-0 bg-linear-to-br from-slate-400 to-slate-600" />
                  <Chip
                    type="success"
                    variant="primary"
                    className="absolute top-2 right-2"
                  >
                    {property.listing_type.replace("_", " ").toUpperCase()}
                  </Chip>
                </div>
                <Card.Content className="pt-4">
                  <h3 className="font-semibold line-clamp-2 mb-2">
                    {property.title}
                  </h3>
                  <p className="text-2xl font-bold text-primary mb-2">
                    £{property.price.toLocaleString()}
                  </p>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground mb-4">
                    <MapPin className="w-4 h-4" />
                    <span className="line-clamp-1">{property.address}</span>
                  </div>
                  <div className="flex gap-4 text-sm text-muted-foreground">
                    {property.property_details?.[0]?.bedrooms &&
                      property.property_details[0].bedrooms > 0 && (
                        <div className="flex items-center gap-1">
                          <Bed className="w-4 h-4" />
                          <span>{property.property_details[0].bedrooms}</span>
                        </div>
                      )}
                    {property.property_details?.[0]?.bathrooms &&
                      property.property_details[0].bathrooms > 0 && (
                        <div className="flex items-center gap-1">
                          <Bath className="w-4 h-4" />
                          <span>{property.property_details[0].bathrooms}</span>
                        </div>
                      )}
                    {property.property_details?.[0]?.square_feet &&
                      property.property_details[0].square_feet > 0 && (
                        <div className="flex items-center gap-1">
                          <Ruler className="w-4 h-4" />
                          <span>
                            {property.property_details[0].square_feet.toLocaleString()}{" "}
                            sqft
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
  );
}
