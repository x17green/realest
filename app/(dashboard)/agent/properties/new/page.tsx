import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { PropertyForm } from "@/components/agent/PropertyForm"

export default async function NewPropertyPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login?redirect=/agent/properties/new")

  const { data: userData } = await supabase
    .from("users")
    .select("id, role")
    .eq("id", user.id)
    .single()

  if (!userData || userData.role !== "agent") redirect("/")

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-2xl">Create Property</h1>
      <PropertyForm mode="create" />
    </div>
  )
}
