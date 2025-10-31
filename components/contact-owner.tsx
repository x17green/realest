"use client"

import type React from "react"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import type { User } from "@supabase/supabase-js"
import Link from "next/link"
import { Mail, Phone, MessageSquare } from "lucide-react"

interface Property {
  id: string
  title: string
  owner_id: string
}

interface Owner {
  id: string
  full_name: string
  phone: string
  email: string
  avatar_url: string
}

interface ContactOwnerProps {
  property: Property
  owner: Owner
  currentUser: User | null
}

export default function ContactOwner({ property, owner, currentUser }: ContactOwnerProps) {
  const [message, setMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSendInquiry = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!currentUser) {
      setError("Please log in to send an inquiry")
      return
    }

    if (!message.trim()) {
      setError("Please enter a message")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const supabase = createClient()
      const { error: inquiryError } = await supabase.from("inquiries").insert({
        property_id: property.id,
        sender_id: currentUser.id,
        owner_id: property.owner_id,
        message: message.trim(),
      })

      if (inquiryError) throw inquiryError

      setSuccess(true)
      setMessage("")
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send inquiry")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Owner Card */}
      <Card>
        <CardHeader>
          <CardTitle>Property Owner</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-2xl font-bold">
              {owner.full_name?.charAt(0) || "O"}
            </div>
            <div>
              <h3 className="font-semibold">{owner.full_name || "Property Owner"}</h3>
              <p className="text-sm text-muted-foreground">Owner/Agent</p>
            </div>
          </div>

          <div className="space-y-2 pt-4 border-t">
            {owner.email && (
              <a
                href={`mailto:${owner.email}`}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <Mail className="w-4 h-4" />
                {owner.email}
              </a>
            )}
            {owner.phone && (
              <a
                href={`tel:${owner.phone}`}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <Phone className="w-4 h-4" />
                {owner.phone}
              </a>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Contact Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Send Inquiry
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!currentUser ? (
            <div className="text-center py-6">
              <p className="text-muted-foreground mb-4">Please log in to send an inquiry</p>
              <Link href="/auth/login">
                <Button className="w-full">Log In</Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSendInquiry} className="space-y-4">
              <div>
                <Textarea
                  placeholder="Tell the owner about your interest in this property..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="min-h-32"
                />
              </div>

              {error && <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>}

              {success && (
                <div className="p-3 bg-green-50 text-green-700 rounded-lg text-sm">
                  Inquiry sent successfully! The owner will contact you soon.
                </div>
              )}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Sending..." : "Send Inquiry"}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>

      {/* Mortgage Calculator */}
      <Card>
        <CardHeader>
          <CardTitle>Mortgage Calculator</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Property Price</label>
              <p className="text-2xl font-bold text-primary">£{property.price?.toLocaleString() || "0"}</p>
            </div>
            <p className="text-xs text-muted-foreground">Use a mortgage calculator to estimate your monthly payments</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
