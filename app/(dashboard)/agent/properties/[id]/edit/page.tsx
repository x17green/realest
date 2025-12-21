import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { PropertyForm } from "@/components/agent/PropertyForm"

export default async function EditPropertyPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(`/auth/login?redirect=/agent/properties/${params.id}/edit`)

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, user_type")
    .eq("id", user.id)
    .single()

  if (!profile || profile.user_type !== "agent") redirect("/")

  const { data: property } = await supabase
    .from("properties")
    .select("id, title, description, address, state, lga, property_type, price, price_frequency")
    .eq("id", params.id)
    .eq("owner_id", user.id)
    .single()

  if (!property) redirect("/agent/properties")

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-2xl">Edit Property</h1>
      <PropertyForm mode="edit" initial={property} />
    </div>
  )
}
