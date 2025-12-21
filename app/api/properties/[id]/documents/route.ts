// realest/app/api/properties/[id]/documents/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const uploadDocumentSchema = z.object({
  file_name: z.string().min(1),
  file_url: z.string().url(),
  document_type: z.enum([
    "certificate_of_occupancy",
    "deed_of_assignment",
    "survey_plan",
    "tax_receipt",
    "building_approval",
    "owner_id",
    "utility_bill",
    "property_photos",
    "other",
  ]),
});

// GET /api/properties/[id]/documents - Get property documents
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const supabase = await createClient();
    const { id } = await params;
    const propertyId = id;

    // Check if property exists and user has access
    const { data: property, error: propertyError } = await supabase
      .from("properties")
      .select(
        `
        owner_id,
        status,
        owner:profiles!properties_owner_id_fkey (
          user_type
        )
      `,
      )
      .eq("id", propertyId)
      .single();

    if (propertyError) {
      return NextResponse.json(
        { error: "Property not found" },
        { status: 404 },
      );
    }

    // Get authenticated user
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const isOwner = user && property.owner_id === user.id;
    const isAdmin = user && property.owner?.[0]?.user_type === "admin";

    // Only owners and admins can see documents
    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const { data: documents, error } = await supabase
      .from("property_documents")
      .select("*")
      .eq("property_id", propertyId)
      .order("uploaded_at", { ascending: false });

    if (error) {
      console.error("Documents fetch error:", error);
      return NextResponse.json(
        { error: "Failed to fetch documents" },
        { status: 500 },
      );
    }

    return NextResponse.json({ documents });
  } catch (error) {
    console.error("Documents API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// POST /api/properties/[id]/documents - Upload document for property
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const supabase = await createClient();
    const { id } = await params;
    const propertyId = id;

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check ownership
    const { data: property, error: propertyError } = await supabase
      .from("properties")
      .select("owner_id, status")
      .eq("id", propertyId)
      .single();

    if (propertyError || property?.owner_id !== user.id) {
      return NextResponse.json(
        { error: "Property not found or access denied" },
        { status: 404 },
      );
    }

    // Only allow document uploads for draft/rejected properties
    if (property.status === "live") {
      return NextResponse.json(
        { error: "Cannot upload documents to live properties" },
        { status: 400 },
      );
    }

    const body = await request.json();
    const validatedData = uploadDocumentSchema.parse(body);

    // Insert document record
    const { data: document, error: insertError } = await supabase
      .from("property_documents")
      .insert({
        property_id: propertyId,
        document_type: validatedData.document_type,
        file_url: validatedData.file_url,
        file_name: validatedData.file_name,
        ml_validation_status: "pending", // Trigger ML validation
        admin_vetting_status: "pending",
      })
      .select()
      .single();

    if (insertError) {
      console.error("Document upload error:", insertError);
      return NextResponse.json(
        { error: "Failed to upload document" },
        { status: 500 },
      );
    }

    // TODO: Trigger ML validation service here
    // This would call an Edge Function or external service

    return NextResponse.json(
      {
        document,
        message: "Document uploaded successfully. Validation in progress.",
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Document upload API error:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid document data", details: error.errors },
        { status: 400 },
      );
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
