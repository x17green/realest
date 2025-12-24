"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/lib/supabase/types";
import type { RealtimeChannel } from "@supabase/supabase-js";

export type Property = Database["public"]["Tables"]["properties"]["Row"] & {
  property_details:
    | Database["public"]["Tables"]["property_details"]["Row"]
    | null;
  property_media: Database["public"]["Tables"]["property_media"]["Row"][];
  owners:
    | (Database["public"]["Tables"]["owners"]["Row"] & {
        profiles: Database["public"]["Tables"]["profiles"]["Row"] | null;
      })
    | null;
};

export interface PropertyFilters {
  propertyType?: string;
  listingType?: "sale" | "rent" | "lease";
  state?: string;
  lga?: string;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  bathrooms?: number;
  hasBq?: boolean;
  nepaStatus?: string;
  waterSource?: string;
  internetType?: string;
  securityTypes?: string[];
}

interface UsePropertyMapOptions {
  bounds?: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
  center?: {
    lat: number;
    lng: number;
  };
  radius?: number; // in kilometers
  filters?: PropertyFilters;
  limit?: number;
  enabled?: boolean;
}

interface UsePropertyMapReturn {
  properties: Property[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function usePropertyMap({
  bounds,
  center,
  radius,
  filters,
  limit = radius ? 500 : 100, // Increase limit for radius search
  enabled = true,
}: UsePropertyMapOptions = {}): UsePropertyMapReturn {
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProperties = async () => {
    if (!enabled) return;

    setIsLoading(true);
    setError(null);

    try {
      const supabase = createClient();

      let query = supabase
        .from("properties")
        .select(
          `
          *,
          property_details (*),
          property_media (*),
          owners (
            *,
            profiles (*)
          )
        `,
        )
        .eq("status", "active")
        .eq("verification_status", "verified")
        .order("created_at", { ascending: false })
        .limit(limit);

      // Apply geospatial bounds filtering
      if (bounds) {
        query = query
          .gte("latitude", bounds.south)
          .lte("latitude", bounds.north)
          .gte("longitude", bounds.west)
          .lte("longitude", bounds.east);
      }

      // Apply filters
      if (filters) {
        if (filters.propertyType) {
          query = query.eq("property_type", filters.propertyType);
        }
        if (filters.listingType) {
          query = query.eq("listing_type", filters.listingType);
        }
        if (filters.state) {
          query = query.eq("state", filters.state);
        }
        if (filters.lga) {
          query = query.eq("lga", filters.lga);
        }
        if (filters.minPrice !== undefined) {
          query = query.gte("price", filters.minPrice);
        }
        if (filters.maxPrice !== undefined) {
          query = query.lte("price", filters.maxPrice);
        }
        if (filters.bedrooms !== undefined) {
          query = query.gte("property_details.bedrooms", filters.bedrooms);
        }
        if (filters.bathrooms !== undefined) {
          query = query.gte("property_details.bathrooms", filters.bathrooms);
        }
        if (filters.hasBq !== undefined) {
          query = query.eq("property_details.has_bq", filters.hasBq);
        }
        if (filters.nepaStatus) {
          query = query.eq("property_details.nepa_status", filters.nepaStatus);
        }
        if (filters.waterSource) {
          query = query.eq(
            "property_details.water_source",
            filters.waterSource,
          );
        }
        if (filters.internetType) {
          query = query.eq(
            "property_details.internet_type",
            filters.internetType,
          );
        }
        if (filters.securityTypes && filters.securityTypes.length > 0) {
          // Filter properties that have at least one of the specified security types
          query = query.overlaps(
            "property_details.security_type",
            filters.securityTypes,
          );
        }
      }

      const { data, error: queryError } = await query;

      if (queryError) {
        throw queryError;
      }

      // Filter out properties without coordinates
      const validProperties = (data || []).filter(
        (property) => property.latitude !== null && property.longitude !== null,
      );

      setProperties(validProperties as Property[]);
    } catch (err) {
      console.error("Error fetching properties for map:", err);
      setError(
        err instanceof Error ? err.message : "Failed to fetch properties",
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, [bounds, center, radius, filters, limit, enabled]);

  // Real-time updates
  useEffect(() => {
    if (!enabled) return;

    const supabase = createClient();
    const channel: RealtimeChannel = supabase
      .channel("properties-updates")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "properties" },
        () => {
          // Refetch properties when any change occurs
          fetchProperties();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [enabled]);

  return {
    properties,
    isLoading,
    error,
    refetch: fetchProperties,
  };
}
