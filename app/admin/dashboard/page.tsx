import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Header from "@/components/header"
import Footer from "@/components/footer"
import AdminDashboardContent from "@/components/admin-dashboard-content"

export default async function AdminDashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  // Check if user is an admin
  const { data: profile } = await supabase.from("profiles").select("user_type").eq("id", user.id).single()

  if (profile?.user_type !== "admin") {
    redirect("/")
  }

  // Fetch pending properties for verification
  const { data: pendingProperties } = await supabase
    .from("properties")
    .select("*, profiles(full_name, email)")
    .eq("verification_status", "pending")
    .order("created_at", { ascending: true })

  // Fetch pending documents
  const { data: pendingDocuments } = await supabase
    .from("property_documents")
    .select("*, properties(title, owner_id), profiles(full_name)")
    .eq("verification_status", "pending")
    .order("created_at", { ascending: true })

  // Fetch verified properties count
  const { count: verifiedCount } = await supabase
    .from("properties")
    .select("*", { count: "exact", head: true })
    .eq("verification_status", "verified")

  // Fetch rejected properties count
  const { count: rejectedCount } = await supabase
    .from("properties")
    .select("*", { count: "exact", head: true })
    .eq("verification_status", "rejected")

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <AdminDashboardContent
        user={user}
        pendingProperties={pendingProperties || []}
        pendingDocuments={pendingDocuments || []}
        verifiedCount={verifiedCount || 0}
        rejectedCount={rejectedCount || 0}
      />
      <Footer />
    </div>
  )
}
