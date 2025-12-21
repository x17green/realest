// realest/app/api/admin/properties/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const validatePropertySchema = z.object({
  status: z.enum(["live", "rejected"]),
  rejection_reason: z.string().optional(),
  admin_notes: z.string().optional(),
});

const vetPropertySchema = z.object({
  vetting_status: z.enum(["approved", "rejected"]),
  vetting_notes: z.string().optional(),
  rejection_reason: z.string().optional(),
});

// GET /api/admin/properties - Get properties needing admin review
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

    // Check if user is admin
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("user_type")
      .eq("id", user.id)
      .single();

    if (profileError || profile?.user_type !== "admin") {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || "pending_ml_validation";

    // Get properties needing review
    const { data: properties, error } = await supabase
      .from("properties")
      .select(`
        *,
        property_details (*),
        property_media (*),
        property_documents (*),
        profiles:owner_id (
          full_name,
          avatar_url,
          phone
        )
      `)
      .eq("status", status)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Admin properties fetch error:", error);
      return NextResponse.json(
        { error: "Failed to fetch properties" },
        { status: 500 }
      );
    }

    return NextResponse.json({ properties });
  } catch (error) {
    console.error("Admin properties API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT /api/admin/properties/[id]/validate - Validate property documents
export async function PUT(request: NextRequest) {
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

    // Check if user is admin
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("user_type")
      .eq("id", user.id)
      .single();

    if (profileError || profile?.user_type !== "admin") {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const propertyId = searchParams.get("property_id");

    if (!propertyId) {
      return NextResponse.json(
        { error: "Property ID is required" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const validatedData = validatePropertySchema.parse(body);

    // Update property status
    const { data: updatedProperty, error: updateError } = await supabase
      .from("properties")
      .update({
        status: validatedData.status === "live" ? "pending_vetting" : "rejected",
        rejection_reason: validatedData.rejection_reason,
        admin_notes: validatedData.admin_notes,
        updated_at: new Date().toISOString(),
      })
      .eq("id", propertyId)
      .select()
      .single();

    if (updateError) {
      console.error("Property validation error:", updateError);
      return NextResponse.json(
        { error: "Failed to update property" },
        { status: 500 }
      );
    }

    // TODO: Send notification to property owner

    return NextResponse.json({
      property: updatedProperty,
      message: `Property ${validatedData.status === "live" ? "approved for vetting" : "rejected"}`
    });
  } catch (error) {
    console.error("Property validation API error:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid validation data", details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
