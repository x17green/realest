import { createServiceClient } from "@/lib/supabase/service"

export type AuditAction = 
  | "create_subadmin"
  | "approve_agent"
  | "reject_agent"
  | "delete_property"
  | "update_property_status"

export interface AuditLogEntry {
  actor_id: string
  action: AuditAction
  target_id?: string | null
  metadata?: Record<string, any> | null
}

export async function logAdminAction(entry: AuditLogEntry) {
  try {
    const service = createServiceClient()
    await service.from("admin_audit_log").insert({
      actor_id: entry.actor_id,
      action: entry.action,
      target_id: entry.target_id ?? null,
      metadata: entry.metadata ?? null,
      created_at: new Date().toISOString(),
    })
  } catch (err) {
    console.error("[Audit Log Error]", err)
    // Don't throw - we don't want to block operations if audit logging fails
  }
}
