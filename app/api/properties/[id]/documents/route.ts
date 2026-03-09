// realest/app/api/properties/[id]/documents/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { propertyDocumentSchema } from "@/lib/validations/property";

// GET /api/properties/[id]/documents - Get property documents
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const supabase = await createClient();
    const { id } = await params;

    // Auth
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check property exists and access
    const property = await prisma.properties.findUnique({
      where: { id },
      select: { owner_id: true, status: true },
    });

    if (!property) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 });
    }

    const ownerRecord = await prisma.owners.findUnique({ where: { profile_id: user.id }, select: { id: true } });
    const isOwner = ownerRecord !== null && property.owner_id === ownerRecord.id;
    const userRow = await prisma.users.findUnique({ where: { id: user.id }, select: { role: true } });
    const isAdmin = userRow?.role === "admin";

    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const documents = await prisma.property_documents.findMany({
      where: { property_id: id },
      orderBy: { created_at: "desc" },
    });

    return NextResponse.json({ documents });
  } catch (error) {
    console.error("Documents API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
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

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const property = await prisma.properties.findUnique({
      where: { id },
      select: { owner_id: true, status: true },
    });

    const ownerRecordPost = await prisma.owners.findUnique({ where: { profile_id: user.id }, select: { id: true } });
    if (!property || !ownerRecordPost || property.owner_id !== ownerRecordPost.id) {
      return NextResponse.json({ error: "Property not found or access denied" }, { status: 404 });
    }

    if (property.status === "live") {
      return NextResponse.json({ error: "Cannot upload documents to live properties" }, { status: 400 });
    }

    const body = await request.json();
    const validatedData = propertyDocumentSchema.parse(body);

    const document = await prisma.property_documents.create({
      data: {
        property_id: id,
        document_type: validatedData.document_type,
        document_url: validatedData.document_url,
        file_name: validatedData.file_name,
        verification_status: "pending",
      },
    });

    // TODO: Trigger ML validation service here

    return NextResponse.json(
      { document, message: "Document uploaded successfully. Validation in progress." },
      { status: 201 },
    );
  } catch (error) {
    console.error("Document upload API error:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid document data", details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
