// realest/app/api/geocode/route.ts
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const geocodeSchema = z.object({
  address: z.string().min(5, "Address must be at least 5 characters"),
  country: z.string().default("Nigeria"),
});

const reverseGeocodeSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});

// POST /api/geocode - Convert address to coordinates
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = geocodeSchema.parse(body);

    // Using Mapbox Geocoding API (you'll need to add MAPBOX_ACCESS_TOKEN to env)
    const mapboxToken = process.env.MAPBOX_ACCESS_TOKEN;
    if (!mapboxToken) {
      console.error("MAPBOX_ACCESS_TOKEN not configured");
      return NextResponse.json(
        { error: "Geocoding service not configured" },
        { status: 500 }
      );
    }

    const encodedAddress = encodeURIComponent(
      `${validatedData.address}, ${validatedData.country}`
    );
    const geocodingUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodedAddress}.json?access_token=${mapboxToken}&limit=1&country=ng`;

    const response = await fetch(geocodingUrl);
    const data = await response.json();

    if (!response.ok) {
      console.error("Mapbox API error:", data);
      return NextResponse.json(
        { error: "Geocoding failed" },
        { status: 500 }
      );
    }

    if (!data.features || data.features.length === 0) {
      return NextResponse.json(
        { error: "Address not found" },
        { status: 404 }
      );
    }

    const feature = data.features[0];
    const [longitude, latitude] = feature.center;

    return NextResponse.json({
      latitude,
      longitude,
      address: feature.place_name,
      confidence: feature.relevance,
      bbox: feature.bbox,
    });
  } catch (error) {
    console.error("Geocoding API error:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid address data", details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// GET /api/geocode/reverse - Convert coordinates to address
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const latitude = searchParams.get("lat");
    const longitude = searchParams.get("lng");

    if (!latitude || !longitude) {
      return NextResponse.json(
        { error: "Latitude and longitude are required" },
        { status: 400 }
      );
    }

    const validatedData = reverseGeocodeSchema.parse({
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
    });

    const mapboxToken = process.env.MAPBOX_ACCESS_TOKEN;
    if (!mapboxToken) {
      console.error("MAPBOX_ACCESS_TOKEN not configured");
      return NextResponse.json(
        { error: "Reverse geocoding service not configured" },
        { status: 500 }
      );
    }

    const reverseGeocodingUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${validatedData.longitude},${validatedData.latitude}.json?access_token=${mapboxToken}&limit=1&country=ng`;

    const response = await fetch(reverseGeocodingUrl);
    const data = await response.json();

    if (!response.ok) {
      console.error("Mapbox reverse API error:", data);
      return NextResponse.json(
        { error: "Reverse geocoding failed" },
        { status: 500 }
      );
    }

    if (!data.features || data.features.length === 0) {
      return NextResponse.json(
        { error: "Location not found" },
        { status: 404 }
      );
    }

    const feature = data.features[0];

    return NextResponse.json({
      address: feature.place_name,
      latitude: validatedData.latitude,
      longitude: validatedData.longitude,
      place_type: feature.place_type,
      properties: feature.properties,
    });
  } catch (error) {
    console.error("Reverse geocoding API error:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid coordinates", details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
