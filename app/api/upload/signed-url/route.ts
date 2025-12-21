// realest/app/api/upload/signed-url/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const signedUrlSchema = z.object({
  file_name: z.string().min(1),
  file_type: z.string().min(1),
  file_size: z
    .number()
    .positive()
    .max(10 * 1024 * 1024), // 10MB max
  bucket: z
    .enum(["property-media", "property-documents", "avatars"])
    .default("property-media"),
});

// POST /api/upload/signed-url - Generate signed URL for direct upload
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
    const validatedData = signedUrlSchema.parse(body);

    // Generate unique file path
    const fileExtension = validatedData.file_name.split(".").pop();
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 15);
    const filePath = `${user.id}/${timestamp}_${randomId}.${fileExtension}`;

    // Generate signed URL for upload
    const { data: signedUrlData, error: signedUrlError } =
      await supabase.storage
        .from(validatedData.bucket)
        .createSignedUploadUrl(filePath);

    if (signedUrlError) {
      console.error("Signed URL generation error:", signedUrlError);
      return NextResponse.json(
        { error: "Failed to generate upload URL" },
        { status: 500 },
      );
    }

    // Generate public URL for accessing the file after upload
    const { data: publicUrlData } = supabase.storage
      .from(validatedData.bucket)
      .getPublicUrl(filePath);

    return NextResponse.json({
      signed_url: signedUrlData.signedUrl,
      public_url: publicUrlData.publicUrl,
      file_path: filePath,
      token: signedUrlData.token,
      // expires_in: signedUrlData.expiresIn, // TODO: Check actual Supabase response structure
    });
  } catch (error) {
    console.error("Signed URL API error:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid file data", details: error.errors },
        { status: 400 },
      );
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
