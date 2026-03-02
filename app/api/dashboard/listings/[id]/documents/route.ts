import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { generateSignedUrl } from "@/lib/utils/upload-utils";

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

    // Verify role via Prisma
    const userRow = await prisma.users.findUnique({
      where: { id: user.id },
      select: { role: true },
    });
    if (!userRow || !["owner", "admin"].includes(userRow.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Verify property ownership (unless admin)
    if (userRow.role !== "admin") {
      const property = await prisma.properties.findFirst({
        where: { id: propertyId, owner_id: user.id },
        select: { id: true },
      });
      if (!property) {
        return NextResponse.json(
          { error: "Property not found or access denied" },
          { status: 404 },
        );
      }
    }

    // Fetch documents for this property
    const documents = await prisma.property_documents.findMany({
      where: { property_id: propertyId },
      orderBy: { created_at: "desc" },
    });

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

    // Verify role via Prisma
    const userRow = await prisma.users.findUnique({
      where: { id: user.id },
      select: { role: true },
    });
    if (!userRow || !["owner", "agent", "admin"].includes(userRow.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Verify property ownership (unless admin)
    if (userRow.role !== "admin") {
      const property = await prisma.properties.findFirst({
        where: { id: propertyId, owner_id: user.id },
        select: { id: true },
      });
      if (!property) {
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

    // Generate signed URL for upload
    const signedUrlResult = await generateSignedUrl({
      bucket: "property-documents",
      file_name: file.name,
      file_type: file.type,
      file_size: file.size,
      user_id: user.id,
      property_id: propertyId,
    });

    // Upload file to signed URL
    const uploadResponse = await fetch(signedUrlResult.signed_url, {
      method: "PUT",
      body: file,
      headers: {
        "Content-Type": file.type,
      },
    });

    if (!uploadResponse.ok) {
      console.error("Upload to signed URL failed:", uploadResponse.statusText);
      return NextResponse.json(
        { error: "Failed to upload document" },
        { status: 500 },
      );
    }

    // Use the public URL from signed URL generation
    const publicUrl = signedUrlResult.public_url;

    // Save document record to database via Prisma
    const documentRecord = await prisma.property_documents.create({
      data: {
        property_id: propertyId,
        document_type: documentType,
        document_url: publicUrl,
        file_name: file.name,
        file_size: file.size,
        verification_status: "pending",
      },
    });

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
