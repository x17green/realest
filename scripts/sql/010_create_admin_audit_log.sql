-- Create admin_audit_log table for tracking all admin actions
CREATE TABLE IF NOT EXISTS admin_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  target_id UUID,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create indexes for common queries
CREATE INDEX idx_admin_audit_log_actor_id ON admin_audit_log(actor_id);
CREATE INDEX idx_admin_audit_log_created_at ON admin_audit_log(created_at DESC);
CREATE INDEX idx_admin_audit_log_action ON admin_audit_log(action);

-- Add comment for documentation
COMMENT ON TABLE admin_audit_log IS 'Tracks all administrative actions for security and compliance auditing';
COMMENT ON COLUMN admin_audit_log.actor_id IS 'The admin who performed the action';
COMMENT ON COLUMN admin_audit_log.action IS 'Type of action: create_subadmin, approve_agent, reject_agent, etc.';
COMMENT ON COLUMN admin_audit_log.target_id IS 'ID of the affected resource (user_id, agent_id, property_id, etc.)';
COMMENT ON COLUMN admin_audit_log.metadata IS 'Additional context about the action (notes, old values, etc.)';

-- RLS policies: Only admins can view audit logs
ALTER TABLE admin_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admins_view_audit_logs" ON admin_audit_log
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND user_type = 'admin'
    )
  );

-- Service role can insert audit logs (using service client in code)
-- No INSERT policy needed as inserts are done via service role
