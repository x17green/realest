import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const supabase = await createClient();
    const { id } = await params;
    const inquiryId = id;

    // Verify authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch inquiry with related data
    const { data: inquiry, error } = await supabase
      .from("inquiries")
      .select(
        `
        *,
        sender:profiles!inquiries_sender_id_fkey(full_name, email, phone, avatar_url),
        receiver:profiles!inquiries_receiver_id_fkey(full_name, email),
        property:properties(id, title, address, state, lga, price, price_frequency, media:property_media(file_url, is_primary))
      `,
      )
      .eq("id", inquiryId)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        // No rows returned
        return NextResponse.json(
          { error: "Inquiry not found" },
          { status: 404 },
        );
      }
      console.error("Database error:", error);
      return NextResponse.json(
        { error: "Failed to fetch inquiry" },
        { status: 500 },
      );
    }

    // Verify user can access this inquiry (must be sender or receiver)
    if (inquiry.sender_id !== user.id && inquiry.receiver_id !== user.id) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    return NextResponse.json({ data: inquiry });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const supabase = await createClient();
    const { id } = await params;
    const inquiryId = id;

    // Verify authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse request body
    const updates = await request.json();
    const allowedFields = ["status"];
    const filteredUpdates = Object.fromEntries(
      Object.entries(updates).filter(([key]) => allowedFields.includes(key)),
    );

    // Verify user can update this inquiry
    const { data: existingInquiry } = await supabase
      .from("inquiries")
      .select("sender_id, receiver_id, status")
      .eq("id", inquiryId)
      .single();

    if (!existingInquiry) {
      return NextResponse.json({ error: "Inquiry not found" }, { status: 404 });
    }

    // Only sender and receiver can update status
    if (
      existingInquiry.sender_id !== user.id &&
      existingInquiry.receiver_id !== user.id
    ) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Validate status transitions
    const validStatuses = ["new", "read", "responded", "closed"];
    if (
      filteredUpdates.status &&
      typeof filteredUpdates.status === "string" &&
      !validStatuses.includes(filteredUpdates.status)
    ) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    // Update inquiry
    const { data: updatedInquiry, error } = await supabase
      .from("inquiries")
      .update(filteredUpdates)
      .eq("id", inquiryId)
      .select(
        `
        *,
        sender:profiles!inquiries_sender_id_fkey(full_name, email),
        receiver:profiles!inquiries_receiver_id_fkey(full_name, email),
        property:properties(title, address)
      `,
      )
      .single();

    if (error) {
      console.error("Database error:", error);
      return NextResponse.json(
        { error: "Failed to update inquiry" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      data: updatedInquiry,
      message: "Inquiry updated successfully",
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
