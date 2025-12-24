"use client";

import dynamic from "next/dynamic";
import type { Property } from "@/lib/hooks/usePropertyMap";
import {
  createMarkerIconHTML,
  isValidCoordinates,
  getPriceContext,
} from "@/lib/utils/mapUtils";

// Dynamic imports for SSR compatibility
const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false },
);

const Popup = dynamic(() => import("react-leaflet").then((mod) => mod.Popup), {
  ssr: false,
});

interface PropertyMapMarkerProps {
  property: Property;
  onPropertyClick?: (property: Property) => void;
  selectedPropertyId?: string;
}

export function PropertyMapMarker({
  property,
  onPropertyClick,
  selectedPropertyId,
}: PropertyMapMarkerProps) {
  // Create custom marker icon
  const createCustomIcon = () => {
    if (typeof window === "undefined") return null;

    const isVerified = property.verification_status === "verified";
    const hasBq = (property.property_details as any)?.has_bq || false;
    const iconHtml = createMarkerIconHTML(
      property.property_type,
      isVerified,
      hasBq,
    );

    return new (window as any).L.DivIcon({
      html: iconHtml,
      className: "custom-marker",
      iconSize: [40, 40],
      iconAnchor: [20, 40],
    });
  };

  if (!isValidCoordinates(property.latitude, property.longitude)) {
    return null;
  }

  return (
    <Marker
      position={[property.latitude!, property.longitude!]}
      icon={createCustomIcon()}
      eventHandlers={{
        click: () => onPropertyClick?.(property),
      }}
    >
      {selectedPropertyId === property.id && (
        <Popup>
          <div className="p-4 min-w-[280px]">
            <h3 className="text-lg font-bold mb-2">{property.title}</h3>
            <p className="text-sm text-muted-foreground mb-2">
              {property.address}, {property.city}, {property.state || ""}
            </p>
            <p className="text-xl font-bold text-primary mb-2">
              ₦{property.price.toLocaleString()} for {property.listing_type}
            </p>
            <p className="text-sm text-muted-foreground mb-2">
              {getPriceContext(
                property.price,
                property.property_type,
                property.state || "",
              )}
            </p>
            {property.property_details && (
              <div className="flex gap-4 text-sm text-muted-foreground">
                {property.property_details.bedrooms && (
                  <span>{property.property_details.bedrooms} beds</span>
                )}
                {property.property_details.bathrooms && (
                  <span>{property.property_details.bathrooms} baths</span>
                )}
                {property.property_details.square_feet && (
                  <span>{property.property_details.square_feet} sqft</span>
                )}
              </div>
            )}
          </div>
        </Popup>
      )}
    </Marker>
  );
}
