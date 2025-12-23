import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

// Schema for resolving duplicates
const resolveDuplicateSchema = z.object({
  action: z.enum(["keep_both", "keep_master", "reject_duplicate"]),
  master_property_id: z.string().uuid().optional(), // Required if action is 'keep_master'
  rejection_reason: z.string().optional(), // Required if action is 'reject_duplicate'
  admin_notes: z.string().optional(),
});

type ResolveDuplicateInput = z.infer<typeof resolveDuplicateSchema>;

// PUT /api/admin/duplicates/[id]/resolve - Admin duplicate resolution
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const supabase = await createClient();
    const { id } = await params;
    const duplicateId = id;

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
    const validatedData = resolveDuplicateSchema.parse(body);

    // Get duplicate record
    const { data: duplicate, error: duplicateError } = await supabase
      .from("properties")
      .select("id, status, owner_id, title, is_duplicate")
      .eq("id", duplicateId)
      .eq("is_duplicate", true)
      .single();

    if (duplicateError || !duplicate) {
      return NextResponse.json(
        { error: "Duplicate property not found" },
        { status: 404 },
      );
    }

    // Validate action-specific requirements
    if (
      validatedData.action === "keep_master" &&
      !validatedData.master_property_id
    ) {
      return NextResponse.json(
        { error: "Master property ID required for keep_master action" },
        { status: 400 },
      );
    }

    if (
      validatedData.action === "reject_duplicate" &&
      !validatedData.rejection_reason
    ) {
      return NextResponse.json(
        { error: "Rejection reason required for reject_duplicate action" },
        { status: 400 },
      );
    }

    // Execute resolution action
    let result = null;
    const resolutionDetails = {
      duplicate_id: duplicateId,
      action: validatedData.action,
      master_property_id: validatedData.master_property_id,
      rejection_reason: validatedData.rejection_reason,
      admin_notes: validatedData.admin_notes,
      resolved_at: new Date().toISOString(),
      resolved_by: user.id,
    };

    switch (validatedData.action) {
      case "keep_both":
        // Mark as not duplicate, allow both to exist
        const { data: keepBothResult, error: keepBothError } = await supabase
          .from("properties")
          .update({
            is_duplicate: false,
            duplicate_resolved_at: new Date().toISOString(),
            duplicate_resolution_action: "keep_both",
            admin_notes: validatedData.admin_notes,
          })
          .eq("id", duplicateId)
          .select()
          .single();

        if (keepBothError) throw keepBothError;
        result = keepBothResult;
        break;

      case "keep_master":
        // Reject the duplicate, keep the master
        const { data: keepMasterResult, error: keepMasterError } =
          await supabase
            .from("properties")
            .update({
              status: "rejected",
              rejection_reason: `Duplicate of property ${validatedData.master_property_id}`,
              is_duplicate: false,
              duplicate_resolved_at: new Date().toISOString(),
              duplicate_resolution_action: "keep_master",
              admin_notes: validatedData.admin_notes,
            })
            .eq("id", duplicateId)
            .select()
            .single();

        if (keepMasterError) throw keepMasterError;
        result = keepMasterResult;
        break;

      case "reject_duplicate":
        // Reject both properties
        const { data: rejectBothResult, error: rejectBothError } =
          await supabase
            .from("properties")
            .update({
              status: "rejected",
              rejection_reason: validatedData.rejection_reason,
              is_duplicate: false,
              duplicate_resolved_at: new Date().toISOString(),
              duplicate_resolution_action: "reject_duplicate",
              admin_notes: validatedData.admin_notes,
            })
            .eq("id", duplicateId)
            .select()
            .single();

        if (rejectBothError) throw rejectBothError;
        result = rejectBothResult;
        break;
    }

    // Create notifications for affected owners
    if (validatedData.action === "keep_master") {
      // Notify owner of rejected duplicate
      await supabase.from("notifications").insert({
        user_id: duplicate.owner_id,
        type: "duplicate_resolution",
        title: "Property Marked as Duplicate",
        message: `Your property "${duplicate.title}" has been identified as a duplicate and rejected. The original listing will remain active.`,
        data: resolutionDetails,
      });
    } else if (validatedData.action === "reject_duplicate") {
      // Notify owner of rejected property
      await supabase.from("notifications").insert({
        user_id: duplicate.owner_id,
        type: "duplicate_resolution",
        title: "Property Rejected - Duplicate",
        message: `Your property "${duplicate.title}" has been rejected as a duplicate. Reason: ${validatedData.rejection_reason}`,
        data: resolutionDetails,
      });
    }

    // Log admin action
    await supabase.from("admin_audit_log").insert({
      admin_id: user.id,
      action: "duplicate_resolution",
      target_type: "property",
      target_id: duplicateId,
      details: resolutionDetails,
    });

    return NextResponse.json({
      data: result,
      message: `Duplicate resolved: ${validatedData.action}`,
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
