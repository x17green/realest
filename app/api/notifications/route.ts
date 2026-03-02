// realest/app/api/notifications/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

// Note: This assumes we add a 'notifications' table to the database
// Table structure:
// - id: uuid primary key
// - user_id: uuid (FK to profiles.id)
// - type: enum (inquiry_received, property_status_changed, etc.)
// - title: string
// - message: string
// - data: jsonb (additional context)
// - is_read: boolean default false
// - created_at: timestamp

// GET /api/notifications - Get user's notifications
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

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = parseInt(searchParams.get("offset") || "0");
    const unreadOnly = searchParams.get("unread_only") === "true";

    const where: Record<string, unknown> = { user_id: user.id };
    if (unreadOnly) where.is_read = false;

    const [notifications, unreadCount] = await Promise.all([
      prisma.notifications.findMany({
        where,
        orderBy: { created_at: "desc" },
        skip,
        take: limit,
      }),
      prisma.notifications.count({ where: { user_id: user.id, is_read: false } }),
    ]);

    const total = await prisma.notifications.count({ where });

    return NextResponse.json({
      notifications,
      pagination: {
        limit,
        offset: skip,
        total,
        has_more: total > skip + limit,
      },
      unread_count: unreadCount,
    });
  } catch (error) {
    console.error("Notifications API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/notifications/mark-all-read - Mark all notifications as read
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

    // Mark all notifications as read
    await prisma.notifications.updateMany({
      where: { user_id: user.id },
      data: { is_read: true },
    });

    return NextResponse.json({
      message: "All notifications marked as read"
    });
  } catch (error) {
    console.error("Mark all read API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
