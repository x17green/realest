import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

// POST /api/properties/[id]/favorites - Save a property to favorites
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const supabase = await createClient();
    const { id } = await params;

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    // Verify property exists and is live
    const property = await prisma.properties.findUnique({
      where: { id, status: "live" },
      select: { id: true, title: true },
    });

    if (!property) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 });
    }

    // Check if already saved
    const existingSave = await prisma.saved_properties.findFirst({
      where: { user_id: user.id, property_id: id },
      select: { id: true },
    });

    if (existingSave) {
      return NextResponse.json({ error: "Property already saved to favorites" }, { status: 409 });
    }

    const savedProperty = await prisma.saved_properties.create({
      data: { user_id: user.id, property_id: id },
      include: {
        properties: {
          select: {
            id: true,
            title: true,
            price: true,
            price_frequency: true,
            state: true,
            city: true,
            bedrooms: true,
            bathrooms: true,
            status: true,
          },
        },
      },
    });

    return NextResponse.json(
      { data: savedProperty, message: "Property saved to favorites" },
      { status: 201 },
    );
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE /api/properties/[id]/favorites - Remove property from favorites
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const supabase = await createClient();
    const { id } = await params;

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const deleted = await prisma.saved_properties.deleteMany({
      where: { user_id: user.id, property_id: id },
    });

    if (deleted.count === 0) {
      return NextResponse.json({ error: "Property not found in favorites" }, { status: 404 });
    }

    return NextResponse.json({ message: "Property removed from favorites" });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
