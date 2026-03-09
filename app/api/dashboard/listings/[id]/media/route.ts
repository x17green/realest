import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { generateSignedUrl } from "@/lib/utils/upload-utils";

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

    // Verify role via Prisma
    const userRow = await prisma.users.findUnique({
      where: { id: user.id },
      select: { role: true },
    });
    if (!userRow || !["owner", "admin"].includes(userRow.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Verify property ownership (unless admin)
    if (userRow.role !== "admin") {
      const property = await prisma.properties.findFirst({
        where: { id: propertyId, owner_id: user.id },
        select: { id: true },
      });
      if (!property) {
        return NextResponse.json(
          { error: "Property not found or access denied" },
          { status: 404 },
        );
      }
    }

    // Fetch media for this property
    const media = await prisma.property_media.findMany({
      where: { property_id: propertyId },
      orderBy: { display_order: "asc" },
    });

    return NextResponse.json({ data: media });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request, { params }: RouteParams) {
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

    // Verify role via Prisma
    const userRow = await prisma.users.findUnique({
      where: { id: user.id },
      select: { role: true },
    });
    if (!userRow || !["owner", "admin"].includes(userRow.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Verify property ownership (unless admin)
    if (userRow.role !== "admin") {
      const property = await prisma.properties.findFirst({
        where: { id: propertyId, owner_id: user.id },
        select: { id: true },
      });
      if (!property) {
        return NextResponse.json(
          { error: "Property not found or access denied" },
          { status: 404 },
        );
      }
    }

    // Parse form data for file upload
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const mediaType = formData.get("media_type") as "image" | "video" | "virtual_tour";
    const altText = formData.get("alt_text") as string;
    const isFeatured = formData.get("is_featured") === "true";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type and size
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "video/mp4"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Only JPEG, PNG, WebP images and MP4 videos are allowed." },
        { status: 400 },
      );
    }

    const maxSize = mediaType === "video" ? 100 * 1024 * 1024 : 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: `File too large. Maximum size is ${maxSize / (1024 * 1024)}MB.` },
        { status: 400 },
      );
    }

    // Generate signed URL for upload
    const signedUrlResult = await generateSignedUrl({
      bucket: "property-media",
      file_name: file.name,
      file_type: file.type,
      file_size: file.size,
      user_id: user.id,
      property_id: propertyId,
    });

    // Upload file to signed URL
    const uploadResponse = await fetch(signedUrlResult.signed_url, {
      method: "PUT",
      body: file,
      headers: { "Content-Type": file.type },
    });

    if (!uploadResponse.ok) {
      console.error("Upload to signed URL failed:", uploadResponse.statusText);
      return NextResponse.json({ error: "Failed to upload file" }, { status: 500 });
    }

    const publicUrl = signedUrlResult.public_url;

    // Get next display order via Prisma
    const lastMedia = await prisma.property_media.findFirst({
      where: { property_id: propertyId },
      orderBy: { display_order: "desc" },
      select: { display_order: true },
    });
    const nextOrder = (lastMedia?.display_order ?? 0) + 1;

    // Unset other featured if this is featured
    if (isFeatured) {
      await prisma.property_media.updateMany({
        where: { property_id: propertyId },
        data: { is_featured: false },
      });
    }

    // Save media record via Prisma
    const mediaRecord = await prisma.property_media.create({
      data: {
        property_id: propertyId,
        media_type: mediaType,
        media_url: publicUrl,
        file_name: file.name,
        display_order: nextOrder,
        is_featured: isFeatured,
      },
    });

    return NextResponse.json(
      { data: mediaRecord, message: "Media uploaded successfully" },
      { status: 201 },
    );
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
