import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, { params }: RouteParams) {
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
        .select("owner_id")
        .eq("id", propertyId)
        .single();

      if (!property || property.owner_id !== user.id) {
        return NextResponse.json(
          { error: "Property not found or access denied" },
          { status: 404 },
        );
      }
    }

    // Fetch documents for this property
    const { data: documents, error } = await supabase
      .from("property_documents")
      .select("*")
      .eq("property_id", propertyId)
      .order("uploaded_at", { ascending: false });

    if (error) {
      console.error("Database error:", error);
      return NextResponse.json(
        { error: "Failed to fetch documents" },
        { status: 500 },
      );
    }

    return NextResponse.json({ data: documents });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
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
        .select("owner_id")
        .eq("id", propertyId)
        .single();

      if (!property || property.owner_id !== user.id) {
        return NextResponse.json(
          { error: "Property not found or access denied" },
          { status: 404 },
        );
      }
    }

    // Parse form data for file upload
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const documentType = formData.get("document_type") as string;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate document type
    const validTypes = [
      "title_deed",
      "survey_plan",
      "certificate_of_occupancy",
      "building_approval",
      "owner_id",
      "power_of_attorney",
      "tax_receipt",
      "other",
    ];

    if (!validTypes.includes(documentType)) {
      return NextResponse.json(
        { error: "Invalid document type" },
        { status: 400 },
      );
    }

    // Validate file type and size
    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "image/webp",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        {
          error:
            "Invalid file type. Only PDF, images, and Word documents are allowed.",
        },
        { status: 400 },
      );
    }

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 10MB." },
        { status: 400 },
      );
    }

    // Generate unique filename
    const fileExt = file.name.split(".").pop();
    const fileName = `${propertyId}-${documentType}-${Date.now()}.${fileExt}`;
    const filePath = `documents/${propertyId}/${fileName}`;

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from("property-documents")
      .upload(filePath, file, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error("Storage upload error:", uploadError);
      return NextResponse.json(
        { error: "Failed to upload document" },
        { status: 500 },
      );
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from("property-documents").getPublicUrl(filePath);

    // Save document record to database
    const { data: documentRecord, error: insertError } = await supabase
      .from("property_documents")
      .insert({
        property_id: propertyId,
        document_type: documentType,
        file_url: publicUrl,
        file_name: file.name,
        file_size: file.size,
        mime_type: file.type,
        ml_validation_status: "pending", // Will be processed by ML service
        uploaded_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (insertError) {
      console.error("Database insert error:", insertError);
      // Clean up uploaded file if database insert failed
      await supabase.storage.from("property-documents").remove([filePath]);

      return NextResponse.json(
        { error: "Failed to save document record" },
        { status: 500 },
      );
    }

    // Trigger ML validation (placeholder - would call ML service)
    // This would typically be done asynchronously via Edge Functions
    console.log("Document uploaded for ML validation:", documentRecord.id);

    return NextResponse.json(
      {
        data: documentRecord,
        message:
          "Document uploaded successfully. It will be validated by our team.",
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
