"use client"

import { useState, ChangeEvent } from "react"
import { Card, Button } from "@heroui/react"
import { useRouter } from "next/navigation"

export function SubAdminForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState("")
  const [fullName, setFullName] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess("")

    try {
      const res = await fetch("/api/admin/subadmins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, full_name: fullName }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? "Failed to create sub-admin")
      }

      setSuccess(`Invitation sent to ${email}! They will receive a password setup link.`)
      setEmail("")
      setFullName("")
      
      // Refresh the page to update the admin list
      router.refresh()
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Full Name</label>
          <input
            className="w-full rounded-md border border-[var(--border)] bg-background px-3 py-2"
            value={fullName}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setFullName(e.target.value)}
            placeholder="Jane Doe"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            className="w-full rounded-md border border-[var(--border)] bg-background px-3 py-2"
            type="email"
            value={email}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
            placeholder="jane@example.com"
            required
          />
        </div>

        {error && (
          <div className="text-sm text-danger bg-danger-50 border border-danger-200 rounded-md p-3">
            {error}
          </div>
        )}

        {success && (
          <div className="text-sm text-success bg-success-50 border border-success-200 rounded-md p-3">
            {success}
          </div>
        )}

        <Button variant="secondary" type="submit" isDisabled={loading}>
          {loading ? "Sending Invitation..." : "Send Invitation"}
        </Button>
      </form>
    </Card>
  )
}
