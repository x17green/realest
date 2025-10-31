import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import Header from "@/components/header"
import Footer from "@/components/footer"
import PropertyGallery from "@/components/property-gallery"
import PropertyDetails from "@/components/property-details"
import PropertyDocuments from "@/components/property-documents"
import ContactOwner from "@/components/contact-owner"

interface PropertyPageProps {
  params: Promise<{ id: string }>
}

export default async function PropertyPage({ params }: PropertyPageProps) {
  const { id } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Fetch property details
  const { data: property, error } = await supabase.from("properties").select("*").eq("id", id).single()

  if (error || !property) {
    notFound()
  }

  // Fetch property details
  const { data: details } = await supabase.from("property_details").select("*").eq("property_id", id).single()

  // Fetch property media
  const { data: media } = await supabase
    .from("property_media")
    .select("*")
    .eq("property_id", id)
    .order("display_order", { ascending: true })

  // Fetch property documents
  const { data: documents } = await supabase.from("property_documents").select("*").eq("property_id", id)

  // Fetch owner profile
  const { data: owner } = await supabase.from("profiles").select("*").eq("id", property.owner_id).single()

  return (
    <div className="min-h-screen bg-background">
      <Header user={user} />

      <main className="container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Property Info */}
          <div className="lg:col-span-2 space-y-8">
            <PropertyGallery media={media || []} title={property.title} />
            <PropertyDetails property={property} details={details} />
            {documents && documents.length > 0 && <PropertyDocuments documents={documents} />}
          </div>

          {/* Right Column - Contact & Info */}
          <div className="space-y-6">
            <ContactOwner property={property} owner={owner} currentUser={user} />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
