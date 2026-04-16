import { Metadata } from 'next'
import {
  requireAuth,
  getCurrentProfile,
  getUserWorkspaces,
  getCurrentWorkspaceId
} from '@/lib/auth'
import { ProfileForm } from '@/components/settings/ProfileForm'
import { PasswordForm } from '@/components/settings/PasswordForm'
import { WorkspaceList } from '@/components/settings/WorkspaceList'
import { IntegrationsList } from '@/components/settings/IntegrationsList'
import { Separator } from '@/components/ui/separator'
import { redirect } from 'next/navigation'

export const metadata: Metadata = {
  title: 'Account Settings | LeadsMind',
  description: 'Manage your profile, security, and workspaces.',
}

export const dynamic = 'force-dynamic';

export default async function AccountSettingsPage() {
  await requireAuth()
  const profile = await getCurrentProfile()
  const workspaces = await getUserWorkspaces()
  const activeWorkspaceId = await getCurrentWorkspaceId()

  if (!activeWorkspaceId) {
    redirect('/login')
  }

  if (!profile) {
    return <div>Error loading profile</div>
  }

  // Profile is already camelCase from getCurrentProfile()
  const profileData = {
    id: profile.id,
    email: profile.email,
    firstName: profile.firstName,
    lastName: profile.lastName,
    avatarUrl: profile.avatarUrl ?? '',
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Account Settings</h1>
        <p className="text-muted-foreground mt-1">
          Update your personal details, secure your account, and manage workspace access.
        </p>
      </div>

      <div className="space-y-10">
        <section id="profile">
          <ProfileForm user={profileData} />
        </section>

        <Separator />

        <section id="security">
          <PasswordForm />
        </section>

        <Separator />

        <section id="workspaces">
          <WorkspaceList
            workspaces={workspaces}
            activeWorkspaceId={activeWorkspaceId}
          />
        </section>

        <Separator />

        <section id="integrations">
          <IntegrationsList />
        </section>
      </div>
    </div>
  )
}
