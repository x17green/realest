import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Header from "@/components/header"
import HeroSection from "@/components/hero-section"
import FeaturedProperties from "@/components/featured-properties"
import Footer from "@/components/footer"

export default async function HomePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Redirect to dashboard if user is logged in
  if (user) {
    const { data: profile } = await supabase.from("profiles").select("user_type").eq("id", user.id).single()

    if (profile?.user_type === "property_owner") {
      redirect("/owner/dashboard")
    } else if (profile?.user_type === "admin") {
      redirect("/admin/dashboard")
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Header user={user} />
      <HeroSection />
      <FeaturedProperties />
      <Footer />
    </div>
  )
}
