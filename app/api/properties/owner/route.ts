// realest/app/api/properties/owner/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET /api/properties/owner - Get current user's properties (owner only)
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

    // Check if user has owner role
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("user_type")
      .eq("id", user.id)
      .single();

    if (profileError ||  !["owner", "agent"].includes(profile?.user_type)) {
      return NextResponse.json(
        { error: "Only property owners can access this endpoint" },
        { status: 403 },
      );
    }

    // Get owner's properties with related data
    const { data: properties, error } = await supabase
      .from("properties")
      .select(
        `
        *,
        property_details (*),
        property_media (*),
        property_documents (*),
        inquiries:property_id (
          id,
          message,
          status,
          created_at,
          profiles:inquiries_sender_id_fkey (
            full_name,
            avatar_url
          )
        )
      `,
      )
      .eq("owner_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Owner properties fetch error:", error);
      return NextResponse.json(
        { error: "Failed to fetch properties" },
        { status: 500 },
      );
    }

    // Group inquiries by property for easier frontend handling
    const propertiesWithInquiries = properties?.map((property) => ({
      ...property,
      inquiry_count: property.inquiries?.length || 0,
      recent_inquiries: property.inquiries?.slice(0, 3) || [], // Last 3 inquiries
    }));

    return NextResponse.json({
      properties: propertiesWithInquiries,
      total: properties?.length || 0,
    });
  } catch (error) {
    console.error("Owner properties API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
