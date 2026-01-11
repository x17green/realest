// realest/app/api/properties/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";
import { 
  propertyListingSchema, 
  propertyDetailsSchema 
} from "@/lib/validations/property";

// Use partial schemas for updates (all fields optional)
const updatePropertySchema = propertyListingSchema.partial();
const updatePropertyDetailsSchema = propertyDetailsSchema.partial();

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
    
    // Validate property fields (root level)
    const validatedPropertyData = updatePropertySchema.parse(body);
    
    // Validate property details fields (nested)
    const validatedDetailsData = updatePropertyDetailsSchema.parse(body);

    // Update property (root table) - only if there are property fields
    const propertyFields = Object.keys(validatedPropertyData).filter(key => 
      !['images', 'documents'].includes(key)
    );
    
    let updatedProperty = property;
    if (propertyFields.length > 0) {
      const { data, error: updateError } = await supabase
        .from("properties")
        .update({
          ...validatedPropertyData,
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
      updatedProperty = data;
    }

    
    // Update property details (nested table) - only if there are details fields
    const detailsFields = Object.keys(validatedDetailsData);
    if (detailsFields.length > 0) {
      const { error: detailsError } = await supabase
        .from("property_details")
        .update({
          ...validatedDetailsData,
          updated_at: new Date().toISOString(),
        })
        .eq("property_id", propertyId);

      if (detailsError) {
        console.error("Property details update error:", detailsError);
        // Don't fail the whole request if details update fails
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
