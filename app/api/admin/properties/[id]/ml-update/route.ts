import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

// Schema for ML validation update
const mlUpdateSchema = z.object({
  status: z.enum(["passed", "failed", "review_required"]),
  confidence_score: z.number().min(0).max(1).optional(),
  notes: z.string().optional(),
  flagged_issues: z.array(z.string()).optional(),
});

type MLUpdateInput = z.infer<typeof mlUpdateSchema>;

// PUT /api/admin/properties/[id]/ml-update - Admin ML validation update
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const supabase = await createClient();
    const { id } = await params;
    const propertyId = id;

    // Get authenticated user and verify admin role
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    // Verify user is admin
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("user_type")
      .eq("id", user.id)
      .single();

    if (profileError || profile?.user_type !== "admin") {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 },
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = mlUpdateSchema.parse(body);

    // Verify property exists and is in ML validation status
    const { data: property, error: propertyError } = await supabase
      .from("properties")
      .select("id, status, owner_id, title")
      .eq("id", propertyId)
      .eq("status", "pending_ml_validation")
      .single();

    if (propertyError || !property) {
      return NextResponse.json(
        { error: "Property not found or not pending ML validation" },
        { status: 404 },
      );
    }

    // Prepare update data
    const updateData: any = {
      status:
        validatedData.status === "passed"
          ? "pending_vetting"
          : "pending_ml_validation",
    };

    // Update property status
    const { data: updatedProperty, error: updateError } = await supabase
      .from("properties")
      .update(updateData)
      .eq("id", propertyId)
      .select(
        `
        id,
        status,
        owner:profiles!inner(
          id,
          full_name,
          email
        )
      `,
      )
      .single();

    if (updateError) {
      console.error("Database error:", updateError);
      return NextResponse.json(
        { error: "Failed to update property status" },
        { status: 500 },
      );
    }

    // Update or create ML validation record
    const mlUpdateData = {
      property_id: propertyId,
      ml_validation_status: validatedData.status,
      ml_confidence_score: validatedData.confidence_score,
      ml_validation_notes: validatedData.notes,
      ml_validated_at: new Date().toISOString(),
      flagged_issues: validatedData.flagged_issues,
    };

    // Check if ML validation record exists
    const { data: existingRecord } = await supabase
      .from("property_documents")
      .select("id")
      .eq("property_id", propertyId)
      .eq("document_type", "ml_validation")
      .single();

    if (existingRecord) {
      // Update existing record
      await supabase
        .from("property_documents")
        .update(mlUpdateData)
        .eq("id", existingRecord.id);
    } else {
      // Create new ML validation record
      await supabase.from("property_documents").insert({
        ...mlUpdateData,
        document_type: "ml_validation",
        file_url: "", // No file for ML validation
        file_name: "ML Validation Result",
        file_size: 0,
        mime_type: "application/json",
      });
    }

    // Create notification for property owner
    let notificationMessage = "";
    let notificationTitle = "";

    switch (validatedData.status) {
      case "passed":
        notificationTitle = "ML Validation Passed";
        notificationMessage = `Your property "${property.title}" has passed ML validation and is now pending physical vetting.`;
        break;
      case "failed":
        notificationTitle = "ML Validation Failed";
        notificationMessage = `Your property "${property.title}" failed ML validation. Please review and resubmit.`;
        break;
      case "review_required":
        notificationTitle = "ML Validation Review Required";
        notificationMessage = `Your property "${property.title}" requires manual review. Our team will contact you soon.`;
        break;
    }

    await supabase.from("notifications").insert({
      user_id: property.owner_id,
      type: "ml_validation",
      title: notificationTitle,
      message: notificationMessage,
      data: {
        property_id: propertyId,
        ml_status: validatedData.status,
        confidence_score: validatedData.confidence_score,
        notes: validatedData.notes,
      },
    });

    // Log admin action
    await supabase.from("admin_audit_log").insert({
      admin_id: user.id,
      action: "ml_validation_update",
      target_type: "property",
      target_id: propertyId,
      details: {
        old_status: "pending_ml_validation",
        new_status: updateData.status,
        ml_status: validatedData.status,
        confidence_score: validatedData.confidence_score,
        notes: validatedData.notes,
        flagged_issues: validatedData.flagged_issues,
      },
    });

    return NextResponse.json({
      data: updatedProperty,
      message: `ML validation ${validatedData.status} - property status updated`,
    });
  } catch (error) {
    console.error("API error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.errors },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
