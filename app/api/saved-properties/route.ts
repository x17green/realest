// realest/app/api/saved-properties/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

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
    const savedProperties = await prisma.saved_properties.findMany({
      where: { user_id: user.id },
      include: {
        properties: {
          include: {
            property_details: true,
            property_media: true,
            owners: { include: { profiles: { select: { full_name: true, avatar_url: true } } } },
          },
        },
      },
      orderBy: { created_at: "desc" },
    });

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
    const property = await prisma.properties.findFirst({
      where: { id: property_id, status: "live" },
      select: { id: true },
    });

    if (!property) {
      return NextResponse.json(
        { error: "Property not found or not available" },
        { status: 404 }
      );
    }

    // Check if already saved (upsert or check unique constraint)
    const existing = await prisma.saved_properties.findFirst({
      where: { user_id: user.id, property_id },
      select: { id: true },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Property already saved" },
        { status: 400 }
      );
    }

    // Save property
    const savedProperty = await prisma.saved_properties.create({
      data: { user_id: user.id, property_id },
    });

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
    await prisma.saved_properties.deleteMany({
      where: { user_id: user.id, property_id: propertyId },
    });

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
