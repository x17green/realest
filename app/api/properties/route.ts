// realest/app/api/properties/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

// Validation schemas for Nigerian market requirements
const createPropertySchema = z.object({
  title: z.string().min(10, "Title must be at least 10 characters"),
  description: z.string().min(50, "Description must be at least 50 characters"),
  price: z.number().positive("Price must be positive"),
  currency: z.string().default("NGN"),
  address: z.string().min(10, "Address is required"),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  property_type: z.enum([
    "duplex",
    "bungalow",
    "flat",
    "self_contained",
    "mini_flat",
    "room_and_parlor",
    "single_room",
    "penthouse",
    "terrace",
    "detached_house",
    "shop",
    "office",
    "warehouse",
    "showroom",
    "event_center",
    "hotel",
    "restaurant",
    "residential_land",
    "commercial_land",
    "mixed_use_land",
    "farmland",
  ]),
  listing_type: z.enum(["sale", "rent", "lease"]),
  bedrooms: z.number().min(0).optional(),
  bathrooms: z.number().min(0).optional(),
  square_feet: z.number().positive().optional(),
  // Nigerian market specific fields
  nepa_status: z
    .enum(["stable", "intermittent", "poor", "none", "generator_only"])
    .optional(),
  has_generator: z.boolean().optional(),
  has_inverter: z.boolean().optional(),
  solar_panels: z.boolean().optional(),
  water_source: z
    .enum(["borehole", "public_water", "well", "water_vendor", "none"])
    .optional(),
  water_tank_capacity: z.number().positive().optional(),
  has_water_treatment: z.boolean().optional(),
  internet_type: z.enum(["fiber", "starlink", "4g", "3g", "none"]).optional(),
  road_condition: z.enum(["paved", "tarred", "untarred", "bad"]).optional(),
  road_accessibility: z
    .enum(["all_year", "dry_season_only", "limited"])
    .optional(),
  security_type: z
    .array(
      z.enum([
        "gated_community",
        "security_post",
        "cctv",
        "perimeter_fence",
        "security_dogs",
        "estate_security",
      ]),
    )
    .optional(),
  security_hours: z.enum(["24/7", "day_only", "night_only", "none"]).optional(),
  has_security_levy: z.boolean().optional(),
  security_levy_amount: z.number().positive().optional(),
  has_bq: z.boolean().optional(),
  bq_type: z
    .enum([
      "self_contained",
      "room_and_parlor",
      "single_room",
      "multiple_rooms",
    ])
    .optional(),
  bq_bathrooms: z.number().min(0).optional(),
  bq_kitchen: z.boolean().optional(),
  bq_separate_entrance: z.boolean().optional(),
  bq_condition: z
    .enum(["excellent", "good", "fair", "needs_renovation"])
    .optional(),
});

const searchQuerySchema = z.object({
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
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(50).default(20),
});

// GET /api/properties - List properties with search and filters
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
      listing_type:
        (searchParams.get("listing_type") as "sale" | "rent" | "lease") ||
        undefined,
      min_price: searchParams.get("min_price")
        ? parseFloat(searchParams.get("min_price")!)
        : undefined,
      max_price: searchParams.get("max_price")
        ? parseFloat(searchParams.get("max_price")!)
        : undefined,
      bedrooms: searchParams.get("bedrooms")
        ? parseInt(searchParams.get("bedrooms")!)
        : undefined,
      bathrooms: searchParams.get("bathrooms")
        ? parseInt(searchParams.get("bathrooms")!)
        : undefined,
      nepa_status: searchParams.get("nepa_status") || undefined,
      has_bq:
        searchParams.get("has_bq") === "true"
          ? true
          : searchParams.get("has_bq") === "false"
            ? false
            : undefined,
      gated_community:
        searchParams.get("gated_community") === "true" ? true : undefined,
      page: parseInt(searchParams.get("page") || "1"),
      limit: parseInt(searchParams.get("limit") || "20"),
    };

    // Validate search parameters
    const validatedSearch = searchQuerySchema.parse(searchData);

    // Build the main properties query with joins
    let query = supabase
      .from("properties")
      .select(
        `
        *,
        property_details (*),
        property_media (*),
        property_documents (*),
        profiles:owner_id (
          full_name,
          avatar_url,
          phone
        )
      `,
      )
      .eq("verification_status", "verified") // Only show verified properties
      .eq("status", "live") // Only show live properties
      .order("created_at", { ascending: false });

    // Apply basic property-level filters
    if (validatedSearch.query) {
      query = query.or(
        `title.ilike.%${validatedSearch.query}%,description.ilike.%${validatedSearch.query}%,address.ilike.%${validatedSearch.query}%`,
      );
    }

    if (validatedSearch.state) {
      query = query.ilike("state", `%${validatedSearch.state}%`);
    }

    if (validatedSearch.city) {
      query = query.ilike("city", `%${validatedSearch.city}%`);
    }

    if (validatedSearch.property_type) {
      query = query.eq("property_type", validatedSearch.property_type);
    }

    if (validatedSearch.listing_type) {
      query = query.eq("listing_type", validatedSearch.listing_type);
    }

    if (validatedSearch.min_price) {
      query = query.gte("price", validatedSearch.min_price);
    }

    if (validatedSearch.max_price) {
      query = query.lte("price", validatedSearch.max_price);
    }

    // Note: Advanced filters (bedrooms, bathrooms, nepa_status, etc.) are currently disabled
    // due to Supabase join filtering limitations. These will be implemented with a different approach.
    // TODO: Implement advanced filtering with subqueries or post-processing

    // Pagination
    const from = (validatedSearch.page - 1) * validatedSearch.limit;
    const to = from + validatedSearch.limit - 1;
    query = query.range(from, to);

    const { data: properties, error, count } = await query;

    if (error) {
      console.error("Properties fetch error:", error);
      return NextResponse.json(
        { error: "Failed to fetch properties" },
        { status: 500 },
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
    });
  } catch (error) {
    console.error("Properties API error:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid search parameters", details: error.errors },
        { status: 400 },
      );
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// POST /api/properties - Create new property
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user has owner role
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("user_type")
      .eq("id", user.id)
      .single();

    if (profileError || profile?.user_type !== "owner") {
      return NextResponse.json(
        { error: "Only property owners can create listings" },
        { status: 403 },
      );
    }

    const body = await request.json();
    const validatedData = createPropertySchema.parse(body);

    // Check for potential duplicates (basic check)
    const { data: existingProperties, error: duplicateError } = await supabase
      .from("properties")
      .select("id, address, latitude, longitude")
      .eq("status", "live")
      .or(
        `address.eq.${validatedData.address},and(latitude.eq.${validatedData.latitude},longitude.eq.${validatedData.longitude})`,
      );

    if (duplicateError) {
      console.error("Duplicate check error:", duplicateError);
    } else if (existingProperties && existingProperties.length > 0) {
      // Flag as potential duplicate - admin will review
      console.log("Potential duplicate detected:", existingProperties);
    }

    // Create property
    const { data: property, error: propertyError } = await supabase
      .from("properties")
      .insert({
        owner_id: user.id,
        title: validatedData.title,
        description: validatedData.description,
        price: validatedData.price,
        currency: validatedData.currency,
        address: validatedData.address,
        city: validatedData.city,
        state: validatedData.state,
        latitude: validatedData.latitude,
        longitude: validatedData.longitude,
        property_type: validatedData.property_type,
        listing_type: validatedData.listing_type,
        status: "draft", // Start as draft, user can publish later
        verification_status: "pending",
      })
      .select()
      .single();

    if (propertyError) {
      console.error("Property creation error:", propertyError);
      return NextResponse.json(
        { error: "Failed to create property" },
        { status: 500 },
      );
    }

    // Create property details
    const { error: detailsError } = await supabase
      .from("property_details")
      .insert({
        property_id: property.id,
        bedrooms: validatedData.bedrooms,
        bathrooms: validatedData.bathrooms,
        square_feet: validatedData.square_feet,
        // Nigerian market specific fields
        nepa_status: validatedData.nepa_status,
        has_generator: validatedData.has_generator,
        has_inverter: validatedData.has_inverter,
        solar_panels: validatedData.solar_panels,
        water_source: validatedData.water_source,
        water_tank_capacity: validatedData.water_tank_capacity,
        has_water_treatment: validatedData.has_water_treatment,
        internet_type: validatedData.internet_type,
        road_condition: validatedData.road_condition,
        road_accessibility: validatedData.road_accessibility,
        security_type: validatedData.security_type,
        security_hours: validatedData.security_hours,
        has_security_levy: validatedData.has_security_levy,
        security_levy_amount: validatedData.security_levy_amount,
        has_bq: validatedData.has_bq,
        bq_type: validatedData.bq_type,
        bq_bathrooms: validatedData.bq_bathrooms,
        bq_kitchen: validatedData.bq_kitchen,
        bq_separate_entrance: validatedData.bq_separate_entrance,
        bq_condition: validatedData.bq_condition,
      });

    if (detailsError) {
      console.error("Property details creation error:", detailsError);
      // Don't fail the whole request, but log the error
    }

    return NextResponse.json(
      {
        property,
        message:
          "Property created successfully. Add photos and documents to complete your listing.",
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Property creation API error:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid property data", details: error.errors },
        { status: 400 },
      );
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
