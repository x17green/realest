// realest/app/api/properties/[id]/media/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { propertyMediaSchema } from "@/lib/validations/property";

// GET /api/properties/[id]/media - Get property media
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const supabase = await createClient();
    const { id } = await params;

    const property = await prisma.properties.findUnique({
      where: { id },
      select: { owner_id: true, status: true },
    });

    if (!property) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 });
    }

    const { data: { user } } = await supabase.auth.getUser();
    let ownerRecord: { id: string } | null = null;
    if (user) {
      ownerRecord = await prisma.owners.findUnique({ where: { profile_id: user.id }, select: { id: true } });
    }
    const isOwner = ownerRecord !== null && property.owner_id === ownerRecord.id;

    if (!isOwner && property.status !== "live") {
      return NextResponse.json({ error: "Property not available" }, { status: 404 });
    }

    const media = await prisma.property_media.findMany({
      where: { property_id: id },
      orderBy: { display_order: "asc" },
    });

    return NextResponse.json({ media });
  } catch (error) {
    console.error("Media API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
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

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const property = await prisma.properties.findUnique({
      where: { id },
      select: { owner_id: true, status: true },
    });

    const ownerRecordPost = await prisma.owners.findUnique({ where: { profile_id: user.id }, select: { id: true } });
    if (!property || !ownerRecordPost || property.owner_id !== ownerRecordPost.id) {
      return NextResponse.json({ error: "Property not found or access denied" }, { status: 404 });
    }

    if (property.status === "live") {
      return NextResponse.json({ error: "Cannot upload media to live properties" }, { status: 400 });
    }

    const body = await request.json();
    const validatedData = propertyMediaSchema.parse(body);

    // Get next display order
    const lastMedia = await prisma.property_media.findFirst({
      where: { property_id: id },
      orderBy: { display_order: "desc" },
      select: { display_order: true },
    });
    const nextDisplayOrder = (lastMedia?.display_order ?? 0) + 1;

    // Unset other featured images if this is featured
    if (validatedData.is_featured) {
      await prisma.property_media.updateMany({
        where: { property_id: id },
        data: { is_featured: false },
      });
    }

    const media = await prisma.property_media.create({
      data: {
        property_id: id,
        media_type: validatedData.media_type,
        media_url: validatedData.media_url,
        file_name: validatedData.file_name,
        is_featured: validatedData.is_featured ?? false,
        display_order: nextDisplayOrder,
      },
    });

    return NextResponse.json({ media, message: "Media uploaded successfully" }, { status: 201 });
  } catch (error) {
    console.error("Media upload API error:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid media data", details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
