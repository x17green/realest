// realest/app/api/properties/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { z } from "zod";
import { propertyListingSchema, propertyDetailsSchema } from "@/lib/validations/property";

const searchQuerySchema = z.object({
  query: z.string().optional(),
  state: z.string().optional(),
  city: z.string().optional(),
  property_type: z.string().optional(),
  listing_type: z.enum(["for_rent", "for_sale", "for_lease", "short_let"]),
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

    // Use the search_properties RPC for efficient filtering
    const { data: properties, error } = await supabase.rpc('search_properties', {
      p_query: validatedSearch.query ?? null,
      p_city: validatedSearch.city ?? null,
      p_state: validatedSearch.state ?? null,
      p_property_type: validatedSearch.property_type ?? null,
      p_listing_type: validatedSearch.listing_type ?? null,
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
      p_listing_type: validatedSearch.listing_type ?? null,
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
    const validatedData = propertyListingSchema.parse(body);
    console.log('Validated property data:', validatedData);
    
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
      price_frequency: validatedData.price_frequency,
      property_type: validatedData.property_type,
      listing_type: validatedData.listing_type,
      address: validatedData.address,
      city: validatedData.city,
      state: validatedData.state,
      postal_code: validatedData.postal_code,
      country: validatedData.country,
      latitude: validatedData.latitude,
      longitude: validatedData.longitude,
      bedrooms: validatedData.bedrooms,
      bathrooms: validatedData.bathrooms,
      square_feet: validatedData.square_feet,
      year_built: validatedData.year_built,
      status: "draft", // Start as draft, user can publish later
      verification_status: "pending",
      listing_source: profile.user_type === 'agent' ? 'agent' : 'owner',
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

    const validatedPropertyDetails = propertyDetailsSchema.parse(body);

    const propertyDetailsData = {
      property_id: property.id,
      parking_spaces: validatedPropertyDetails.parking_spaces || null,
      has_pool: validatedPropertyDetails.has_pool || null,
      has_garage: validatedPropertyDetails.has_garage || null,
      has_garden: validatedPropertyDetails.has_garden || null,
      heating_type: validatedPropertyDetails.heating_type || null,
      cooling_type: validatedPropertyDetails.cooling_type || null,
      flooring_type: validatedPropertyDetails.flooring_type || null,
      roof_type: validatedPropertyDetails.roof_type || null,
      foundation_type: validatedPropertyDetails.foundation_type || null,
      metadata: validatedPropertyDetails.metadata || {},
      amenities: validatedPropertyDetails.amenities || {}, // Initialize as empty JSONB
      features: validatedPropertyDetails.features || {}   // Initialize as empty JSONB
    };

    // Create property details with metadata (use service client for consistency)
    const { error: detailsError } = await serviceClient
      .from("property_details")
      .insert(propertyDetailsData);

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
