// realest/app/api/admin/properties/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const validatePropertySchema = z.object({
  status: z.enum(["live", "rejected"]),
  rejection_reason: z.string().optional(),
  admin_notes: z.string().optional(),
});

const vetPropertySchema = z.object({
  vetting_status: z.enum(["approved", "rejected"]),
  vetting_notes: z.string().optional(),
  rejection_reason: z.string().optional(),
});

// GET /api/admin/properties - Get properties needing admin review
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const adminRow = await prisma.users.findUnique({ where: { id: user.id }, select: { role: true } });
    if (!adminRow || adminRow.role !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || "pending_ml_validation";

    const properties = await prisma.properties.findMany({
      where: { status },
      include: {
        property_details: true,
        property_media: true,
        property_documents: true,
        owners: { include: { profiles: { select: { full_name: true, avatar_url: true, phone: true } } } },
      },
      orderBy: { created_at: "desc" },
    });

    return NextResponse.json({ properties });
  } catch (error) {
    console.error("Admin properties API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PUT /api/admin/properties - Validate property (approve for vetting or reject)
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const adminRow = await prisma.users.findUnique({ where: { id: user.id }, select: { role: true } });
    if (!adminRow || adminRow.role !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const propertyId = searchParams.get("property_id");

    if (!propertyId) {
      return NextResponse.json({ error: "Property ID is required" }, { status: 400 });
    }

    const body = await request.json();
    const validatedData = validatePropertySchema.parse(body);

    const updatedProperty = await prisma.properties.update({
      where: { id: propertyId },
      data: {
        status: validatedData.status === "live" ? "pending_vetting" : "rejected",
        updated_at: new Date(),
      },
    });

    // TODO: Send notification to property owner

    return NextResponse.json({
      property: updatedProperty,
      message: `Property ${validatedData.status === "live" ? "approved for vetting" : "rejected"}`,
    });
  } catch (error) {
    console.error("Property validation API error:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid validation data", details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
