import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, Bed, Bath, Ruler, Calendar, DollarSign, CheckCircle } from "lucide-react"

interface Property {
  id: string
  title: string
  description: string
  price: number
  address: string
  city: string
  state: string
  postal_code: string
  bedrooms: number
  bathrooms: number
  square_feet: number
  year_built: number
  property_type: string
  listing_type: string
  verification_status: string
  created_at: string
}

interface PropertyDetailsProps {
  property: Property
  details: any
}

export default function PropertyDetails({ property, details }: PropertyDetailsProps) {
  const listingTypeLabel = property.listing_type.replace("_", " ").toUpperCase()
  const propertyTypeLabel = property.property_type.replace("_", " ").toUpperCase()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">{property.title}</h1>
            <div className="flex items-center gap-2 text-muted-foreground mb-4">
              <MapPin className="w-5 h-5" />
              <span>
                {property.address}, {property.city}, {property.state} {property.postal_code}
              </span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-4xl font-bold text-primary mb-2">£{property.price.toLocaleString()}</div>
            <Badge className="bg-green-600">{listingTypeLabel}</Badge>
          </div>
        </div>

        {property.verification_status === "verified" && (
          <div className="flex items-center gap-2 text-green-600 mb-4">
            <CheckCircle className="w-5 h-5" />
            <span className="font-semibold">Verified & Vetted Property</span>
          </div>
        )}
      </div>

      {/* Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground leading-relaxed">{property.description}</p>
        </CardContent>
      </Card>

      {/* Key Details */}
      <Card>
        <CardHeader>
          <CardTitle>Key Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {property.bedrooms > 0 && (
              <div>
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Bed className="w-5 h-5" />
                  <span className="text-sm">Bedrooms</span>
                </div>
                <p className="text-2xl font-bold">{property.bedrooms}</p>
              </div>
            )}
            {property.bathrooms > 0 && (
              <div>
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Bath className="w-5 h-5" />
                  <span className="text-sm">Bathrooms</span>
                </div>
                <p className="text-2xl font-bold">{property.bathrooms}</p>
              </div>
            )}
            {property.square_feet > 0 && (
              <div>
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Ruler className="w-5 h-5" />
                  <span className="text-sm">Square Feet</span>
                </div>
                <p className="text-2xl font-bold">{property.square_feet.toLocaleString()}</p>
              </div>
            )}
            <div>
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Calendar className="w-5 h-5" />
                <span className="text-sm">Year Built</span>
              </div>
              <p className="text-2xl font-bold">{property.year_built}</p>
            </div>
            <div>
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <DollarSign className="w-5 h-5" />
                <span className="text-sm">Property Type</span>
              </div>
              <p className="text-lg font-semibold">{propertyTypeLabel}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Amenities */}
      {details?.amenities && details.amenities.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Amenities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {details.amenities.map((amenity: string, index: number) => (
                <Badge key={index} variant="outline" className="justify-center py-2">
                  {amenity}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
