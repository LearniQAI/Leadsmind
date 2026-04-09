import { redirect } from 'next/navigation'
import { createServerClient } from './supabase/server'
import { cookies } from 'next/headers'

export async function getSession() {
  const supabase = await createServerClient()
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession()
    return session
  } catch (error) {
    console.error('Error fetching session:', error)
    return null
  }
}

export async function getUser() {
  const session = await getSession()
  return session?.user ?? null
}

export async function getCurrentProfile() {
  const user = await getUser()
  if (!user) return null

  const supabase = await createServerClient()
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  if (error || !data) return null
  return data
}

export async function getCurrentWorkspaceId() {
  const cookieStore = await cookies()
  return cookieStore.get('active_workspace_id')?.value || null
}

export async function getCurrentWorkspace() {
  const workspaceId = await getCurrentWorkspaceId()
  if (!workspaceId) return null

  const supabase = await createServerClient()
  const { data, error } = await supabase
    .from('workspaces')
    .select('*')
    .eq('id', workspaceId)
    .single()

  if (error || !data) return null
  return data
}

export async function getUserRole() {
  const user = await getUser()
  const workspaceId = await getCurrentWorkspaceId()
  
  if (!user || !workspaceId) return null

  const supabase = await createServerClient()
  const { data, error } = await supabase
    .from('workspace_members')
    .select('role')
    .eq('workspace_id', workspaceId)
    .eq('user_id', user.id)
    .single()

  if (error || !data) return null
  return data.role
}

export async function getUserWorkspaces() {
  const user = await getUser()
  if (!user) return []

  const supabase = await createServerClient()
  const { data, error } = await supabase
    .from('workspace_members')
    .select(`
      workspace_id,
      role,
      workspaces (
        id,
        name,
        logo_url
      )
    `)
    .eq('user_id', user.id)

  if (error || !data) {
    console.error('Error fetching user workspaces:', error)
    return []
  }

  // Flatten the response
  type WorkspaceQueryResult = {
    role: 'admin' | 'member' | 'client'
    workspaces: {
      id: string
      name: string
      logo_url: string | null
    }
  }

  return (data as unknown as WorkspaceQueryResult[]).map((item) => ({
    id: item.workspaces.id,
    name: item.workspaces.name,
    logoUrl: item.workspaces.logo_url,
    role: item.role,
  }))
}

export async function requireAuth() {
  const session = await getSession()
  if (!session) {
    redirect('/login')
  }
  return session.user
}

export async function requireAdmin() {
  const role = await getUserRole()
  
  if (role !== 'admin') {
    redirect('/403')
  }
}

export async function logout() {
  const supabase = await createServerClient()
  await supabase.auth.signOut()
  
  const cookieStore = await cookies()
  cookieStore.delete('active_workspace_id')
  
  redirect('/login')
}
