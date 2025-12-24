"use client";

import { useMemo } from "react";
import dynamic from "next/dynamic";
import type { Property } from "@/lib/hooks/usePropertyMap";
import { createMarkerIconHTML, isValidCoordinates } from "@/lib/utils/mapUtils";

// Dynamic imports for SSR compatibility
const MarkerClusterGroup = dynamic(
  () => import("react-leaflet-markercluster").then((mod) => mod.default),
  { ssr: false },
);

const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false },
);

const Popup = dynamic(() => import("react-leaflet").then((mod) => mod.Popup), {
  ssr: false,
});

interface PropertyMapMarkerClusterProps {
  properties: Property[];
  onPropertyClick?: (property: Property) => void;
  selectedPropertyId?: string;
}

export function PropertyMapMarkerCluster({
  properties,
  onPropertyClick,
  selectedPropertyId,
}: PropertyMapMarkerClusterProps) {
  // Create custom marker icons
  const createCustomIcon = useMemo(
    () => (property: Property) => {
      if (typeof window === "undefined") return null;

      const isVerified = property.verification_status === "verified";
      const iconHtml = createMarkerIconHTML(property.property_type, isVerified);

      return new (window as any).L.DivIcon({
        html: iconHtml,
        className: "custom-marker",
        iconSize: [40, 40],
        iconAnchor: [20, 40],
      });
    },
    [],
  );

  // Filter out properties without valid coordinates
  const validProperties = useMemo(
    () =>
      properties.filter((property) =>
        isValidCoordinates(property.latitude, property.longitude),
      ),
    [properties],
  );

  // Cluster group options
  const clusterOptions = useMemo(
    () => ({
      chunkedLoading: true,
      chunkInterval: 200,
      chunkDelay: 50,
      spiderfyOnMaxZoom: true,
      showCoverageOnHover: false,
      zoomToBoundsOnClick: true,
      iconCreateFunction: (cluster: any) => {
        const childCount = cluster.getChildCount();
        let className = "marker-cluster-";

        if (childCount < 10) {
          className += "small";
        } else if (childCount < 100) {
          className += "medium";
        } else {
          className += "large";
        }

        return new (window as any).L.DivIcon({
          html: `<div><span>${childCount}</span></div>`,
          className: `marker-cluster ${className}`,
          iconSize: new (window as any).L.Point(40, 40),
        });
      },
    }),
    [],
  );

  if (typeof window === "undefined") {
    return null;
  }

  return (
    // @ts-ignore
    <MarkerClusterGroup {...clusterOptions}>
      {validProperties.map((property) => (
        <Marker
          key={property.id}
          position={[property.latitude!, property.longitude!]}
          icon={createCustomIcon(property)}
          eventHandlers={{
            click: () => onPropertyClick?.(property),
          }}
        >
          {selectedPropertyId === property.id && (
            <Popup>
              <div className="p-4 min-w-[280px]">
                <h3 className="text-lg font-bold mb-2">{property.title}</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  {property.address}, {property.city}, {property.state}
                </p>
                <p className="text-xl font-bold text-primary mb-2">
                  ₦{property.price.toLocaleString()} for {property.listing_type}
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
      ))}
    </MarkerClusterGroup>
  );
}

// CSS styles for marker clusters (to be added to globals.css)
export const markerClusterStyles = `
.marker-cluster-small {
  background-color: rgba(16, 185, 129, 0.6);
  border: 2px solid rgba(16, 185, 129, 0.8);
}

.marker-cluster-small div {
  background-color: rgba(255, 255, 255, 0.8);
  border-radius: 50%;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  color: #065f46;
  font-size: 12px;
}

.marker-cluster-medium {
  background-color: rgba(245, 158, 11, 0.6);
  border: 2px solid rgba(245, 158, 11, 0.8);
}

.marker-cluster-medium div {
  background-color: rgba(255, 255, 255, 0.8);
  border-radius: 50%;
  width: 35px;
  height: 35px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  color: #92400e;
  font-size: 14px;
}

.marker-cluster-large {
  background-color: rgba(239, 68, 68, 0.6);
  border: 2px solid rgba(239, 68, 68, 0.8);
}

.marker-cluster-large div {
  background-color: rgba(255, 255, 255, 0.8);
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  color: #991b1b;
  font-size: 16px;
}

.marker-cluster {
  border-radius: 50%;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  transition: all 0.2s ease;
}

.marker-cluster:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
}
`;
