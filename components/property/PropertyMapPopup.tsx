"use client";

import dynamic from "next/dynamic";
import type { Property } from "@/lib/hooks/usePropertyMap";
import { getPriceContext } from "@/lib/utils/mapUtils";

// Dynamic imports for SSR compatibility
const Popup = dynamic(() => import("react-leaflet").then((mod) => mod.Popup), {
  ssr: false,
});

interface PropertyMapPopupProps {
  property: Property;
  selectedPropertyId?: string;
}

export function PropertyMapPopup({
  property,
  selectedPropertyId,
}: PropertyMapPopupProps) {
  if (selectedPropertyId !== property.id) return null;

  return (
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
  );
}
