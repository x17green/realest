// realest/app/api/properties/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { z } from "zod";

// Validation schemas for Nigerian market requirements
const MetadataSchema = z.object({
  nigeria: z.object({
    nepa_status: z.enum(["stable", "intermittent", "poor", "none", "generator_only"]).optional(),
    power_source: z.string().optional()
  }).optional(),
  utilities: z.object({
    water_source: z.enum(["borehole", "public_water", "well", "water_vendor", "none"]).optional(),
    water_tank_capacity: z.number().positive().optional(),
    has_water_treatment: z.boolean().optional(),
    internet_type: z.enum(["fiber", "starlink", "4g", "3g", "none"]).optional()
  }).optional(),
  security: z.object({
    security_type: z.array(z.enum([
      "gated_community", "security_post", "cctv", 
      "perimeter_fence", "security_dogs", "estate_security"
    ])).optional(),
    security_hours: z.enum(["24/7", "day_only", "night_only", "none"]).optional(),
    has_security_levy: z.boolean().optional(),
    security_levy_amount: z.number().positive().optional()
  }).optional(),
  bq: z.object({
    has_bq: z.boolean().optional(),
    bq_type: z.enum(["self_contained", "room_and_parlor", "single_room", "multiple_rooms"]).optional(),
    bq_bathrooms: z.number().min(0).optional(),
    bq_kitchen: z.boolean().optional(),
    bq_separate_entrance: z.boolean().optional(),
    bq_condition: z.enum(["excellent", "good", "fair", "needs_renovation"]).optional()
  }).optional(),
  building: z.object({
    floors: z.number().min(1).optional(),
    material: z.string().optional(),
    year_renovated: z.number().min(1900).max(new Date().getFullYear()).optional()
  }).optional(),
  city: z.string().optional()
}).passthrough();

const createPropertySchema = z.object({
  title: z.string().min(10, "Title must be at least 10 characters"),
  description: z.string().min(50, "Description must be at least 50 characters"),
  price: z.number().positive("Price must be positive"),
  country: z.string().optional().default("NG"),
  address: z.string().min(10, "Address is required"),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  property_type: z.enum([
    "duplex", "bungalow", "flat", "self_contained", "mini_flat", "room_and_parlor",
    "single_room", "penthouse", "terrace", "detached_house", "shop", "office",
    "warehouse", "showroom", "event_center", "hotel", "restaurant",
    "residential_land", "commercial_land", "mixed_use_land", "farmland",
    "house", "apartment", "land", "commercial"
  ]),
  listing_type: z.enum(["sale", "rent", "lease"]),
  listing_source: z.enum(["owner", "agent"]).default("owner"),
  bedrooms: z.number().min(0).optional(),
  bathrooms: z.number().min(0).optional(),
  square_feet: z.number().positive().optional(),
  // Convenience fields for Nigerian market (will be mapped to metadata)
  nepa_status: z.enum(["stable", "intermittent", "poor", "none", "generator_only"]).optional(),
  has_generator: z.boolean().optional(),
  has_inverter: z.boolean().optional(),
  solar_panels: z.boolean().optional(),
  water_source: z.enum(["borehole", "public_water", "well", "water_vendor", "none"]).optional(),
  water_tank_capacity: z.number().positive().optional(),
  has_water_treatment: z.boolean().optional(),
  internet_type: z.enum(["fiber", "starlink", "4g", "3g", "none"]).optional(),
  road_condition: z.enum(["paved", "tarred", "untarred", "bad"]).optional(),
  road_accessibility: z.enum(["all_year", "dry_season_only", "limited"]).optional(),
  security_type: z.array(z.enum([
    "gated_community", "security_post", "cctv", 
    "perimeter_fence", "security_dogs", "estate_security"
  ])).optional(),
  security_hours: z.enum(["24/7", "day_only", "night_only", "none"]).optional(),
  has_security_levy: z.boolean().optional(),
  security_levy_amount: z.number().positive().optional(),
  has_bq: z.boolean().optional(),
  bq_type: z.enum(["self_contained", "room_and_parlor", "single_room", "multiple_rooms"]).optional(),
  bq_bathrooms: z.number().min(0).optional(),
  bq_kitchen: z.boolean().optional(),
  bq_separate_entrance: z.boolean().optional(),
  bq_condition: z.enum(["excellent", "good", "fair", "needs_renovation"]).optional(),
  // Optional metadata object for extensibility
  metadata: MetadataSchema.optional()
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

// Use service role client for insert to bypass RLS and enforce server-side owner_id/agent_id
const serviceClient = createServiceClient();

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

    // Map listing_type to DB format
    const dbListingType = validatedSearch.listing_type 
      ? `for_${validatedSearch.listing_type}` as "for_sale" | "for_rent" | "for_lease"
      : null;

    // Use the search_properties RPC for efficient filtering
    const { data: properties, error } = await supabase.rpc('search_properties', {
      p_query: validatedSearch.query ?? null,
      p_city: validatedSearch.city ?? null,
      p_state: validatedSearch.state ?? null,
      p_property_type: validatedSearch.property_type ?? null,
      p_listing_type: dbListingType ?? null,
      p_min_price: validatedSearch.min_price ?? null,
      p_max_price: validatedSearch.max_price ?? null,
      p_nepa_status: validatedSearch.nepa_status ?? null,
      p_has_bq: validatedSearch.has_bq ?? null,
      p_limit: validatedSearch.limit,
      p_offset: (validatedSearch.page - 1) * validatedSearch.limit
    });

    if (error) {
      console.error("Properties search error:", error);
      return NextResponse.json(
        { error: "Failed to search properties" },
        { status: 500 },
      );
    }

    // Get accurate total count using companion RPC
    const { data: totalCountData, error: countError } = await supabase.rpc('search_properties_count', {
      p_query: validatedSearch.query ?? null,
      p_city: validatedSearch.city ?? null,
      p_state: validatedSearch.state ?? null,
      p_property_type: validatedSearch.property_type ?? null,
      p_listing_type: dbListingType ?? null,
      p_min_price: validatedSearch.min_price ?? null,
      p_max_price: validatedSearch.max_price ?? null,
      p_nepa_status: validatedSearch.nepa_status ?? null,
      p_has_bq: validatedSearch.has_bq ?? null,
    });

    const total = totalCountData ?? 0;

    return NextResponse.json({
      properties: properties || [],
      pagination: {
        page: validatedSearch.page,
        limit: validatedSearch.limit,
        total,
        pages: Math.ceil(total / validatedSearch.limit),
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
    console.log('Authenticated user:', user);
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user has owner role
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("user_type")
      .eq("id", user.id)
      .single();

    if (profileError || !["owner", "agent"].includes(profile?.user_type)) {
      return NextResponse.json(
        { error: "Only agents and property owners can create listings" },
        { status: 403 },
      );
    }

    const body = await request.json();
    const validatedData = createPropertySchema.parse(body);

    // Map listing_type to DB format
    const dbListingType = validatedData.listing_type ? `for_${validatedData.listing_type}` : null;

    // Build metadata by merging convenience fields
    const metadata = validatedData.metadata ?? {};
    if (validatedData.nepa_status) {
      metadata.nigeria = { ...(metadata.nigeria || {}), nepa_status: validatedData.nepa_status };
    }
    if (validatedData.has_generator !== undefined || validatedData.has_inverter !== undefined || validatedData.solar_panels !== undefined) {
      metadata.nigeria = { 
        ...(metadata.nigeria || {}), 
        power_source: validatedData.has_generator ? 'generator' : 
                     validatedData.has_inverter ? 'inverter' : 
                     validatedData.solar_panels ? 'solar' : undefined 
      };
    }
    if (validatedData.water_source || validatedData.water_tank_capacity || validatedData.has_water_treatment || validatedData.internet_type) {
      metadata.utilities = {
        ...(metadata.utilities || {}),
        water_source: validatedData.water_source,
        water_tank_capacity: validatedData.water_tank_capacity,
        has_water_treatment: validatedData.has_water_treatment,
        internet_type: validatedData.internet_type
      };
    }
    if (validatedData.security_type || validatedData.security_hours || validatedData.has_security_levy || validatedData.security_levy_amount) {
      metadata.security = {
        ...(metadata.security || {}),
        security_type: validatedData.security_type,
        security_hours: validatedData.security_hours,
        has_security_levy: validatedData.has_security_levy,
        security_levy_amount: validatedData.security_levy_amount
      };
    }
    if (validatedData.has_bq || validatedData.bq_type || validatedData.bq_bathrooms || validatedData.bq_kitchen || validatedData.bq_separate_entrance || validatedData.bq_condition) {
      metadata.bq = {
        ...(metadata.bq || {}),
        has_bq: validatedData.has_bq,
        bq_type: validatedData.bq_type,
        bq_bathrooms: validatedData.bq_bathrooms,
        bq_kitchen: validatedData.bq_kitchen,
        bq_separate_entrance: validatedData.bq_separate_entrance,
        bq_condition: validatedData.bq_condition
      };
    }
    if (validatedData.city) {
      metadata.city = validatedData.city; // For indexed city searches
    }

    // Check for potential duplicates: run two parameterized queries and combine results in JS
    const [{ data: byAddress, error: errAddr }, { data: byCoords, error: errCoords }] = await Promise.all([
      supabase.from('properties').select('id, address, latitude, longitude').eq('status', 'active').eq('address', validatedData.address),
      supabase.from('properties').select('id, address, latitude, longitude').eq('status', 'active')
        .eq('latitude', validatedData.latitude)
        .eq('longitude', validatedData.longitude),
    ]);

    if (errAddr || errCoords) {
      console.error('Duplicate check error:', errAddr || errCoords);
    } else {
      const existingProperties = [...(byAddress || []), ...(byCoords || [])];
      if (existingProperties.length > 0) {
        console.log('Potential duplicate detected:', existingProperties);
      }
    }

    // For agents, we need to get the agents.id (not profiles.id)
    let agentId: string | null = null;
    if (profile.user_type === 'agent') {
      const { data: agentRecord, error: agentError } = await supabase
        .from('agents')
        .select('id')
        .eq('profile_id', user.id)
        .single();

      if (agentError) {
        console.error('Agent lookup error:', agentError);
        return NextResponse.json(
          { error: 'Agent record not found. Please contact support.' },
          { status: 400 }
        );
      }
      agentId = agentRecord.id;
    }

    // Create property with server-enforced owner_id/agent_id
    const propertyData = {
      owner_id: profile.user_type === 'owner' ? user.id : null,
      agent_id: agentId,
      title: validatedData.title,
      description: validatedData.description,
      price: validatedData.price,
      country: validatedData.country,
      address: validatedData.address,
      city: validatedData.city,
      state: validatedData.state,
      latitude: validatedData.latitude,
      longitude: validatedData.longitude,
      property_type: validatedData.property_type,
      listing_type: dbListingType,
      status: "draft", // Start as draft, user can publish later
      verification_status: "pending",
    };

    const { data: property, error: propertyError } = await serviceClient
      .from("properties")
      .insert(propertyData)
      .select()
      .single();

    if (propertyError) {
      console.error("Property creation error:", propertyError);
      return NextResponse.json(
        { error: "Failed to create property" },
        { status: 500 },
      );
    }

    // Create property details with metadata (use service client for consistency)
    const { error: detailsError } = await serviceClient
      .from("property_details")
      .insert({
        property_id: property.id,
        bedrooms: validatedData.bedrooms,
        bathrooms: validatedData.bathrooms,
        square_feet: validatedData.square_feet,
        metadata,
        amenities: {}, // Initialize as empty JSONB
        features: {}   // Initialize as empty JSONB
      });

    if (detailsError) {
      console.error("Property details creation error:", detailsError);
      // Don't fail the whole request, but log the error
    }

    // Audit logging (already using service client)
    await serviceClient.from('admin_audit_log').insert({
      actor_id: user.id,
      action: 'create_property',
      target_id: property.id,
      metadata: { payload: validatedData, note: 'Created via API v2 mapping to metadata' }
    });

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
