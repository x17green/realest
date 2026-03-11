/**
 * DELETE /api/admin/waitlist/[id]  — remove a waitlist subscriber
 *
 * Admin-only.
 */
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { supabase, error: 'Unauthorized', status: 401 as const };

  const { data: userRow } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();

  if (userRow?.role !== 'admin') return { supabase, error: 'Forbidden', status: 403 as const };
  return { supabase, error: null, status: 200 as const };
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { supabase, error, status } = await requireAdmin();
  if (error) return NextResponse.json({ error }, { status });

  const { id } = await params;

  const { error: deleteError } = await supabase
    .from('waitlist')
    .delete()
    .eq('id', id);

  if (deleteError) {
    return NextResponse.json({ error: deleteError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
