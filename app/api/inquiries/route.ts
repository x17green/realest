// realest/app/api/inquiries/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const createInquirySchema = z.object({
  property_id: z.string().uuid(),
  message: z.string().min(10, "Message must be at least 10 characters"),
  contact_phone: z.string().optional(),
  contact_email: z.string().email().optional(),
});

const updateInquirySchema = z.object({
  status: z.enum(["pending", "responded", "closed"]).optional(),
});

// GET /api/inquiries - Get user's inquiries (user or owner)
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

    // Get user's profile to determine role
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("user_type")
      .eq("id", user.id)
      .single();

    if (profileError) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    let query;

    if (profile.user_type === "user") {
      // Users see inquiries they sent
      query = supabase
        .from("inquiries")
        .select(
          `
          *,
          properties (
            id,
            title,
            address,
            price,
            currency,
            property_media (
              file_url,
              is_primary
            )
          ),
          profiles:user_id (
            full_name,
            avatar_url
          )
        `,
        )
        .eq("user_id", user.id);
    } else if (profile.user_type === "owner") {
      // Owners see inquiries on their properties
      query = supabase
        .from("inquiries")
        .select(
          `
          *,
          properties (
            id,
            title,
            address,
            price,
            currency,
            property_media (
              file_url,
              is_primary
            )
          ),
          profiles:user_id (
            full_name,
            avatar_url,
            phone
          )
        `,
        )
        .eq("properties.owner_id", user.id);
    } else {
      return NextResponse.json({ error: "Invalid user type" }, { status: 403 });
    }

    const { data: inquiries, error } = await query.order("created_at", {
      ascending: false,
    });

    if (error) {
      console.error("Inquiries fetch error:", error);
      return NextResponse.json(
        { error: "Failed to fetch inquiries" },
        { status: 500 },
      );
    }

    return NextResponse.json({ inquiries });
  } catch (error) {
    console.error("Inquiries API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// POST /api/inquiries - Create new inquiry
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

    // Check if user is a user
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("user_type, full_name, phone, email")
      .eq("id", user.id)
      .single();

    if (profileError || profile?.user_type !== "user") {
      return NextResponse.json(
        { error: "Only users can send inquiries" },
        { status: 403 },
      );
    }

    const body = await request.json();
    const validatedData = createInquirySchema.parse(body);

    // Check if property exists and is live
    const { data: property, error: propertyError } = await supabase
      .from("properties")
      .select("id, owner_id, status, title")
      .eq("id", validatedData.property_id)
      .eq("status", "live")
      .single();

    if (propertyError || !property) {
      return NextResponse.json(
        { error: "Property not found or not available" },
        { status: 404 },
      );
    }

    // Check if user already has a pending inquiry for this property
    const { data: existingInquiry, error: existingError } = await supabase
      .from("inquiries")
      .select("id")
      .eq("property_id", validatedData.property_id)
      .eq("user_id", user.id)
      .eq("status", "pending")
      .single();

    if (existingInquiry) {
      return NextResponse.json(
        { error: "You already have a pending inquiry for this property" },
        { status: 400 },
      );
    }

    // Create inquiry
    const { data: inquiry, error: inquiryError } = await supabase
      .from("inquiries")
      .insert({
        property_id: validatedData.property_id,
        user_id: user.id,
        message: validatedData.message,
        contact_phone: validatedData.contact_phone || profile.phone,
        contact_email: validatedData.contact_email || profile.email,
        status: "pending",
      })
      .select(
        `
        *,
        properties (
          title,
          owner_id
        )
      `,
      )
      .single();

    if (inquiryError) {
      console.error("Inquiry creation error:", inquiryError);
      return NextResponse.json(
        { error: "Failed to send inquiry" },
        { status: 500 },
      );
    }

    // TODO: Send notification to property owner
    // This could trigger an email or in-app notification

    return NextResponse.json(
      {
        inquiry,
        message:
          "Inquiry sent successfully. The property owner will respond soon.",
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Inquiry creation API error:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid inquiry data", details: error.errors },
        { status: 400 },
      );
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
