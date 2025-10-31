import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Header from "@/components/header"
import Footer from "@/components/footer"
import OwnerInquiriesPage from "@/components/owner-inquiries-page"

export default async function InquiriesPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Check if user is a property owner
  const { data: profile } = await supabase.from("profiles").select("user_type").eq("id", user.id).single()

  if (profile?.user_type !== "property_owner") {
    redirect("/")
  }

  // Fetch all inquiries for owner's properties
  const { data: inquiries } = await supabase
    .from("inquiries")
    .select("*, properties(id, title), profiles(full_name, email, phone)")
    .eq("owner_id", user.id)
    .order("created_at", { ascending: false })

  return (
    <div className="min-h-screen bg-background">
      <Header user={user} />
      <OwnerInquiriesPage inquiries={inquiries || []} />
      <Footer />
    </div>
  )
}
