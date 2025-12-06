import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Header from "@/components/header"
import Footer from "@/components/footer"
import ListPropertyForm from "@/components/list-property-form"

export default async function ListPropertyPage() {
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

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-8">
        <ListPropertyForm userId={user.id} />
      </main>
      <Footer />
    </div>
  );
}
