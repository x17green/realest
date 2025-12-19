import { Card } from "@heroui/react"

export type AgentCardItem = {
  id: string
  full_name?: string | null
  agency_name?: string | null
  license_number?: string | null
  state?: string | null
  verified_at?: string | null
  profile_photo_url?: string | null
  properties_count?: number | null
  average_rating?: number | null
}

export function AgentCard({ agent }: { agent: AgentCardItem }) {
  return (
    <Card className="p-5 hover:shadow-lg transition-shadow">
      <div className="flex items-center gap-4">
        <div className="h-14 w-14 rounded-full bg-[var(--gray-200)] overflow-hidden">
          {agent.profile_photo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={agent.profile_photo_url} alt={agent.full_name ?? "Agent"} className="h-full w-full object-cover" />
          ) : null}
        </div>
        <div className="flex-1">
          <h3 className="font-heading text-lg">{agent.full_name ?? "Agent"}</h3>
          <p className="text-sm text-muted-foreground">{agent.agency_name ?? "—"}</p>
          <p className="text-xs text-muted-foreground">{agent.state ?? ""}</p>
          <div className="mt-2 text-xs text-muted-foreground">
            <span>Listings: {agent.properties_count ?? 0}</span>
            <span className="mx-2">•</span>
            <span>Rating: {agent.average_rating ?? "—"}</span>
          </div>
        </div>
        <div>
          <a href={`/agent/${agent.id}`} className="text-primary underline">View Profile</a>
        </div>
      </div>
    </Card>
  )
}
