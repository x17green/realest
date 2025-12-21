// realest/app/api/saved-properties/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Note: This assumes we add a 'saved_properties' table to the database
// Table structure:
// - id: uuid primary key
// - user_id: uuid (FK to profiles.id)
// - property_id: uuid (FK to properties.id)
// - created_at: timestamp

// GET /api/saved-properties - Get user's saved properties
export async function GET(request: NextRequest) {
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

    // Get saved properties with full property details
    const { data: savedProperties, error } = await supabase
      .from("saved_properties")
      .select(`
        id,
        created_at,
        properties (
          *,
          property_details (*),
          property_media (*),
          profiles:owner_id (
            full_name,
            avatar_url
          )
        )
      `)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Saved properties fetch error:", error);
      return NextResponse.json(
        { error: "Failed to fetch saved properties" },
        { status: 500 }
      );
    }

    return NextResponse.json({ saved_properties: savedProperties });
  } catch (error) {
    console.error("Saved properties API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/saved-properties - Save a property to favorites
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

    const body = await request.json();
    const { property_id } = body;

    if (!property_id) {
      return NextResponse.json(
        { error: "Property ID is required" },
        { status: 400 }
      );
    }

    // Check if property exists and is live
    const { data: property, error: propertyError } = await supabase
      .from("properties")
      .select("id, status")
      .eq("id", property_id)
      .eq("status", "live")
      .single();

    if (propertyError || !property) {
      return NextResponse.json(
        { error: "Property not found or not available" },
        { status: 404 }
      );
    }

    // Check if already saved
    const { data: existing, error: existingError } = await supabase
      .from("saved_properties")
      .select("id")
      .eq("user_id", user.id)
      .eq("property_id", property_id)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: "Property already saved" },
        { status: 400 }
      );
    }

    // Save property
    const { data: savedProperty, error: saveError } = await supabase
      .from("saved_properties")
      .insert({
        user_id: user.id,
        property_id: property_id,
      })
      .select()
      .single();

    if (saveError) {
      console.error("Save property error:", saveError);
      return NextResponse.json(
        { error: "Failed to save property" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { saved_property: savedProperty, message: "Property saved successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Save property API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/saved-properties - Remove a property from favorites
export async function DELETE(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const propertyId = searchParams.get("property_id");

    if (!propertyId) {
      return NextResponse.json(
        { error: "Property ID is required" },
        { status: 400 }
      );
    }

    // Remove from saved properties
    const { error } = await supabase
      .from("saved_properties")
      .delete()
      .eq("user_id", user.id)
      .eq("property_id", propertyId);

    if (error) {
      console.error("Remove saved property error:", error);
      return NextResponse.json(
        { error: "Failed to remove saved property" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "Property removed from saved list"
    });
  } catch (error) {
    console.error("Remove saved property API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
