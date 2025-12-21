// realest/app/api/properties/[id]/media/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const uploadMediaSchema = z.object({
  file_name: z.string().min(1),
  file_url: z.string().url(),
  media_type: z.enum(["image", "video", "virtual_tour"]),
  is_primary: z.boolean().default(false),
});

// GET /api/properties/[id]/media - Get property media
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const supabase = await createClient();
    const { id } = await params;
    const propertyId = id;

    // Check if property exists and user has access
    const { data: property, error: propertyError } = await supabase
      .from("properties")
      .select("owner_id, status")
      .eq("id", propertyId)
      .single();

    if (propertyError) {
      return NextResponse.json(
        { error: "Property not found" },
        { status: 404 },
      );
    }

    // Get authenticated user
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const isOwner = user && property.owner_id === user.id;

    // Only owners can see all media, others see only for live properties
    if (!isOwner && property.status !== "live") {
      return NextResponse.json(
        { error: "Property not available" },
        { status: 404 },
      );
    }

    const { data: media, error } = await supabase
      .from("property_media")
      .select("*")
      .eq("property_id", propertyId)
      .order("sort_order", { ascending: true });

    if (error) {
      console.error("Media fetch error:", error);
      return NextResponse.json(
        { error: "Failed to fetch media" },
        { status: 500 },
      );
    }

    return NextResponse.json({ media });
  } catch (error) {
    console.error("Media API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// POST /api/properties/[id]/media - Upload media for property
export async function POST(
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
      .select("owner_id, status")
      .eq("id", propertyId)
      .single();

    if (propertyError || property?.owner_id !== user.id) {
      return NextResponse.json(
        { error: "Property not found or access denied" },
        { status: 404 },
      );
    }

    // Only allow media uploads for draft/rejected properties
    if (property.status === "live") {
      return NextResponse.json(
        { error: "Cannot upload media to live properties" },
        { status: 400 },
      );
    }

    const body = await request.json();
    const validatedData = uploadMediaSchema.parse(body);

    // Get current max sort order
    const { data: existingMedia, error: sortError } = await supabase
      .from("property_media")
      .select("sort_order")
      .eq("property_id", propertyId)
      .order("sort_order", { ascending: false })
      .limit(1);

    const nextSortOrder =
      existingMedia && existingMedia.length > 0
        ? existingMedia[0].sort_order + 1
        : 1;

    // If this is marked as primary, unset other primary images
    if (validatedData.is_primary) {
      await supabase
        .from("property_media")
        .update({ is_primary: false })
        .eq("property_id", propertyId);
    }

    // Insert media record
    const { data: media, error: insertError } = await supabase
      .from("property_media")
      .insert({
        property_id: propertyId,
        media_type: validatedData.media_type,
        file_url: validatedData.file_url,
        file_name: validatedData.file_name,
        is_primary: validatedData.is_primary,
        sort_order: nextSortOrder,
      })
      .select()
      .single();

    if (insertError) {
      console.error("Media upload error:", insertError);
      return NextResponse.json(
        { error: "Failed to upload media" },
        { status: 500 },
      );
    }

    return NextResponse.json(
      { media, message: "Media uploaded successfully" },
      { status: 201 },
    );
  } catch (error) {
    console.error("Media upload API error:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid media data", details: error.errors },
        { status: 400 },
      );
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
