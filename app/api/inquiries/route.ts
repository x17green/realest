// realest/app/api/inquiries/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createInquirySchema = z.object({
  property_id: z.string().uuid(),
  message: z.string().min(10, "Message must be at least 10 characters"),
  contact_phone: z.string().optional(),
  contact_email: z.string().email().optional(),
});

const updateInquirySchema = z.object({
  status: z.enum(["pending", "responded", "closed"]).optional(),
});

// GET /api/inquiries - Get user's inquiries (user or owner)
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user's role to determine query type
    const userRow = await prisma.users.findUnique({
      where: { id: user.id },
      select: { role: true },
    });

    if (!userRow) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    let inquiries;

    if (userRow.role === "user") {
      // Users see inquiries they sent
      inquiries = await prisma.inquiries.findMany({
        where: { sender_id: user.id },
        include: {
          properties: {
            select: {
              id: true,
              title: true,
              address: true,
              price: true,
              property_media: {
                where: { is_primary: true },
                select: { file_url: true, is_primary: true },
                take: 1,
              },
            },
          },
          profiles_inquiries_sender_idToprofiles: {
            select: { full_name: true, avatar_url: true },
          },
        },
        orderBy: { created_at: "desc" },
      });
    } else if (userRow.role === "owner") {
      // Owners see inquiries on their properties
      inquiries = await prisma.inquiries.findMany({
        where: { owner_id: user.id },
        include: {
          properties: {
            select: {
              id: true,
              title: true,
              address: true,
              price: true,
              property_media: {
                where: { is_primary: true },
                select: { file_url: true, is_primary: true },
                take: 1,
              },
            },
          },
          profiles_inquiries_sender_idToprofiles: {
            select: { full_name: true, avatar_url: true, phone: true },
          },
        },
        orderBy: { created_at: "desc" },
      });
    } else {
      return NextResponse.json({ error: "Invalid user type" }, { status: 403 });
    }

    return NextResponse.json({ inquiries });
  } catch (error) {
    console.error("Inquiries API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// POST /api/inquiries - Create new inquiry
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user has the 'user' role (buyers send inquiries)
    const [userRow, senderProfile] = await Promise.all([
      prisma.users.findUnique({ where: { id: user.id }, select: { role: true } }),
      prisma.profiles.findUnique({
        where: { id: user.id },
        select: { phone: true, email: true },
      }),
    ]);

    if (!userRow || userRow.role !== "user") {
      return NextResponse.json(
        { error: "Only users can send inquiries" },
        { status: 403 },
      );
    }

    const body = await request.json();
    const validatedData = createInquirySchema.parse(body);

    // Check if property exists and is live
    const property = await prisma.properties.findFirst({
      where: { id: validatedData.property_id, status: "live" },
      select: { id: true, owner_id: true, status: true, title: true },
    });

    if (!property) {
      return NextResponse.json(
        { error: "Property not found or not available" },
        { status: 404 },
      );
    }

    // Check if user already has a pending inquiry for this property
    const existingInquiry = await prisma.inquiries.findFirst({
      where: {
        property_id: validatedData.property_id,
        sender_id: user.id,
        status: "pending",
      },
      select: { id: true },
    });

    if (existingInquiry) {
      return NextResponse.json(
        { error: "You already have a pending inquiry for this property" },
        { status: 400 },
      );
    }

    // Create inquiry — owner_id comes from the property record
    const inquiry = await prisma.inquiries.create({
      data: {
        property_id: validatedData.property_id,
        sender_id: user.id,
        owner_id: property.owner_id!,
        message: validatedData.message,
        status: "pending",
      },
      include: {
        properties: { select: { title: true, owner_id: true } },
      },
    });

    // TODO: Send notification to property owner

    return NextResponse.json(
      {
        inquiry,
        message:
          "Inquiry sent successfully. The property owner will respond soon.",
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Inquiry creation API error:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid inquiry data", details: error.errors },
        { status: 400 },
      );
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
