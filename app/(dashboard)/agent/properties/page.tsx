import { redirect } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { PropertiesList, type PropertyListItem } from "@/components/agent/PropertiesList"

export default async function AgentPropertiesPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth/login?redirect=/agent/properties")
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, user_type, full_name")
    .eq("id", user.id)
    .single()

  if (!profile || profile.user_type !== "agent") {
    redirect("/")
  }

  const { data: props } = await supabase
    .from("properties")
    .select("id, title, status, price, price_frequency, views_count, inquiries_count, created_at")
    .eq("owner_id", user.id)
    .order("created_at", { ascending: false })

  const properties = (props ?? []) as PropertyListItem[]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl">Manage Properties</h1>
        <Link href="/agent/properties/new" className="text-primary underline">New Property</Link>
      </div>
      <PropertiesList properties={properties} />
    </div>
  )
}
