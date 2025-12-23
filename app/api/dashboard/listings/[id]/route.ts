import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const supabase = await createClient();
    const { id } = await params;
    const propertyId = id;

    // Verify authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify user is property owner or admin
    const { data: profile } = await supabase
      .from("profiles")
      .select("user_type")
      .eq("id", user.id)
      .single();

    if (!profile || !["owner", "admin"].includes(profile.user_type)) {
      return NextResponse.json(
        { error: "Forbidden - Property owners only" },
        { status: 403 },
      );
    }

    // Fetch property with related data
    const { data: property, error } = await supabase
      .from("properties")
      .select(
        `
        *,
        owner:profiles(full_name, email, phone, avatar_url),
        media:property_media(*),
        documents:property_documents(*),
        inquiries:inquiries(*, sender:profiles(full_name, email))
      `,
      )
      .eq("id", propertyId)
      .eq("owner_id", user.id) // Ensure owner can only access their own properties
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        // No rows returned
        return NextResponse.json(
          { error: "Property not found or access denied" },
          { status: 404 },
        );
      }
      console.error("Database error:", error);
      return NextResponse.json(
        { error: "Failed to fetch property" },
        { status: 500 },
      );
    }

    return NextResponse.json({ data: property });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const supabase = await createClient();
    const { id } = await params;
    const propertyId = id;

    // Verify authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify user is property owner or admin
    const { data: profile } = await supabase
      .from("profiles")
      .select("user_type")
      .eq("id", user.id)
      .single();

    if (!profile || !["owner", "admin"].includes(profile.user_type)) {
      return NextResponse.json(
        { error: "Forbidden - Property owners only" },
        { status: 403 },
      );
    }

    // Parse request body
    const updates = await request.json();

    // Prevent updating certain fields that should be managed by the system
    const protectedFields = [
      "id",
      "owner_id",
      "status",
      "verified_at",
      "created_at",
    ];
    const filteredUpdates = Object.fromEntries(
      Object.entries(updates).filter(([key]) => !protectedFields.includes(key)),
    );

    // Add updated_at timestamp
    filteredUpdates.updated_at = new Date().toISOString();

    // Update property
    const { data: property, error } = await supabase
      .from("properties")
      .update(filteredUpdates)
      .eq("id", propertyId)
      .eq("owner_id", user.id) // Ensure owner can only update their own properties
      .select(
        `
        *,
        owner:profiles(full_name, email)
      `,
      )
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        // No rows returned
        return NextResponse.json(
          { error: "Property not found or access denied" },
          { status: 404 },
        );
      }
      console.error("Database error:", error);
      return NextResponse.json(
        { error: "Failed to update property" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      data: property,
      message: "Property updated successfully",
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const supabase = await createClient();
    const { id } = await params;
    const propertyId = id;

    // Verify authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify user is property owner or admin
    const { data: profile } = await supabase
      .from("profiles")
      .select("user_type")
      .eq("id", user.id)
      .single();

    if (!profile || !["owner", "admin"].includes(profile.user_type)) {
      return NextResponse.json(
        { error: "Forbidden - Property owners only" },
        { status: 403 },
      );
    }

    // Check current property status - only allow deletion of draft/unlisted properties
    const { data: currentProperty } = await supabase
      .from("properties")
      .select("status")
      .eq("id", propertyId)
      .eq("owner_id", user.id)
      .single();

    if (!currentProperty) {
      return NextResponse.json(
        { error: "Property not found or access denied" },
        { status: 404 },
      );
    }

    if (!["draft", "unlisted", "rejected"].includes(currentProperty.status)) {
      return NextResponse.json(
        {
          error: "Cannot delete property",
          message:
            "Only draft, unlisted, or rejected properties can be deleted",
        },
        { status: 400 },
      );
    }

    // Delete property (this will cascade to related media/documents due to FK constraints)
    const { error } = await supabase
      .from("properties")
      .delete()
      .eq("id", propertyId)
      .eq("owner_id", user.id);

    if (error) {
      console.error("Database error:", error);
      return NextResponse.json(
        { error: "Failed to delete property" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      message: "Property deleted successfully",
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
