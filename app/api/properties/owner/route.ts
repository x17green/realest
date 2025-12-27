// realest/app/api/properties/owner/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET /api/properties/owner - Get current user's properties (owner/agent)
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

    // Check if user has owner or agent role
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("user_type")
      .eq("id", user.id)
      .single();

    if (profileError || !["owner", "agent"].includes(profile?.user_type)) {
      return NextResponse.json(
        { error: "Only property owners and agents can access this endpoint" },
        { status: 403 },
      );
    }

    // Parse pagination parameters
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "20")));
    const offset = (page - 1) * limit;

    // Get total count first (efficient for pagination)
    const { count: totalCount, error: countError } = await supabase
      .from("properties")
      .select("*", { count: "exact", head: true })
      .eq("owner_id", user.id);

    if (countError) {
      console.error("Count query error:", countError);
      return NextResponse.json(
        { error: "Failed to fetch property count" },
        { status: 500 },
      );
    }

    // Get paginated properties with related data
    const { data: properties, error } = await supabase
      .from("properties")
      .select(
        `
        *,
        property_details (*),
        property_media (*),
        property_documents (*)
      `,
      )
      .eq("owner_id", user.id)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error("Owner properties fetch error:", error);
      return NextResponse.json(
        { error: "Failed to fetch properties" },
        { status: 500 },
      );
    }

    // Get inquiry counts and recent inquiries for each property
    // Use separate queries for better performance
    const propertyIds = properties?.map(p => p.id) || [];

    let inquiryStats: Record<string, { count: number; recent: any[] }> = {};

    if (propertyIds.length > 0) {
      // Get inquiry counts per property
      const { data: inquiryCounts, error: inquiryCountError } = await supabase
        .from("inquiries")
        .select("property_id")
        .in("property_id", propertyIds)
        .eq("owner_id", user.id);

      if (!inquiryCountError && inquiryCounts) {
        // Count inquiries per property
        const countMap: Record<string, number> = {};
        inquiryCounts.forEach(inquiry => {
          countMap[inquiry.property_id] = (countMap[inquiry.property_id] || 0) + 1;
        });

        // Get recent inquiries (last 3 per property)
        const { data: recentInquiries, error: recentError } = await supabase
          .from("inquiries")
          .select(`
            id,
            property_id,
            message,
            status,
            created_at,
            profiles:inquiries_sender_id_fkey (
              full_name,
              avatar_url
            )
          `)
          .in("property_id", propertyIds)
          .eq("owner_id", user.id)
          .order("created_at", { ascending: false })
          .limit(3 * propertyIds.length); // Get more than needed, then filter

        if (!recentError && recentInquiries) {
          // Group recent inquiries by property
          const recentMap: Record<string, any[]> = {};
          recentInquiries.forEach(inquiry => {
            if (!recentMap[inquiry.property_id]) {
              recentMap[inquiry.property_id] = [];
            }
            if (recentMap[inquiry.property_id].length < 3) {
              recentMap[inquiry.property_id].push({
                id: inquiry.id,
                message: inquiry.message,
                status: inquiry.status,
                created_at: inquiry.created_at,
                sender: inquiry.profiles
              });
            }
          });

          // Combine counts and recent inquiries
          propertyIds.forEach(propertyId => {
            inquiryStats[propertyId] = {
              count: countMap[propertyId] || 0,
              recent: recentMap[propertyId] || []
            };
          });
        }
      }
    }

    // Combine properties with inquiry stats
    const propertiesWithStats = properties?.map(property => ({
      ...property,
      inquiry_count: inquiryStats[property.id]?.count || 0,
      recent_inquiries: inquiryStats[property.id]?.recent || []
    })) || [];

    // Calculate pagination info
    const totalPages = Math.ceil((totalCount || 0) / limit);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;

    return NextResponse.json({
      properties: propertiesWithStats,
      pagination: {
        page,
        limit,
        total: totalCount || 0,
        total_pages: totalPages,
        has_next: hasNext,
        has_prev: hasPrev
      }
    });
  } catch (error) {
    console.error("Owner properties API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
