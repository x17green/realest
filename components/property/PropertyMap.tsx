"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import dynamic from "next/dynamic";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  MapPin,
  Search,
  Home,
  Building2,
  Hotel,
  Calendar,
  Bed,
  Bath,
  Square,
  X,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  Filter,
  Layers,
  Navigation,
  Zap,
  Droplets,
  Wifi,
  Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { LatLngExpression, LatLngBounds } from "leaflet";
import { Loader } from "@googlemaps/js-api-loader";
const EditControl = dynamic(
  () => import("react-leaflet-draw").then((mod) => mod.EditControl),
  { ssr: false },
);
const GeoJSON = dynamic(
  () => import("react-leaflet").then((mod) => mod.GeoJSON),
  { ssr: false },
);
import { usePropertyMap } from "@/lib/hooks/usePropertyMap";
import {
  formatMapPrice,
  createMarkerIconHTML,
  leafletBoundsToBounds,
  isValidCoordinates,
  NIGERIAN_STATES,
  LAGOS_LGAS,
  INFRASTRUCTURE_FILTERS,
  getPropertyTypeColor,
  getPropertyTypeIcon,
} from "@/lib/utils/mapUtils";
import {
  getDefaultMapCenter,
  getDefaultMapBounds,
} from "@/lib/utils/nigerianLocations";
import { PropertyMapMarkerCluster } from "./PropertyMapMarkerCluster";

// Dynamic imports for SSR compatibility
const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false },
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false },
);
const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false },
);
const Popup = dynamic(() => import("react-leaflet").then((mod) => mod.Popup), {
  ssr: false,
});

import { useMapEvents, useMap } from "react-leaflet";

// Map bounds handling with event synchronization
function useMapBounds() {
  const [bounds, setBounds] = useState(getDefaultMapBounds());

  return { bounds, setBounds };
}

// Component to handle map events and update bounds
function MapEventHandler({
  onBoundsChange,
}: {
  onBoundsChange: (bounds: {
    north: number;
    south: number;
    east: number;
    west: number;
  }) => void;
}) {
  useMapEvents({
    moveend: (e: any) => {
      const leafletBounds = e.target.getBounds();
      onBoundsChange(leafletBoundsToBounds(leafletBounds));
    },
    zoomend: (e: any) => {
      const leafletBounds = e.target.getBounds();
      onBoundsChange(leafletBoundsToBounds(leafletBounds));
    },
  });

  return null;
}

// Component to control map view programmatically
function MapController({
  bounds,
}: {
  bounds: { north: number; south: number; east: number; west: number };
}) {
  const leafletMap = useMap();

  useEffect(() => {
    if (leafletMap) {
      const leafletBounds = new (window as any).L.LatLngBounds(
        [bounds.south, bounds.west],
        [bounds.north, bounds.east],
      );
      leafletMap.fitBounds(leafletBounds);
    }
  }, [bounds, leafletMap]);

  return null;
}

interface PropertyMapProps {
  className?: string;
  initialCenter?: LatLngExpression;
  initialZoom?: number;
  showFilters?: boolean;
  showLegend?: boolean;
}

export function PropertyMap({
  className,
  initialCenter = [getDefaultMapCenter().lat, getDefaultMapCenter().lng],
  initialZoom = 11,
  showFilters = true,
  showLegend = true,
}: PropertyMapProps) {
  const [selectedProperty, setSelectedProperty] = useState<any | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [leafletLoaded, setLeafletLoaded] = useState(false);
  const [showStateBoundaries, setShowStateBoundaries] = useState(false);
  const [stateGeoJson, setStateGeoJson] = useState<any>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Filter states
  const [filters, setFilters] = useState({
    propertyType: "",
    listingType: "",
    state: "",
    minPrice: 0,
    maxPrice: 100000000, // 100M Naira
    bedrooms: 0,
    bathrooms: 0,
    hasBq: false,
    nepaStatus: "",
    waterSource: "",
    internetType: "",
    securityTypes: [] as string[],
  });

  const { bounds, setBounds } = useMapBounds();

  // Fetch properties with current filters and bounds
  const { properties, isLoading, error } = usePropertyMap({
    bounds,
    filters: {
      propertyType: filters.propertyType || undefined,
      listingType:
        (filters.listingType as "sale" | "rent" | "lease") || undefined,
      state: filters.state || undefined,
      minPrice: filters.minPrice || undefined,
      maxPrice: filters.maxPrice < 100000000 ? filters.maxPrice : undefined,
      bedrooms: filters.bedrooms || undefined,
      bathrooms: filters.bathrooms || undefined,
      hasBq: filters.hasBq || undefined,
      nepaStatus: filters.nepaStatus || undefined,
      waterSource: filters.waterSource || undefined,
      internetType: filters.internetType || undefined,
      securityTypes:
        filters.securityTypes.length > 0 ? filters.securityTypes : undefined,
    },
    limit: 200,
  });

  // Load Leaflet CSS, Google Maps API, and state boundaries
  useEffect(() => {
    const loadLeafletCSS = async () => {
      if (typeof window !== "undefined") {
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
        document.head.appendChild(link);

        // Load Leaflet Draw CSS
        const drawLink = document.createElement("link");
        drawLink.rel = "stylesheet";
        drawLink.href =
          "https://unpkg.com/leaflet-draw@1.0.4/dist/leaflet.draw.css";
        document.head.appendChild(drawLink);
        setLeafletLoaded(true);

        // Fetch Nigerian states GeoJSON
        try {
          const response = await fetch(
            "https://raw.githubusercontent.com/codefornigeria/nigeria-geojson/master/ng-states.geojson",
          );
          const data = await response.json();
          setStateGeoJson(data);
        } catch (error) {
          console.warn("Failed to load state boundaries:", error);
        }

        // Load Google Maps API for autocomplete
        const googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
        if (googleMapsApiKey) {
          const loader = new Loader({
            apiKey: googleMapsApiKey,
            version: "weekly",
            libraries: ["places"],
          });

          (loader as any)
            .load()
            .then(() => {
              if (searchInputRef.current && (window as any).google) {
                const autocomplete = new (
                  window as any
                ).google.maps.places.Autocomplete(searchInputRef.current, {
                  componentRestrictions: { country: "ng" },
                  fields: ["geometry", "formatted_address"],
                });

                autocomplete.addListener("place_changed", () => {
                  const place = autocomplete.getPlace();
                  if (place.geometry?.location) {
                    const lat = place.geometry.location.lat();
                    const lng = place.geometry.location.lng();

                    // Center map on selected location with small bounds
                    const newBounds = {
                      north: lat + 0.01,
                      south: lat - 0.01,
                      east: lng + 0.01,
                      west: lng - 0.01,
                    };
                    setBounds(newBounds);

                    // Update search query with formatted address
                    setSearchQuery(place.formatted_address || "");
                  }
                });
              }
            })
            .catch((error: any) => {
              console.warn("Failed to load Google Maps API:", error);
            });
        }
      }
    };
    loadLeafletCSS();
  }, []);

  // Create custom marker icons
  const createCustomIcon = useCallback((property: any) => {
    if (typeof window === "undefined") return null;

    const isVerified = property.verification_status === "verified";
    const iconHtml = createMarkerIconHTML(property.property_type, isVerified);

    return new (window as any).L.DivIcon({
      html: iconHtml,
      className: "custom-marker",
      iconSize: [40, 40],
      iconAnchor: [20, 40],
    });
  }, []);

  // Filter properties by search query
  const filteredProperties = properties.filter((property) => {
    if (!searchQuery) return true;

    const query = searchQuery.toLowerCase();
    return (
      property.title?.toLowerCase().includes(query) ||
      property.address?.toLowerCase().includes(query) ||
      property.city?.toLowerCase().includes(query) ||
      property.state?.toLowerCase().includes(query)
    );
  });

  // Handle filter changes
  const updateFilter = (key: string, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  // Reset filters
  const resetFilters = () => {
    setFilters({
      propertyType: "",
      listingType: "",
      state: "",
      minPrice: 0,
      maxPrice: 100000000,
      bedrooms: 0,
      bathrooms: 0,
      hasBq: false,
      nepaStatus: "",
      waterSource: "",
      internetType: "",
      securityTypes: [],
    });
  };

  // Image navigation
  const nextImage = () => {
    if (selectedProperty?.property_media?.length > 0) {
      setCurrentImageIndex((prev) =>
        prev === selectedProperty.property_media.length - 1 ? 0 : prev + 1,
      );
    }
  };

  const prevImage = () => {
    if (selectedProperty?.property_media?.length > 0) {
      setCurrentImageIndex((prev) =>
        prev === 0 ? selectedProperty.property_media.length - 1 : prev - 1,
      );
    }
  };

  // Get current image URL
  const getCurrentImageUrl = (property: any) => {
    if (property?.property_media?.length > 0) {
      const currentMedia = property.property_media[currentImageIndex];
      if (currentMedia?.media_type === "image") {
        return currentMedia.file_url;
      }
    }
    return "/placeholder-property.jpg";
  };

  if (!leafletLoaded) {
    return (
      <div className="relative h-screen w-full overflow-hidden flex items-center justify-center bg-background">
        <Card className="p-8 max-w-md text-center">
          <h2 className="text-2xl font-bold mb-4">Loading Map...</h2>
          <p className="text-muted-foreground">
            Please wait while we initialize the property map.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="relative h-screen w-full overflow-hidden">
      <MapContainer
        center={initialCenter}
        zoom={initialZoom}
        style={{ height: "100%", width: "100%" }}
        className="z-0"
        aria-label="Interactive property map"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapEventHandler onBoundsChange={setBounds} />

        <MapController bounds={bounds} />

        <EditControl
          position="topright"
          onCreated={(e: any) => {
            const layer = e.layer;
            const bounds = layer.getBounds();
            const newBounds = leafletBoundsToBounds(bounds);
            setBounds(newBounds);
          }}
          draw={{
            rectangle: true,
            polygon: true,
            circle: false,
            marker: false,
            polyline: false,
            circlemarker: false,
          }}
        />

        {showStateBoundaries && stateGeoJson && (
          <GeoJSON
            data={stateGeoJson}
            style={{
              color: "#374151",
              weight: 2,
              opacity: 0.6,
              fillOpacity: 0.1,
            }}
          />
        )}

        <PropertyMapMarkerCluster
          properties={filteredProperties}
          onPropertyClick={(property) => {
            setSelectedProperty(property);
            setCurrentImageIndex(0);
          }}
          selectedPropertyId={selectedProperty?.id}
        />
      </MapContainer>

      {/* Header Overlay */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/70 to-transparent p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-white">
                RealEST Property Map
              </h1>
              <p className="text-white/80 text-sm">
                Discover verified properties across Nigeria
              </p>
            </div>
            <div className="flex items-center gap-4 text-white">
              <div className="text-right">
                <p className="text-2xl font-bold">
                  {filteredProperties.length}
                </p>
                <p className="text-sm text-white/80">Properties Found</p>
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative mb-4">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              ref={searchInputRef}
              placeholder="Search by location, property type, or features..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 pr-12 h-12 bg-background/95 backdrop-blur-sm border-border/50"
              aria-label="Search properties by location, type, or features"
            />
            {showFilters && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2"
                onClick={() => setShowFilterPanel(!showFilterPanel)}
                aria-label="Toggle filters panel"
              >
                <SlidersHorizontal className="h-5 w-5" />
              </Button>
            )}
          </div>

          {/* Quick Filters */}
          {showFilters && (
            <div className="flex flex-wrap gap-2">
              <Select
                value={filters.propertyType}
                onValueChange={(value) => updateFilter("propertyType", value)}
              >
                <SelectTrigger className="w-[140px] bg-background/95 backdrop-blur-sm">
                  <SelectValue placeholder="Property Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Types</SelectItem>
                  <SelectItem value="house">House</SelectItem>
                  <SelectItem value="apartment">Apartment</SelectItem>
                  <SelectItem value="land">Land</SelectItem>
                  <SelectItem value="commercial">Commercial</SelectItem>
                  <SelectItem value="event_center">Event Center</SelectItem>
                  <SelectItem value="hotel">Hotel</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={filters.listingType}
                onValueChange={(value) => updateFilter("listingType", value)}
              >
                <SelectTrigger className="w-[120px] bg-background/95 backdrop-blur-sm">
                  <SelectValue placeholder="Listing Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Listings</SelectItem>
                  <SelectItem value="sale">For Sale</SelectItem>
                  <SelectItem value="rent">For Rent</SelectItem>
                  <SelectItem value="lease">For Lease</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={filters.state}
                onValueChange={(value) => updateFilter("state", value)}
              >
                <SelectTrigger className="w-[120px] bg-background/95 backdrop-blur-sm">
                  <SelectValue placeholder="State" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All States</SelectItem>
                  {NIGERIAN_STATES.map((state: any) => (
                    <SelectItem key={state.code} value={state.code}>
                      {state.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </div>

      {/* Filter Panel */}
      {showFilterPanel && (
        <Card
          className="absolute top-24 left-6 w-[320px] max-h-[calc(100vh-8rem)] overflow-y-auto z-20 bg-background/95 backdrop-blur-sm border-border/50"
          role="dialog"
          aria-labelledby="filter-title"
        >
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 id="filter-title" className="text-lg font-semibold">
                Filters
              </h3>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowStateBoundaries(!showStateBoundaries)}
                  className={cn(
                    "text-sm",
                    showStateBoundaries && "bg-primary/10 text-primary",
                  )}
                >
                  <Layers className="h-4 w-4 mr-1" />
                  State Boundaries
                </Button>
                <Button variant="ghost" size="sm" onClick={resetFilters}>
                  Reset All
                </Button>
              </div>
            </div>

            <div className="space-y-6">
              {/* Price Range */}
              <div>
                <Label className="text-sm font-medium mb-2 block">
                  Price Range (₦)
                </Label>
                <div className="px-2">
                  <Slider
                    value={[filters.minPrice, filters.maxPrice]}
                    onValueChange={([min, max]) => {
                      updateFilter("minPrice", min);
                      updateFilter("maxPrice", max);
                    }}
                    max={100000000}
                    step={1000000}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>{formatMapPrice(filters.minPrice)}</span>
                    <span>{formatMapPrice(filters.maxPrice)}</span>
                  </div>
                </div>
              </div>

              {/* Bedrooms/Bathrooms */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium mb-2 block">
                    Min Bedrooms
                  </Label>
                  <Select
                    value={filters.bedrooms.toString()}
                    onValueChange={(value) =>
                      updateFilter("bedrooms", parseInt(value))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Any</SelectItem>
                      <SelectItem value="1">1+</SelectItem>
                      <SelectItem value="2">2+</SelectItem>
                      <SelectItem value="3">3+</SelectItem>
                      <SelectItem value="4">4+</SelectItem>
                      <SelectItem value="5">5+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-sm font-medium mb-2 block">
                    Min Bathrooms
                  </Label>
                  <Select
                    value={filters.bathrooms.toString()}
                    onValueChange={(value) =>
                      updateFilter("bathrooms", parseInt(value))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Any</SelectItem>
                      <SelectItem value="1">1+</SelectItem>
                      <SelectItem value="2">2+</SelectItem>
                      <SelectItem value="3">3+</SelectItem>
                      <SelectItem value="4">4+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Nigerian Infrastructure */}
              <div>
                <Label className="text-sm font-medium mb-3 block">
                  Infrastructure
                </Label>
                <div className="space-y-3">
                  <div>
                    <Label className="text-xs text-muted-foreground mb-2 block">
                      Power (NEPA)
                    </Label>
                    <Select
                      value={filters.nepaStatus}
                      onValueChange={(value) =>
                        updateFilter("nepaStatus", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Any power status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Any</SelectItem>
                        {INFRASTRUCTURE_FILTERS.nepa_status.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-xs text-muted-foreground mb-2 block">
                      Water Source
                    </Label>
                    <Select
                      value={filters.waterSource}
                      onValueChange={(value) =>
                        updateFilter("waterSource", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Any water source" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Any</SelectItem>
                        {INFRASTRUCTURE_FILTERS.water_source.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="hasBq"
                      checked={filters.hasBq}
                      onCheckedChange={(checked) =>
                        updateFilter("hasBq", checked)
                      }
                    />
                    <Label htmlFor="hasBq" className="text-sm">
                      Has Boys Quarters (BQ)
                    </Label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Property Details Card */}
      {selectedProperty && (
        <Card
          className="absolute right-6 top-24 w-[400px] max-h-[calc(100vh-8rem)] overflow-y-auto z-20 bg-background/95 backdrop-blur-sm border-border/50"
          role="dialog"
          aria-labelledby="property-title"
        >
          <div className="relative">
            {/* Property Images */}
            <div className="relative h-64 overflow-hidden rounded-t-lg">
              <img
                src={getCurrentImageUrl(selectedProperty)}
                alt={selectedProperty.title}
                className="w-full h-full object-cover"
              />

              {/* Image Navigation */}
              {selectedProperty.property_media?.length > 1 && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white"
                    onClick={prevImage}
                    aria-label="Previous property image"
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white"
                    onClick={nextImage}
                    aria-label="Next property image"
                  >
                    <ChevronRight className="h-6 w-6" />
                  </Button>

                  {/* Image Indicators */}
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                    {selectedProperty.property_media.map(
                      (_: any, idx: number) => (
                        <div
                          key={idx}
                          className={cn(
                            "h-1.5 w-1.5 rounded-full transition-all",
                            idx === currentImageIndex
                              ? "bg-white w-4"
                              : "bg-white/50",
                          )}
                        />
                      ),
                    )}
                  </div>
                </>
              )}

              {/* Verification Badge */}
              {selectedProperty.verification_status === "verified" && (
                <Badge className="absolute top-3 left-3 bg-green-600 hover:bg-green-700">
                  ✓ Verified
                </Badge>
              )}

              {/* Close Button */}
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-3 right-3 bg-black/50 hover:bg-black/70 text-white"
                onClick={() => setSelectedProperty(null)}
                aria-label="Close property details"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Property Details */}
            <div className="p-6 space-y-4">
              <div>
                <div className="flex items-start justify-between mb-2">
                  <h3 id="property-title" className="text-2xl font-bold">
                    {selectedProperty.title}
                  </h3>
                  <Badge
                    variant="outline"
                    style={{
                      backgroundColor: `${getPropertyTypeColor(selectedProperty.property_type)}20`,
                      borderColor: getPropertyTypeColor(
                        selectedProperty.property_type,
                      ),
                    }}
                  >
                    {selectedProperty.property_type.replace("_", " ")}
                  </Badge>
                </div>

                <div className="flex items-center text-muted-foreground mb-2">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span className="text-sm">
                    {selectedProperty.address}, {selectedProperty.city},{" "}
                    {selectedProperty.state}
                  </span>
                </div>

                <div className="text-3xl font-bold text-primary">
                  {formatMapPrice(
                    selectedProperty.price,
                    selectedProperty.currency,
                  )}
                  <span className="text-sm text-muted-foreground ml-2">
                    for {selectedProperty.listing_type}
                  </span>
                </div>
              </div>

              {/* Property Specs */}
              {selectedProperty.property_details && (
                <div className="flex flex-wrap gap-4 py-4 border-y border-border">
                  {selectedProperty.property_details.bedrooms && (
                    <div className="flex items-center gap-2">
                      <Bed className="h-5 w-5 text-muted-foreground" />
                      <span className="font-semibold">
                        {selectedProperty.property_details.bedrooms}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        Beds
                      </span>
                    </div>
                  )}
                  {selectedProperty.property_details.bathrooms && (
                    <div className="flex items-center gap-2">
                      <Bath className="h-5 w-5 text-muted-foreground" />
                      <span className="font-semibold">
                        {selectedProperty.property_details.bathrooms}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        Baths
                      </span>
                    </div>
                  )}
                  {selectedProperty.property_details.square_feet && (
                    <div className="flex items-center gap-2">
                      <Square className="h-5 w-5 text-muted-foreground" />
                      <span className="font-semibold">
                        {selectedProperty.property_details.square_feet.toLocaleString()}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        sqft
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Nigerian Infrastructure */}
              {selectedProperty.property_details && (
                <div>
                  <h4 className="font-semibold mb-3">Infrastructure</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {selectedProperty.property_details.nepa_status && (
                      <div className="flex items-center gap-2 text-sm">
                        <Zap className="h-4 w-4 text-orange-500" />
                        <span>
                          NEPA: {selectedProperty.property_details.nepa_status}
                        </span>
                      </div>
                    )}
                    {selectedProperty.property_details.water_source && (
                      <div className="flex items-center gap-2 text-sm">
                        <Droplets className="h-4 w-4 text-blue-500" />
                        <span>
                          Water:{" "}
                          {selectedProperty.property_details.water_source.replace(
                            "_",
                            " ",
                          )}
                        </span>
                      </div>
                    )}
                    {selectedProperty.property_details.internet_type && (
                      <div className="flex items-center gap-2 text-sm">
                        <Wifi className="h-4 w-4 text-purple-500" />
                        <span>
                          Internet:{" "}
                          {selectedProperty.property_details.internet_type}
                        </span>
                      </div>
                    )}
                    {selectedProperty.property_details.has_bq && (
                      <div className="flex items-center gap-2 text-sm">
                        <Home className="h-4 w-4 text-green-500" />
                        <span>Has BQ</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Description */}
              {selectedProperty.description && (
                <div>
                  <h4 className="font-semibold mb-2">Description</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {selectedProperty.description}
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2">
                <Button className="flex-1">View Details</Button>
                <Button variant="outline" className="flex-1">
                  Contact Owner
                </Button>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Legend */}
      {showLegend && (
        <Card className="absolute bottom-6 right-6 p-4 z-10 bg-background/95 backdrop-blur-sm border-border/50">
          <h4 className="font-semibold mb-3 text-sm">Property Types</h4>
          <div className="space-y-2">
            {[
              { type: "house", label: "House", icon: Home },
              { type: "apartment", label: "Apartment", icon: Building2 },
              { type: "land", label: "Land", icon: Square },
              { type: "commercial", label: "Commercial", icon: Building2 },
              { type: "event_center", label: "Event Center", icon: Calendar },
              { type: "hotel", label: "Hotel", icon: Hotel },
            ].map(({ type, label, icon: Icon }) => {
              const count = filteredProperties.filter(
                (p) => p.property_type === type,
              ).length;
              return (
                <div key={type} className="flex items-center gap-2 text-sm">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: getPropertyTypeColor(type) }}
                  />
                  <Icon className="h-4 w-4" />
                  <span className="capitalize">{label}</span>
                  <span className="text-muted-foreground ml-auto">
                    ({count})
                  </span>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Loading/Error States */}
      {isLoading && (
        <div className="absolute inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center z-30">
          <Card className="p-6">
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              <span>Loading properties...</span>
            </div>
          </Card>
        </div>
      )}

      {error && (
        <div className="absolute top-24 left-1/2 -translate-x-1/2 z-30">
          <Card className="p-4 bg-destructive/10 border-destructive/20">
            <p className="text-destructive text-sm">{error}</p>
          </Card>
        </div>
      )}
    </div>
  );
}

export default PropertyMap;
