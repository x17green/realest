import { Card } from "@/components/ui/card";
import {
  Home,
  Building2,
  Hotel,
  Calendar,
  Square,
} from "lucide-react";
import { getPropertyTypeColor } from "@/lib/utils/mapUtils";

interface PropertyMapLegendProps {
  showLegend: boolean;
  filteredProperties: any[];
}

export function PropertyMapLegend({
  showLegend,
  filteredProperties,
}: PropertyMapLegendProps) {
  if (!showLegend) return null;

  return (
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
  );
}
