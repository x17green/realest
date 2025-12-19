import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { agentId, action, notes } = body as { agentId?: string, action?: "approve" | "reject", notes?: string }
    if (!agentId || !action) {
      return NextResponse.json({ error: "Missing agentId or action" }, { status: 400 })
    }

    const supabase = await createClient()

    // Ensure requester is admin
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { data: profile } = await supabase
      .from("profiles")
      .select("id, user_type")
      .eq("id", user.id)
      .single()
    if (!profile || profile.user_type !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const newStatus = action === "approve" ? "approved" : "rejected"

    const { error } = await supabase
      .from("agents")
      .update({ verification_status: newStatus, verification_notes: notes ?? null, verified_at: newStatus === "approved" ? new Date().toISOString() : null })
      .eq("id", agentId)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}
