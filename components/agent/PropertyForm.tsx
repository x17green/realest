"use client"

import { useEffect, useMemo, useState, ChangeEvent } from "react"
import { Button, Card } from "@heroui/react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

export type PropertyFormValues = {
  id?: string
  title: string
  description: string
  address: string
  state: string
  city: string
  property_type: string
  price: number
  price_frequency: "sale" | "annual" | "monthly" | "nightly"
  listing_type: "for_sale" | "for_rent" | "for_lease"
}
const LISTING_TYPE_OPTIONS = [
  { value: "for_sale", label: "For Sale" },
  { value: "for_rent", label: "For Rent" },
  { value: "for_lease", label: "For Lease" },
]

const PROPERTY_TYPES = [
  { value: "house", label: "House" },
  { value: "apartment", label: "Apartment" },
  { value: "land", label: "Land" },
  { value: "commercial", label: "Commercial" },
]

const PRICE_FREQ = [
  { value: "sale", label: "Sale" },
  { value: "annual", label: "Per Year" },
  { value: "monthly", label: "Per Month" },
  { value: "nightly", label: "Per Night" },
]

export function PropertyForm({ initial, mode }: { initial?: Partial<PropertyFormValues>, mode: "create" | "edit" }) {
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])
  const [loading, setLoading] = useState(false)
  const [values, setValues] = useState<PropertyFormValues>({
    id: initial?.id,
    title: initial?.title ?? "",
    description: initial?.description ?? "",
    address: initial?.address ?? "",
    state: initial?.state ?? "",
    city: initial?.city ?? "",
    property_type: initial?.property_type ?? "house",
    price: initial?.price ?? 0,
    price_frequency: (initial?.price_frequency as PropertyFormValues["price_frequency"]) ?? "annual",
    listing_type: (initial?.listing_type as PropertyFormValues["listing_type"]) ?? "for_rent",
  })

  useEffect(() => {
    if (initial) {
      setValues((v) => ({
        ...v,
        ...initial,
        price_frequency: (initial.price_frequency as PropertyFormValues["price_frequency"]) ?? v.price_frequency,
        listing_type: (initial.listing_type as PropertyFormValues["listing_type"]) ?? v.listing_type,
      }))
    }
  }, [initial])

  async function handleSubmit() {
    setLoading(true)
    try {
      const { data: session } = await supabase.auth.getUser()
      const user = session.user
      if (!user) {
        router.push("/auth/login?redirect=/agent/properties")
        return
      }

      if (mode === "create") {
            // Look up agent's id using the current user's profile id
            const { data: agentRow, error: agentError } = await supabase
              .from("agents")
              .select("id")
              .eq("profile_id", user.id)
              .single()
            if (agentError || !agentRow) {
              alert("Agent profile not found. Please contact support.")
              setLoading(false)
              return
            }
            const { error } = await supabase
              .from("properties")
              .insert({
                ...values,
                agent_id: agentRow.id,
                owner_id: user.id, // Set to null for agent listings if desired
                listing_source: "agent",
              })
            if (error) throw error
      } else {
        if (!values.id) throw new Error("Missing property id")
        const { error } = await supabase
          .from("properties")
          .update({
            title: values.title,
            description: values.description,
            address: values.address,
            state: values.state,
            city: values.city,
            property_type: values.property_type,
            price: values.price,
            price_frequency: values.price_frequency,
            listing_type: values.listing_type,
            country: "NG",
            status: "active",
            verification_status: "pending",
            listing_source: "agent",
          })
          .eq("id", values.id)
        if (error) throw error
      }

      router.push("/agent/properties")
    } catch (err) {
      console.error(err)
      alert((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="p-6 space-y-6">
      <div>
        <label className="block text-sm font-medium mb-1">Title</label>
        <input
          className="w-full rounded-md border border-[var(--border)] bg-background px-3 py-2"
          value={values.title}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setValues({ ...values, title: e.target.value })}
          placeholder="e.g., 3 Bedroom Flat in Lekki"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Description</label>
        <textarea
          className="w-full rounded-md border border-[var(--border)] bg-background px-3 py-2"
          value={values.description}
          onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setValues({ ...values, description: e.target.value })}
          placeholder="Describe your property..."
          rows={4}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Listing Type</label>
                    <select
                      className="w-full rounded-md border border-[var(--border)] bg-background px-3 py-2"
                      value={values.listing_type}
                      onChange={(e: ChangeEvent<HTMLSelectElement>) => setValues({ ...values, listing_type: e.target.value as PropertyFormValues["listing_type"] })}
                    >
                      {LISTING_TYPE_OPTIONS.map((t) => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                      ))}
                    </select>
                  </div>
          <label className="block text-sm font-medium mb-1">Address</label>
          <input
            className="w-full rounded-md border border-[var(--border)] bg-background px-3 py-2"
            value={values.address}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setValues({ ...values, address: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">State</label>
          <input
            className="w-full rounded-md border border-[var(--border)] bg-background px-3 py-2"
            value={values.state}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setValues({ ...values, state: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">City</label>
          <input
            className="w-full rounded-md border border-[var(--border)] bg-background px-3 py-2"
            value={values.city}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setValues({ ...values, city: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Property Type</label>
          <select
            className="w-full rounded-md border border-[var(--border)] bg-background px-3 py-2"
            value={values.property_type}
            onChange={(e: ChangeEvent<HTMLSelectElement>) => setValues({ ...values, property_type: e.target.value })}
          >
            {PROPERTY_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Price (₦)</label>
          <input
            className="w-full rounded-md border border-[var(--border)] bg-background px-3 py-2"
            type="number"
            value={String(values.price)}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setValues({ ...values, price: Number(e.target.value) })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Price Frequency</label>
          <select
            className="w-full rounded-md border border-[var(--border)] bg-background px-3 py-2"
            value={values.price_frequency}
            onChange={(e: ChangeEvent<HTMLSelectElement>) => setValues({ ...values, price_frequency: e.target.value as PropertyFormValues["price_frequency"] })}
          >
            {PRICE_FREQ.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex gap-3">
        <Button variant="secondary" onPress={handleSubmit} isDisabled={loading}>
          {mode === "create" ? "Create Property" : "Save Changes"}
        </Button>
        {mode === "edit" && values.id && (
          <Button
            variant="danger"
            onPress={async () => {
              if (!confirm("Delete this property?")) return
              setLoading(true)
              try {
                const { error } = await supabase.from("properties").delete().eq("id", values.id)
                if (error) throw error
                router.push("/agent/properties")
              } catch (err) {
                alert((err as Error).message)
              } finally {
                setLoading(false)
              }
            }}
          >
            Delete
          </Button>
        )}
      </div>
    </Card>
  )
}
