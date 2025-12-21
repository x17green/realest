import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { PropertyForm } from "@/components/agent/PropertyForm"

export default async function NewPropertyPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login?redirect=/agent/properties/new")

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, user_type")
    .eq("id", user.id)
    .single()

  if (!profile || profile.user_type !== "agent") redirect("/")

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-2xl">Create Property</h1>
      <PropertyForm mode="create" />
    </div>
  )
}
