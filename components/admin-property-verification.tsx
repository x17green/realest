"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { MapPin, AlertCircle, CheckCircle } from "lucide-react"

interface Property {
  id: string
  title: string
  address: string
  city: string
  price: number
  verification_status: string
  created_at: string
  profiles: { full_name: string; email: string }
}

interface AdminPropertyVerificationProps {
  properties: Property[]
}

export default function AdminPropertyVerification({ properties }: AdminPropertyVerificationProps) {
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null)
  const [notes, setNotes] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleVerify = async (propertyId: string, status: "verified" | "rejected") => {
    setIsLoading(true)
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from("properties")
        .update({
          verification_status: status,
          updated_at: new Date().toISOString(),
        })
        .eq("id", propertyId)

      if (error) throw error

      // Reset form
      setSelectedProperty(null)
      setNotes("")
      alert(`Property ${status} successfully!`)
    } catch (error) {
      alert("Error updating property verification status")
    } finally {
      setIsLoading(false)
    }
  }

  if (properties.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-12">
            <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
            <p className="text-muted-foreground">All properties have been verified!</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Properties List */}
      <div className="lg:col-span-2 space-y-4">
        {properties.map((property) => (
          <Card
            key={property.id}
            className={`cursor-pointer transition-all ${selectedProperty?.id === property.id ? "ring-2 ring-primary" : ""}`}
            onClick={() => setSelectedProperty(property)}
          >
            <CardContent className="pt-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h3 className="font-semibold mb-1">{property.title}</h3>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                    <MapPin className="w-4 h-4" />
                    <span>
                      {property.address}, {property.city}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">Submitted by: {property.profiles.full_name}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-primary">£{property.price.toLocaleString()}</p>
                  <Badge className="bg-yellow-600 mt-2">PENDING</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Verification Panel */}
      <div>
        {selectedProperty ? (
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle className="text-lg">Verification</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">{selectedProperty.title}</h4>
                <p className="text-sm text-muted-foreground mb-4">{selectedProperty.address}</p>
              </div>

              <div>
                <label className="text-sm font-medium">Verification Notes</label>
                <Textarea
                  placeholder="Add notes about this property..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="mt-2 min-h-24"
                />
              </div>

              <div className="space-y-2">
                <Button
                  className="w-full bg-green-600 hover:bg-green-700 gap-2"
                  onClick={() => handleVerify(selectedProperty.id, "verified")}
                  disabled={isLoading}
                >
                  <CheckCircle className="w-4 h-4" />
                  Approve
                </Button>
                <Button
                  variant="destructive"
                  className="w-full gap-2"
                  onClick={() => handleVerify(selectedProperty.id, "rejected")}
                  disabled={isLoading}
                >
                  <AlertCircle className="w-4 h-4" />
                  Reject
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">Select a property to verify</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
