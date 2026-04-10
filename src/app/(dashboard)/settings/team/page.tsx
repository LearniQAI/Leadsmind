import { requireAdmin, getCurrentWorkspace, getUser } from '@/lib/auth';
import { createServerClient } from '@/lib/supabase/server';
import { InviteMemberForm } from '@/components/dashboard/InviteMemberForm';
import { PendingInvitationsList } from '@/components/dashboard/PendingInvitationsList';
import { TeamMembersTable } from '@/components/dashboard/TeamMembersTable';
import { Separator } from '@/components/ui/separator';
import { redirect } from 'next/navigation';

export default async function TeamSettingsPage() {
  await requireAdmin();
  
  const workspace = await getCurrentWorkspace();
  if (!workspace) redirect('/login');

  const user = await getUser();
  if (!user) redirect('/login');

  const supabase = await createServerClient();

  // Fetch current members
  const { data: members, error: membersError } = await supabase
    .from('workspace_members')
    .select('*, users(*)')
    .eq('workspace_id', workspace!.id)
    .order('joined_at', { ascending: true });

  if (membersError) {
    console.error('Error fetching members:', membersError);
  }

  // Fetch pending invitations
  const { data: invitations, error: invitesError } = await supabase
    .from('invitations')
    .select('*')
    .eq('workspace_id', workspace!.id)
    .is('accepted_at', null)
    .gt('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false });

  if (invitesError) {
    console.error('Error fetching invitations:', invitesError);
  }

  return (
    <div className="max-w-5xl mx-auto py-6 space-y-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight">Team Members</h1>
        <p className="text-muted-foreground">
          Invite and manage your team members and their roles.
        </p>
      </div>

      <div className="space-y-6">
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Invite Team Member</h2>
          <InviteMemberForm />
        </section>

        <Separator />

        {invitations && invitations.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-xl font-semibold">Pending Invitations</h2>
            <PendingInvitationsList invitations={invitations || []} />
          </section>
        )}

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Workspace Members</h2>
          <TeamMembersTable 
            members={members || []} 
            currentUserId={user.id} 
          />
        </section>
      </div>
    </div>
  );
}
