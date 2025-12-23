import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { z } from "zod";

const respondSchema = z.object({
  response_message: z
    .string()
    .min(10, "Response must be at least 10 characters")
    .max(2000, "Response must be less than 2000 characters"),
  contact_phone: z
    .string()
    .regex(/^\+234[0-9]{10}$/, "Invalid Nigerian phone number")
    .optional(),
  contact_email: z.string().email("Invalid email address").optional(),
  schedule_viewing: z.boolean().optional(),
  viewing_date: z.string().optional(), // ISO date string
  viewing_time: z.string().optional(),
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
    const validationResult = respondSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Invalid response data",
          details: validationResult.error.issues,
        },
        { status: 400 },
      );
    }

    const responseData = validationResult.data;

    // Verify inquiry exists and user is the receiver (property owner)
    const { data: inquiry, error: inquiryError } = await supabase
      .from("inquiries")
      .select(
        `
        *,
        sender:profiles!inquiries_sender_id_fkey(full_name, email),
        property:properties(title, address, owner_id)
      `,
      )
      .eq("id", inquiryId)
      .single();

    if (inquiryError || !inquiry) {
      return NextResponse.json({ error: "Inquiry not found" }, { status: 404 });
    }

    // Verify user is the property owner
    if (inquiry.property.owner_id !== user.id) {
      return NextResponse.json(
        {
          error:
            "Access denied - Only property owners can respond to inquiries",
        },
        { status: 403 },
      );
    }

    // Update inquiry status and add response
    const { data: updatedInquiry, error: updateError } = await supabase
      .from("inquiries")
      .update({
        status: "responded",
        responded_at: new Date().toISOString(),
      })
      .eq("id", inquiryId)
      .select()
      .single();

    if (updateError) {
      console.error("Database update error:", updateError);
      return NextResponse.json(
        { error: "Failed to update inquiry status" },
        { status: 500 },
      );
    }

    // Create response record (assuming there's a responses table, or store in inquiry)
    // For now, we'll store the response in the inquiry message or create a separate response
    // This would typically be a separate table for threaded conversations

    // Send email notification to inquirer
    const ownerProfile = await supabase
      .from("profiles")
      .select("full_name, email")
      .eq("id", user.id)
      .single();

    const emailData = {
      to: inquiry.sender.email,
      subject: `Response to your inquiry about ${inquiry.property.title}`,
      template: "inquiry-response",
      data: {
        inquirer_name: inquiry.sender.full_name,
        owner_name: ownerProfile.data?.full_name || "Property Owner",
        property_title: inquiry.property.title,
        property_address: inquiry.property.address,
        response_message: responseData.response_message,
        contact_phone: responseData.contact_phone,
        contact_email: responseData.contact_email,
        schedule_viewing: responseData.schedule_viewing,
        viewing_date: responseData.viewing_date,
        viewing_time: responseData.viewing_time,
      },
    };

    // Trigger email sending (would typically be done via Edge Function or queue)
    console.log("Sending response email:", emailData);

    // In a real implementation, you'd call an email service here
    // await sendEmail(emailData)

    return NextResponse.json({
      data: updatedInquiry,
      message: "Response sent successfully",
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
