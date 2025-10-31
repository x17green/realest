"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Mail, MessageSquare } from "lucide-react"

interface Inquiry {
  id: string
  message: string
  status: string
  created_at: string
  properties: { title: string }
  profiles: { full_name: string; email: string }
}

interface OwnerInquiriesProps {
  inquiries: Inquiry[]
}

export default function OwnerInquiries({ inquiries }: OwnerInquiriesProps) {
  if (inquiries.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-12">
            <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No inquiries yet</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {inquiries.map((inquiry) => (
        <Card key={inquiry.id}>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <h3 className="font-semibold mb-1">{inquiry.properties.title}</h3>
                <p className="text-sm text-muted-foreground">From: {inquiry.profiles.full_name}</p>
              </div>
              <Badge
                className={
                  inquiry.status === "new"
                    ? "bg-blue-600"
                    : inquiry.status === "viewed"
                      ? "bg-yellow-600"
                      : inquiry.status === "responded"
                        ? "bg-green-600"
                        : "bg-gray-600"
                }
              >
                {inquiry.status.toUpperCase()}
              </Badge>
            </div>

            <p className="text-sm text-foreground mb-4 p-3 bg-muted rounded-lg">{inquiry.message}</p>

            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">{new Date(inquiry.created_at).toLocaleDateString()}</p>
              <a href={`mailto:${inquiry.profiles.email}`}>
                <Button size="sm" variant="outline" className="gap-2 bg-transparent">
                  <Mail className="w-4 h-4" />
                  Reply
                </Button>
              </a>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
