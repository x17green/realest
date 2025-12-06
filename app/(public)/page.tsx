import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Header from "@/components/header"
import HeroSection from "@/components/hero-section"
import FeaturedProperties from "@/components/featured-properties"
import Footer from "@/components/footer"
import ComingSoonHero from "@/components/coming-soon-hero"
import { getAppMode, shouldShowFullSite, shouldEnableAuthentication } from "@/lib/app-mode"

export default async function HomePage() {
  const appMode = getAppMode()
  const showFullSite = shouldShowFullSite()
  const enableAuth = shouldEnableAuthentication()

  // Initialize user as null for coming-soon mode
  let user = null

  // Only fetch user data if authentication is enabled
  if (enableAuth) {
    const supabase = await createClient()
    const { data: userData } = await supabase.auth.getUser()
    user = userData.user

    // Redirect to dashboard if user is logged in and we're in full site mode
    if (user && showFullSite) {
      const { data: profile } = await supabase.from("profiles").select("user_type").eq("id", user.id).single()

      if (profile?.user_type === "property_owner") {
        redirect("/owner/dashboard")
      } else if (profile?.user_type === "admin") {
        redirect("/admin/dashboard")
      }
    }
  }

  // Branch-aware rendering: Show coming soon if not full site mode
  if (!showFullSite) {
    return <ComingSoonHero />
  }

  // Original full site rendering (for develop/staging/production after release)
  return (
    <div className="min-h-screen w-full bg-background">
      <Header />
      <HeroSection />
      <FeaturedProperties />
      <Footer />
    </div>
  )
}
