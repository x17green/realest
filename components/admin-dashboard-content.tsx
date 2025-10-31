"use client"

import { useState } from "react"
import type { User } from "@supabase/supabase-js"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileCheck, Home } from "lucide-react"
import AdminPropertyVerification from "@/components/admin-property-verification"
import AdminDocumentVerification from "@/components/admin-document-verification"

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

interface Document {
  id: string
  document_type: string
  file_name: string
  verification_status: string
  created_at: string
  properties: { title: string; owner_id: string }
  profiles: { full_name: string }
}

interface AdminDashboardContentProps {
  user: User
  pendingProperties: Property[]
  pendingDocuments: Document[]
  verifiedCount: number
  rejectedCount: number
}

export default function AdminDashboardContent({
  user,
  pendingProperties,
  pendingDocuments,
  verifiedCount,
  rejectedCount,
}: AdminDashboardContentProps) {
  const [activeTab, setActiveTab] = useState("properties")

  return (
    <main className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">Verify and manage property listings</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Properties</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600">{pendingProperties.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Awaiting verification</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Verified Properties</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{verifiedCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Approved listings</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Rejected Properties</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">{rejectedCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Rejected listings</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Documents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{pendingDocuments.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Awaiting review</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="properties" className="gap-2">
            <Home className="w-4 h-4" />
            Properties
          </TabsTrigger>
          <TabsTrigger value="documents" className="gap-2">
            <FileCheck className="w-4 h-4" />
            Documents
          </TabsTrigger>
        </TabsList>

        <TabsContent value="properties" className="mt-6">
          <AdminPropertyVerification properties={pendingProperties} />
        </TabsContent>

        <TabsContent value="documents" className="mt-6">
          <AdminDocumentVerification documents={pendingDocuments} />
        </TabsContent>
      </Tabs>
    </main>
  )
}
