"use client"

import { useState } from "react"
import { Card, Button } from "@heroui/react"

export type AgentItem = {
  id: string
  profile_id: string
  full_name?: string | null
  agency_name?: string | null
  license_number?: string | null
  verification_status?: "pending" | "approved" | "rejected" | null
  license_certificate_url?: string | null
}

export function VerifyAgentRow({ agent, onAction }: { agent: AgentItem, onAction: (id: string) => void }) {
  const [notes, setNotes] = useState("")
  const [loading, setLoading] = useState<"approve" | "reject" | null>(null)

  async function handle(action: "approve" | "reject") {
    setLoading(action)
    try {
      const res = await fetch("/api/admin/verify-agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agentId: agent.id, action, notes }),
      })
      if (!res.ok) throw new Error(await res.text())
      onAction(agent.id)
    } catch (err) {
      alert((err as Error).message)
    } finally {
      setLoading(null)
    }
  }

  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h3 className="font-heading text-lg">{agent.full_name ?? "Unknown Agent"}</h3>
          <p className="text-sm text-muted-foreground">Agency: {agent.agency_name ?? "—"}</p>
          <p className="text-sm text-muted-foreground">License: {agent.license_number ?? "—"}</p>
          <p className="text-sm">Status: {agent.verification_status ?? "pending"}</p>
          <div className="mt-2">
            <label className="block text-sm font-medium mb-1">Verification Notes</label>
            <textarea
              className="w-full rounded-md border border-[var(--border)] bg-background px-3 py-2"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add notes (optional)"
              rows={3}
            />
          </div>
          {agent.license_certificate_url ? (
            <a className="text-primary underline" href={agent.license_certificate_url} target="_blank" rel="noreferrer">View Certificate</a>
          ) : (
            <span className="text-xs text-muted-foreground">No certificate uploaded</span>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <Button variant="secondary" onPress={() => handle("approve")} isDisabled={loading !== null}>Approve</Button>
          <Button variant="danger" onPress={() => handle("reject")} isDisabled={loading !== null}>Reject</Button>
        </div>
      </div>
    </Card>
  )
}
