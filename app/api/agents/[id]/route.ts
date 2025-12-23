import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET /api/agents/[id] - Get agent details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const supabase = await createClient();
    const { id } = await params;
    const agentId = id;

    // Get agent profile
    const { data: agent, error: agentError } = await supabase
      .from("profiles")
      .select(
        `
        id,
        full_name,
        email,
        phone,
        avatar_url,
        created_at,
        user_type,
        agent_verification_status,
        agent_specialties,
        agent_experience_years,
        agent_languages,
        agent_service_areas,
        agent_rating,
        agent_total_reviews,
        agent_properties_count,
        agent_response_time_hours,
        agent_about,
        agent_verified_at,
        agent_license_number,
        agent_company_name,
        agent_website,
        agent_social_links
      `,
      )
      .eq("id", agentId)
      .eq("user_type", "agent")
      .single();

    if (agentError || !agent) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    }

    // Only return verified agents publicly
    if (agent.agent_verification_status !== "verified") {
      return NextResponse.json(
        { error: "Agent profile not available" },
        { status: 404 },
      );
    }

    // Get agent's properties (live only)
    const { data: properties, error: propertiesError } = await supabase
      .from("properties")
      .select(
        `
        id,
        title,
        price,
        price_frequency,
        state,
        lga,
        bedrooms,
        bathrooms,
        size_sqm,
        has_bq,
        status,
        created_at,
        verified_at,
        media:property_media!inner(
          file_url,
          is_primary
        )
      `,
      )
      .eq("owner_id", agentId)
      .eq("status", "live")
      .order("created_at", { ascending: false })
      .limit(6); // Show recent 6 properties

    if (propertiesError) {
      console.error("Properties fetch error:", propertiesError);
    }

    // Get agent reviews
    const { data: reviews, error: reviewsError } = await supabase
      .from("reviews")
      .select(
        `
        id,
        rating,
        comment,
        created_at,
        reviewer:profiles!inner(
          id,
          full_name,
          avatar_url
        )
      `,
      )
      .eq("target_id", agentId)
      .eq("target_type", "agent")
      .order("created_at", { ascending: false })
      .limit(5);

    if (reviewsError) {
      console.error("Reviews fetch error:", reviewsError);
    }

    // Calculate review statistics
    let reviewStats = {
      average_rating: agent.agent_rating || 0,
      total_reviews: agent.agent_total_reviews || 0,
      rating_distribution: {},
    };

    if (reviews && reviews.length > 0) {
      // Recalculate from actual reviews
      const totalRating = reviews.reduce(
        (sum: number, review: any) => sum + review.rating,
        0,
      );
      reviewStats.average_rating =
        Math.round((totalRating / reviews.length) * 10) / 10;
      reviewStats.total_reviews = reviews.length;

      // Rating distribution
      reviewStats.rating_distribution = {
        5: reviews.filter((r: any) => r.rating === 5).length,
        4: reviews.filter((r: any) => r.rating === 4).length,
        3: reviews.filter((r: any) => r.rating === 3).length,
        2: reviews.filter((r: any) => r.rating === 2).length,
        1: reviews.filter((r: any) => r.rating === 1).length,
      };
    }

    // Format response
    const agentProfile = {
      id: agent.id,
      name: agent.full_name,
      email: agent.email,
      phone: agent.phone,
      avatar_url: agent.avatar_url,
      verified: agent.agent_verification_status === "verified",
      verified_at: agent.agent_verified_at,
      member_since: agent.created_at,
      about: agent.agent_about,
      specialties: agent.agent_specialties || [],
      experience_years: agent.agent_experience_years,
      languages: agent.agent_languages || [],
      service_areas: agent.agent_service_areas || [],
      properties_count: agent.agent_properties_count || 0,
      response_time_hours: agent.agent_response_time_hours,
      company: agent.agent_company_name,
      license_number: agent.agent_license_number,
      website: agent.agent_website,
      social_links: agent.agent_social_links,
      reviews: reviewStats,
      recent_reviews: reviews || [],
      recent_properties: properties || [],
    };

    return NextResponse.json({ data: agentProfile });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
