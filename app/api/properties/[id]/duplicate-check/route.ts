// realest/app/api/properties/[id]/duplicate-check/route.ts
// realest/app/api/properties/[id]/duplicate-check/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const duplicateCheckSchema = z.object({
  address: z.string().optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  radius: z.number().min(0.01).max(10).default(0.1), // km radius for proximity check
});

// POST /api/properties/[id]/duplicate-check - Check for potential duplicate properties
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
      .select("owner_id, address, latitude, longitude")
      .eq("id", propertyId)
      .single();

    if (propertyError || property?.owner_id !== user.id) {
      return NextResponse.json(
        { error: "Property not found or access denied" },
        { status: 404 },
      );
    }

    const body = await request.json();
    const validatedData = duplicateCheckSchema.parse(body);

    // Use provided data or fall back to property data
    const checkAddress = validatedData.address || property.address;
    const checkLatitude = validatedData.latitude || property.latitude;
    const checkLongitude = validatedData.longitude || property.longitude;

    if (!checkAddress && (!checkLatitude || !checkLongitude)) {
      return NextResponse.json(
        { error: "Address or coordinates required for duplicate check" },
        { status: 400 },
      );
    }

    const potentialDuplicates: any[] = [];

    // 1. Exact address match check
    if (checkAddress) {
      const { data: addressMatches, error: addressError } = await supabase
        .from("properties")
        .select(
          `
          id,
          title,
          address,
          latitude,
          longitude,
          status,
          verification_status,
          created_at,
          profiles:owner_id (
            full_name
          )
        `,
        )
        .neq("id", propertyId) // Exclude current property
        .eq("status", "live") // Only check live properties
        .ilike(
          "address",
          checkAddress
            .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "")
            .toLowerCase(),
        );

      if (addressError) {
        console.error("Address duplicate check error:", addressError);
      } else if (addressMatches && addressMatches.length > 0) {
        potentialDuplicates.push(
          ...addressMatches.map((match) => ({
            ...match,
            duplicate_type: "exact_address",
            confidence: "high",
          })),
        );
      }
    }

    // 2. Geospatial proximity check (if coordinates available)
    if (checkLatitude && checkLongitude) {
      // Convert radius from km to degrees (approximate)
      const radiusInDegrees = validatedData.radius / 111.32;

      const { data: proximityMatches, error: proximityError } = await supabase
        .from("properties")
        .select(
          `
          id,
          title,
          address,
          latitude,
          longitude,
          status,
          verification_status,
          created_at,
          profiles:owner_id (
            full_name
          )
        `,
        )
        .neq("id", propertyId)
        .eq("status", "live")
        .gte("latitude", checkLatitude - radiusInDegrees)
        .lte("latitude", checkLatitude + radiusInDegrees)
        .gte("longitude", checkLongitude - radiusInDegrees)
        .lte("longitude", checkLongitude + radiusInDegrees);

      if (proximityError) {
        console.error("Proximity duplicate check error:", proximityError);
      } else if (proximityMatches && proximityMatches.length > 0) {
        // Calculate actual distances and filter
        const nearbyProperties = proximityMatches
          .map((match) => {
            const distance = calculateDistance(
              checkLatitude,
              checkLongitude,
              match.latitude,
              match.longitude,
            );
            return {
              ...match,
              distance,
              duplicate_type: "geospatial_proximity",
            };
          })
          .filter((match) => match.distance <= validatedData.radius)
          .map((match) => ({
            ...match,
            confidence:
              match.distance < 0.05
                ? "high"
                : match.distance < 0.2
                  ? "medium"
                  : "low",
          }));

        potentialDuplicates.push(...nearbyProperties);
      }
    }

    // 3. Owner-specific check (same owner listing similar properties)
    const { data: ownerMatches, error: ownerError } = await supabase
      .from("properties")
      .select(
        `
        id,
        title,
        address,
        latitude,
        longitude,
        status,
        verification_status,
        created_at
      `,
      )
      .neq("id", propertyId)
      .eq("owner_id", user.id)
      .in("status", ["draft", "pending_ml_validation", "pending_vetting"]);

    if (ownerError) {
      console.error("Owner duplicate check error:", ownerError);
    } else if (ownerMatches && ownerMatches.length > 0) {
      potentialDuplicates.push(
        ...ownerMatches.map((match) => ({
          ...match,
          duplicate_type: "same_owner",
          confidence: "high",
          profiles: { full_name: "You" },
        })),
      );
    }

    // Remove duplicates from results
    const uniqueDuplicates = potentialDuplicates.filter(
      (duplicate, index, self) =>
        index === self.findIndex((d) => d.id === duplicate.id),
    );

    return NextResponse.json({
      has_duplicates: uniqueDuplicates.length > 0,
      potential_duplicates: uniqueDuplicates,
      checked_criteria: {
        address: !!checkAddress,
        coordinates: !!(checkLatitude && checkLongitude),
        radius_km: validatedData.radius,
        total_checked: uniqueDuplicates.length,
      },
    });
  } catch (error) {
    console.error("Duplicate check API error:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid check parameters", details: error.errors },
        { status: 400 },
      );
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// Helper function to calculate distance between two coordinates (Haversine formula)
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}
