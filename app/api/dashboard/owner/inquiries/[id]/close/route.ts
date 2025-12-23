import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { z } from "zod";

const closeSchema = z.object({
  reason: z
    .enum(["resolved", "no_longer_interested", "duplicate", "spam", "other"])
    .optional(),
  notes: z
    .string()
    .max(500, "Notes must be less than 500 characters")
    .optional(),
});

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(request: Request, { params }: RouteParams) {
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

    // Parse and validate request body
    const body = await request.json();
    const validationResult = closeSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Invalid close data",
          details: validationResult.error.issues,
        },
        { status: 400 },
      );
    }

    const closeData = validationResult.data;

    // Verify inquiry exists and user can close it
    const { data: inquiry, error: inquiryError } = await supabase
      .from("inquiries")
      .select(
        `
        *,
        sender:profiles!inquiries_sender_id_fkey(id, full_name),
        receiver:profiles!inquiries_receiver_id_fkey(id, full_name),
        property:properties(title, owner_id)
      `,
      )
      .eq("id", inquiryId)
      .single();

    if (inquiryError || !inquiry) {
      return NextResponse.json({ error: "Inquiry not found" }, { status: 404 });
    }

    // Verify user is either sender or receiver
    if (inquiry.sender_id !== user.id && inquiry.receiver_id !== user.id) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Close the inquiry
    const { data: closedInquiry, error: updateError } = await supabase
      .from("inquiries")
      .update({
        status: "closed",
        updated_at: new Date().toISOString(),
      })
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

    if (updateError) {
      console.error("Database update error:", updateError);
      return NextResponse.json(
        { error: "Failed to close inquiry" },
        { status: 500 },
      );
    }

    // Log closure reason if provided (could be stored in a separate activity log)
    if (closeData.reason || closeData.notes) {
      console.log(`Inquiry ${inquiryId} closed by user ${user.id}:`, {
        reason: closeData.reason,
        notes: closeData.notes,
      });
    }

    // Send notification email to the other party
    const isOwnerClosing = inquiry.receiver_id === user.id;
    const recipient = isOwnerClosing ? inquiry.sender : inquiry.receiver;

    const emailData = {
      to: recipient.email,
      subject: `Inquiry closed for ${inquiry.property.title}`,
      template: "inquiry-closed",
      data: {
        recipient_name: recipient.full_name,
        property_title: inquiry.property.title,
        property_address: inquiry.property.address,
        closed_by: isOwnerClosing ? "property owner" : "inquirer",
        reason: closeData.reason,
        notes: closeData.notes,
      },
    };

    // Trigger email sending
    console.log("Sending closure notification:", emailData);

    return NextResponse.json({
      data: closedInquiry,
      message: "Inquiry closed successfully",
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
