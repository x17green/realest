// realest/app/api/search/properties/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const searchSchema = z.object({
  query: z.string().optional(),
  state: z.string().optional(),
  city: z.string().optional(),
  property_type: z.string().optional(),
  listing_type: z.enum(["sale", "rent", "lease"]).optional(),
  min_price: z.number().optional(),
  max_price: z.number().optional(),
  bedrooms: z.number().optional(),
  bathrooms: z.number().optional(),
  nepa_status: z.string().optional(),
  has_bq: z.boolean().optional(),
  gated_community: z.boolean().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  radius: z.number().default(10), // km
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(50).default(20),
});

// GET /api/search/properties - Advanced property search
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);

    // Parse search parameters
    const searchData = {
      query: searchParams.get("query") || undefined,
      state: searchParams.get("state") || undefined,
      city: searchParams.get("city") || undefined,
      property_type: searchParams.get("property_type") || undefined,
      listing_type: (searchParams.get("listing_type") as "sale" | "rent" | "lease") || undefined,
      min_price: searchParams.get("min_price") ? parseFloat(searchParams.get("min_price")!) : undefined,
      max_price: searchParams.get("max_price") ? parseFloat(searchParams.get("max_price")!) : undefined,
      bedrooms: searchParams.get("bedrooms") ? parseInt(searchParams.get("bedrooms")!) : undefined,
      bathrooms: searchParams.get("bathrooms") ? parseInt(searchParams.get("bathrooms")!) : undefined,
      nepa_status: searchParams.get("nepa_status") || undefined,
      has_bq: searchParams.get("has_bq") === "true" ? true : searchParams.get("has_bq") === "false" ? false : undefined,
      gated_community: searchParams.get("gated_community") === "true" ? true : undefined,
      latitude: searchParams.get("latitude") ? parseFloat(searchParams.get("latitude")!) : undefined,
      longitude: searchParams.get("longitude") ? parseFloat(searchParams.get("longitude")!) : undefined,
      radius: parseFloat(searchParams.get("radius") || "10"),
      page: parseInt(searchParams.get("page") || "1"),
      limit: parseInt(searchParams.get("limit") || "20"),
    };

    const validatedSearch = searchSchema.parse(searchData);

    let query = supabase
      .from("properties")
      .select(`
        *,
        property_details (*),
        property_media (*),
        profiles:owner_id (
          full_name,
          avatar_url
        )
      `, { count: 'exact' })
      .eq("verification_status", "verified")
      .eq("status", "live")
      .order("created_at", { ascending: false });

    // Text search
    if (validatedSearch.query) {
      query = query.or(
        `title.ilike.%${validatedSearch.query}%,description.ilike.%${validatedSearch.query}%,address.ilike.%${validatedSearch.query}%`
      );
    }

    // Location filters
    if (validatedSearch.state) {
      query = query.ilike("state", `%${validatedSearch.state}%`);
    }

    if (validatedSearch.city) {
      query = query.ilike("city", `%${validatedSearch.city}%`);
    }

    // Property type and listing type
    if (validatedSearch.property_type) {
      query = query.eq("property_type", validatedSearch.property_type);
    }

    if (validatedSearch.listing_type) {
      query = query.eq("listing_type", validatedSearch.listing_type);
    }

    // Price range
    if (validatedSearch.min_price) {
      query = query.gte("price", validatedSearch.min_price);
    }

    if (validatedSearch.max_price) {
      query = query.lte("price", validatedSearch.max_price);
    }

    // Bedrooms and bathrooms
    if (validatedSearch.bedrooms) {
      query = query.eq("property_details.bedrooms", validatedSearch.bedrooms);
    }

    if (validatedSearch.bathrooms) {
      query = query.eq("property_details.bathrooms", validatedSearch.bathrooms);
    }

    // Nigerian market specific filters
    if (validatedSearch.nepa_status) {
      query = query.eq("property_details.nepa_status", validatedSearch.nepa_status);
    }

    if (validatedSearch.has_bq !== undefined) {
      query = query.eq("property_details.has_bq", validatedSearch.has_bq);
    }

    if (validatedSearch.gated_community) {
      query = query.contains("property_details.security_type", ["gated_community"]);
    }

    // Geospatial search (if coordinates provided)
    if (validatedSearch.latitude && validatedSearch.longitude) {
      // Using PostGIS ST_DWithin for radius search
      // Note: This requires PostGIS extension and proper setup
      const radiusInDegrees = validatedSearch.radius / 111.32; // Approximate conversion km to degrees
      query = query.filter(
        'latitude',
        'gte',
        validatedSearch.latitude - radiusInDegrees
      ).filter(
        'latitude',
        'lte',
        validatedSearch.latitude + radiusInDegrees
      ).filter(
        'longitude',
        'gte',
        validatedSearch.longitude - radiusInDegrees
      ).filter(
        'longitude',
        'lte',
        validatedSearch.longitude + radiusInDegrees
      );
    }

    // Pagination
    const from = (validatedSearch.page - 1) * validatedSearch.limit;
    const to = from + validatedSearch.limit - 1;
    query = query.range(from, to);

    const { data: properties, error, count } = await query;

    if (error) {
      console.error("Search error:", error);
      return NextResponse.json(
        { error: "Search failed" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      properties,
      pagination: {
        page: validatedSearch.page,
        limit: validatedSearch.limit,
        total: count || 0,
        pages: Math.ceil((count || 0) / validatedSearch.limit),
      },
      search_criteria: validatedSearch,
    });
  } catch (error) {
    console.error("Search API error:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid search parameters", details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
