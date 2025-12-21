// realest/app/api/inquiries/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const updateInquirySchema = z.object({
  status: z.enum(["pending", "responded", "closed"]).optional(),
  response_message: z.string().optional(),
});

// GET /api/inquiries/[id] - Get single inquiry with full details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const supabase = await createClient();
    const { id } = await params;
    const inquiryId = id;

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get inquiry with related data
    const { data: inquiry, error } = await supabase
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
          owner_id,
          property_media (
            file_url,
            is_primary
          )
        ),
        buyer:profiles!inquiries_buyer_id_fkey (
          id,
          full_name,
          avatar_url,
          phone,
          email
        ),
        owner:properties (
          profiles:owner_id (
            id,
            full_name,
            avatar_url,
            phone
          )
        )
      `,
      )
      .eq("id", inquiryId)
      .single();

    if (error) {
      console.error("Inquiry fetch error:", error);
      if (error.code === "PGRST116") {
        return NextResponse.json(
          { error: "Inquiry not found" },
          { status: 404 },
        );
      }
      return NextResponse.json(
        { error: "Failed to fetch inquiry" },
        { status: 500 },
      );
    }

    // Check if user has access (buyer who sent it or property owner)
    const isBuyer = inquiry.buyer_id === user.id;
    const isOwner = inquiry.properties?.owner_id === user.id;

    if (!isBuyer && !isOwner) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    return NextResponse.json({ inquiry });
  } catch (error) {
    console.error("Inquiry API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// PUT /api/inquiries/[id] - Update inquiry (status, response)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const supabase = await createClient();
    const { id } = await params;
    const inquiryId = id;

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = updateInquirySchema.parse(body);

    // Get inquiry to check ownership
    const { data: inquiry, error: inquiryError } = await supabase
      .from("inquiries")
      .select(
        `
        *,
        properties (
          owner_id
        )
      `,
      )
      .eq("id", inquiryId)
      .single();

    if (inquiryError || !inquiry) {
      return NextResponse.json({ error: "Inquiry not found" }, { status: 404 });
    }

    // Check permissions
    const isBuyer = inquiry.buyer_id === user.id;
    const isOwner = inquiry.properties?.owner_id === user.id;

    if (!isBuyer && !isOwner) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Buyers can only close their inquiries
    if (isBuyer && validatedData.status && validatedData.status !== "closed") {
      return NextResponse.json(
        { error: "Buyers can only close inquiries" },
        { status: 403 },
      );
    }

    // Owners can respond and update status
    if (isOwner && validatedData.response_message) {
      // TODO: Send response notification to buyer
    }

    // Update inquiry
    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (validatedData.status) {
      updateData.status = validatedData.status;
      if (validatedData.status === "responded") {
        updateData.responded_at = new Date().toISOString();
      }
    }

    const { data: updatedInquiry, error: updateError } = await supabase
      .from("inquiries")
      .update(updateData)
      .eq("id", inquiryId)
      .select()
      .single();

    if (updateError) {
      console.error("Inquiry update error:", updateError);
      return NextResponse.json(
        { error: "Failed to update inquiry" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      inquiry: updatedInquiry,
      message: "Inquiry updated successfully",
    });
  } catch (error) {
    console.error("Inquiry update API error:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid update data", details: error.errors },
        { status: 400 },
      );
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
