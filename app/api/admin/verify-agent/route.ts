import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { logAdminAction } from "@/lib/audit"
import { prisma } from "@/lib/prisma"

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

    const adminRow = await prisma.users.findUnique({ where: { id: user.id }, select: { role: true } })
    if (!adminRow || adminRow.role !== 'admin') {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Update agent verification using schema-valid fields: verified (bool) + verification_date
    await prisma.agents.update({
      where: { id: agentId },
      data: {
        verified: action === 'approve',
        verification_date: action === 'approve' ? new Date() : null,
      },
    })

    // Log the admin action
    await logAdminAction({
      actor_id: user.id,
      action: action === "approve" ? "approve_agent" : "reject_agent",
      target_id: agentId,
      metadata: { notes },
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}
