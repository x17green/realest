import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Header from "@/components/header"
import Footer from "@/components/footer"
import OwnerDashboardContent from "@/components/owner-dashboard-content"

export default async function OwnerDashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  // Check if user is a property owner
  const { data: profile } = await supabase.from("profiles").select("user_type").eq("id", user.id).single()

  if (profile?.user_type !== "property_owner") {
    redirect("/")
  }

  // Fetch owner's properties
  const { data: properties } = await supabase
    .from("properties")
    .select("*")
    .eq("owner_id", user.id)
    .order("created_at", { ascending: false })

  // Fetch inquiries for owner's properties
  const { data: inquiries } = await supabase
    .from("inquiries")
    .select("*, properties(title), profiles(full_name, email)")
    .eq("owner_id", user.id)
    .order("created_at", { ascending: false })
    .limit(10)

  return (
    <div className="min-h-screen bg-background">
      <Header user={user} />
      <OwnerDashboardContent user={user} properties={properties || []} inquiries={inquiries || []} />
      <Footer />
    </div>
  )
}
