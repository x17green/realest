"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { MapPin, Bed, Bath, Ruler } from "lucide-react"

interface Property {
  id: string
  title: string
  price: number
  address: string
  city: string
  bedrooms: number
  bathrooms: number
  square_feet: number
  listing_type: string
  property_type: string
}

export default function FeaturedProperties() {
  const [properties, setProperties] = useState<Property[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchProperties = async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("properties")
        .select("*")
        .eq("status", "active")
        .eq("verification_status", "verified")
        .limit(4)

      if (!error && data) {
        setProperties(data as Property[])
      }
      setIsLoading(false)
    }

    fetchProperties()
  }, [])

  if (isLoading) {
    return (
      <section className="py-16 bg-background">
        <div className="container">
          <h2 className="text-3xl font-bold mb-8">Featured Properties</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-64 bg-muted rounded-lg animate-pulse" />
            ))}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-16 bg-background">
      <div className="container">
        <h2 className="text-3xl font-bold mb-8">Featured Properties</h2>

        {properties.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No verified properties available yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {properties.map((property) => (
              <Link key={property.id} href={`/property/${property.id}`}>
                <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                  <div className="relative h-48 bg-muted rounded-t-lg overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-400 to-slate-600" />
                    <Badge className="absolute top-2 right-2 bg-green-600">
                      {property.listing_type.replace("_", " ").toUpperCase()}
                    </Badge>
                  </div>
                  <CardContent className="pt-4">
                    <h3 className="font-semibold line-clamp-2 mb-2">{property.title}</h3>
                    <p className="text-2xl font-bold text-primary mb-2">£{property.price.toLocaleString()}</p>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground mb-4">
                      <MapPin className="w-4 h-4" />
                      <span className="line-clamp-1">{property.address}</span>
                    </div>
                    <div className="flex gap-4 text-sm text-muted-foreground">
                      {property.bedrooms > 0 && (
                        <div className="flex items-center gap-1">
                          <Bed className="w-4 h-4" />
                          <span>{property.bedrooms}</span>
                        </div>
                      )}
                      {property.bathrooms > 0 && (
                        <div className="flex items-center gap-1">
                          <Bath className="w-4 h-4" />
                          <span>{property.bathrooms}</span>
                        </div>
                      )}
                      {property.square_feet > 0 && (
                        <div className="flex items-center gap-1">
                          <Ruler className="w-4 h-4" />
                          <span>{property.square_feet.toLocaleString()} sqft</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
