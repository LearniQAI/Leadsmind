'use server';

import { createServerClient } from '@/lib/supabase/server';
import { getCurrentWorkspaceId } from '@/lib/auth';

export async function getWorkspaceMembers() {
  const workspaceId = await getCurrentWorkspaceId();
  if (!workspaceId) return [];

  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from('workspace_members')
    .select(`
      user_id,
      users (
        id,
        first_name,
        last_name,
        email
      )
    `)
    .eq('workspace_id', workspaceId);

  if (error || !data) return [];

  return data.map((m: any) => ({
    id: m.users.id,
    name: `${m.users.first_name} ${m.users.last_name}`,
    email: m.users.email,
  }));
}
