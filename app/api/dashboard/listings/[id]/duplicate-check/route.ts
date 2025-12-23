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

    // Get the property details for duplicate checking
    const { data: property, error: propertyError } = await supabase
      .from("properties")
      .select("title, address, state, lga, latitude, longitude, owner_id")
      .eq("id", propertyId)
      .single();

    if (propertyError || !property) {
      return NextResponse.json(
        { error: "Property not found" },
        { status: 404 },
      );
    }

    // Verify ownership (unless admin)
    if (profile.user_type !== "admin" && property.owner_id !== user.id) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Perform duplicate checks
    const duplicates = {
      exact_address: [] as any[],
      nearby_properties: [] as any[],
      similar_titles: [] as any[],
    };

    // 1. Exact address match (excluding current property and rejected ones)
    const { data: exactMatches } = await supabase
      .from("properties")
      .select(
        `
        id, title, address, state, lga, status, created_at,
        owner:profiles(full_name, email)
      `,
      )
      .eq("address", property.address)
      .eq("state", property.state)
      .neq("id", propertyId) // Exclude current property
      .neq("status", "rejected") // Don't flag against rejected properties
      .limit(5);

    if (exactMatches) {
      duplicates.exact_address = exactMatches;
    }

    // 2. Nearby properties (within 500 meters if coordinates available)
    if (property.latitude && property.longitude) {
      const { data: nearby } = await supabase.rpc("properties_within_radius", {
        lat: property.latitude,
        lng: property.longitude,
        radius_km: 0.5, // 500 meters
        exclude_property_id: propertyId,
      });

      if (nearby) {
        duplicates.nearby_properties = nearby.slice(0, 5); // Limit results
      }
    }

    // 3. Similar titles in same LGA (basic text similarity)
    const titleWords = property.title.toLowerCase().split(" ");
    const significantWords = titleWords.filter(
      (word: string) =>
        word.length > 3 &&
        !["the", "and", "for", "with", "from"].includes(word),
    );

    if (significantWords.length > 0) {
      // Simple approach: check for properties with similar key words
      const { data: similarTitles } = await supabase
        .from("properties")
        .select(
          `
          id, title, address, state, lga, status,
          owner:profiles(full_name)
        `,
        )
        .eq("lga", property.lga)
        .eq("state", property.state)
        .neq("id", propertyId)
        .neq("status", "rejected")
        .ilike("title", `%${significantWords[0]}%`) // At least one matching word
        .limit(5);

      if (similarTitles) {
        duplicates.similar_titles = similarTitles;
      }
    }

    // Calculate overall duplicate risk
    const totalDuplicates =
      duplicates.exact_address.length +
      duplicates.nearby_properties.length +
      duplicates.similar_titles.length;

    let riskLevel: "low" | "medium" | "high" = "low";
    if (totalDuplicates >= 3) {
      riskLevel = "high";
    } else if (totalDuplicates >= 1) {
      riskLevel = "medium";
    }

    return NextResponse.json({
      data: {
        property_id: propertyId,
        risk_level: riskLevel,
        total_duplicates: totalDuplicates,
        duplicates,
        recommendations:
          riskLevel === "high"
            ? [
                "Contact RealEST support to review potential duplicate",
                "Consider modifying property details",
              ]
            : riskLevel === "medium"
              ? [
                  "Review similar properties to ensure this is unique",
                  "Consider adding more specific details",
                ]
              : ["Property appears unique - proceed with listing"],
      },
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
