// realest/app/api/upload/signed-url/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";
import { generateSignedUrl, signedUrlSchema } from "@/lib/utils/upload-utils";

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
    const validatedData = signedUrlSchema.parse({
      ...body,
      user_id: user.id,
    });

    const result = await generateSignedUrl(validatedData);

    return NextResponse.json(result);
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
