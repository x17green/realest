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

    // Verify user owns this property or is admin
    const { data: profile } = await supabase
      .from("profiles")
      .select("user_type")
      .eq("id", user.id)
      .single();

    if (!profile || !["owner", "admin"].includes(profile.user_type)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Verify property ownership (unless admin)
    if (profile.user_type !== "admin") {
      const { data: property } = await supabase
        .from("properties")
        .select("owner_id")
        .eq("id", propertyId)
        .single();

      if (!property || property.owner_id !== user.id) {
        return NextResponse.json(
          { error: "Property not found or access denied" },
          { status: 404 },
        );
      }
    }

    // Fetch media for this property
    const { data: media, error } = await supabase
      .from("property_media")
      .select("*")
      .eq("property_id", propertyId)
      .order("display_order", { ascending: true });

    if (error) {
      console.error("Database error:", error);
      return NextResponse.json(
        { error: "Failed to fetch media" },
        { status: 500 },
      );
    }

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

    // Verify user owns this property or is admin
    const { data: profile } = await supabase
      .from("profiles")
      .select("user_type")
      .eq("id", user.id)
      .single();

    if (!profile || !["owner", "admin"].includes(profile.user_type)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Verify property ownership (unless admin)
    if (profile.user_type !== "admin") {
      const { data: property } = await supabase
        .from("properties")
        .select("owner_id")
        .eq("id", propertyId)
        .single();

      if (!property || property.owner_id !== user.id) {
        return NextResponse.json(
          { error: "Property not found or access denied" },
          { status: 404 },
        );
      }
    }

    // Parse form data for file upload
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const mediaType = formData.get("media_type") as
      | "image"
      | "video"
      | "virtual_tour";
    const altText = formData.get("alt_text") as string;
    const isPrimary = formData.get("is_primary") === "true";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type and size
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "video/mp4"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        {
          error:
            "Invalid file type. Only JPEG, PNG, WebP images and MP4 videos are allowed.",
        },
        { status: 400 },
      );
    }

    const maxSize = mediaType === "video" ? 100 * 1024 * 1024 : 5 * 1024 * 1024; // 100MB for video, 5MB for images
    if (file.size > maxSize) {
      return NextResponse.json(
        {
          error: `File too large. Maximum size is ${maxSize / (1024 * 1024)}MB.`,
        },
        { status: 400 },
      );
    }

    // Generate unique filename
    const fileExt = file.name.split(".").pop();
    const fileName = `${propertyId}-${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `properties/${propertyId}/${fileName}`;

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from("property-media")
      .upload(filePath, file, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error("Storage upload error:", uploadError);
      return NextResponse.json(
        { error: "Failed to upload file" },
        { status: 500 },
      );
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from("property-media").getPublicUrl(filePath);

    // Generate thumbnail for videos (placeholder - would need video processing)
    let thumbnailUrl = null;
    if (mediaType === "video") {
      // In a real implementation, you'd generate a thumbnail
      // For now, we'll use a placeholder
      thumbnailUrl = publicUrl.replace(".mp4", "_thumb.jpg");
    }

    // Get next display order
    const { data: existingMedia } = await supabase
      .from("property_media")
      .select("display_order")
      .eq("property_id", propertyId)
      .order("display_order", { ascending: false })
      .limit(1);

    const nextOrder =
      existingMedia && existingMedia.length > 0
        ? existingMedia[0].display_order + 1
        : 1;

    // If this is primary, unset other primary images
    if (isPrimary) {
      await supabase
        .from("property_media")
        .update({ is_primary: false })
        .eq("property_id", propertyId);
    }

    // Save media record to database
    const { data: mediaRecord, error: insertError } = await supabase
      .from("property_media")
      .insert({
        property_id: propertyId,
        media_type: mediaType,
        file_url: publicUrl,
        thumbnail_url: thumbnailUrl,
        alt_text: altText || null,
        display_order: nextOrder,
        is_primary: isPrimary,
      })
      .select()
      .single();

    if (insertError) {
      console.error("Database insert error:", insertError);
      // Clean up uploaded file if database insert failed
      await supabase.storage.from("property-media").remove([filePath]);

      return NextResponse.json(
        { error: "Failed to save media record" },
        { status: 500 },
      );
    }

    return NextResponse.json(
      {
        data: mediaRecord,
        message: "Media uploaded successfully",
      },
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
