// realest/app/api/properties/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const updatePropertySchema = z.object({
  title: z.string().min(10).optional(),
  description: z.string().min(50).optional(),
  price: z.number().positive().optional(),
  address: z.string().min(10).optional(),
  city: z.string().min(2).optional(),
  state: z.string().min(2).optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  property_type: z
    .enum([
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
    ])
    .optional(),
  listing_type: z.enum(["sale", "rent", "lease"]).optional(),
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

// GET /api/properties/[id] - Get single property with full details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const supabase = await createClient();
    const { id } = await params;
    const propertyId = id;

    // Get property with all related data
    const { data: property, error } = await supabase
      .from("properties")
      .select(
        `
        *,
        property_details (*),
        property_media (*),
        property_documents (*),
        profiles:owner_id (
          id,
          full_name,
          avatar_url,
          phone,
          created_at
        ),
        inquiries:property_id (
          id,
          message,
          status,
          created_at,
          profiles:inquiries_sender_id_fkey (
            full_name,
            avatar_url
          )
        )
      `,
      )
      .eq("id", propertyId)
      .single();

    if (error) {
      console.error("Property fetch error:", error);
      if (error.code === "PGRST116") {
        return NextResponse.json(
          { error: "Property not found" },
          { status: 404 },
        );
      }
      return NextResponse.json(
        { error: "Failed to fetch property" },
        { status: 500 },
      );
    }

    // Check if user can view this property
    // Only verified/live properties are publicly visible
    // Owners can see their own properties in any status
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const isOwner = user && property.owner_id === user.id;
    const isAdmin = user && property.profiles?.user_type === "admin";

    if (!isOwner && !isAdmin && property.status !== "live") {
      return NextResponse.json(
        { error: "Property not available" },
        { status: 404 },
      );
    }

    return NextResponse.json({ property });
  } catch (error) {
    console.error("Property API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// PUT /api/properties/[id] - Update property (owner only, pre-verification)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const supabase = await createClient();
    const { id } = await params;
    const propertyId = id;

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check ownership
    const { data: property, error: propertyError } = await supabase
      .from("properties")
      .select("owner_id, agent_id, status, verification_status")
      .eq("id", propertyId)
      .single();

    if (propertyError || property?.owner_id !== user.id) {
      return NextResponse.json(
        { error: "Property not found or access denied" },
        { status: 404 },
      );
    }

    // Only allow updates for draft or rejected properties
    if (
      property.status === "live" ||
      property.verification_status === "verified"
    ) {
      return NextResponse.json(
        { error: "Cannot update verified properties. Contact support." },
        { status: 400 },
      );
    }

    const body = await request.json();
    const validatedData = updatePropertySchema.parse(body);

    // Update property
    const { data: updatedProperty, error: updateError } = await supabase
      .from("properties")
      .update({
        title: validatedData.title,
        description: validatedData.description,
        price: validatedData.price,
        address: validatedData.address,
        city: validatedData.city,
        state: validatedData.state,
        latitude: validatedData.latitude,
        longitude: validatedData.longitude,
        property_type: validatedData.property_type,
        listing_type: validatedData.listing_type,
        updated_at: new Date().toISOString(),
      })
      .eq("id", propertyId)
      .select()
      .single();

    if (updateError) {
      console.error("Property update error:", updateError);
      return NextResponse.json(
        { error: "Failed to update property" },
        { status: 500 },
      );
    }

    // Update property details if provided
    if (
      Object.keys(validatedData).some(
        (key) =>
          ![
            "title",
            "description",
            "price",
            "address",
            "city",
            "state",
            "latitude",
            "longitude",
            "property_type",
            "listing_type",
          ].includes(key),
      )
    ) {
      const detailsUpdate: any = {};

      // Map validated data to property_details fields
      if (validatedData.bedrooms !== undefined)
        detailsUpdate.bedrooms = validatedData.bedrooms;
      if (validatedData.bathrooms !== undefined)
        detailsUpdate.bathrooms = validatedData.bathrooms;
      if (validatedData.square_feet !== undefined)
        detailsUpdate.square_feet = validatedData.square_feet;
      if (validatedData.nepa_status !== undefined)
        detailsUpdate.nepa_status = validatedData.nepa_status;
      if (validatedData.has_generator !== undefined)
        detailsUpdate.has_generator = validatedData.has_generator;
      if (validatedData.has_inverter !== undefined)
        detailsUpdate.has_inverter = validatedData.has_inverter;
      if (validatedData.solar_panels !== undefined)
        detailsUpdate.solar_panels = validatedData.solar_panels;
      if (validatedData.water_source !== undefined)
        detailsUpdate.water_source = validatedData.water_source;
      if (validatedData.water_tank_capacity !== undefined)
        detailsUpdate.water_tank_capacity = validatedData.water_tank_capacity;
      if (validatedData.has_water_treatment !== undefined)
        detailsUpdate.has_water_treatment = validatedData.has_water_treatment;
      if (validatedData.internet_type !== undefined)
        detailsUpdate.internet_type = validatedData.internet_type;
      if (validatedData.road_condition !== undefined)
        detailsUpdate.road_condition = validatedData.road_condition;
      if (validatedData.road_accessibility !== undefined)
        detailsUpdate.road_accessibility = validatedData.road_accessibility;
      if (validatedData.security_type !== undefined)
        detailsUpdate.security_type = validatedData.security_type;
      if (validatedData.security_hours !== undefined)
        detailsUpdate.security_hours = validatedData.security_hours;
      if (validatedData.has_security_levy !== undefined)
        detailsUpdate.has_security_levy = validatedData.has_security_levy;
      if (validatedData.security_levy_amount !== undefined)
        detailsUpdate.security_levy_amount = validatedData.security_levy_amount;
      if (validatedData.has_bq !== undefined)
        detailsUpdate.has_bq = validatedData.has_bq;
      if (validatedData.bq_type !== undefined)
        detailsUpdate.bq_type = validatedData.bq_type;
      if (validatedData.bq_bathrooms !== undefined)
        detailsUpdate.bq_bathrooms = validatedData.bq_bathrooms;
      if (validatedData.bq_kitchen !== undefined)
        detailsUpdate.bq_kitchen = validatedData.bq_kitchen;
      if (validatedData.bq_separate_entrance !== undefined)
        detailsUpdate.bq_separate_entrance = validatedData.bq_separate_entrance;
      if (validatedData.bq_condition !== undefined)
        detailsUpdate.bq_condition = validatedData.bq_condition;

      if (Object.keys(detailsUpdate).length > 0) {
        const { error: detailsError } = await supabase
          .from("property_details")
          .update(detailsUpdate)
          .eq("property_id", propertyId);

        if (detailsError) {
          console.error("Property details update error:", detailsError);
        }
      }
    }

    return NextResponse.json({
      property: updatedProperty,
      message: "Property updated successfully",
    });
  } catch (error) {
    console.error("Property update API error:", error);
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

// DELETE /api/properties/[id] - Delete property (owner only, draft status)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const supabase = await createClient();
    const { id } = await params;
    const propertyId = id;

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check ownership and status
    const { data: property, error: propertyError } = await supabase
      .from("properties")
      .select("owner_id, status")
      .eq("id", propertyId)
      .single();

    if (propertyError || property?.owner_id !== user.id) {
      return NextResponse.json(
        { error: "Property not found or access denied" },
        { status: 404 },
      );
    }

    // Only allow deletion of draft properties
    if (property.status !== "draft") {
      return NextResponse.json(
        { error: "Cannot delete published properties" },
        { status: 400 },
      );
    }

    // Delete property (cascade will handle related records)
    const { error: deleteError } = await supabase
      .from("properties")
      .delete()
      .eq("id", propertyId);

    if (deleteError) {
      console.error("Property deletion error:", deleteError);
      return NextResponse.json(
        { error: "Failed to delete property" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      message: "Property deleted successfully",
    });
  } catch (error) {
    console.error("Property deletion API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
