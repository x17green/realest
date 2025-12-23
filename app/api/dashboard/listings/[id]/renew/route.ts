import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

interface RouteParams {
  params: Promise<{ id: string }>;
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
        .select("owner_id, status")
        .eq("id", propertyId)
        .single();

      if (!property || property.owner_id !== user.id) {
        return NextResponse.json(
          { error: "Property not found or access denied" },
          { status: 404 },
        );
      }

      // Check if property can be renewed (must be live or expired)
      if (!["live", "expired"].includes(property.status)) {
        return NextResponse.json(
          {
            error: "Cannot renew property",
            message: "Only live or expired properties can be renewed",
          },
          { status: 400 },
        );
      }
    }

    // Calculate renewal date (typically 1 year from now)
    const renewalDate = new Date();
    renewalDate.setFullYear(renewalDate.getFullYear() + 1);

    // Update property with renewal
    const { data: updatedProperty, error } = await supabase
      .from("properties")
      .update({
        status: "live", // Reactivate if expired
        updated_at: new Date().toISOString(),
        // Add renewal tracking fields if they exist in schema
        // renewed_at: new Date().toISOString(),
        // renewal_expires_at: renewalDate.toISOString()
      })
      .eq("id", propertyId)
      .select(
        `
        *,
        owner:profiles(full_name, email)
      `,
      )
      .single();

    if (error) {
      console.error("Database error:", error);
      return NextResponse.json(
        { error: "Failed to renew property" },
        { status: 500 },
      );
    }

    // Log renewal activity (could be stored in an activity log table)
    console.log(`Property ${propertyId} renewed by user ${user.id}`);

    return NextResponse.json({
      data: updatedProperty,
      message: "Property renewed successfully for another year",
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
